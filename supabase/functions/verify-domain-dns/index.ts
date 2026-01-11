import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration - VPS server IP for DNS verification
const SERVER_IP = Deno.env.get('HOSTINGER_SERVER_IP') || '72.61.227.134';
const APP_NAME = Deno.env.get('APP_NAME') || 'linkbio';
const TXT_RECORD_NAME = `_${APP_NAME}`;
const TXT_VERIFY_PREFIX = `${APP_NAME}_verify`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domainId } = await req.json();

    if (!domainId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Domain ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get domain info
    const { data: domain, error: domainError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      console.error('Domain not found:', domainError);
      return new Response(
        JSON.stringify({ success: false, error: 'Domain not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying DNS for domain: ${domain.domain}`);
    console.log(`Expected IP: ${SERVER_IP}, TXT record: ${TXT_RECORD_NAME}`);

    const errors: string[] = [];
    let aRecordValid = false;
    let txtRecordValid = false;

    // Check A record using DNS-over-HTTPS (Cloudflare)
    try {
      const aRecordResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain.domain}&type=A`,
        { headers: { 'Accept': 'application/dns-json' } }
      );
      const aRecordData = await aRecordResponse.json();
      console.log('A record response:', JSON.stringify(aRecordData));

      if (aRecordData.Answer && aRecordData.Answer.length > 0) {
        const aRecords = aRecordData.Answer.filter((r: any) => r.type === 1);
        const hasCorrectIP = aRecords.some((r: any) => r.data === SERVER_IP);
        
        if (hasCorrectIP) {
          aRecordValid = true;
          console.log('A record valid - pointing to correct IP');
        } else {
          const foundIPs = aRecords.map((r: any) => r.data).join(', ');
          errors.push(`A record points to ${foundIPs || 'unknown'}, expected ${SERVER_IP}`);
          console.log('A record invalid:', errors[errors.length - 1]);
        }
      } else {
        errors.push(`No A record found for ${domain.domain}`);
        console.log('No A record found');
      }
    } catch (e) {
      console.error('Error checking A record:', e);
      errors.push('Failed to verify A record');
    }

    // Check TXT record for verification token
    if (domain.verification_token) {
      try {
        const txtRecordResponse = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${TXT_RECORD_NAME}.${domain.domain}&type=TXT`,
          { headers: { 'Accept': 'application/dns-json' } }
        );
        const txtRecordData = await txtRecordResponse.json();
        console.log('TXT record response:', JSON.stringify(txtRecordData));

        if (txtRecordData.Answer && txtRecordData.Answer.length > 0) {
          const txtRecords = txtRecordData.Answer.filter((r: any) => r.type === 16);
          const expectedValue = `${TXT_VERIFY_PREFIX}=${domain.verification_token}`;
          const hasValidToken = txtRecords.some((r: any) => {
            // TXT records are quoted, so we need to clean them
            const cleanedData = r.data.replace(/^"|"$/g, '');
            return cleanedData === expectedValue;
          });

          if (hasValidToken) {
            txtRecordValid = true;
            console.log('TXT record valid - verification token matches');
          } else {
            errors.push(`TXT record at ${TXT_RECORD_NAME}.${domain.domain} does not contain correct verification token`);
            console.log('TXT record invalid');
          }
        } else {
          errors.push(`No TXT record found at ${TXT_RECORD_NAME}.${domain.domain}`);
          console.log('No TXT record found');
        }
      } catch (e) {
        console.error('Error checking TXT record:', e);
        errors.push('Failed to verify TXT record');
      }
    } else {
      // No verification token required, skip TXT check
      txtRecordValid = true;
    }

    // Determine final status - AUTO-ACTIVATE when DNS is verified
    const dnsVerified = aRecordValid && txtRecordValid;
    let newStatus: string;
    
    if (dnsVerified) {
      // DNS verified - AUTOMATICALLY ACTIVATE the domain
      newStatus = 'active';
    } else {
      // DNS not verified
      newStatus = 'failed';
    }

    // Update domain status
    const { error: updateError } = await supabase
      .from('custom_domains')
      .update({
        status: newStatus,
        dns_verified: dnsVerified,
        ssl_status: dnsVerified ? 'active' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainId);

    if (updateError) {
      console.error('Error updating domain:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update domain status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: dnsVerified,
        verified: dnsVerified,
        aRecordValid,
        txtRecordValid,
        errors: errors.length > 0 ? errors : undefined,
        message: dnsVerified 
          ? 'Domain verified and activated! Your custom domain is now live.' 
          : `Verification failed: ${errors.join('; ')}`,
        nextStep: dnsVerified 
          ? 'Your domain is ready to use.'
          : 'Please check your DNS settings and try again.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in verify-domain-dns:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});