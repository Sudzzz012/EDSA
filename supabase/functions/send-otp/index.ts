import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Configuration
const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@erasedebtsa.co.za'
const EDSA_FUNCTION_TOKEN = Deno.env.get('EDSA_FUNCTION_TOKEN')
const OTP_TTL_MINUTES = parseInt(Deno.env.get('EDSA_OTP_TTL_MINUTES') || '10')

// Hash function for OTP
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(otp)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  console.log('🔍 Send OTP function called with method:', req.method)
  
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
    console.log('📝 Request body:', { ...body, email: body.email ? body.email.substring(0, 3) + '***' : 'missing' })
    
    const { ref_number, id_number, email } = body

    if (!ref_number || !id_number || !email) {
      console.log('❌ Missing required fields:', { ref_number: !!ref_number, id_number: !!id_number, email: !!email })
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: ref_number, id_number, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔢 Generated OTP for ref:', ref_number)
    
    const otp_hash = await hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
    
    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')! // Use anon key instead of service role
    
    console.log('🗑️ Cleaning up existing OTPs...')
    // Clean up any existing OTPs for this user first
    const cleanupResponse = await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes?ref_number=eq.${ref_number}&id_number=eq.${id_number}&email=eq.${email}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!cleanupResponse.ok) {
      console.log('⚠️ Cleanup failed but continuing:', await cleanupResponse.text())
    }
    
    console.log('💾 Storing new OTP...')
    // Store new OTP
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/edsa_otp_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ref_number,
        id_number,
        email,
        otp_hash,
        expires_at: expiresAt.toISOString(),
        ip,
        attempts: 0,
        verified: false
      })
    })

    if (!storeResponse.ok) {
      const errorText = await storeResponse.text()
      console.error('❌ Failed to store OTP:', errorText)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Failed to store OTP code',
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const storedOtp = await storeResponse.json()
    console.log('✅ OTP stored successfully:', storedOtp[0]?.id)

    // Send email via SendGrid if configured
    if (SENDGRID_API_KEY) {
      console.log('📧 Sending email via SendGrid...')
      
      const emailPayload = {
        personalizations: [{
          to: [{ email: email }],
          subject: `Your Verification Code - Erase Debt SA (${ref_number})`
        }],
        from: { email: FROM_EMAIL, name: 'Erase Debt SA' },
        content: [{
          type: 'text/html',
          value: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #003865, #005c97); padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Erase Debt SA</h1>
                <p style="color: #dce8f7; margin: 5px 0 0 0; font-size: 14px;">Your Verification Code</p>
              </div>
              <div style="padding: 40px 20px; background: white; color: #333;">
                <h2 style="color: #2970ba; margin-bottom: 20px;">Verification Required</h2>
                <p style="line-height: 1.6; margin-bottom: 25px;">
                  You requested to track your application (Reference: <strong>${ref_number}</strong>).
                  Please use the verification code below to proceed:
                </p>
                <div style="background: #f1f5f9; border: 2px solid #2970ba; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                  <div style="font-size: 32px; font-weight: bold; color: #2970ba; letter-spacing: 8px; margin-bottom: 10px;">
                    ${otp}
                  </div>
                  <p style="color: #64748b; margin: 0; font-size: 14px;">Valid for ${OTP_TTL_MINUTES} minutes</p>
                </div>
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    <strong>Important:</strong> This code expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this verification, please ignore this email.
                  </p>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                  Need help? Contact us:<br>
                  📞 <strong>031 500 2220</strong> or <strong>031 109 5560</strong><br>
                  📧 <strong>queries@erasedebtsa.co.za</strong><br>
                  🌐 <strong>www.erasedebtsa.net</strong>
                </p>
              </div>
              <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  © 2025 Erase Debt SA. All rights reserved.<br>
                  23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068
                </p>
              </div>
            </div>
          `
        }]
      }

      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      })

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text()
        console.error('❌ SendGrid error:', emailError)
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Failed to send email',
            details: emailError
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('✅ Email sent successfully')
    } else {
      console.log('⚠️ SendGrid not configured, OTP stored but email not sent')
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: `OTP sent to ${email}`,
        expires_in_minutes: OTP_TTL_MINUTES,
        debug_info: {
          sendgrid_configured: !!SENDGRID_API_KEY,
          ref_number,
          stored_at: new Date().toISOString()
        }
      }),
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