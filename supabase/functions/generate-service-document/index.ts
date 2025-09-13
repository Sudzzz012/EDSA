const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token, Authorization',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Generate Service Document Called ===')
    
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return new Response('Invalid access - missing token', { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      })
    }

    // Decode the service token to get client info
    let clientData
    try {
      const decoded = atob(token)
      clientData = JSON.parse(decoded)
    } catch (error) {
      return new Response('Invalid token format', { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      })
    }

    // Check token expiry (30 days)
    if (clientData.expires && Date.now() > clientData.expires) {
      return new Response('Document link has expired', { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      })
    }

    // Generate personalized service document HTML
    const serviceHtml = generatePersonalizedServiceDocument(clientData)
    
    console.log('✅ Service document generated for:', clientData.first_name, clientData.service_type)

    return new Response(serviceHtml, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Error generating service document:', error)
    return new Response('Error generating document', { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
    })
  }
})

function generatePersonalizedServiceDocument(clientData) {
  // Map service types to appropriate content
  const serviceContent = getServiceContent(clientData.service_type)
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${serviceContent.title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #222; }
    .banner { background: linear-gradient(135deg, #2970ba, #003865); color: #fff; padding: 2rem; text-align: center; }
    .client-info { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; }
    header { background: #fff; padding: 1rem 2rem; text-align: center; border-bottom: 1px solid #e5e7eb; }
    header img { height: 48px; margin-bottom: 0.5rem; }
    header h1 { font-size: 1.35rem; color: #2680b3; line-height: 1.4; margin: 0; }
    .container { max-width: 800px; margin: 2rem auto; background: #fff; padding: 2rem; border-radius: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h2 { color: #2680b3; margin-top: 2rem; }
    ul { margin-left: 1.2rem; }
    .legal { font-size: 0.92rem; color: #666; margin-top: 2rem; background: #f1f5f9; padding: 1rem; border-left: 4px solid #cbd5e1; }
    .back { display: inline-block; margin: 2rem 0 1rem 0; color: #2680b3; text-decoration: none; font-weight: bold; }
    p { margin-bottom: 1rem; }
    .personalized { background: #e7f3ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #2970ba; margin: 1rem 0; }
    .amount { font-weight: bold; color: #2970ba; }
    .important-notice { background: #ffeaa7; border: 2px solid #fdcb6e; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; }
    .digital-mandate { background: #d4edda; border: 2px solid #28a745; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; }
  </style>
  <script>
    // Track document access
    console.log('Service document accessed by:', '${clientData.first_name} ${clientData.last_name}');
    
    // Disable right-click and text selection for security
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    document.addEventListener('selectstart', function(e) { e.preventDefault(); });
  </script>
</head>
<body>
  <div class="banner">
    <h1>📋 Your Personal Service Agreement</h1>
    <div class="client-info">
      <strong>${clientData.first_name} ${clientData.last_name}</strong><br>
      Sale Reference: ${clientData.sale_reference}<br>
      Service: ${clientData.service_type}
    </div>
  </div>

  <header>
    <img src="https://via.placeholder.com/48x48/2970ba/ffffff?text=EDSA" alt="Erase Debt SA Logo"/>
    <h1>${serviceContent.title}</h1>
  </header>
  
  <div class="container">
    <div class="personalized">
      <h3>🎯 Your Personalized Service Details</h3>
      <ul>
        <li><strong>Client Name:</strong> ${clientData.first_name} ${clientData.last_name}</li>
        <li><strong>Service Type:</strong> ${clientData.service_type}</li>
        <li><strong>Total Amount:</strong> <span class="amount">R${(clientData.total_amount || 0).toLocaleString()}</span></li>
        <li><strong>Monthly Payment:</strong> <span class="amount">R${(clientData.monthly_payment || 0).toLocaleString()}</span></li>
        <li><strong>Sale Reference:</strong> ${clientData.sale_reference}</li>
        <li><strong>Payment Plan:</strong> ${Math.ceil((clientData.total_amount || 0) / (clientData.monthly_payment || 1))} months</li>
      </ul>
    </div>

    <div class="digital-mandate">
      <h3>📋 Digital Mandate Instructions</h3>
      <p><strong>For your DebiCheck authorization, please provide the following details to your bank:</strong></p>
      <ul>
        <li><strong>Creditor:</strong> Erase Debt SA</li>
        <li><strong>Amount:</strong> R${(clientData.monthly_payment || 0).toLocaleString()}</li>
        <li><strong>Reference:</strong> ${clientData.sale_reference}</li>
        <li><strong>Collection Date:</strong> Monthly (as per your salary date)</li>
        <li><strong>Bank Details:</strong> Will be provided by our admin team</li>
      </ul>
      <p><strong>Important:</strong> This digital mandate ensures your monthly payments are collected automatically, keeping your service on track.</p>
    </div>

    ${serviceContent.content}

    <div class="important-notice">
      <h3>⚠️ Important Document Notice</h3>
      <p><strong>This is your personalized service agreement document.</strong></p>
      <ul>
        <li>This document is generated specifically for ${clientData.first_name} ${clientData.last_name}</li>
        <li>Contains your exact service details and payment plan</li>
        <li>Keep this email and document for your records</li>
        <li>This secure link expires in 30 days for security</li>
        <li>Contact us if you need a new copy</li>
      </ul>
    </div>

    <div class="legal">
      <p>You have a 5-business-day cooling-off period after signing up. Cancellation requests after this window will incur a non-refundable admin and application fee. To cancel a debit order, written notice must be sent to <a href="mailto:queries@erasedebtsa.co.za">queries@erasedebtsa.co.za</a> at least 10 working days before the debit date. Please note: canceling the debit order does not cancel the service agreement, and any legally owed amounts cannot be reclaimed.</p>
      <p><strong>Please note:</strong> The non-refundable admin and application fee is set at <strong>R2300</strong> or equal to the first DebiCheck debit order amount. If the first DebiCheck debit order is less than R2300, a second debit will be processed to cover the full admin and application fee after the 5-business-day cooling-off period.</p>
    </div>

    <p style="text-align:center; margin-top: 2rem;">
      <em>This is a secure document generated specifically for ${clientData.first_name} ${clientData.last_name}</em>
    </p>
  </div>
  
  <script>
    // Prevent saving/printing for security
    window.addEventListener('beforeprint', function(e) {
      alert('This document cannot be printed. Please save this email for your records.');
      e.preventDefault();
      return false;
    });
  </script>
</body>
</html>
  `
}

function getServiceContent(serviceType) {
  const serviceMap = {
    'Service 1A - DRR C and D3 (Still Paying the DC)': {
      title: 'Service 1A - DRR C AND D3 STATUS (Still Paying the Debt Counsellor)',
      content: `
        <p><strong>Thank you for signing up with Erase Debt SA.</strong> By accepting the DebiCheck authorization, you have already confirmed your agreement to the service terms and conditions, which were carefully explained during your signup call. This section gives you a comprehensive breakdown of what you can expect: from your first successful payment, through documentation, processing, legal preparation, and final service delivery.</p>

        <h2>Important Payment Notes</h2>
        <p>Please note your DebiCheck debit order may process 1 or 2 days before the scheduled date. This happens due to weekends, public holidays, or bank processing times. We track your payments carefully within 72 to 120 hours (3 to 5 working days, excluding weekends and public holidays) after signup to keep everything on track. It is crucial to understand that missing a payment or failing to submit required documents can delay the service timeline, which typically takes up to 12 weeks after final payment, depending on court dates and creditor responsiveness.</p>

        <h2>Detailed Service Description</h2>
        <p>If you are still paying the debt counsellor, Erase Debt SA will initiate a formal transfer request within 72 hours of your sign-up. Our admin team will contact you to provide a Power of Attorney (POA) form, which you will need to sign and return along with a copy of your ID. This allows us to proceed with the official handover. The transfer will be handled by our partnered debt counsellor, Debt Mate. We will draft all necessary court documents for you to represent yourself in court, or you may choose to use your own attorney, or our panel of attorneys (at an additional cost).</p>

        <h2>Payment Milestones (Successful Payment Towards Your Services)</h2>
        <p>Each payment milestone is critical to maintaining progress on your case. Every payment made must be tracked successfully; otherwise, your timeline and completion date will shift forward.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure timely payments each month.</li>
          <li>Submit signed POA forms and ID copies when requested.</li>
          <li>Avoid communicating with the prior debt counsellor without our guidance.</li>
          <li>Respond promptly to any additional document or information requests.</li>
          <li>Provide feedback on staff performance to help us maintain service quality.</li>
        </ul>

        <h2>Why Some Clients Move Faster Than Others</h2>
        <p>Each case is unique; some clients have straightforward credit profiles, while others involve complex legal histories or multiple creditors. We treat all clients equally, but processing times can differ depending on the complexity of your situation.</p>

        <h2>Communication and Updates</h2>
        <p>Our administrative team provides regular updates every 3 to 5 working days after payments or major milestones. You can also contact us directly via our office landline numbers: 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit queries or track your process using your ID number.</p>
      `
    },
    
    'Service 1B - DRR C and D3 (No Longer Paying the DC)': {
      title: 'Service 1B - DRR C AND D3 STATUS (No Longer Paying the Debt Counsellor)',
      content: `
        <p><strong>Thank you for signing up with Erase Debt SA.</strong> By accepting the DebiCheck authorization, you have already confirmed your agreement to the service terms and conditions, which were carefully explained during your signup call. This section gives you a comprehensive breakdown of what you can expect: from your first successful payment, through documentation, processing, legal preparation, and final service delivery.</p>

        <h2>Important Payment Notes</h2>
        <p>Please note your DebiCheck debit order may process 1 or 2 days before the scheduled date. This happens due to weekends, public holidays, or bank processing times. We track your payments carefully within 72 to 120 hours (3 to 5 working days, excluding weekends and public holidays) after signup to keep everything on track. It is crucial to understand that missing a payment or failing to submit required documents can delay the service timeline, which typically takes up to 12 weeks after final payment, depending on court dates and creditor responsiveness.</p>

        <h2>Detailed Service Description</h2>
        <p>If you are no longer paying your debt counsellor, do not communicate or sign anything further with them, as this could escalate your matter to a D4 status and trigger a requirement to settle all debts before exiting. We will formulate all the paperwork you need and ensure we push for the earliest possible court date.</p>
        <p>Our admin team will contact you to provide a Power of Attorney (POA) form, which you will need to sign and return along with a copy of your ID. This allows us to proceed with the official handover. The transfer will be handled by our partnered debt counsellor, Debt Mate. We will draft all necessary court documents for you to represent yourself in court, or you may choose to use your own attorney, or our panel of attorneys (at an additional cost).</p>

        <h2>Payment Milestones (Successful Payment Towards Your Services)</h2>
        <p>Each payment milestone is critical to maintaining progress on your case. Every payment made must be tracked successfully; otherwise, your timeline and completion date will shift forward.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure timely payments each month.</li>
          <li>Submit signed POA forms and ID copies when requested.</li>
          <li>Avoid communicating with the prior debt counsellor without our guidance.</li>
          <li>Respond promptly to any additional document or information requests.</li>
          <li>Provide feedback on staff performance to help us maintain service quality.</li>
        </ul>

        <h2>Communication and Updates</h2>
        <p>Our administrative team provides regular updates every 3 to 5 working days after payments or major milestones. You can also contact us directly via our office landline numbers: 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit queries or track your process using your ID number.</p>
      `
    },

    'Service 2 - D4 BELOW 12M': {
      title: 'Service 2 - D4 BELOW 12 MONTHS',
      content: `
        <p><strong>Thank you for signing up with Erase Debt SA.</strong> By accepting the DebiCheck authorization, you have already confirmed your agreement to the service terms and conditions, carefully explained during your signup call. This section gives you a detailed explanation of the process, timelines, and your responsibilities.</p>

        <h2>Important Payment Notes</h2>
        <p>Your DebiCheck debit order may run 1 or 2 days before the scheduled debit date due to weekends, public holidays, or bank processing. We track your payments within 72 to 120 hours (3 to 5 working days) after signup to avoid any delays. Missing a payment or not submitting required documents will delay the process. The full timeline typically takes up to 12 weeks after final payment, depending on creditor responses and NCR updates.</p>

        <h2>Detailed Service Description</h2>
        <p>As a client under D4 status, you already have a court order in place. To exit debt review, you must:</p>
        <ul>
          <li>Pay all outstanding debts in full</li>
          <li>Collect paid-up letters for each account</li>
          <li>Obtain a clearance certificate from a debt counsellor</li>
        </ul>
        <p>Our team will assist you once we receive all full payments. We will:</p>
        <ul>
          <li>Review your credit profile</li>
          <li>Help list accounts needing settlement</li>
          <li>Guide you in obtaining paid-up letters</li>
          <li>Submit these to the NCR for final clearance</li>
        </ul>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Make timely payments</li>
          <li>Submit all required paid-up letters and supporting documents</li>
          <li>Stay in communication with our admin team</li>
          <li>Provide honest feedback about staff handling and communication</li>
        </ul>

        <h2>Communication and Updates</h2>
        <p>We provide regular updates every 3 to 5 working days after each payment or milestone. If you have any questions or concerns, you can reach us at: 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit a query or track progress using your ID number.</p>
      `
    },

    'Service 3 - D4 AITC (4-in-1 Credit Report)': {
      title: 'Service 3 - D4 AITC (4-in-1 Credit Report Only)',
      content: `
        <p>This service provides a detailed 4-in-1 credit report from the four major bureaus (TransUnion, XDS, VeriCred, and Experian) to help you understand your financial standing.</p>

        <p><strong>Important:</strong> This service does not include any debt review removal, legal filings, or account removals. It is strictly an advisory service.</p>

        <p>Once we receive your full payment, we will pull the full 4-in-1 report, analyze it, and deliver a written advisory explaining your next steps. This report will disclose:</p>
        <ul>
          <li>All listings (including good standing and negative)</li>
          <li>Account balances</li>
          <li>Paid-up accounts</li>
          <li>Prescribed accounts</li>
          <li>Paid-up judgments or admin orders</li>
        </ul>

        <h2>Timeline</h2>
        <p>We aim to complete this within 2 to 3 weeks after final payment.</p>

        <h2>Your Responsibilities</h2>
        <ul>
          <li>Make full payment before we begin</li>
          <li>Provide any supporting documentation if requested</li>
          <li>Understand that no removal or legal work is included; this is strictly for report delivery and advisory purposes</li>
        </ul>
      `
    },

    'Service 4 - NL/ITC Credit Bureau Advice': {
      title: 'Service 4 - NL/ITC Credit Bureau Advice',
      content: `
        <p>Thank you for signing up with Erase Debt SA. By accepting the DebiCheck authorization, you have already confirmed your agreement to the service terms and conditions, as carefully explained during your signup call. This section provides you with a full overview of what to expect during the advisory process, from payment milestones to your credit report review and our professional recommendations.</p>

        <h2>Important Payment Notes</h2>
        <p>Please note that your DebiCheck debit order may process 1 to 2 days before the scheduled debit date. This is due to factors like weekends, public holidays, or the way banks process transactions. We track payments carefully within 72 to 120 hours (3 to 5 working days, excluding weekends and public holidays) after signup to ensure we stay on schedule. Missing a payment or delaying document submissions will delay your overall process timeline, which typically takes 2 to 3 weeks after final payment.</p>

        <h2>Detailed Service Description</h2>
        <p>This service focuses on delivering expert guidance and credit-specific advice based on a comprehensive 4-in-1 credit check that we conduct using the four major South African credit bureaus:</p>
        <ul>
          <li>TransUnion</li>
          <li>XDS</li>
          <li>VeriCred</li>
          <li>Experian</li>
        </ul>
        <p>Once full payment is received, we will:</p>
        <ul>
          <li>Pull your complete 4-in-1 credit report</li>
          <li>Review and identify any negative factors or issues on your profile</li>
          <li>Prepare a detailed written report explaining the negative areas and providing clear, actionable advice on how to improve your creditworthiness</li>
        </ul>
        <p><strong>Note:</strong> This service is advisory only. It does not include legal removals, debt review withdrawals, or court filings.</p>

        <h2>Timeline</h2>
        <p>We aim to complete the advisory report and send it to you within 2 to 3 weeks after full payment has been made.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure full payment is made before we begin.</li>
          <li>Provide any supporting documentation we request to assist the process.</li>
          <li>Understand that this service is purely for advice and does not include legal work or removals.</li>
          <li>Provide feedback on how our staff handled your query so we can improve service quality.</li>
        </ul>

        <h2>Communication and Updates</h2>
        <p>Our admin team provides regular updates every 3 to 5 working days after each payment or milestone is reached. If you need to contact us, you can:</p>
        <ul>
          <li>Call 031 500 2220 or 031 109 5560</li>
          <li>Visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit queries or track your process using your ID number.</li>
        </ul>
      `
    },

    'Service 5 - NL ITC Clearance': {
      title: 'Service 5 - NL ITC Clearance',
      content: `
        <p>Thank you for signing up with Erase Debt SA. By accepting the DebiCheck authorization, you have confirmed your agreement to our service terms and conditions, as explained during your signup call. This page gives you a full breakdown of what to expect from this service, including timelines, client responsibilities, and admin requirements.</p>

        <h2>Important Payment Notes</h2>
        <p>Your DebiCheck debit order may process 1–2 days before your scheduled date, depending on bank processing times, public holidays, or weekends. We track your payments carefully 3–5 working days after sign-up. Late payments or missing documents may cause delays. Most cases are completed within 6–8 weeks after final payment and document submission.</p>

        <h2>Service Description</h2>
        <p>This service is for clearing negative listings that appear on your credit report. These may include:</p>
        <ul>
          <li>Settled but still listed accounts</li>
          <li>Paid-up judgments</li>
          <li>Admin orders</li>
          <li>Accounts listed in error</li>
          <li>Prescribed or outdated records</li>
        </ul>
        <p>Once payment is received, we'll pull your full 4-in-1 credit report and assist in identifying and clearing the listings that qualify. You may be required to submit paid-up letters or supporting documents. This process may require communication with the credit bureaus or data providers, and timelines may vary.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Ensure full payment is made before processing begins</li>
          <li>Provide paid-up letters and ID copies as needed</li>
          <li>Respond to requests from our admin team promptly</li>
          <li>Avoid making new credit applications until the service is complete</li>
        </ul>

        <h2>Communication and Support</h2>
        <p>You will receive updates every 3–5 working days after each payment or milestone. You can also contact us by phone at 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit a query or track your status using your ID number.</p>
      `
    },

    'Service 6 - RN A Status - NL Removals': {
      title: 'Service 6 - RN A Status NL Removals',
      content: `
        <p>Thank you for signing up with Erase Debt SA. By accepting the DebiCheck authorization, you have already confirmed your agreement to the service terms and conditions, as carefully explained during your signup call. This section explains the negative listing removal process for RN A status clients, from your first successful payment to final resolution.</p>

        <h2>Important Payment Notes</h2>
        <p>Please note that your DebiCheck debit order may process 1 to 2 days before the scheduled debit date due to weekends, public holidays, or bank processing timelines. We track your payments carefully within 72 to 120 hours (3 to 5 working days, excluding weekends and public holidays) after signup to ensure your process moves forward smoothly. Missing a payment or failing to provide required documents can delay the process, which typically takes 8 to 12 weeks after final payment.</p>

        <h2>Detailed Service Description</h2>
        <p>This service focuses on helping RN A status clients by:</p>
        <ul>
          <li>Requesting a formal transfer from your current debt counsellor</li>
          <li>Conducting an affordability assessment to confirm your financial status</li>
          <li>Investigating and working to remove eligible negative listings, such as prescribed debts, expired enquiries (over 12 months), paid-up admin orders, and paid-up judgments</li>
          <li>Correcting inaccurate or outdated credit information where applicable</li>
        </ul>
        <p><strong>Please note:</strong> Current arrears, recent judgments, admin orders, or enquiries cannot be removed.</p>

        <h2>Timeline</h2>
        <p>The process typically takes 8 to 12 weeks after full payment, depending on the complexity of your profile and creditor cooperation.</p>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Make full payment before we begin</li>
          <li>Provide any requested documentation promptly</li>
          <li>Avoid contacting your current debt counsellor, as this can disrupt the process</li>
          <li>Provide feedback on our staff performance to help us improve our services</li>
        </ul>

        <h2>Communication and Updates</h2>
        <p>Our admin team provides regular updates every 3 to 5 working days after key milestones. For any queries, please call 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> to submit a query or track progress using your ID number.</p>
      `
    },

    'Service 7 - RN Other Status / NL Removal': {
      title: 'Service 7 - RN Other Status / NL Removal',
      content: `
        <p>Thank you for signing up with Erase Debt SA. By accepting the DebiCheck authorization, you have confirmed your agreement to our service terms and conditions, as explained during your signup call. This page provides full information about the RN OTHER/NL removal process and what you can expect.</p>

        <h2>Important Payment Notes</h2>
        <p>Your DebiCheck debit order may process 1–2 days before your scheduled debit date due to weekends, holidays, or banking processes. We confirm payments within 3–5 working days. Late or missed payments can delay the service. Completion typically takes 6–10 weeks depending on your case details.</p>

        <h2>Service Description</h2>
        <p>This service assists clients who:</p>
        <ul>
          <li>Were previously under debt review but no longer are</li>
          <li>Were never under debt review but still show blocks or negative listings</li>
          <li>Have judgments, admin orders, expired inquiries, or other outdated negative items</li>
        </ul>
        <p>We pull your full credit report, assess what's removable, and begin the necessary steps to correct or remove qualifying listings. Listings may include:</p>
        <ul>
          <li>Prescribed accounts</li>
          <li>Expired inquiries (older than 12 months)</li>
          <li>Paid-up judgments or admin orders</li>
          <li>Settled but still-listed accounts</li>
        </ul>

        <h2>Client Responsibilities</h2>
        <ul>
          <li>Pay in full before the process begins</li>
          <li>Provide paid-up letters and copies of your ID as requested</li>
          <li>Avoid taking new credit or credit checks during this time</li>
          <li>Submit documents promptly when contacted by our admin team</li>
        </ul>

        <h2>Communication and Support</h2>
        <p>Our admin team will provide progress updates every 3–5 working days after payment or milestones. For questions, contact us at 031 500 2220 or 031 109 5560. You may also submit a query or track your case at <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a> using your ID number.</p>
      `
    }
  }

  // Default content for unmatched services
  return serviceMap[serviceType] || {
    title: 'Your Service Agreement',
    content: `
      <p>Thank you for choosing Erase Debt SA for your credit restoration needs.</p>
      <h2>Service Description</h2>
      <p>Your selected service: <strong>${serviceType}</strong></p>
      <p>Our team will provide you with professional service according to the terms and conditions explained during your signup call.</p>
      <h2>Communication and Updates</h2>
      <p>Our admin team provides regular updates every 3 to 5 working days. You can contact us at 031 500 2220 or 031 109 5560, or visit <a href="https://www.erasedebtsa.net">www.erasedebtsa.net</a>.</p>
    `
  }
}