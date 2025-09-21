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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token
    const token = req.headers.get('x-edsa-token')
    if (EDSA_FUNCTION_TOKEN && token !== EDSA_FUNCTION_TOKEN) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { ref_number, id_number, email, otp } = await req.json()

    if (!ref_number || !id_number || !email || !otp) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Get the most recent unverified OTP record
    const otpResponse = await fetch(
      `${supabaseUrl}/rest/v1/edsa_otp_codes?ref_number=eq.${ref_number}&id_number=eq.${id_number}&email=eq.${email}&verified=eq.false&order=created_at.desc&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    )

    const otpData = await otpResponse.json()
    
    if (!otpData || otpData.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'OTP not found or expired' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otpRecord = otpData[0]

    // Check if expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'OTP has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Too many failed attempts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash the provided OTP and compare
    const providedOtpHash = await hashOTP(otp)
    
    if (otpRecord.otp_hash !== providedOtpHash) {
      // Increment attempts
      await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes?id=eq.${otpRecord.id}`, {
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

      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Invalid OTP code',
          attempts_remaining: MAX_ATTEMPTS - otpRecord.attempts - 1
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // OTP is valid - mark as verified
    await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes?id=eq.${otpRecord.id}`, {
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

    return new Response(
      JSON.stringify({ ok: true, message: 'OTP verified successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})