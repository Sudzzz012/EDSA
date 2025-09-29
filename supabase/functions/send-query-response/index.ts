import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// SendGrid configuration
const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'admin@erasedebtsa.co.za'

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
      console.log('SendGrid not configured - response saved but no email sent')
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, clientName, reference, response, adminName, queryType } = await req.json()

    if (!email || !response) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and response' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Professional email template for client notifications
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Response to Your Query - Erase Debt SA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #003865, #005c97); padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">Erase Debt SA</h1>
          <p style="color: #dce8f7; margin: 8px 0 0 0; font-size: 16px;">Response to Your Query</p>
        </div>

        <!-- Content -->
        <div style="padding: 35px 25px;">
          <h2 style="color: #2970ba; margin-bottom: 20px;">Hello ${clientName},</h2>
          
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="background: #0ea5e9; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold;">✓</div>
              <div>
                <div style="font-weight: bold; color: #0c4a6e; margin-bottom: 3px;">We've Responded to Your Query</div>
                <div style="font-size: 14px; color: #0369a1;">Reference: ${reference}</div>
              </div>
            </div>
          </div>

          <div style="background-color: #f8fafc; border-left: 4px solid #2970ba; border-radius: 0 8px 8px 0; padding: 20px; margin: 25px 0;">
            <h3 style="color: #2970ba; margin: 0 0 15px 0; font-size: 18px;">Our Response:</h3>
            <div style="color: #374151; line-height: 1.7; font-size: 16px;">
              ${response}
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 13px; color: #6b7280;">
                <strong>Responded by:</strong> ${adminName}<br>
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #2970ba, #005c97); color: white; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; font-size: 20px;">📱 View Full Details on Portal</h3>
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
              For complete query history and to send follow-up messages, please visit our secure client portal:
            </p>
            <a href="https://www.erasedebtsa.net/track-query.html" 
               style="display: inline-block; background: #ffffff; color: #2970ba; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
              🔐 Access Your Portal Now
            </a>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="color: #f59e0b; font-size: 18px; margin-right: 10px;">💡</div>
              <div style="font-weight: bold; color: #92400e;">Need Further Assistance?</div>
            </div>
            <div style="color: #92400e; line-height: 1.6;">
              • <strong>Portal:</strong> Use the link above to view all responses and send follow-ups<br>
              • <strong>Phone:</strong> 031 500 2220 or 031 109 5560<br>
              • <strong>Email:</strong> queries@erasedebtsa.co.za
            </div>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            <strong>Important:</strong> This email confirms that we've responded to your query. For the most up-to-date information and to continue the conversation, please use our secure client portal.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
          <div style="color: #2970ba; font-weight: bold; margin-bottom: 8px;">Erase Debt SA</div>
          <div style="color: #64748b; margin: 0; font-size: 12px; line-height: 1.5;">
            📍 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068<br>
            📞 031 500 2220 | 031 109 5560 | 📧 queries@erasedebtsa.co.za<br>
            🌐 www.erasedebtsa.co.za | Portal: www.erasedebtsa.net<br><br>
            © 2025 Erase Debt SA. All rights reserved. | POPIA Compliant | NCR Registered
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    // Plain text version
    const emailText = `
    Response to Your Query - Erase Debt SA
    
    Hello ${clientName},
    
    We've responded to your query (Reference: ${reference}).
    
    OUR RESPONSE:
    ${response}
    
    Responded by: ${adminName}
    Date: ${new Date().toLocaleString()}
    
    VIEW FULL DETAILS ON PORTAL:
    For complete query history and to send follow-up messages, please visit:
    https://www.erasedebtsa.net/track-query.html
    
    NEED FURTHER ASSISTANCE?
    • Portal: Use the link above for all responses and follow-ups
    • Phone: 031 500 2220 or 031 109 5560
    • Email: queries@erasedebtsa.co.za
    
    Important: This email confirms our response. For the most current information, please use our secure client portal.
    
    Erase Debt SA
    23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068
    Phone: 031 500 2220 | 031 109 5560
    Email: queries@erasedebtsa.co.za
    Website: www.erasedebtsa.co.za | Portal: www.erasedebtsa.net
    
    © 2025 Erase Debt SA. All rights reserved.
    `

    // SendGrid email payload
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: `Response to Your ${queryType} - Erase Debt SA (${reference})`
        }
      ],
      from: { email: FROM_EMAIL, name: 'Erase Debt SA Admin Team' },
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
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
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
          success: false,
          error: 'Failed to send email notification',
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Query response email sent to ${email} for reference ${reference}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Query response email sent successfully to client' 
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