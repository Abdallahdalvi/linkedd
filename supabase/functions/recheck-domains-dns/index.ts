import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPECTED_IP = '185.158.133.1';

async function verifyDomainDns(domain: string, verificationToken: string | null): Promise<{
  aRecordValid: boolean;
  txtRecordValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let aRecordValid = false;
  let txtRecordValid = false;

  // Check A record
  try {
    const aRecordResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      { headers: { 'Accept': 'application/dns-json' } }
    );
    const aRecordData = await aRecordResponse.json();

    if (aRecordData.Answer && aRecordData.Answer.length > 0) {
      const aRecords = aRecordData.Answer.filter((r: any) => r.type === 1);
      const hasCorrectIP = aRecords.some((r: any) => r.data === EXPECTED_IP);
      
      if (hasCorrectIP) {
        aRecordValid = true;
      } else {
        const foundIPs = aRecords.map((r: any) => r.data).join(', ');
        errors.push(`A record points to ${foundIPs || 'unknown'}, expected ${EXPECTED_IP}`);
      }
    } else {
      errors.push(`No A record found for ${domain}`);
    }
  } catch (e) {
    errors.push('Failed to verify A record');
  }

  // Check TXT record
  if (verificationToken) {
    try {
      const txtRecordResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=_lovable.${domain}&type=TXT`,
        { headers: { 'Accept': 'application/dns-json' } }
      );
      const txtRecordData = await txtRecordResponse.json();

      if (txtRecordData.Answer && txtRecordData.Answer.length > 0) {
        const txtRecords = txtRecordData.Answer.filter((r: any) => r.type === 16);
        const expectedValue = `lovable_verify=${verificationToken}`;
        const hasValidToken = txtRecords.some((r: any) => {
          const cleanedData = r.data.replace(/^"|"$/g, '');
          return cleanedData === expectedValue;
        });

        if (hasValidToken) {
          txtRecordValid = true;
        } else {
          errors.push(`TXT record does not contain correct verification token`);
        }
      } else {
        errors.push(`No TXT record found at _lovable.${domain}`);
      }
    } catch (e) {
      errors.push('Failed to verify TXT record');
    }
  } else {
    txtRecordValid = true;
  }

  return { aRecordValid, txtRecordValid, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active domains that need re-verification
    const { data: domains, error: fetchError } = await supabase
      .from('custom_domains')
      .select('*')
      .in('status', ['active', 'verifying', 'pending']);

    if (fetchError) {
      console.error('Error fetching domains:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch domains' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!domains || domains.length === 0) {
      console.log('No domains to verify');
      return new Response(
        JSON.stringify({ success: true, message: 'No domains to verify', checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${domains.length} domains...`);

    const results: { domain: string; status: string; verified: boolean }[] = [];

    for (const domain of domains) {
      console.log(`Verifying: ${domain.domain}`);
      
      const { aRecordValid, txtRecordValid, errors } = await verifyDomainDns(
        domain.domain,
        domain.verification_token
      );

      const dnsVerified = aRecordValid && txtRecordValid;
      let newStatus = domain.status;

      // Update status based on verification result
      if (dnsVerified && domain.status !== 'active') {
        newStatus = 'active';
      } else if (!dnsVerified && domain.status === 'active') {
        // Domain was active but DNS no longer valid - mark as offline
        newStatus = 'failed';
      }

      if (newStatus !== domain.status || dnsVerified !== domain.dns_verified) {
        await supabase
          .from('custom_domains')
          .update({
            status: newStatus,
            dns_verified: dnsVerified,
            ssl_status: dnsVerified ? 'active' : 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', domain.id);
      }

      results.push({
        domain: domain.domain,
        status: newStatus,
        verified: dnsVerified,
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('DNS recheck complete:', JSON.stringify(results));

    return new Response(
      JSON.stringify({
        success: true,
        checked: domains.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in recheck-domains-dns:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
