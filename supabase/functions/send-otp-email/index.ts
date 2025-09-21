import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// SendGrid configuration
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@erasedebtsa.co.za'
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, otp, reference, firstName } = await req.json()

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and otp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Email HTML template
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Verification Code - Erase Debt SA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #003865, #005c97); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Erase Debt SA</h1>
          <p style="color: #dce8f7; margin: 5px 0 0 0; font-size: 14px;">Your Query Verification Code</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #2970ba; margin-bottom: 20px;">Hello ${firstName || 'Valued Client'},</h2>
          
          <p style="color: #334155; line-height: 1.6; margin-bottom: 25px;">
            You requested to view your query ${reference ? `(Reference: <strong>${reference}</strong>)` : ''}. 
            Please use the verification code below to proceed:
          </p>

          <!-- OTP Code Box -->
          <div style="background-color: #f1f5f9; border: 2px solid #2970ba; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #2970ba; letter-spacing: 8px; margin-bottom: 10px;">
              ${otp}
            </div>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Enter this code to access your query</p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This code expires in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Need help? Contact us at:<br>
            📞 <strong>031 500 2220</strong> or <strong>031 109 5560</strong><br>
            📧 <strong>queries@erasedebtsa.co.za</strong><br>
            🌐 <strong>www.erasedebtsa.net</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin: 0; font-size: 12px;">
            © 2025 Erase Debt SA. All rights reserved.<br>
            23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068
          </p>
        </div>
      </div>
    </body>
    </html>
    `

    // Plain text version
    const emailText = `
    Your Verification Code - Erase Debt SA
    
    Hello ${firstName || 'Valued Client'},
    
    You requested to view your query ${reference ? `(Reference: ${reference})` : ''}. 
    Please use the verification code below to proceed:
    
    Verification Code: ${otp}
    
    This code expires in 10 minutes. If you didn't request this verification, please ignore this email.
    
    Need help? Contact us:
    Phone: 031 500 2220 or 031 109 5560
    Email: queries@erasedebtsa.co.za
    Website: www.erasedebtsa.net
    
    © 2025 Erase Debt SA. All rights reserved.
    `

    // SendGrid email payload
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: `Your Verification Code - Erase Debt SA ${reference ? `(${reference})` : ''}`
        }
      ],
      from: { email: FROM_EMAIL, name: 'Erase Debt SA' },
      content: [
        {
          type: 'text/plain',
          value: emailText
        },
        {
          type: 'text/html',
          value: emailHTML
        }
      ]
    }

    // Send email via SendGrid
    const response = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful email send (optional)
    console.log(`OTP email sent to ${email} for reference ${reference || 'N/A'}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})