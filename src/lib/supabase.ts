/**
 * Dynamic Supabase Client Export
 * 
 * Use this instead of importing from '@/integrations/supabase/client' directly.
 * This proxy automatically uses custom credentials if configured by super admin.
 */

import { supabase as defaultSupabase } from '@/integrations/supabase/client';
import { getDynamicSupabaseClient, getSupabaseConfig } from '@/lib/dynamic-supabase';

function getActiveClient() {
  const config = getSupabaseConfig();
  return config.isOverride ? getDynamicSupabaseClient() : defaultSupabase;
}

// Proxy that lazily resolves the correct client on every property access
export const supabase = new Proxy({} as typeof defaultSupabase, {
  get(_target, prop) {
    return (getActiveClient() as any)[prop];
  },
});
