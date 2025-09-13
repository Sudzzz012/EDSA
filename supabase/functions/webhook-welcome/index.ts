import { getEmailTemplate } from '../email-templates/index.ts';

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
    console.log('=== Welcome Webhook Called ===')
    
    const { clientData } = await req.json()
    
    if (!clientData || !clientData.email) {
      return new Response(
        JSON.stringify({ error: 'Missing client data or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling sendWelcomeEmail for:', clientData.email)

    const SENDGRID_API_KEY = Deno.env.get('SENDGRIDFINAL')
    
    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate welcome email using template
    const emailContent = getEmailTemplate('welcome', {
      clientName: `${clientData.first_name} ${clientData.last_name}`,
      serviceType: clientData.service_type,
      totalAmount: clientData.total_amount,
      monthlyPayment: clientData.monthly_payment,
      saleReference: clientData.sale_reference,
      branch: clientData.branch_name,
      serviceDocumentLink: `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-service-document?token=${clientData.service_document_token}`
    });

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
        JSON.stringify({ error: 'Failed to send welcome email', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Welcome email sent successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        recipient: clientData.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in welcome webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})