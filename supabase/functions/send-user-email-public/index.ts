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
    console.log('Received email request:', req.method)
    
    const { to, subject, body, from = 'noreply@erasedebtsa.co.za' } = await req.json()
    
    console.log('Email details:', { to, subject: subject ? 'Present' : 'Missing', from })

    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL') || Deno.env.get('SENDGRID_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not found')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('SendGrid API key found, sending email...')

    // Send email via SendGrid
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject || 'Password Reset - Erase Debt SA'
        }
      ],
      from: {
        email: from,
        name: 'Erase Debt SA'
      },
      content: [
        {
          type: 'text/html',
          value: body
        }
      ]
    }

    console.log('Sending to SendGrid API...')

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', response.status, response.statusText, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully!')

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-user-email-public function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received email request:', req.method)
    
    const { to, subject, body, from = 'noreply@erasedebtsa.co.za' } = await req.json()
    
    console.log('Email details:', { to, subject: subject ? 'Present' : 'Missing', from })

    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL') || Deno.env.get('SENDGRID_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not found in environment variables. Available env vars:', Object.keys(Deno.env.toObject()))
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('SendGrid API key found, sending email...')

    // Send email via SendGrid
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject || 'Password Reset - Erase Debt SA'
        }
      ],
      from: {
        email: from,
        name: 'Erase Debt SA'
      },
      content: [
        {
          type: 'text/html',
          value: body
        }
      ]
    }

    console.log('Sending to SendGrid API...')

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', response.status, response.statusText, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully!')

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-user-email-public function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})