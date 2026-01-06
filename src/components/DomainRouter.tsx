import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Main domain where dashboard is hosted
const MAIN_DOMAIN = 'links.dalvi.cloud';

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
      if (
        currentHost === 'localhost' ||
        currentHost === '127.0.0.1' ||
        currentHost === MAIN_DOMAIN ||
        currentHost.endsWith('.lovableproject.com') ||
        currentHost.endsWith('.lovable.app')
      ) {
        setIsChecking(false);
        return;
      }

      // This is a custom domain - check if it's registered
      try {
        const { data, error } = await supabase
          .from('custom_domains')
          .select('profile_id, link_profiles!inner(username)')
          .eq('domain', currentHost.toLowerCase())
          .eq('status', 'active')
          .single();

        if (data && (data.link_profiles as any)?.username) {
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
        window.location.href = `https://${MAIN_DOMAIN}${path}`;
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
    const isCustom = !(
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      currentHost === MAIN_DOMAIN ||
      currentHost.endsWith('.lovableproject.com') ||
      currentHost.endsWith('.lovable.app')
    );
    setIsCustomDomain(isCustom);
  }, []);

  return isCustomDomain;
}

export function getMainDomainUrl(path: string = ''): string {
  return `https://${MAIN_DOMAIN}${path}`;
}
