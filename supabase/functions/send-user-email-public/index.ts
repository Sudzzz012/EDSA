const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Email Function Called ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { to, subject, body, from = 'noreply@erasedebtsa.co.za' } = requestBody
    
    if (!to) {
      console.error('Missing "to" email address')
      return new Response(
        JSON.stringify({ error: 'Missing recipient email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email details:', { 
      to, 
      subject: subject ? 'Present' : 'Missing', 
      from,
      bodyLength: body ? body.length : 0
    })

    // Check for SendGrid API key in environment
    const envVars = Deno.env.toObject()
    console.log('Available environment variables:', Object.keys(envVars))
    
    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL') || 
                             Deno.env.get('SENDGRID_API_KEY') || 
                             Deno.env.get('RESEND_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.error('❌ No email API key found in environment')
      console.log('Checked variables: SENDGRIDFINAL, SENDGRID_API_KEY, RESEND_API_KEY')
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured', 
          details: 'Missing API key in environment variables',
          availableEnvVars: Object.keys(envVars)
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Email API key found, preparing to send email...')

    // Prepare email data for SendGrid
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject || 'Email from Erase Debt SA'
        }
      ],
      from: {
        email: from,
        name: 'Erase Debt SA'
      },
      content: [
        {
          type: 'text/html',
          value: body || `<p>Hello,</p><p>This is a test email from Erase Debt SA.</p>`
        }
      ]
    }

    console.log('Sending email to SendGrid API...')
    console.log('SendGrid payload:', JSON.stringify(emailData, null, 2))

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    console.log('SendGrid response status:', response.status)
    console.log('SendGrid response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ SendGrid API error:', response.status, response.statusText)
      console.error('SendGrid error body:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email via SendGrid', 
          details: errorText,
          status: response.status,
          statusText: response.statusText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const responseData = await response.text()
    console.log('✅ Email sent successfully!')
    console.log('SendGrid response data:', responseData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        to: to,
        subject: subject
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Fatal error in send-user-email-public function:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})