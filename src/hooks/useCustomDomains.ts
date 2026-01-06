import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomDomain {
  id: string;
  profile_id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed';
  is_primary: boolean;
  ssl_status: string;
  dns_verified: boolean;
  verification_token: string | null;
  created_at: string;
  updated_at: string;
}

export function useCustomDomains(profileId?: string) {
  const { user } = useAuth();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDomains((data || []) as CustomDomain[]);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const addDomain = async (domain: string, includeWww: boolean = true): Promise<{ success: boolean; error?: string }> => {
    if (!profileId) return { success: false, error: 'No profile' };

    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    const domainsToAdd: string[] = [normalizedDomain];
    
    // Add www version if it's a root domain and includeWww is true
    if (includeWww && !normalizedDomain.startsWith('www.') && normalizedDomain.split('.').length === 2) {
      domainsToAdd.push(`www.${normalizedDomain}`);
    }

    try {
      // Check if any domain already exists
      for (const d of domainsToAdd) {
        const { data: existing } = await supabase
          .from('custom_domains')
          .select('id')
          .eq('domain', d)
          .maybeSingle();

        if (existing) {
          return { success: false, error: `Domain ${d} is already registered` };
        }
      }

      // Add all domains
      for (let i = 0; i < domainsToAdd.length; i++) {
        const d = domainsToAdd[i];
        const verificationToken = `lovable_verify_${crypto.randomUUID().slice(0, 8)}`;
        
        const { error } = await supabase
          .from('custom_domains')
          .insert({
            profile_id: profileId,
            domain: d,
            status: 'pending',
            is_primary: domains.length === 0 && i === 0, // Only first domain of first batch is primary
            verification_token: verificationToken,
          });

        if (error) throw error;
      }

      await fetchDomains();
      return { success: true };
    } catch (error: any) {
      console.error('Error adding domain:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyDomain = async (domainId: string): Promise<{ success: boolean; error?: string; details?: any }> => {
    try {
      // Update status to verifying
      await supabase
        .from('custom_domains')
        .update({ status: 'verifying' })
        .eq('id', domainId);

      // Call edge function to verify DNS
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { domainId },
      });

      if (error) throw error;

      await fetchDomains();
      
      return { 
        success: data.success, 
        error: data.success ? undefined : data.message,
        details: data,
      };
    } catch (error: any) {
      console.error('Error verifying domain:', error);
      return { success: false, error: error.message };
    }
  };

  const removeDomain = async (domainId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const domainToRemove = domains.find(d => d.id === domainId);
      
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      // If removed domain was primary, make the next one primary
      if (domainToRemove?.is_primary && domains.length > 1) {
        const nextDomain = domains.find(d => d.id !== domainId);
        if (nextDomain) {
          await supabase
            .from('custom_domains')
            .update({ is_primary: true })
            .eq('id', nextDomain.id);
        }
      }

      await fetchDomains();
      return { success: true };
    } catch (error: any) {
      console.error('Error removing domain:', error);
      return { success: false, error: error.message };
    }
  };

  const setPrimaryDomain = async (domainId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, unset all as primary
      await supabase
        .from('custom_domains')
        .update({ is_primary: false })
        .eq('profile_id', profileId);

      // Then set the selected one as primary
      const { error } = await supabase
        .from('custom_domains')
        .update({ is_primary: true })
        .eq('id', domainId);

      if (error) throw error;

      await fetchDomains();
      return { success: true };
    } catch (error: any) {
      console.error('Error setting primary domain:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    domains,
    loading,
    addDomain,
    verifyDomain,
    removeDomain,
    setPrimaryDomain,
    refetch: fetchDomains,
  };
}

// Utility function to get profile by custom domain
export async function getProfileByDomain(domain: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('custom_domains')
      .select('profile_id, link_profiles!inner(username)')
      .eq('domain', domain.toLowerCase())
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    // Return the username for routing
    return (data.link_profiles as any)?.username || null;
  } catch (error) {
    console.error('Error getting profile by domain:', error);
    return null;
  }
}
