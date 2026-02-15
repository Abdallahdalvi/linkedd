import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/schema-prefix';

type AppRole = 'super_admin' | 'admin' | 'client';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from(t('user_roles'))
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        setRoles(data.map((r) => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const isSuperAdmin = roles.includes('super_admin');
  const isAdmin = roles.includes('admin') || isSuperAdmin;
  const isClient = roles.includes('client') || isAdmin;

  return { roles, isSuperAdmin, isAdmin, isClient, loading };
}
