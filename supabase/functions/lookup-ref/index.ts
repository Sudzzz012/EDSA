import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const EDSA_FUNCTION_TOKEN = Deno.env.get('EDSA_FUNCTION_TOKEN')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token
    const token = req.headers.get('x-edsa-token')
    if (EDSA_FUNCTION_TOKEN && token !== EDSA_FUNCTION_TOKEN) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { id_number, email } = await req.json()

    if (!id_number || !email) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing ID number or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Look up client by ID and email to get their reference number
    const clientResponse = await fetch(
      `${supabaseUrl}/rest/v1/edsa_client_database?client_id_number=eq.${id_number}&email=eq.${email}&select=sale_reference,first_name,last_name`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    )

    const clientData = await clientResponse.json()
    
    if (!clientData || clientData.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No client found with this ID and email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = clientData[0]
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        ref_number: client.sale_reference,
        client_name: `${client.first_name} ${client.last_name}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})