import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const EDSA_FUNCTION_TOKEN = Deno.env.get('EDSA_FUNCTION_TOKEN')
const MAX_ATTEMPTS = parseInt(Deno.env.get('EDSA_OTP_MAX_ATTEMPTS') || '5')

// Hash function for OTP verification
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(otp)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  console.log('🔍 Verify OTP function called with method:', req.method)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method)
      return new Response(
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token if configured
    const token = req.headers.get('x-edsa-token')
    if (EDSA_FUNCTION_TOKEN && token !== EDSA_FUNCTION_TOKEN) {
      console.log('❌ Invalid token provided')
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized access' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    console.log('📝 Verify request:', { ...body, otp: body.otp ? '***' : 'missing' })
    
    const { ref_number, id_number, email, otp } = body

    if (!ref_number || !id_number || !email || !otp) {
      console.log('❌ Missing required fields')
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: ref_number, id_number, email, otp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')! // Use anon key instead of service role

    console.log('🔍 Looking up OTP record...')
    // Get the most recent unverified OTP record
    const otpResponse = await fetch(
      `${supabaseUrl}/rest/v1/edsa_otp_codes?ref_number=eq.${ref_number}&id_number=eq.${id_number}&email=eq.${email}&verified=eq.false&order=created_at.desc&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!otpResponse.ok) {
      const errorText = await otpResponse.text()
      console.error('❌ Failed to query OTP:', errorText)
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to verify OTP', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otpData = await otpResponse.json()
    console.log('📊 OTP query result:', otpData.length, 'records found')
    
    if (!otpData || otpData.length === 0) {
      console.log('❌ No OTP record found')
      return new Response(
        JSON.stringify({ ok: false, error: 'OTP not found or expired. Please request a new code.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otpRecord = otpData[0]
    console.log('📋 OTP record found:', { id: otpRecord.id, attempts: otpRecord.attempts, expires_at: otpRecord.expires_at })

    // Check if expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      console.log('❌ OTP has expired')
      return new Response(
        JSON.stringify({ ok: false, error: 'OTP has expired. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      console.log('❌ Too many attempts')
      return new Response(
        JSON.stringify({ ok: false, error: 'Too many failed attempts. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash the provided OTP and compare
    const providedOtpHash = await hashOTP(otp)
    console.log('🔐 Comparing OTP hashes...')
    
    if (otpRecord.otp_hash !== providedOtpHash) {
      console.log('❌ Invalid OTP provided')
      
      // Increment attempts
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes?id=eq.${otpRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          attempts: otpRecord.attempts + 1
        })
      })

      if (!updateResponse.ok) {
        console.error('⚠️ Failed to update attempts:', await updateResponse.text())
      }

      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Invalid OTP code. Please try again.',
          attempts_remaining: MAX_ATTEMPTS - otpRecord.attempts - 1
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ OTP verified successfully, marking as verified...')
    // OTP is valid - mark as verified
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes?id=eq.${otpRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        verified: true
      })
    })

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text()
      console.error('⚠️ Failed to mark OTP as verified:', errorText)
    }

    console.log('🎉 OTP verification complete')
    return new Response(
      JSON.stringify({ ok: true, message: 'OTP verified successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})