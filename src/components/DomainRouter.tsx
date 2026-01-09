import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MAIN_DOMAIN, isDomainActive } from '@/config/domain';

interface DomainRouterProps {
  children: React.ReactNode;
}

export function DomainRouter({ children }: DomainRouterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    const checkDomain = async () => {
      const currentHost = window.location.hostname;
      
      // Allow localhost and main domain to access everything
      // Remove Lovable-specific domain checks for Hostinger deployment
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
        // Check for active_manual or active status (both work)
        const { data, error } = await supabase
          .from('custom_domains')
          .select('profile_id, status, link_profiles!inner(username)')
          .eq('domain', currentHost.toLowerCase())
          .in('status', ['active_manual', 'active'])
          .single();

        if (data && isDomainActive(data.status) && (data.link_profiles as any)?.username) {
          setIsCustomDomain(true);
          // Redirect to the profile page
          const username = (data.link_profiles as any).username;
          if (location.pathname === '/' || location.pathname === '') {
            navigate(`/${username}`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Domain lookup error:', error);
      }

      setIsChecking(false);
    };

    checkDomain();
  }, [navigate, location.pathname]);

  // If on custom domain, only allow profile routes
  useEffect(() => {
    if (isCustomDomain) {
      const path = location.pathname;
      // Block access to dashboard, admin, auth routes on custom domains
      if (
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/auth') ||
        path === '/'
      ) {
        // Redirect to main domain for these routes
        window.location.href = `${window.location.protocol}//${MAIN_DOMAIN}${path}`;
      }
    }
  }, [isCustomDomain, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export function useIsCustomDomain(): boolean {
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    const currentHost = window.location.hostname;
    // Remove Lovable-specific domain checks for Hostinger deployment
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
