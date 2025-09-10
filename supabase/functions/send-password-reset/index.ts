import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, full_name, id_number, reset_token } = await req.json()

    // Construct reset link
    const resetLink = `${req.headers.get('origin') || 'https://your-domain.com'}/set-password.html?user=${encodeURIComponent(id_number)}&token=${encodeURIComponent(reset_token)}`

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Erase Debt SA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2970ba; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2970ba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${full_name},</p>
            
            <p>You requested a password reset for your Erase Debt SA staff account (ID: ${id_number}).</p>
            
            <p>Click the button below to set a new password:</p>
            
            <a href="${resetLink}" class="button">Reset My Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px;">${resetLink}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <p>Best regards,<br>Erase Debt SA IT Team</p>
          </div>
          <div class="footer">
            <p>Erase Debt SA | 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email via SendGrid
    const emailData = {
      personalizations: [
        {
          to: [{ email: to, name: full_name }],
          subject: 'Password Reset - Erase Debt SA Staff Portal'
        }
      ],
      from: {
        email: 'noreply@erasedebtsa.co.za',
        name: 'Erase Debt SA'
      },
      content: [
        {
          type: 'text/html',
          value: emailHtml
        }
      ]
    }

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
      console.error('SendGrid error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-password-reset function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})