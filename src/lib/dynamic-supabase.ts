/**
 * Dynamic Supabase Client
 * 
 * Checks localStorage for credential overrides (set by super admin),
 * falls back to environment variables.
 * Auto-bootstraps from admin_settings on first load.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const STORAGE_KEY = 'supabase_connection_override';

export interface SupabaseConfig {
  projectId: string;
  url: string;
  anonKey: string;
  isOverride: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey && parsed.projectId) {
        return {
          projectId: parsed.projectId,
          url: parsed.url,
          anonKey: parsed.anonKey,
          isOverride: true,
        };
      }
    }
  } catch {
    // ignore parse errors
  }

  return {
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || '',
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    isOverride: false,
  };
}

export function saveSupabaseConfig(config: { projectId: string; url: string; anonKey: string }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

let _dynamicClient: SupabaseClient<Database> | null = null;
let _lastConfig: { url: string; anonKey: string } | null = null;

export function getDynamicSupabaseClient(): SupabaseClient<Database> {
  const config = getSupabaseConfig();

  if (!_dynamicClient || _needsRecreation(config)) {
    _dynamicClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    _lastConfig = { url: config.url, anonKey: config.anonKey };
  }

  return _dynamicClient;
}

function _needsRecreation(config: SupabaseConfig): boolean {
  if (!_lastConfig) return true;
  return _lastConfig.url !== config.url || _lastConfig.anonKey !== config.anonKey;
}

/**
 * Bootstrap: fetch custom connection from admin_settings using the default client.
 * If found and not already in localStorage, save and reload.
 * Returns true if a reload was triggered.
 */
let _bootstrapped = false;
export async function bootstrapSupabaseConfig(defaultClient: SupabaseClient<Database>): Promise<boolean> {
  if (_bootstrapped) return false;
  _bootstrapped = true;

  // Already have an override in localStorage — nothing to do
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return false;

  try {
    const { data } = await defaultClient
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'custom_supabase_connection')
      .maybeSingle();

    if (data?.setting_value) {
      const val = data.setting_value as any;
      if (val.url && val.anon_key && val.project_id) {
        saveSupabaseConfig({
          projectId: val.project_id,
          url: val.url,
          anonKey: val.anon_key,
        });
        window.location.reload();
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed to bootstrap Supabase config from admin_settings:', err);
  }

  return false;
}
