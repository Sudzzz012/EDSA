import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Configuration
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@erasedebtsa.co.za'
const EDSA_FUNCTION_TOKEN = Deno.env.get('EDSA_FUNCTION_TOKEN')
const OTP_TTL_MINUTES = parseInt(Deno.env.get('EDSA_OTP_TTL_MINUTES') || '10')

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

    const { ref_number, id_number, email } = await req.json()

    if (!ref_number || !id_number || !email) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    // Store OTP in database (you'll need to create this table)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Store OTP
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        ref_number,
        id_number,
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0
      })
    })

    if (!storeResponse.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to store OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via SendGrid
    if (SENDGRID_API_KEY) {
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
                <h1 style="color: #ffffff; margin: 0;">Erase Debt SA</h1>
                <p style="color: #dce8f7; margin: 5px 0 0 0;">Your Verification Code</p>
              </div>
              <div style="padding: 40px 20px; background: white;">
                <h2 style="color: #2970ba;">Verification Required</h2>
                <p>You requested to view your query (Reference: <strong>${ref_number}</strong>).</p>
                <div style="background: #f1f5f9; border: 2px solid #2970ba; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                  <div style="font-size: 32px; font-weight: bold; color: #2970ba; letter-spacing: 8px;">${otp}</div>
                  <p style="color: #64748b; margin: 10px 0 0 0;">Valid for ${OTP_TTL_MINUTES} minutes</p>
                </div>
                <p style="color: #64748b; font-size: 14px;">
                  Need help? Contact us:<br>
                  📞 031 500 2220 or 031 109 5560<br>
                  📧 queries@erasedebtsa.co.za
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
        console.error('SendGrid error:', await emailResponse.text())
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: `OTP sent to ${email}`,
        expires_in_minutes: OTP_TTL_MINUTES
      }),
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