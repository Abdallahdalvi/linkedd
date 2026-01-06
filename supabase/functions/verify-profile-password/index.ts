import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    // Validate inputs
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Username is required', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to access password_hash
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Verifying password for username:', username);

    // Get the profile with password hash
    const { data: profile, error: fetchError } = await supabase
      .from('link_profiles')
      .select('id, password_hash, is_password_protected')
      .eq('username', username)
      .single();

    if (fetchError || !profile) {
      console.error('Profile fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Profile not found', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.is_password_protected || !profile.password_hash) {
      console.log('Profile is not password protected');
      return new Response(
        JSON.stringify({ valid: true, message: 'Profile is not password protected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the password using bcrypt
    const isValid = await bcrypt.compare(password, profile.password_hash);

    console.log('Password verification result:', isValid);

    if (isValid) {
      // Generate a simple access token (UUID)
      const accessToken = crypto.randomUUID();
      
      return new Response(
        JSON.stringify({ 
          valid: true, 
          accessToken,
          profileId: profile.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in verify-profile-password:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
