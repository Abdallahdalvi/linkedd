/**
 * API Client Wrapper
 * 
 * Switches between Supabase (Cloud) and self-hosted REST API
 * based on the VITE_API_MODE environment variable.
 * 
 * Usage:
 *   import { api } from '@/lib/api-client';
 *   const profile = await api.profiles.getByUsername('john');
 *   const { token } = await api.auth.login('a@b.com', 'pass');
 */

import { supabase as defaultSupabase } from '@/integrations/supabase/client';
import { getDynamicSupabaseClient, getSupabaseConfig } from '@/lib/dynamic-supabase';
import { t } from '@/lib/schema-prefix';

// Use dynamic client if override exists, otherwise default
function getSupabase() {
  const config = getSupabaseConfig();
  return config.isOverride ? getDynamicSupabaseClient() : defaultSupabase;
}

// Proxy: lazily resolve the client on each call
const supabase = new Proxy({} as typeof defaultSupabase, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

// ─── Config ───
type ApiMode = 'supabase' | 'rest';

const API_MODE: ApiMode = (import.meta.env.VITE_API_MODE as ApiMode) || 'supabase';
const REST_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── REST helpers ───
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

async function restFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${REST_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

async function restUpload(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${REST_BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  // REST API returns relative path; prefix with base URL
  return url.startsWith('http') ? url : `${REST_BASE}${url}`;
}

// ─── Auth ───
const authClient = {
  async signUp(email: string, password: string, fullName?: string) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      return { success: true };
    }
    const data = await restFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    setToken(data.token);
    return { success: true, user: data.user, token: data.token };
  },

  async signIn(email: string, password: string) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true };
    }
    const data = await restFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return { success: true, user: data.user, token: data.token };
  },

  async signOut() {
    if (API_MODE === 'supabase') {
      await supabase.auth.signOut();
    } else {
      clearToken();
    }
  },

  async getUser() {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    return restFetch('/api/auth/me');
  },

  async getUserRoles(userId: string): Promise<string[]> {
    if (API_MODE === 'supabase') {
      const { data } = await supabase
        .from(t('user_roles'))
        .select('role')
        .eq('user_id', userId);
      return (data || []).map((r) => r.role);
    }
    const user = await restFetch('/api/auth/me');
    return user.roles || ['client'];
  },
};

// ─── Profiles ───
const profilesClient = {
  async getByUsername(username: string) {
    if (API_MODE === 'supabase') {
      const { data, error } = await supabase
        .from(t('link_profiles'))
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const res = await restFetch(`/api/profiles/${username}`);
    return res.profile;
  },

  async getMine() {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from(t('link_profiles'))
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    }
    const res = await restFetch('/api/my/profile');
    return res.profile;
  },

  async create(username: string) {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from(t('link_profiles'))
        .insert({ user_id: user.id, username })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return restFetch('/api/my/profile', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  async update(profileId: string, updates: Record<string, unknown>) {
    if (API_MODE === 'supabase') {
      const { data, error } = await supabase
        .from(t('link_profiles'))
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return restFetch('/api/my/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ─── Blocks ───
const blocksClient = {
  async getByProfile(profileId: string, enabledOnly = false) {
    if (API_MODE === 'supabase') {
      let query = supabase
        .from(t('blocks'))
        .select('*')
        .eq('profile_id', profileId)
        .order('position', { ascending: true });
      if (enabledOnly) query = query.eq('is_enabled', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    // REST: public profile endpoint returns blocks alongside profile
    const res = await restFetch('/api/my/profile');
    return res.blocks || [];
  },

  async create(block: Record<string, unknown>) {
    if (API_MODE === 'supabase') {
      const { data, error } = await supabase
        .from(t('blocks'))
        .insert(block as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return restFetch('/api/my/blocks', {
      method: 'POST',
      body: JSON.stringify(block),
    });
  },

  async update(blockId: string, updates: Record<string, unknown>) {
    if (API_MODE === 'supabase') {
      const { data, error } = await supabase
        .from(t('blocks'))
        .update(updates)
        .eq('id', blockId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return restFetch(`/api/my/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(blockId: string) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.from(t('blocks')).delete().eq('id', blockId);
      if (error) throw error;
    } else {
      await restFetch(`/api/my/blocks/${blockId}`, { method: 'DELETE' });
    }
  },

  async reorder(order: { id: string; position: number }[]) {
    if (API_MODE === 'supabase') {
      for (const item of order) {
        await supabase.from(t('blocks')).update({ position: item.position }).eq('id', item.id);
      }
    } else {
      await restFetch('/api/my/blocks/reorder', {
        method: 'PUT',
        body: JSON.stringify({ order }),
      });
    }
  },
};

// ─── Leads ───
const leadsClient = {
  async submit(lead: { block_id: string; profile_id: string; visitor_id?: string; name?: string; email?: string; phone?: string }) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.from(t('block_leads')).insert(lead);
      if (error) throw error;
    } else {
      await restFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(lead),
      });
    }
  },

  async getMine(profileId: string) {
    if (API_MODE === 'supabase') {
      const { data, error } = await supabase
        .from(t('block_leads'))
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return restFetch('/api/my/leads');
  },

  async delete(leadId: string) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.from(t('block_leads')).delete().eq('id', leadId);
      if (error) throw error;
    } else {
      await restFetch(`/api/my/leads/${leadId}`, { method: 'DELETE' });
    }
  },
};

// ─── Analytics ───
const analyticsClient = {
  async track(event: { profile_id: string; block_id?: string; event_type: string; visitor_id?: string; referrer?: string; browser?: string; device_type?: string; country?: string; city?: string }) {
    if (API_MODE === 'supabase') {
      await supabase.from(t('analytics_events')).insert(event);
    } else {
      await restFetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    }
  },

  async getMine(profileId: string) {
    if (API_MODE === 'supabase') {
      const { data } = await supabase
        .from(t('analytics_events'))
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1000);
      return data || [];
    }
    return restFetch('/api/my/analytics');
  },
};

// ─── Storage ───
const storageClient = {
  async upload(file: File, path: string, bucket = 'profile-images'): Promise<string> {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicUrl;
    }
    return restUpload(file);
  },
};

// ─── Admin ───
const adminClient = {
  async getUsers() {
    if (API_MODE === 'supabase') {
      const { data } = await supabase
        .from(t('profiles'))
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false });
      return data || [];
    }
    return restFetch('/api/admin/users');
  },

  async setUserRole(userId: string, role: string) {
    if (API_MODE === 'supabase') {
      await supabase.from(t('user_roles')).delete().eq('user_id', userId);
      const { error } = await supabase.from(t('user_roles')).insert({ user_id: userId, role: role as any });
      if (error) throw error;
    } else {
      await restFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    }
  },

  async suspendUser(userId: string, suspended: boolean) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase
        .from(t('profiles'))
        .update({ is_suspended: suspended })
        .eq('id', userId);
      if (error) throw error;
    } else {
      await restFetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ suspended }),
      });
    }
  },

  async getSettings() {
    if (API_MODE === 'supabase') {
      const { data } = await supabase.from(t('admin_settings')).select('*');
      return data || [];
    }
    return restFetch('/api/admin/settings');
  },

  async updateSetting(key: string, value: unknown) {
    if (API_MODE === 'supabase') {
      const { error } = await supabase
        .from(t('admin_settings'))
        .upsert({ setting_key: key, setting_value: value as any }, { onConflict: 'setting_key' });
      if (error) throw error;
    } else {
      await restFetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
    }
  },
};

// ─── Export unified API ───
export const api = {
  mode: API_MODE,
  auth: authClient,
  profiles: profilesClient,
  blocks: blocksClient,
  leads: leadsClient,
  analytics: analyticsClient,
  storage: storageClient,
  admin: adminClient,
};

export default api;
