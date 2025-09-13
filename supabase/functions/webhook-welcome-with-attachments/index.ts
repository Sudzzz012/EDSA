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
    console.log('=== Welcome Email with Attachments Called ===')
    
    const { clientData } = await req.json()
    
    if (!clientData || !clientData.email) {
      return new Response(
        JSON.stringify({ error: 'Missing client data or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending welcome email with attachments to:', clientData.email)

    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
    
    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate service document HTML
    const serviceResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-service-attachment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientData: clientData,
        attachmentType: 'service'
      })
    })

    if (!serviceResponse.ok) {
      throw new Error('Failed to generate service document')
    }

    const serviceData = await serviceResponse.json()

    // Generate mandate document HTML  
    const mandateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-service-attachment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientData: clientData,
        attachmentType: 'mandate'
      })
    })

    if (!mandateResponse.ok) {
      throw new Error('Failed to generate mandate document')
    }

    const mandateData = await mandateResponse.json()

    // Create base64 encoded attachments
    const serviceAttachment = btoa(serviceData.html)
    const mandateAttachment = btoa(mandateData.html)

    // Generate welcome email content
    const emailContent = generateWelcomeEmailWithAttachments(clientData)

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
      ],
      attachments: [
        {
          content: serviceAttachment,
          filename: `${clientData.sale_reference}_Service_Agreement.html`,
          type: 'text/html',
          disposition: 'attachment'
        },
        {
          content: mandateAttachment,
          filename: `${clientData.sale_reference}_Digital_Mandate.html`,
          type: 'text/html',
          disposition: 'attachment'
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
        JSON.stringify({ error: 'Failed to send welcome email with attachments', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log audit trail
    await logAuditTrail(clientData, 'welcome_email_sent_with_attachments')

    console.log('✅ Welcome email with service and mandate attachments sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email with service document and mandate attachments sent successfully',
        recipient: clientData.email,
        attachments: [
          `${clientData.sale_reference}_Service_Agreement.html`,
          `${clientData.sale_reference}_Digital_Mandate.html`
        ]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending welcome email with attachments:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateWelcomeEmailWithAttachments(client) {
  const subject = `🎉 Welcome to Erase Debt SA - Service Documents Attached`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Erase Debt SA</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f6f9; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(41, 112, 186, 0.15); }
        .header { background: linear-gradient(135deg, #2970ba, #003865); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .content { padding: 40px 30px; background: #ffffff; }
        .highlight { background: #f0f8ff; padding: 20px; border-left: 4px solid #2970ba; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .important { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .attachments-section { background: #e7f3ff; border: 2px solid #2970ba; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; }
        .amount { font-weight: bold; color: #2970ba; font-size: 18px; }
        .footer { background: #f8f9fa; text-align: center; padding: 30px; font-size: 14px; color: #666; border-top: 1px solid #e9ecef; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body style="background: #f4f6f9; margin: 0; padding: 20px;">
      <div class="email-container">
        <div class="header">
          <h1>🎉 Welcome to Erase Debt SA!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Your service has been activated - Documents attached</p>
        </div>
        <div class="content">
          <p>Dear <strong>${client.first_name} ${client.last_name}</strong>,</p>
          
          <p>Congratulations! Your <strong>${client.service_type}</strong> has been activated and our expert team is now working on your case.</p>
          
          <div class="highlight">
            <h3 style="margin-top: 0; color: #2970ba;">📋 Your Service Details</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Service:</strong> ${client.service_type}</li>
              <li><strong>Total Amount:</strong> <span class="amount">R${((client.total_amount || 0)).toLocaleString()}</span></li>
              <li><strong>Monthly Payment:</strong> <span class="amount">R${((client.monthly_payment || 0)).toLocaleString()}</span></li>
              <li><strong>Payment Plan:</strong> ${Math.ceil((client.total_amount || 0) / (client.monthly_payment || 1))} months</li>
              <li><strong>Sale Reference:</strong> ${client.sale_reference}</li>
              <li><strong>Branch:</strong> ${client.branch_name}</li>
            </ul>
          </div>

          <div class="attachments-section">
            <h3 style="margin-top: 0; color: #2970ba;">📎 Important Documents Attached</h3>
            <p><strong>We've attached TWO important documents to this email:</strong></p>
            <ul style="text-align: left; display: inline-block;">
              <li><strong>📋 ${client.sale_reference}_Service_Agreement.html</strong><br>
                  <em>Your complete personalized service agreement</em></li>
              <li><strong>💳 ${client.sale_reference}_Digital_Mandate.html</strong><br>
                  <em>Digital mandate with your exact payment details</em></li>
            </ul>
            <p style="margin-bottom: 0;"><strong>Please open and review both documents carefully. They contain all the information you need to complete your service setup.</strong></p>
          </div>
          
          <div class="important">
            <h3 style="margin-top: 0; color: #856404;">🔑 Next Steps</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Open and read</strong> your service agreement document</li>
              <li><strong>Complete the digital mandate</strong> setup with your bank</li>
              <li><strong>Keep these documents</strong> for your permanent records</li>
              <li><strong>Contact us</strong> if you have any questions about the setup</li>
            </ul>
          </div>
          
          <p><strong>🚀 What happens next:</strong></p>
          <ul>
            <li>Our team begins working on your case immediately</li>
            <li>You'll receive regular updates every 3-5 working days</li>
            <li>Our admin team will contact you to finalize your DebiCheck setup</li>
            <li>Professional support is available whenever you need it</li>
          </ul>
          
          <p style="margin-bottom: 0;">Welcome to the Erase Debt SA family!</p>
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

async function logAuditTrail(clientData, action) {
  try {
    const auditEntry = {
      client_reference: clientData.sale_reference,
      client_name: `${clientData.first_name} ${clientData.last_name}`,
      action: action,
      timestamp: new Date().toISOString(),
      details: {
        service_type: clientData.service_type,
        total_amount: clientData.total_amount,
        monthly_payment: clientData.monthly_payment,
        email: clientData.email,
        agent: clientData.agent_name,
        branch: clientData.branch_name
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