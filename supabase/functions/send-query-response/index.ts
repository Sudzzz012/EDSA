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
    console.log('🔍 Query response email function called')
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📧 SendGrid API Key:', SENDGRID_API_KEY ? `${SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET')

    if (!SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured - SENDGRIDFINAL environment variable missing' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, clientName, reference, response, adminName, queryType, firstName, lastName } = await req.json()
    
    console.log('📨 Email request:', { email, clientName, reference, adminName, queryType })

    if (!email || !response) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and response' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const finalClientName = clientName || [firstName, lastName].filter(Boolean).join(' ') || 'Valued Client'

    // Professional email template for client notifications
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Response to Your Query - Erase Debt SA</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #003865, #005c97); padding: 35px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px;">Erase Debt SA</h1>
          <p style="color: #dce8f7; margin: 10px 0 0 0; font-size: 18px; font-weight: 500;">Admin Team Response</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #2970ba; margin-bottom: 25px; font-size: 24px;">Hello ${finalClientName},</h2>
          
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center;">
            <div style="background: #0ea5e9; color: white; border-radius: 50%; width: 45px; height: 45px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; font-size: 20px; font-weight: bold;">✓</div>
            <div style="color: #0c4a6e; font-size: 18px; font-weight: bold; margin-bottom: 8px;">We've Responded to Your Query</div>
            <div style="color: #0369a1; font-size: 16px; font-weight: 600;">Reference: ${reference}</div>
            <div style="color: #0369a1; font-size: 14px; margin-top: 5px;">Query Type: ${queryType}</div>
          </div>

          <div style="background-color: #f8fafc; border-left: 6px solid #2970ba; border-radius: 0 12px 12px 0; padding: 25px; margin: 30px 0;">
            <h3 style="color: #2970ba; margin: 0 0 18px 0; font-size: 20px; display: flex; align-items: center;">
              <span style="background: #2970ba; color: white; border-radius: 50%; width: 35px; height: 35px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">💬</span>
              Our Professional Response:
            </h3>
            <div style="color: #374151; line-height: 1.8; font-size: 17px; background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
              ${response}
            </div>
            <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 14px; color: #6b7280;">
                <strong style="color: #059669;">Admin:</strong> ${adminName}
              </div>
              <div style="font-size: 14px; color: #6b7280;">
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #2970ba, #1e40af); color: white; border-radius: 15px; padding: 30px; text-align: center; margin: 35px 0; box-shadow: 0 8px 25px rgba(41, 112, 186, 0.3);">
            <h3 style="margin: 0 0 18px 0; font-size: 22px; font-weight: bold;">🖥️ View Full Details on Your Portal</h3>
            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #dce8f7;">
              For complete query history, to send follow-up messages, and to track your application status, please visit our secure client portal:
            </p>
            <a href="https://www.erasedebtsa.net/track-query.html" 
               style="display: inline-block; background: #ffffff; color: #2970ba; padding: 18px 35px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); transition: all 0.3s;">
              🔐 Access Your Secure Portal Now
            </a>
          </div>

          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="color: #f59e0b; font-size: 24px; margin-right: 15px;">📞</div>
              <div style="font-weight: bold; color: #92400e; font-size: 18px;">Need Immediate Assistance?</div>
            </div>
            <div style="color: #92400e; line-height: 1.7; font-size: 16px;">
              <strong style="color: #854d0e;">Phone:</strong> 031 500 2220 or 031 109 5560<br>
              <strong style="color: #854d0e;">Email:</strong> queries@erasedebtsa.co.za<br>
              <strong style="color: #854d0e;">Portal:</strong> Use the button above for instant access to all your information
            </div>
          </div>

          <div style="background: #e6f3ff; border: 1px solid #2970ba; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #003865; font-size: 15px; line-height: 1.6;">
              <strong>🔔 Important:</strong> This email confirms that our admin team has responded to your query. 
              For the most up-to-date information, complete conversation history, and to continue communicating with us, 
              please use your secure client portal using the link above.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
          <div style="color: #2970ba; font-weight: bold; font-size: 18px; margin-bottom: 12px;">🏢 Erase Debt SA</div>
          <div style="color: #64748b; margin: 0; font-size: 13px; line-height: 1.6;">
            <strong>Address:</strong> 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068<br>
            <strong>Phone:</strong> 031 500 2220 | 031 109 5560<br>
            <strong>Email:</strong> queries@erasedebtsa.co.za<br>
            <strong>Website:</strong> www.erasedebtsa.co.za | <strong>Portal:</strong> www.erasedebtsa.net<br><br>
            <em>© 2025 Erase Debt SA. All rights reserved. | POPIA Compliant | NCR Registered</em>
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    // Plain text version
    const emailText = `
RESPONSE TO YOUR QUERY - ERASE DEBT SA

Hello ${finalClientName},

We've responded to your query (Reference: ${reference}).

OUR PROFESSIONAL RESPONSE:
${response}

Responded by: ${adminName}
Date: ${new Date().toLocaleString()}
Query Type: ${queryType}

VIEW FULL DETAILS ON YOUR SECURE PORTAL:
For complete query history and to send follow-up messages, please visit:
https://www.erasedebtsa.net/track-query.html

NEED IMMEDIATE ASSISTANCE?
• Phone: 031 500 2220 or 031 109 5560
• Email: queries@erasedebtsa.co.za
• Portal: Use the link above for instant access to all your information

Important: This email confirms our admin team's response. For the most current information and complete conversation history, please use your secure client portal.

Erase Debt SA
23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068
Phone: 031 500 2220 | 031 109 5560
Email: queries@erasedebtsa.co.za
Website: www.erasedebtsa.co.za | Portal: www.erasedebtsa.net

© 2025 Erase Debt SA. All rights reserved.
    `

-        // SendGrid email payload
+        // SendGrid email payload
        const emailPayload = {
          personalizations: [
            {
              to: [{ email: email }],
-              subject: `Response to Your ${queryType} - Erase Debt SA (${reference})`
+              subject: `✅ Admin Response: ${queryType} - Erase Debt SA (${reference})`
            }
          ],
-          from: { email: FROM_EMAIL, name: 'Erase Debt SA Admin Team' },
+          from: { 
+            email: FROM_EMAIL, 
+            name: 'Erase Debt SA Admin Team' 
+          },
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

+        console.log('📤 Sending via SendGrid...');
+        
        // Send email via SendGrid
-        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
+        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
-          body: JSON.stringify(emailPayload)
+          body: JSON.stringify(sgPayload)
        })

-        if (!response.ok) {
-          const errorText = await response.text()
+        console.log('📡 SendGrid response status:', sendGridResponse.status)
+        
+        if (!sendGridResponse.ok) {
+          const errorText = await sendGridResponse.text()
          console.error('SendGrid error:', errorText)
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Failed to send email notification',
-              details: errorText
+              status: sendGridResponse.status,
+              details: errorText,
+              apiKeyStatus: SENDGRID_API_KEY ? 'Present' : 'Missing'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

-        console.log(`Query response email sent to ${email} for reference ${reference}`)
+        console.log(`✅ Query response email sent successfully to ${email} for reference ${reference}`)

        return new Response(
          JSON.stringify({ 
            success: true, 
-            message: 'Query response email sent successfully to client' 
+            message: 'Query response email sent successfully to client',
+            email: email,
+            reference: reference,
+            timestamp: new Date().toISOString()
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
-            message: error.message
+            message: error.message,
+            stack: error.stack
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    })