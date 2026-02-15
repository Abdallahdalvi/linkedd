import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MAIN_DOMAIN, isDomainActive } from '@/config/domain';

interface DomainRouterProps {
  children: React.ReactNode;
}

interface CustomDomainData {
  username: string;
  profileId: string;
}

export function DomainRouter({ children }: DomainRouterProps) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [customDomainData, setCustomDomainData] = useState<CustomDomainData | null>(null);

  useEffect(() => {
    const checkDomain = async () => {
      const currentHost = window.location.hostname;
      
      // Allow localhost and main domain to access everything normally
      if (
        currentHost === 'localhost' ||
        currentHost === '127.0.0.1' ||
        currentHost === MAIN_DOMAIN ||
        currentHost.endsWith(`.${MAIN_DOMAIN}`)
      ) {
        setIsChecking(false);
        return;
      }

      // This is a custom domain - check if it's registered and active
      try {
        const { data, error } = await supabase
          .from('custom_domains')
          .select('profile_id, status, link_profiles!inner(username)')
          .eq('domain', currentHost.toLowerCase())
          .single();

        if (data && isDomainActive(data.status) && (data.link_profiles as any)?.username) {
          setCustomDomainData({
            username: (data.link_profiles as any).username,
            profileId: data.profile_id,
          });
        }
      } catch (error) {
        console.error('Domain lookup error:', error);
      }

      setIsChecking(false);
    };

    checkDomain();
  }, []);

  // If on custom domain, block access to dashboard/admin/auth routes
  useEffect(() => {
    if (customDomainData) {
      const path = location.pathname;
      // Block access to dashboard, admin, auth routes on custom domains
      if (
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/auth')
      ) {
        // Redirect to main domain for these routes
        window.location.href = `${window.location.protocol}//${MAIN_DOMAIN}${path}`;
      }
    }
  }, [customDomainData, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get custom domain data if on a custom domain
export function useCustomDomainProfile(): CustomDomainData | null {
  const [data, setData] = useState<CustomDomainData | null>(null);

  useEffect(() => {
    const checkDomain = async () => {
      const currentHost = window.location.hostname;
      
      // Not a custom domain
      if (
        currentHost === 'localhost' ||
        currentHost === '127.0.0.1' ||
        currentHost === MAIN_DOMAIN ||
        currentHost.endsWith(`.${MAIN_DOMAIN}`)
      ) {
        return;
      }

      try {
        const { data: domainData } = await supabase
          .from('custom_domains')
          .select('profile_id, status, link_profiles!inner(username)')
          .eq('domain', currentHost.toLowerCase())
          .single();

        if (domainData && isDomainActive(domainData.status) && (domainData.link_profiles as any)?.username) {
          setData({
            username: (domainData.link_profiles as any).username,
            profileId: domainData.profile_id,
          });
        }
      } catch (error) {
        console.error('Domain lookup error:', error);
      }
    };

    checkDomain();
  }, []);

  return data;
}

export function useIsCustomDomain(): boolean {
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    const currentHost = window.location.hostname;
    const isCustom = !(
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      currentHost === MAIN_DOMAIN ||
      currentHost.endsWith(`.${MAIN_DOMAIN}`)
    );
    setIsCustomDomain(isCustom);
  }, []);

  return isCustomDomain;
}

export function getMainDomainUrl(path: string = ''): string {
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${MAIN_DOMAIN}${path}`;
}