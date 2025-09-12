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
    console.log('=== Email Template Function Called ===')
    
    const { template, clientData } = await req.json()
    
    if (!template || !clientData) {
      return new Response(
        JSON.stringify({ error: 'Missing template or client data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Template:', template)
    console.log('Client:', clientData.first_name, clientData.last_name)

    // Get SendGrid API key
    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL') || 
                             Deno.env.get('SENDGRID_API_KEY') || 
                             Deno.env.get('RESEND_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.error('❌ No email API key configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate email content based on template
    const emailContent = generateEmailTemplate(template, clientData)
    
    console.log('Generated email:', emailContent.subject)

    // Send via SendGrid
    const emailData = {
      personalizations: [
        {
          to: [{ email: clientData.email, name: `${clientData.first_name} ${clientData.last_name}` }],
          subject: emailContent.subject
        }
      ],
      from: {
        email: 'noreply@erasedebtsa.co.za',
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
      console.error('❌ SendGrid error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Email sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${template} email sent to ${clientData.email}`,
        template: template
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in email template function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateEmailTemplate(template, client) {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #2970ba; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #2970ba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      .amount { font-weight: bold; color: #2970ba; }
      .highlight { background: #e7f3ff; padding: 15px; border-left: 4px solid #2970ba; margin: 20px 0; }
    </style>
  `;

  const templates = {
    welcome: {
      subject: `Welcome to Erase Debt SA - ${client.service_type}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Welcome to Erase Debt SA</title>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Erase Debt SA!</h1>
            </div>
            <div class="content">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              
              <p>Thank you for choosing Erase Debt SA for your credit restoration journey. Your application has been successfully activated!</p>
              
              <div class="highlight">
                <h3>Your Service Details:</h3>
                <ul>
                  <li><strong>Service:</strong> ${client.service_type}</li>
                  <li><strong>Total Amount:</strong> <span class="amount">R${(client.total_amount || 0).toLocaleString()}</span></li>
                  <li><strong>Monthly Payment:</strong> <span class="amount">R${(client.monthly_payment || 0).toLocaleString()}</span></li>
                  <li><strong>Sale Reference:</strong> ${client.sale_reference || 'TBC'}</li>
                </ul>
              </div>
              
              <p>Our expert team will begin working on your case immediately. You can expect regular updates every 3-5 working days.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Keep this email for your records</li>
                <li>Ensure your monthly payments are made on time</li>
                <li>Check your email regularly for updates</li>
                <li>Contact us if you have any questions</li>
              </ul>
              
              <p>You can track your progress anytime using your reference number at our client portal.</p>
              
              <p>Best regards,<br><strong>Erase Debt SA Team</strong></p>
            </div>
            <div class="footer">
              <p>Erase Debt SA | 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068</p>
              <p>Phone: 031 500 2220 / 031 109 5560 | Email: admin@erasedebtsa.co.za</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    payment: {
      subject: `Payment Reminder - R${(client.monthly_payment || 0).toLocaleString()} Due`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Payment Reminder</title>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              
              <p>This is a friendly reminder that your monthly payment is due soon.</p>
              
              <div class="highlight">
                <h3>Payment Details:</h3>
                <ul>
                  <li><strong>Monthly Payment:</strong> <span class="amount">R${(client.monthly_payment || 0).toLocaleString()}</span></li>
                  <li><strong>Service:</strong> ${client.service_type}</li>
                  <li><strong>Reference:</strong> ${client.sale_reference || 'N/A'}</li>
                  <li><strong>Due Date:</strong> ${client.salary_date || 'As per your agreement'}</li>
                </ul>
              </div>
              
              <p><strong>Payment Methods:</strong></p>
              <ul>
                <li>DebiCheck automatic deduction (if set up)</li>
                <li>EFT transfer to our banking details</li>
                <li>Contact us for other payment options</li>
              </ul>
              
              <p>Timely payments ensure your case progresses smoothly without delays.</p>
              
              <p>If you've already made this payment, please ignore this reminder.</p>
              
              <p>Best regards,<br><strong>Erase Debt SA Team</strong></p>
            </div>
            <div class="footer">
              <p>Erase Debt SA | 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068</p>
              <p>Phone: 031 500 2220 / 031 109 5560 | Email: admin@erasedebtsa.co.za</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    documents: {
      subject: `Document Request - ${client.service_type}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Document Request</title>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Document Request</h1>
            </div>
            <div class="content">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              
              <p>To continue processing your <strong>${client.service_type}</strong> case, we need additional documentation from you.</p>
              
              <div class="highlight">
                <h3>Required Documents:</h3>
                <ul>
                  <li>Copy of your ID document</li>
                  <li>Proof of income (latest payslip)</li>
                  <li>Bank statements (last 3 months)</li>
                  <li>Any relevant paid-up letters</li>
                  <li>Power of Attorney form (attached or will be sent separately)</li>
                </ul>
              </div>
              
              <p><strong>How to Submit:</strong></p>
              <ul>
                <li>Email scanned copies to: <strong>admin@erasedebtsa.co.za</strong></li>
                <li>Use your reference number: <strong>${client.sale_reference || 'TBC'}</strong></li>
                <li>Or upload via our secure client portal</li>
              </ul>
              
              <p><strong>Important:</strong> Please submit these documents within 7 days to avoid delays in processing your case.</p>
              
              <p>If you have any questions about the required documents, please contact our team.</p>
              
              <p>Best regards,<br><strong>Erase Debt SA Team</strong></p>
            </div>
            <div class="footer">
              <p>Erase Debt SA | 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068</p>
              <p>Phone: 031 500 2220 / 031 109 5560 | Email: admin@erasedebtsa.co.za</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    update: {
      subject: `Service Update - ${client.service_type}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Service Update</title>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Service Progress Update</h1>
            </div>
            <div class="content">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              
              <p>We're writing to provide you with an update on your <strong>${client.service_type}</strong> case.</p>
              
              <div class="highlight">
                <h3>Current Status:</h3>
                <ul>
                  <li><strong>Service:</strong> ${client.service_type}</li>
                  <li><strong>Status:</strong> ${(client.status || 'Active').replace('_', ' ').toUpperCase()}</li>
                  <li><strong>Reference:</strong> ${client.sale_reference || 'TBC'}</li>
                  <li><strong>Monthly Payment:</strong> <span class="amount">R${(client.monthly_payment || 0).toLocaleString()}</span></li>
                </ul>
              </div>
              
              <p><strong>What's Happening:</strong></p>
              <ul>
                <li>Your case is progressing according to schedule</li>
                <li>Our team is actively working on your credit profile</li>
                <li>We're in communication with relevant credit bureaus</li>
                <li>All payments received have been processed</li>
              </ul>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Continue making your monthly payments on time</li>
                <li>Respond promptly to any document requests</li>
                <li>Avoid applying for new credit during this process</li>
              </ul>
              
              <p>We'll send you another update within the next 3-5 working days, or sooner if there are significant developments.</p>
              
              <p>Thank you for your patience and trust in our services.</p>
              
              <p>Best regards,<br><strong>Erase Debt SA Team</strong></p>
            </div>
            <div class="footer">
              <p>Erase Debt SA | 23 Whetstone Drive, Unit 11, Phoenix, Durban, 4068</p>
              <p>Phone: 031 500 2220 / 031 109 5560 | Email: admin@erasedebtsa.co.za</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }

  if (!templates[template]) {
    return new Response(
      JSON.stringify({ error: 'Invalid email template', availableTemplates: Object.keys(templates) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return templates[template]
}