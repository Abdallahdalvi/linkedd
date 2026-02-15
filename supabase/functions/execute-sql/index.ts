import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check super_admin role using service role client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: Super Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sql } = await req.json()
    if (!sql || typeof sql !== 'string') {
      return new Response(JSON.stringify({ error: 'SQL query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Execute SQL using the database URL directly
    const dbUrl = Deno.env.get('SUPABASE_DB_URL')!
    
    // Use pg module via service client rpc or direct postgres
    // We'll use the REST API with service role for read queries
    // For DDL/DML, use the pg connection
    
    const { Client } = await import('https://deno.land/x/postgres@v0.19.3/mod.ts')
    const client = new Client(dbUrl)
    await client.connect()
    
    try {
      const result = await client.queryObject(sql)
      
      // Log the action to audit_logs
      await serviceClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'sql_execute',
        entity_type: 'database',
        details: { sql: sql.substring(0, 500), row_count: result.rows?.length || 0 },
      })

      return new Response(JSON.stringify({
        rows: result.rows || [],
        rowCount: result.rowCount ?? 0,
        columns: result.columns?.map(c => c.name) || [],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } finally {
      await client.end()
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
