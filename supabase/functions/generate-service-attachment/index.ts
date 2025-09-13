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
    console.log('=== Generate Service Attachment Called ===')
    
    const { clientData, attachmentType } = await req.json()
    
    if (!clientData) {
      return new Response(
        JSON.stringify({ error: 'Missing client data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let htmlContent = ''
    let filename = ''

    if (attachmentType === 'mandate') {
      htmlContent = generateMandateDocument(clientData)
      filename = `mandate_${clientData.sale_reference}.html`
    } else {
      htmlContent = generateServiceDocument(clientData)
      filename = `service_${clientData.sale_reference}.html`
    }

    console.log('✅ Generated', attachmentType, 'document for:', clientData.first_name)

    return new Response(
      JSON.stringify({ 
        success: true,
        html: htmlContent,
        filename: filename,
        clientData: clientData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating service attachment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateMandateDocument(clientData) {
  const mandateTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Authority and Mandate - ${clientData.first_name} ${clientData.last_name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111; line-height: 1.6; }
    h1, h2 { color: #1a4b7a; text-align: center; }
    .section { margin-bottom: 2em; }
    .signature { font-family: 'Brush Script MT', cursive; font-size: 1.7rem; margin-left: 2rem; color: #222; }
    .audit { font-size: 0.9em; color: #444; background: #f9f9f9; padding: 1em; border-top: 2px solid #ccc; margin-top: 3em; }
    .header-logo { width: 300px; display: block; margin: 0 auto 30px; }
    .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #333; }
    .footer img { width: 180px; display: block; margin: 0 auto 10px; }
    .client-highlight { background: #e7f3ff; padding: 15px; border-left: 4px solid #2970ba; margin: 20px 0; }
    .amount { font-weight: bold; color: #2970ba; font-size: 1.1em; }
  </style>
  <script>
    // Auto-populate from service document interaction
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Mandate document loaded for: ${clientData.first_name} ${clientData.last_name}');
      
      // Check if client accessed service document
      const serviceAccessed = localStorage.getItem('service_accessed_${clientData.sale_reference}');
      if (serviceAccessed) {
        // Auto-populate mandate with client data
        populateMandateFromServiceData();
      }
      
      // Track mandate access
      trackMandateAccess();
    });
    
    function populateMandateFromServiceData() {
      console.log('Auto-populating mandate with service data...');
      // Client data is already embedded in the template
      
      // Trigger confirmation email after mandate is viewed
      setTimeout(() => {
        sendConfirmationEmail();
      }, 5000); // 5 seconds after opening mandate
    }
    
    function trackMandateAccess() {
      const accessData = {
        client_reference: '${clientData.sale_reference}',
        document_type: 'mandate',
        access_time: new Date().toISOString(),
        client_name: '${clientData.first_name} ${clientData.last_name}',
        service_type: '${clientData.service_type}'
      };
      
      // Store in localStorage for audit
      localStorage.setItem('mandate_access_${clientData.sale_reference}', JSON.stringify(accessData));
    }
    
    function sendConfirmationEmail() {
      fetch('https://xzjunkpxvfdpuogoflzh.supabase.co/functions/v1/webhook-terms-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6anVua3B4dmZkcHVvZ29mbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjMwNzksImV4cCI6MjA2NDczOTA3OX0.bRMANK5hzAKnuFXylVfhtzuU18CsjeJ4wa1UWHvSPNQ'
        },
        body: JSON.stringify({
          clientData: {
            email: '${clientData.email}',
            first_name: '${clientData.first_name}',
            last_name: '${clientData.last_name}',
            sale_reference: '${clientData.sale_reference}',
            service_type: '${clientData.service_type}'
          },
          mandateAccepted: true,
          accessTime: new Date().toISOString()
        })
      }).then(response => {
        if (response.ok) {
          console.log('✅ Terms confirmation email triggered');
        }
      }).catch(error => {
        console.error('Failed to trigger confirmation email:', error);
      });
    }
  </script>
</head>
<body>
  <h1>AUTHORITY AND MANDATE FOR PAYMENT INSTRUCTIONS</h1>
  <p style="text-align:center;">This Authority and Mandate is entered into between Good Converters T/A Erase Debt SA and ${clientData.first_name} ${clientData.last_name}.</p>

  <div class="client-highlight">
    <h3>Your Personal Details</h3>
    <p><strong>Client Name:</strong> ${clientData.first_name} ${clientData.last_name}</p>
    <p><strong>Client ID Number:</strong> ${clientData.client_id_number}</p>
    <p><strong>Email:</strong> ${clientData.email}</p>
    <p><strong>Phone:</strong> ${clientData.phone}</p>
  </div>

  <div class="section">
    <h2>Service & Payment Details</h2>
    <p><strong>Selected Service:</strong> ${clientData.service_type}</p>
    <p><strong>Total Amount:</strong> <span class="amount">R${(clientData.total_amount || 0).toLocaleString()}</span></p>
    <p><strong>Monthly Payment:</strong> <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span></p>
    <p><strong>Payment Plan:</strong> ${Math.ceil((clientData.total_amount || 0) / (clientData.monthly_payment || 1))} Months</p>
    <p><strong>Sale Reference:</strong> ${clientData.sale_reference}</p>
    <p><strong>Branch:</strong> ${clientData.branch_name}</p>
    <p><strong>Agent:</strong> ${clientData.agent_name}</p>
  </div>

  <div class="section">
    <h2>Bank Account Details</h2>
    <p><strong>Bank Name:</strong> ${clientData.bank || 'To be provided'}</p>
    <p><strong>Account Number:</strong> ${clientData.account_number || 'To be provided'}</p>
    <p><strong>Type of Account:</strong> ${clientData.account_type || 'To be provided'}</p>
    <p><strong>Salary Date:</strong> ${clientData.salary_date || 'To be confirmed'}</p>
    <p><strong>Tracking Start Date:</strong> ${clientData.tracking_date || 'To be confirmed'}</p>
    <p><strong>Nupay Reference:</strong> ${clientData.nupay_reference || 'To be assigned'}</p>
  </div>

  <div class="section">
    <h2>Digital Mandate Setup Instructions</h2>
    <div class="client-highlight">
      <h3>🏦 DebiCheck Authorization Required</h3>
      <p>To complete your service setup, please authorize the following DebiCheck with your bank:</p>
      <ul>
        <li><strong>Creditor:</strong> Good Converters T/A Erase Debt SA</li>
        <li><strong>Monthly Amount:</strong> <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span></li>
        <li><strong>Reference:</strong> ${clientData.sale_reference}</li>
        <li><strong>Collection Date:</strong> ${clientData.salary_date || 'Monthly on your salary date'}</li>
        <li><strong>Duration:</strong> ${Math.ceil((clientData.total_amount || 0) / (clientData.monthly_payment || 1))} months</li>
      </ul>
      <p><strong>Important:</strong> Our admin team will contact you with complete banking details and the DebiCheck mandate form.</p>
    </div>
  </div>

  <div class="section">
    <h2>Terms and Conditions</h2>
    <ol>
      <li><strong>Payment Authorization</strong><br>
        • The Client authorizes Erase Debt SA to collect monthly payments of <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span> via debit order.<br>
        • The Client agrees that Erase Debt SA may track the Client's bank account prior to the debit date to ensure the availability of funds.
      </li>
      <li><strong>Service Delivery</strong><br>
        • The selected service "${clientData.service_type}" will commence only upon receipt of full payment.<br>
        • The completion time for each service is estimated but not guaranteed, as it depends on external factors.
      </li>
      <li><strong>Cancellation Policy</strong><br>
        • The cancellation of this mandate does not terminate the contractual obligation.<br>
        • A no-refund policy applies, as the service commences upon payment.<br>
        • Written notice required for cancellation to queries@erasedebtsa.co.za
      </li>
      <li><strong>Confidentiality & Data Protection</strong><br>
        • Erase Debt SA adheres to POPIA and ensures the confidentiality of client information.<br>
        • Personal and financial data will only be used for the purpose of rendering the selected service.
      </li>
      <li><strong>Client Responsibility & Compliance</strong><br>
        • The Client is responsible for providing accurate information.<br>
        • Delays caused by incorrect information will not be the responsibility of Erase Debt SA.<br>
        • Failure to make payments may result in immediate service termination.
      </li>
    </ol>
  </div>

  <div class="section">
    <h2>Client Declaration</h2>
    <p>I, <strong>${clientData.first_name} ${clientData.last_name}</strong>, confirm that I have read, understood, and agree to the terms of this Authority and Mandate for the service: <strong>${clientData.service_type}</strong></p>
    <p><strong>DebiCheck Accepted:</strong> ✅ Yes (Digital Authorization)</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Digital Signature:</strong></p>
    <p class="signature">${clientData.first_name} ${clientData.last_name}</p>
    <p><strong>Agreement Reference Number:</strong> ${clientData.sale_reference}</p>
    <p><strong>Agent Name:</strong> ${clientData.agent_name}</p>
  </div>

  <div class="audit">
    <h3>Digital Audit Trail</h3>
    <p><strong>Reference Number:</strong> ${clientData.sale_reference}</p>
    <p><strong>Captured By:</strong> ${clientData.agent_name}</p>
    <p><strong>Branch:</strong> ${clientData.branch_name}</p>
    <p><strong>Date Captured:</strong> ${clientData.sale_date || new Date().toLocaleDateString()}</p>
    <p><strong>DebiCheck Accepted:</strong> ✅ Yes (Digital)</p>
    <p><strong>Email Sent To:</strong> ${clientData.email}</p>
    <p><strong>Document Generated:</strong> ${new Date().toISOString()}</p>
    <p><strong>Service Amount:</strong> R${(clientData.total_amount || 0).toLocaleString()}</p>
    <p><strong>Monthly Payment:</strong> R${(clientData.monthly_payment || 0).toLocaleString()}</p>
  </div>

  <div class="footer">
    <p><strong>GOOD CONVERTERS T/A ERASE DEBT SA | REG NUMBER 2013/198706/07</strong></p>
    <p>WEBSITE: www.erasedebtsa.co.za | OFFICE NUMBERS: 0315002220 / 031 109 5560</p>
    <p>EMAIL: admin@erasedebtsa.co.za | 23 Whetstone Drive, Unit 11, Phoenix, DBN, KZN, 4068</p>
  </div>
</body>
</html>`

  return mandateTemplate
}

function generateServiceDocument(clientData) {
  // Get the appropriate service content from your existing service files
  const serviceContent = getServiceContent(clientData.service_type)
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${serviceContent.title} - ${clientData.first_name} ${clientData.last_name}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #222; }
    header { background: #fff; padding: 1rem 2rem; text-align: center; border-bottom: 1px solid #e5e7eb; }
    header img { height: 48px; margin-bottom: 0.5rem; }
    header h1 { font-size: 1.35rem; color: #2680b3; line-height: 1.4; margin: 0; }
    .container { max-width: 800px; margin: 2rem auto; background: #fff; padding: 2rem; border-radius: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h2 { color: #2680b3; margin-top: 2rem; }
    ul { margin-left: 1.2rem; }
    .legal { font-size: 0.92rem; color: #666; margin-top: 2rem; background: #f1f5f9; padding: 1rem; border-left: 4px solid #cbd5e1; }
    p { margin-bottom: 1rem; }
    .client-banner { background: linear-gradient(135deg, #2970ba, #003865); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
    .client-details { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2970ba; }
    .mandate-section { background: #f0fff4; border: 2px solid #28a745; padding: 20px; border-radius: 12px; margin: 25px 0; }
    .amount { font-weight: bold; color: #2970ba; font-size: 1.1em; }
    .close-tracking { position: fixed; top: 10px; right: 10px; background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; }
  </style>
  <script>
    // Track service document interaction
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Service document opened by: ${clientData.first_name} ${clientData.last_name}');
      
      // Mark service as accessed
      localStorage.setItem('service_accessed_${clientData.sale_reference}', 'true');
      
      // Track access in audit log
      const auditData = {
        client_reference: '${clientData.sale_reference}',
        client_name: '${clientData.first_name} ${clientData.last_name}',
        document_type: 'service_agreement',
        access_time: new Date().toISOString(),
        service_type: '${clientData.service_type}',
        total_amount: ${clientData.total_amount || 0},
        monthly_payment: ${clientData.monthly_payment || 0}
      };
      
      // Send audit log
      fetch('https://xzjunkpxvfdpuogoflzh.supabase.co/functions/v1/webhook-audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6anVua3B4dmZkcHVvZ29mbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjMwNzksImV4cCI6MjA2NDczOTA3OX0.bRMANK5hzAKnuFXylVfhtzuU18CsjeJ4wa1UWHvSPNQ'
        },
        body: JSON.stringify({
          auditData: auditData,
          action: 'service_document_opened'
        })
      }).catch(error => console.error('Audit log failed:', error));
    });
    
    // Track when document is closed
    window.addEventListener('beforeunload', function() {
      const closeData = {
        client_reference: '${clientData.sale_reference}',
        document_type: 'service_agreement',
        close_time: new Date().toISOString(),
        duration: Date.now() - (localStorage.getItem('service_open_time_${clientData.sale_reference}') || Date.now())
      };
      
      localStorage.setItem('service_close_time_${clientData.sale_reference}', Date.now().toString());
      
      // This will trigger the mandate auto-population
      console.log('Service document closed - mandate will auto-populate');
    });
    
    localStorage.setItem('service_open_time_${clientData.sale_reference}', Date.now().toString());
  </script>
</head>
<body>
  <div class="client-banner">
    <h1>📋 Your Personal Service Agreement</h1>
    <p><strong>${clientData.first_name} ${clientData.last_name}</strong> | ${clientData.sale_reference}</p>
    <p>Service: ${clientData.service_type}</p>
  </div>

  <header>
    <h1>${serviceContent.title}</h1>
  </header>
  
  <div class="container">
    <div class="client-details">
      <h3>🎯 Your Service Details</h3>
      <ul>
        <li><strong>Client:</strong> ${clientData.first_name} ${clientData.last_name}</li>
        <li><strong>Service:</strong> ${clientData.service_type}</li>
        <li><strong>Total Amount:</strong> <span class="amount">R${(clientData.total_amount || 0).toLocaleString()}</span></li>
        <li><strong>Monthly Payment:</strong> <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span></li>
        <li><strong>Payment Plan:</strong> ${Math.ceil((clientData.total_amount || 0) / (clientData.monthly_payment || 1))} months</li>
        <li><strong>Sale Reference:</strong> ${clientData.sale_reference}</li>
        <li><strong>Branch:</strong> ${clientData.branch_name}</li>
      </ul>
    </div>

    <div class="mandate-section">
      <h3>💳 Digital Mandate Instructions</h3>
      <p><strong>To complete your service setup, please authorize the following DebiCheck with your bank:</strong></p>
      <ul>
        <li><strong>Creditor:</strong> Good Converters T/A Erase Debt SA</li>
        <li><strong>Monthly Amount:</strong> <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span></li>
        <li><strong>Reference:</strong> ${clientData.sale_reference}</li>
        <li><strong>Collection Date:</strong> ${clientData.salary_date || 'Monthly on your salary date'}</li>
        <li><strong>Duration:</strong> ${Math.ceil((clientData.total_amount || 0) / (clientData.monthly_payment || 1))} months</li>
      </ul>
      <p><strong>Important:</strong> Our admin team will contact you with complete banking details and the DebiCheck mandate form.</p>
    </div>

    ${serviceContent.content}

    <div class="legal">
      <h3>📋 Terms Acceptance</h3>
      <p><strong>By opening this document, you confirm that you have read and understood the service terms and conditions outlined above.</strong></p>
      <p>You have a 5-business-day cooling-off period after signing up. Cancellation requests after this window will incur a non-refundable admin and application fee of <strong>R2300</strong>.</p>
      <p>Written notice is required to cancel any debit order - sent to <a href="mailto:queries@erasedebtsa.co.za">queries@erasedebtsa.co.za</a> at least 10 working days before the debit date.</p>
    </div>

    <p style="text-align:center; margin-top: 2rem;">
      <em>This document was generated specifically for ${clientData.first_name} ${clientData.last_name} on ${new Date().toLocaleDateString()}</em>
    </p>
  </div>
</body>
</html>`
}

function getServiceContent(serviceType) {
  const serviceMap = {
    'Service 1A - DRR C and D3 (Still Paying the DC)': {
      title: 'Service 1A - DRR C AND D3 STATUS (Still Paying the Debt Counsellor)',
      content: `
        <h2>Service Description</h2>
        <p>If you are still paying the debt counsellor, Erase Debt SA will initiate a formal transfer request within 72 hours of your sign-up. Our admin team will contact you to provide a Power of Attorney (POA) form, which you will need to sign and return along with a copy of your ID.</p>

        <h2>Timeline</h2>
        <p>The process typically takes up to 12 weeks after final payment, depending on court dates and creditor responsiveness.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure timely payments each month</li>
          <li>Submit signed POA forms and ID copies when requested</li>
          <li>Avoid communicating with the prior debt counsellor without our guidance</li>
          <li>Respond promptly to any additional document or information requests</li>
        </ul>
      `
    },
    'Service 1B - DRR C and D3 (No Longer Paying the DC)': {
      title: 'Service 1B - DRR C AND D3 STATUS (No Longer Paying the Debt Counsellor)',
      content: `
        <h2>Service Description</h2>
        <p>If you are no longer paying your debt counsellor, do not communicate or sign anything further with them. We will formulate all the paperwork you need and ensure we push for the earliest possible court date.</p>

        <h2>Timeline</h2>
        <p>The process typically takes up to 12 weeks after final payment, depending on court dates and creditor responsiveness.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure timely payments each month</li>
          <li>Submit signed POA forms and ID copies when requested</li>
          <li>Avoid communicating with the prior debt counsellor without our guidance</li>
          <li>Respond promptly to any additional document or information requests</li>
        </ul>
      `
    },
    'Service 2 - D4 BELOW 12M': {
      title: 'Service 2 - D4 BELOW 12 MONTHS',
      content: `
        <h2>Service Description</h2>
        <p>As a client under D4 status, you already have a court order in place. To exit debt review, you must pay all outstanding debts in full, collect paid-up letters for each account, and obtain a clearance certificate from a debt counsellor.</p>

        <h2>Timeline</h2>
        <p>The full timeline typically takes up to 12 weeks after final payment, depending on creditor responses and NCR updates.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Make timely payments</li>
          <li>Submit all required paid-up letters and supporting documents</li>
          <li>Stay in communication with our admin team</li>
          <li>Provide honest feedback about staff handling and communication</li>
        </ul>
      `
    },
    'Service 3 - D4 AITC (4-in-1 Credit Report)': {
      title: 'Service 3 - D4 AITC (4-in-1 Credit Report Only)',
      content: `
        <h2>Service Description</h2>
        <p>This service provides a detailed 4-in-1 credit report from the four major bureaus (TransUnion, XDS, VeriCred, and Experian) to help you understand your financial standing.</p>
        <p><strong>Important:</strong> This service does not include any debt review removal, legal filings, or account removals. It is strictly an advisory service.</p>

        <h2>Timeline</h2>
        <p>We aim to complete this within 2 to 3 weeks after final payment.</p>

        <h2>What You'll Receive</h2>
        <ul>
          <li>All listings (including good standing and negative)</li>
          <li>Account balances</li>
          <li>Paid-up accounts</li>
          <li>Prescribed accounts</li>
          <li>Paid-up judgments or admin orders</li>
        </ul>
      `
    },
    'Service 4 - NL/ITC Credit Bureau Advice': {
      title: 'Service 4 - NL/ITC Credit Bureau Advice',
      content: `
        <h2>Service Description</h2>
        <p>This service focuses on delivering expert guidance and credit-specific advice based on a comprehensive 4-in-1 credit check using the four major South African credit bureaus: TransUnion, XDS, VeriCred, and Experian.</p>
        <p><strong>Note:</strong> This service is advisory only. It does not include legal removals, debt review withdrawals, or court filings.</p>

        <h2>Timeline</h2>
        <p>We aim to complete the advisory report and send it to you within 2 to 3 weeks after full payment.</p>

        <h2>What We'll Do</h2>
        <ul>
          <li>Pull your complete 4-in-1 credit report</li>
          <li>Review and identify any negative factors or issues on your profile</li>
          <li>Prepare a detailed written report explaining the negative areas</li>
          <li>Provide clear, actionable advice on how to improve your creditworthiness</li>
        </ul>
      `
    },
    'Service 5 - NL ITC Clearance': {
      title: 'Service 5 - NL ITC Clearance',
      content: `
        <h2>Service Description</h2>
        <p>This service is for clearing negative listings that appear on your credit report, including settled but still listed accounts, paid-up judgments, admin orders, accounts listed in error, and prescribed or outdated records.</p>

        <h2>Timeline</h2>
        <p>Most cases are completed within 6–8 weeks after final payment and document submission.</p>

        <h2>Process</h2>
        <ul>
          <li>Pull your full 4-in-1 credit report</li>
          <li>Identify and clear listings that qualify</li>
          <li>Submit paid-up letters or supporting documents as required</li>
          <li>Communicate with credit bureaus or data providers as needed</li>
        </ul>
      `
    },
    'Service 6 - RN A Status - NL Removals': {
      title: 'Service 6 - RN A Status NL Removals',
      content: `
        <h2>Service Description</h2>
        <p>This service focuses on helping RN A status clients by requesting a formal transfer from your current debt counsellor, conducting an affordability assessment, and working to remove eligible negative listings.</p>

        <h2>Timeline</h2>
        <p>The process typically takes 8 to 12 weeks after full payment, depending on the complexity of your profile and creditor cooperation.</p>

        <h2>What We Remove</h2>
        <ul>
          <li>Prescribed debts</li>
          <li>Expired enquiries (over 12 months)</li>
          <li>Paid-up admin orders</li>
          <li>Paid-up judgments</li>
          <li>Inaccurate or outdated credit information</li>
        </ul>
        <p><strong>Note:</strong> Current arrears, recent judgments, admin orders, or enquiries cannot be removed.</p>
      `
    },
    'Service 7 - RN Other Status / NL Removal': {
      title: 'Service 7 - RN Other Status / NL Removal',
      content: `
        <h2>Service Description</h2>
        <p>This service assists clients who were previously under debt review but no longer are, were never under debt review but still show blocks or negative listings, or have judgments, admin orders, expired inquiries, or other outdated negative items.</p>

        <h2>Timeline</h2>
        <p>Completion typically takes 6–10 weeks depending on your case details.</p>

        <h2>Eligible Removals</h2>
        <ul>
          <li>Prescribed accounts</li>
          <li>Expired inquiries (older than 12 months)</li>
          <li>Paid-up judgments or admin orders</li>
          <li>Settled but still-listed accounts</li>
        </ul>
      `
    }
  }

  return serviceMap[serviceType] || {
    title: 'Your Service Agreement',
    content: `
      <h2>Service Description</h2>
      <p>Your selected service: <strong>${serviceType}</strong></p>
      <p>Our team will provide you with professional service according to the terms and conditions.</p>
    `
  }
}