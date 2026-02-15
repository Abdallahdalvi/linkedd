/**
 * Dynamic Supabase Client
 * 
 * Checks localStorage for credential overrides (set by super admin),
 * falls back to environment variables.
 * 
 * Usage:
 *   import { getDynamicSupabaseClient, getSupabaseConfig } from '@/lib/dynamic-supabase';
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

let _lastConfig: { url: string; anonKey: string } | null = null;

function _needsRecreation(config: SupabaseConfig): boolean {
  if (!_lastConfig) return true;
  return _lastConfig.url !== config.url || _lastConfig.anonKey !== config.anonKey;
}
