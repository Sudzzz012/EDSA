import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edsa-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const EDSA_FUNCTION_TOKEN = Deno.env.get('EDSA_FUNCTION_TOKEN')

serve(async (req) => {
  console.log('🔍 Lookup ref function called with method:', req.method)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method)
      return new Response(
        JSON.stringify({ ok: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify token if configured
    const token = req.headers.get('x-edsa-token')
    if (EDSA_FUNCTION_TOKEN && token !== EDSA_FUNCTION_TOKEN) {
      console.log('❌ Invalid token provided')
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized access' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    console.log('📝 Lookup request:', { ...body, email: body.email ? body.email.substring(0, 3) + '***' : 'missing' })
    
    const { id_number, email } = body

    if (!id_number || !email) {
      console.log('❌ Missing required fields')
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: id_number, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')! // Use anon key instead of service role

    console.log('🔍 Looking up client by ID and email...')
    // Look up client by ID and email to get their reference number
    const clientResponse = await fetch(
      `${supabaseUrl}/rest/v1/edsa_client_database?client_id_number=eq.${id_number}&email=eq.${email}&select=sale_reference,first_name,last_name&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text()
      console.error('❌ Failed to query client:', errorText)
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Failed to lookup client information',
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientData = await clientResponse.json()
    console.log('📊 Client query result:', clientData.length, 'records found')
    
    if (!clientData || clientData.length === 0) {
      console.log('❌ No client found')
      return new Response(
        JSON.stringify({ ok: false, error: 'No client found with this ID number and email combination.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = clientData[0]
    console.log('✅ Client found:', { ref: client.sale_reference, name: `${client.first_name} ${client.last_name}` })
    
    return new Response(
      JSON.stringify({ 
        ok: true, 
        ref_number: client.sale_reference,
        client_name: `${client.first_name} ${client.last_name}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})