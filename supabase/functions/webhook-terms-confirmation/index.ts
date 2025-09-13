const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Terms Confirmation Webhook Called ===')
    
    const { clientData, mandateAccepted, accessTime } = await req.json()
    
    if (!clientData || !clientData.email) {
      return new Response(
        JSON.stringify({ error: 'Missing client data or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending terms confirmation email to:', clientData.email)

    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
    
    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate confirmation email
    const emailContent = generateTermsConfirmationEmail(clientData, accessTime)

    const emailData = {
      personalizations: [
        {
          to: [{ email: clientData.email, name: `${clientData.first_name} ${clientData.last_name}` }],
          subject: emailContent.subject
        }
      ],
      from: {
        email: 'noreply@erasedebtsa.net',
        name: 'Erase Debt SA'
      },
      content: [
        {
          type: 'text/html',
          value: emailContent.html
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
      console.error('SendGrid error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send terms confirmation email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log audit trail
    await logAuditTrail(clientData, 'terms_accepted_confirmation_sent', {
      mandate_accepted: mandateAccepted,
      access_time: accessTime
    })

    console.log('✅ Terms confirmation email sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Terms confirmation email sent successfully',
        recipient: clientData.email,
        confirmed_at: accessTime
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in terms confirmation webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateTermsConfirmationEmail(client, accessTime) {
  const subject = `✅ Terms & Conditions Accepted - ${client.service_type}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Terms Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f6f9; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(41, 112, 186, 0.15); }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .content { padding: 40px 30px; background: #ffffff; }
        .success { background: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .audit-section { background: #f8f9fa; border: 2px solid #6c757d; padding: 20px; border-radius: 12px; margin: 25px 0; }
        .footer { background: #f8f9fa; text-align: center; padding: 30px; font-size: 14px; color: #666; border-top: 1px solid #e9ecef; }
        .amount { font-weight: bold; color: #28a745; font-size: 18px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body style="background: #f4f6f9; margin: 0; padding: 20px;">
      <div class="email-container">
        <div class="header">
          <h1>✅ Terms & Conditions Accepted</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Your service agreement is now complete</p>
        </div>
        <div class="content">
          <p>Dear <strong>${client.first_name} ${client.last_name}</strong>,</p>
          
          <p>Thank you for reviewing and accepting the terms and conditions for your <strong>${client.service_type}</strong>.</p>
          
          <div class="success">
            <h3 style="margin-top: 0; color: #155724;">🎯 Terms Acceptance Confirmed</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Client:</strong> ${client.first_name} ${client.last_name}</li>
              <li><strong>Service:</strong> ${client.service_type}</li>
              <li><strong>Reference:</strong> ${client.sale_reference}</li>
              <li><strong>Acceptance Time:</strong> ${new Date(accessTime).toLocaleString()}</li>
              <li><strong>Status:</strong> <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px;">TERMS ACCEPTED</span></li>
            </ul>
          </div>
          
          <p><strong>📋 What This Means:</strong></p>
          <ul>
            <li>Your service agreement is now legally binding and complete</li>
            <li>Our team can proceed with your case processing</li>
            <li>Your monthly payment schedule is confirmed</li>
            <li>You've accepted all terms and conditions as outlined</li>
          </ul>
          
          <div class="audit-section">
            <h3 style="margin-top: 0; color: #495057;">📊 Digital Audit Record</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Document Access:</strong> Service agreement opened and reviewed</li>
              <li><strong>Mandate Review:</strong> Digital mandate terms accepted</li>
              <li><strong>IP Tracking:</strong> Access logged for legal compliance</li>
              <li><strong>Timestamp:</strong> ${new Date(accessTime).toISOString()}</li>
              <li><strong>Audit Reference:</strong> ${client.sale_reference}_TERMS_${Date.now()}</li>
            </ul>
          </div>
          
          <p><strong>🚀 Next Steps:</strong></p>
          <ul>
            <li>Our admin team will contact you within 24 hours</li>
            <li>We'll provide complete banking details for your DebiCheck setup</li>
            <li>Your case processing begins immediately</li>
            <li>Regular updates every 3-5 working days via email</li>
          </ul>
          
          <p>Thank you for choosing Erase Debt SA. Your journey to financial freedom is now officially underway!</p>
          
          <p style="margin-bottom: 0;">Best regards,</p>
          <p><strong>The Erase Debt SA Team</strong></p>
        </div>
        <div class="footer">
          <div style="line-height: 1.8;">
            <strong>Erase Debt SA</strong><br>
            23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068<br><br>
            📞 <a href="tel:0315002220" style="color: #2970ba;">031 500 2220</a> / <a href="tel:0311095560" style="color: #2970ba;">031 109 5560</a><br>
            📧 <a href="mailto:admin@erasedebtsa.co.za" style="color: #2970ba;">admin@erasedebtsa.co.za</a><br>
            🌐 <a href="https://www.erasedebtsa.net" style="color: #2970ba;">www.erasedebtsa.net</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  return { subject, html }
}

async function logAuditTrail(clientData, action, additionalData = {}) {
  try {
    const auditEntry = {
      client_reference: clientData.sale_reference,
      client_name: `${clientData.first_name} ${clientData.last_name}`,
      action: action,
      timestamp: new Date().toISOString(),
      details: {
        service_type: clientData.service_type,
        email: clientData.email,
        agent: clientData.agent_name,
        branch: clientData.branch_name,
        ...additionalData
      }
    }

    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-audit-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auditData: auditEntry,
        action: action
      })
    })
  } catch (error) {
    console.error('Audit logging failed:', error)
  }
}