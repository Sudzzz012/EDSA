import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

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
    console.log('=== Audit Log Webhook Called ===')
    
    const { auditData, action } = await req.json()
    
    if (!auditData) {
      return new Response(
        JSON.stringify({ error: 'Missing audit data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Logging audit entry for:', auditData.client_reference, 'Action:', action)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || 'https://xzjunkpxvfdpuogoflzh.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    )

    // Insert into audit_log table
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        client_reference: auditData.client_reference,
        client_name: auditData.client_name,
        action: action,
        details: auditData.details || auditData,
        timestamp: auditData.timestamp || new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'Unknown',
        user_agent: req.headers.get('user-agent') || 'Unknown'
      })

    if (auditError) {
      console.error('Error saving audit log:', auditError)
      return new Response(
        JSON.stringify({ error: 'Failed to save audit log', details: auditError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Also update the client's audit_log array field
    if (auditData.client_reference) {
      const { data: client } = await supabase
        .from('edsa_client_database')
        .select('audit_log')
        .eq('sale_reference', auditData.client_reference)
        .single()

      if (client) {
        const updatedAuditLog = [
          ...(client.audit_log || []),
          {
            timestamp: auditData.timestamp || new Date().toISOString(),
            action: action,
            details: auditData.details || auditData
          }
        ]

        await supabase
          .from('edsa_client_database')
          .update({
            audit_log: updatedAuditLog,
            updated_at: new Date().toISOString()
          })
          .eq('sale_reference', auditData.client_reference)
      }
    }

    console.log('✅ Audit log saved successfully!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Audit log saved successfully',
        reference: auditData.client_reference,
        action: action
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in audit log webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})