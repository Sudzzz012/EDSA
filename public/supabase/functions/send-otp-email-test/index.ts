import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Simple GET request for testing
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        message: 'Send OTP Email function is running!',
        timestamp: new Date().toISOString(),
        environment: {
          SENDGRIDFINAL: Deno.env.get('SENDGRIDFINAL') ? '✅ Set' : '❌ Not Set',
          FROM_EMAIL: Deno.env.get('FROM_EMAIL') || 'Not Set'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check environment variables
    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@erasedebtsa.co.za'

    console.log('Environment check:', {
      SENDGRID_API_KEY: SENDGRID_API_KEY ? `${SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET',
      FROM_EMAIL: FROM_EMAIL
    })

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'SendGrid API key not configured',
          help: 'Set SENDGRIDFINAL environment variable'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, otp, reference, firstName } = await req.json()
    console.log('Request payload:', { email, otp, reference, firstName })

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['email', 'otp'],
          received: { email: !!email, otp: !!otp }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Simple email template for testing
    const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2970ba;">Erase Debt SA - Test Email</h2>
      <p>Hello ${firstName || 'User'},</p>
      <p>Your verification code is: <strong style="font-size: 24px; color: #2970ba;">${otp}</strong></p>
      <p>Reference: ${reference || 'N/A'}</p>
      <p>This is a test email to verify the email service is working.</p>
    </div>
    `

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: `Test Email - Verification Code ${otp}`
        }
      ],
      from: { email: FROM_EMAIL, name: 'Erase Debt SA Test' },
      content: [
        {
          type: 'text/html',
          value: emailHTML
        }
      ]
    }

    console.log('Sending email via SendGrid...')

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    console.log('SendGrid response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'SendGrid API error',
          status: response.status,
          details: errorText,
          apiKey: `${SENDGRID_API_KEY.substring(0, 10)}...`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        email: email,
        timestamp: new Date().toISOString()
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
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})