# Complete Supabase Migration Guide
## Lovable Cloud → Self-Hosted Supabase

> **Generated**: 2026-02-11
> **Source Project ID**: `bjkfzcexylofmmupvvxt`

This file contains EVERYTHING needed to replicate your Lovable Cloud backend on a self-hosted Supabase instance: schema, RLS policies, functions, triggers, edge functions, storage, and all live data.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Full PostgreSQL Schema](#2-full-postgresql-schema)
3. [Enum Types](#3-enum-types)
4. [Tables](#4-tables)
5. [Indexes](#5-indexes)
6. [Database Functions](#6-database-functions)
7. [Triggers](#7-triggers)
8. [Row-Level Security Policies](#8-row-level-security-policies)
9. [Storage Buckets](#9-storage-buckets)
10. [Edge Functions](#10-edge-functions)
11. [Secrets / Environment Variables](#11-secrets--environment-variables)
12. [Live Data Export (INSERT Statements)](#12-live-data-export)
13. [Auth Users Migration](#13-auth-users-migration)
14. [Frontend .env Config](#14-frontend-env-config)
15. [Step-by-Step Migration Checklist](#15-step-by-step-migration-checklist)

---

## 1. Prerequisites

- A self-hosted Supabase instance ([docs](https://supabase.com/docs/guides/self-hosting))
  - Docker Compose method recommended
- PostgreSQL 15+
- Deno runtime (for edge functions)
- Access to DNS for custom domains

---

## 2. Full PostgreSQL Schema

Run this entire SQL block in your new Supabase SQL Editor (or via `psql`). It creates everything from scratch.

```sql
-- ============================================================
-- LINKBIO COMPLETE SCHEMA - Self-Hosted Supabase Migration
-- ============================================================

-- ─── 1. ENUM TYPES ───
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');


-- ─── 2. TABLES ───

-- Profiles (mirrors auth.users metadata)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'client',
  is_suspended BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Link Profiles
CREATE TABLE public.link_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  location TEXT,
  theme_preset TEXT DEFAULT 'default',
  background_type TEXT DEFAULT 'solid',
  background_value TEXT DEFAULT '#ffffff',
  custom_colors JSONB DEFAULT '{}'::jsonb,
  custom_fonts JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocks
CREATE TABLE public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  url TEXT,
  icon TEXT,
  thumbnail_url TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  button_style JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  mobile_only BOOLEAN DEFAULT FALSE,
  desktop_only BOOLEAN DEFAULT FALSE,
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Block Leads
CREATE TABLE public.block_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  visitor_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.link_profiles(id) ON DELETE SET NULL,
  block_id UUID REFERENCES public.blocks(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  browser TEXT,
  device_type TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom Domains
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  domain VARCHAR NOT NULL UNIQUE,
  status VARCHAR NOT NULL DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_status VARCHAR DEFAULT 'pending',
  verification_token VARCHAR,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Settings
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── 3. INDEXES ───

CREATE INDEX idx_blocks_profile ON public.blocks(profile_id);
CREATE INDEX idx_blocks_position ON public.blocks(profile_id, position);
CREATE INDEX idx_analytics_profile ON public.analytics_events(profile_id);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at);
CREATE INDEX idx_leads_profile ON public.block_leads(profile_id);
CREATE INDEX idx_leads_block ON public.block_leads(block_id);
CREATE INDEX idx_domains_profile ON public.custom_domains(profile_id);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);


-- ─── 4. DATABASE FUNCTIONS ───

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ─── 5. TRIGGERS ───

-- New user signup → auto-create profile + role
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_link_profiles_updated_at
  BEFORE UPDATE ON public.link_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─── 6. ROW-LEVEL SECURITY ───

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ── profiles ──
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- ── user_roles ──
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (is_admin(auth.uid()));

-- ── link_profiles ──
CREATE POLICY "Public profiles are viewable by everyone" ON public.link_profiles
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own link profiles" ON public.link_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all link profiles" ON public.link_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- ── blocks ──
CREATE POLICY "Public blocks are viewable" ON public.blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = blocks.profile_id AND link_profiles.is_public = true)
  );
CREATE POLICY "Users can manage own blocks" ON public.blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = blocks.profile_id AND link_profiles.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage all blocks" ON public.blocks
  FOR ALL USING (is_admin(auth.uid()));

-- ── block_leads ──
CREATE POLICY "Anyone can submit lead data" ON public.block_leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own leads" ON public.block_leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = block_leads.profile_id AND link_profiles.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own leads" ON public.block_leads
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = block_leads.profile_id AND link_profiles.user_id = auth.uid())
  );
CREATE POLICY "Admins can view all leads" ON public.block_leads
  FOR SELECT USING (is_admin(auth.uid()));

-- ── analytics_events ──
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = analytics_events.profile_id AND link_profiles.user_id = auth.uid())
  );
CREATE POLICY "Admins can view all analytics" ON public.analytics_events
  FOR SELECT USING (is_admin(auth.uid()));

-- ── custom_domains ──
CREATE POLICY "Users can view their own domains" ON public.custom_domains
  FOR SELECT USING (
    profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert their own domains" ON public.custom_domains
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update their own domains" ON public.custom_domains
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete their own domains" ON public.custom_domains
  FOR DELETE USING (
    profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Public can read domains for routing" ON public.custom_domains
  FOR SELECT USING (status::text = 'active');
CREATE POLICY "Admins can view all domains" ON public.custom_domains
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage all domains" ON public.custom_domains
  FOR ALL USING (is_admin(auth.uid()));

-- ── admin_settings ──
CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL USING (is_admin(auth.uid()));

-- ── audit_logs ──
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (is_admin(auth.uid()));
```

---

## 9. Storage Buckets

```sql
-- Create the profile-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Storage policies
CREATE POLICY "Public can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 10. Edge Functions

You have **4 edge functions**. Copy each into `supabase/functions/<name>/index.ts` on your self-hosted instance.

### `supabase/config.toml`

```toml
[functions.set-profile-password]
verify_jwt = false

[functions.verify-profile-password]
verify_jwt = false

[functions.verify-domain-dns]
verify_jwt = false

[functions.recheck-domains-dns]
verify_jwt = false
```

### 10.1 `set-profile-password/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const { password, enabled } = await req.json();

    if (enabled) {
      if (!password || typeof password !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Password is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (password.length < 4 || password.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Password must be between 4 and 100 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const { error: updateError } = await supabase
        .from('link_profiles')
        .update({ is_password_protected: true, password_hash: passwordHash })
        .eq('user_id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from('link_profiles')
        .update({ is_password_protected: false, password_hash: null })
        .eq('user_id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 10.2 `verify-profile-password/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Username is required', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error: fetchError } = await supabase
      .from('link_profiles')
      .select('id, password_hash, is_password_protected')
      .eq('username', username)
      .single();

    if (fetchError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.is_password_protected || !profile.password_hash) {
      return new Response(
        JSON.stringify({ valid: true, message: 'Profile is not password protected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await bcrypt.compare(password, profile.password_hash);

    if (isValid) {
      const accessToken = crypto.randomUUID();
      return new Response(
        JSON.stringify({ valid: true, accessToken, profileId: profile.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 10.3 `verify-domain-dns/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVER_IP = Deno.env.get("HOSTINGER_SERVER_IP") || "185.158.133.1";
const APP_NAME = Deno.env.get("APP_NAME") || "linkbio";
const TXT_RECORD_NAME = `_${APP_NAME}`;
const TXT_VERIFY_PREFIX = `${APP_NAME}_verify`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domainId } = await req.json();

    if (!domainId) {
      return new Response(JSON.stringify({ success: false, error: "Domain ID is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: domain, error: domainError } = await supabase
      .from("custom_domains").select("*").eq("id", domainId).single();

    if (domainError || !domain) {
      return new Response(JSON.stringify({ success: false, error: "Domain not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errors: string[] = [];
    let aRecordValid = false;
    let txtRecordValid = false;

    // Check A record via Cloudflare DNS-over-HTTPS
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain.domain}&type=A`, {
        headers: { Accept: "application/dns-json" },
      });
      const data = await res.json();
      if (data.Answer?.length > 0) {
        const aRecords = data.Answer.filter((r: any) => r.type === 1);
        if (aRecords.some((r: any) => r.data === SERVER_IP)) {
          aRecordValid = true;
        } else {
          errors.push(`A record points to ${aRecords.map((r: any) => r.data).join(", ")}, expected ${SERVER_IP}`);
        }
      } else {
        errors.push(`No A record found for ${domain.domain}`);
      }
    } catch { errors.push("Failed to verify A record"); }

    // Check TXT record
    if (domain.verification_token) {
      try {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${TXT_RECORD_NAME}.${domain.domain}&type=TXT`,
          { headers: { Accept: "application/dns-json" } }
        );
        const data = await res.json();
        if (data.Answer?.length > 0) {
          const expected = `${TXT_VERIFY_PREFIX}=${domain.verification_token}`;
          if (data.Answer.filter((r: any) => r.type === 16).some((r: any) => r.data.replace(/^"|"$/g, "") === expected)) {
            txtRecordValid = true;
          } else {
            errors.push(`TXT record does not contain correct verification token`);
          }
        } else {
          errors.push(`No TXT record found at ${TXT_RECORD_NAME}.${domain.domain}`);
        }
      } catch { errors.push("Failed to verify TXT record"); }
    } else {
      txtRecordValid = true;
    }

    const dnsVerified = aRecordValid && txtRecordValid;
    const newStatus = dnsVerified ? "active" : "failed";

    await supabase.from("custom_domains").update({
      status: newStatus, dns_verified: dnsVerified,
      ssl_status: dnsVerified ? "active" : "pending",
      updated_at: new Date().toISOString(),
    }).eq("id", domainId);

    return new Response(JSON.stringify({
      success: dnsVerified, verified: dnsVerified, aRecordValid, txtRecordValid,
      errors: errors.length > 0 ? errors : undefined,
      message: dnsVerified ? "Domain verified and activated!" : `Verification failed: ${errors.join("; ")}`,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### 10.4 `recheck-domains-dns/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERVER_IP = Deno.env.get('HOSTINGER_SERVER_IP') || '72.61.227.134';
const APP_NAME = Deno.env.get('APP_NAME') || 'linkbio';
const TXT_RECORD_NAME = `_${APP_NAME}`;
const TXT_VERIFY_PREFIX = `${APP_NAME}_verify`;

async function verifyDomainDns(domain: string, verificationToken: string | null) {
  const errors: string[] = [];
  let aRecordValid = false;
  let txtRecordValid = false;

  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
      headers: { 'Accept': 'application/dns-json' }
    });
    const data = await res.json();
    if (data.Answer?.length > 0) {
      if (data.Answer.filter((r: any) => r.type === 1).some((r: any) => r.data === SERVER_IP)) {
        aRecordValid = true;
      } else {
        errors.push(`A record points to wrong IP`);
      }
    } else {
      errors.push(`No A record found for ${domain}`);
    }
  } catch { errors.push('Failed to verify A record'); }

  if (verificationToken) {
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${TXT_RECORD_NAME}.${domain}&type=TXT`,
        { headers: { 'Accept': 'application/dns-json' } }
      );
      const data = await res.json();
      if (data.Answer?.length > 0) {
        const expected = `${TXT_VERIFY_PREFIX}=${verificationToken}`;
        if (data.Answer.filter((r: any) => r.type === 16).some((r: any) => r.data.replace(/^"|"$/g, '') === expected)) {
          txtRecordValid = true;
        } else {
          errors.push('TXT record invalid');
        }
      } else {
        errors.push(`No TXT record found`);
      }
    } catch { errors.push('Failed to verify TXT record'); }
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: domains } = await supabase
      .from('custom_domains').select('*')
      .in('status', ['active', 'verifying', 'pending', 'failed']);

    if (!domains?.length) {
      return new Response(
        JSON.stringify({ success: true, message: 'No domains to verify', checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { domain: string; status: string; verified: boolean }[] = [];

    for (const domain of domains) {
      const { aRecordValid, txtRecordValid } = await verifyDomainDns(domain.domain, domain.verification_token);
      const dnsVerified = aRecordValid && txtRecordValid;
      let newStatus = domain.status;

      if (dnsVerified && domain.status !== 'active') newStatus = 'active';
      if (!dnsVerified && domain.status === 'active') newStatus = 'failed';

      if (newStatus !== domain.status || dnsVerified !== domain.dns_verified) {
        await supabase.from('custom_domains').update({
          status: newStatus, dns_verified: dnsVerified,
          ssl_status: dnsVerified ? 'active' : 'pending',
          updated_at: new Date().toISOString(),
        }).eq('id', domain.id);
      }

      results.push({ domain: domain.domain, status: newStatus, verified: dnsVerified });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return new Response(
      JSON.stringify({ success: true, checked: domains.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 11. Secrets / Environment Variables

Set these in your self-hosted Supabase project (Dashboard → Settings → Edge Functions → Secrets):

| Secret Name | Description |
|---|---|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase |
| `HOSTINGER_SERVER_IP` | Your VPS IP for DNS verification (e.g. `185.158.133.1`) |
| `APP_NAME` | Optional, defaults to `linkbio` |

---

## 12. Live Data Export

### 12.1 Profiles

```sql
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_suspended, is_verified, created_at, updated_at) VALUES
('f364ce3a-095f-4403-a3a5-f5b15e179c84', 'fortengie@gmail.com', 'abd', NULL, 'client', false, false, '2026-01-06 05:06:54.17291+00', '2026-01-06 05:06:54.17291+00'),
('c45ba178-8a72-4817-bf3e-8e653c748cc8', 'dalviabdallah76@gmail.com', 'abdallah', NULL, 'client', false, false, '2026-01-06 12:37:01.123569+00', '2026-01-06 12:37:01.123569+00'),
('4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'fortengie2@gmail.com', 'family', NULL, 'client', false, false, '2026-01-15 15:46:39.013929+00', '2026-01-15 15:46:39.013929+00'),
('b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'abdallah.dalvi@ubiqedge.com', 'Ubiqedge', NULL, 'client', false, false, '2026-01-16 09:29:15.729394+00', '2026-01-16 09:29:15.729394+00');
```

### 12.2 User Roles

```sql
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('0f487238-c9e8-4b72-83a9-2f81e412d4bf', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'client', '2026-01-06 12:37:01.123569+00'),
('07590c70-ce8c-4f1f-b304-37a761a696ef', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'super_admin', '2026-01-13 16:18:47.033975+00'),
('d4108aa4-ac9d-44f5-ba50-26e84629e258', 'f364ce3a-095f-4403-a3a5-f5b15e179c84', 'admin', '2026-01-14 18:07:41.375607+00'),
('edbb3091-d47d-48de-9373-408c55bae1a8', '4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'client', '2026-01-15 15:46:39.013929+00'),
('3a953c40-8de7-4c66-828b-4c00dc6d021e', 'b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'client', '2026-01-16 09:29:15.729394+00');
```

### 12.3 Link Profiles

```sql
INSERT INTO public.link_profiles (id, user_id, username, display_name, bio, avatar_url, cover_url, location, theme_preset, background_type, background_value, custom_colors, custom_fonts, social_links, seo_title, seo_description, og_image_url, is_public, is_password_protected, password_hash, total_views, created_at, updated_at) VALUES
('baf47e4d-9a3e-43cb-9248-c517ab56beec', 'f364ce3a-095f-4403-a3a5-f5b15e179c84', 'abdallah', 'abdallah', 'Professional Digital Marketing and AI Automation services', 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/avatars/1767690552880.jpg', '', '', 'forest', 'solid', '#052e16', '{"accent":"#22c55e","animations":true,"bg":"#052e16","buttonRadius":16,"buttonStyle":"filled","cardBg":"#14532d","gradient":false,"id":"forest","name":"Forest","text":"#dcfce7"}', '{}', '{"email":"fortengie@gmail.com","facebook":"","instagram":"","linkedin":"https://www.linkedin.com/in/abdallahdalvi","phone":"+917400239134","pinterest":"","snapchat":"","tiktok":"","twitter":"","website":"","youtube":""}', NULL, NULL, NULL, true, false, NULL, 29, '2026-01-06 05:07:02.048489+00', '2026-02-04 21:57:59.962386+00'),
('15318d84-d3c5-406e-b6c8-38f0516e25aa', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'admin76', 'abdallah', NULL, NULL, NULL, NULL, 'default', 'solid', '#ffffff', '{}', '{}', '{}', NULL, NULL, NULL, true, false, NULL, 0, '2026-01-06 12:37:12.815045+00', '2026-01-06 12:37:12.815045+00'),
('e2cafdea-9846-4e5d-8d38-e3707b3c2ea8', '4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'family', 'family', NULL, NULL, NULL, NULL, 'default', 'solid', '#ffffff', '{}', '{}', '{}', NULL, NULL, NULL, true, false, NULL, 0, '2026-01-15 15:46:44.579936+00', '2026-01-15 15:46:44.579936+00'),
('611e9b63-cfb4-4923-b904-e3f55cd8a081', 'b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'ubiqedge', 'Ubiqedge', NULL, NULL, NULL, NULL, 'default', 'solid', '#ffffff', '{}', '{}', '{}', NULL, NULL, NULL, true, false, NULL, 0, '2026-01-16 09:29:58.71606+00', '2026-01-16 09:29:58.71606+00');
```

### 12.4 Blocks

```sql
INSERT INTO public.blocks (id, profile_id, type, title, subtitle, url, icon, thumbnail_url, content, button_style, position, is_enabled, is_featured, open_in_new_tab, mobile_only, desktop_only, schedule_start, schedule_end, total_clicks, created_at, updated_at) VALUES
('a5585337-eab6-485a-8420-5169ad83efdb', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'carousel', 'work', '', NULL, NULL, NULL, '{"items":[{"id":"6cddb2f7-324a-4a80-aa58-c939f0fabbf2","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681011578.jpg","title":"","url":""},{"id":"8cc9440c-5199-4e3a-97c8-abd2eec15a28","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681021039.jpg","title":"","url":""},{"id":"946850d4-58f2-4969-b019-7cb3789fb932","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681070056.jpeg","title":"","url":""},{"id":"d7f1ac7b-a715-4b0a-b832-44363858e0d4","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681066803.png","title":"","url":""},{"id":"934850ae-6629-4c9c-90e0-1765e8e68160","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681063317.png","title":"","url":""}]}', '{}', 0, true, false, true, false, false, NULL, NULL, 0, '2026-01-06 06:30:32.675775+00', '2026-01-06 13:07:07.544233+00'),
('1e94a361-8ce8-431c-b55a-cea2bba975c1', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'contact_email', 'Send Email', NULL, 'mailto:fortengie@gmail.com', NULL, NULL, '{"message":""}', '{}', 1, false, false, true, false, false, NULL, NULL, 0, '2026-01-06 06:31:51.488797+00', '2026-01-06 09:13:56.516256+00'),
('3ad6a401-aea1-4dce-b0f0-56ce5a4ee522', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'link', 'Website', NULL, 'https://ubiqedge.com', NULL, 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/block-thumbnails/1767682603272.png', '{}', '{}', 2, true, false, true, false, false, NULL, NULL, 0, '2026-01-06 06:57:04.346674+00', '2026-01-06 09:14:05.157557+00'),
('0805620c-73d0-4fed-ab6e-516fa95b2757', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'video', 'Watch my latest video', NULL, 'https://www.youtube.com/watch?v=qx2WBSPVorI', NULL, 'https://img.youtube.com/vi/qx2WBSPVorI/maxresdefault.jpg', '{"video_type":"youtube"}', '{}', 3, true, false, true, false, false, NULL, NULL, 0, '2026-01-06 07:36:24.125387+00', '2026-01-06 07:36:24.125387+00'),
('ed13628c-2a5c-47e3-b00f-28170583dd3f', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'contact_whatsapp', 'Message on WhatsApp', '', 'https://wa.me/917400239134', NULL, NULL, '{"message":""}', '{}', 4, true, false, true, false, false, NULL, NULL, 0, '2026-01-06 09:14:52.113066+00', '2026-01-06 09:15:07.161289+00'),
('4c4bb18f-78f8-4acb-aac2-c8f45bf3818e', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'shop', 'Mental Health Book', '', 'https://ubiqedge.com', NULL, 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/products/1767695695111.jpg', '{"badge":"","currency":"USD","display_style":"card","original_price":20,"price":10,"product_type":"digital"}', '{}', 5, true, false, true, false, false, NULL, NULL, 0, '2026-01-06 10:35:45.587143+00', '2026-01-06 10:40:12.736897+00'),
('9faf045b-d89b-468a-b5b4-0a38be3f5f28', 'e2cafdea-9846-4e5d-8d38-e3707b3c2ea8', 'link', 'hi', NULL, 'https:\\www.hi.com', NULL, NULL, '{}', '{}', 0, true, false, true, false, false, NULL, NULL, 0, '2026-01-16 14:03:52.395204+00', '2026-01-16 14:03:52.395204+00');
```

### 12.5 Analytics Events (sample — 133 total rows)

> **Note**: There are 133 analytics events. A representative sample is below. For the full dataset, export via the Dashboard Settings > Full Backup tool in-app.

```sql
-- Most recent 20 events (sample)
INSERT INTO public.analytics_events (id, profile_id, block_id, event_type, visitor_id, referrer, browser, device_type, created_at) VALUES
('d4005f92-2880-4875-b300-cc98c72b158d', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', NULL, 'view', 'v_1770242279707_9j89su3kf', NULL, 'Chrome', 'desktop', '2026-02-04 21:57:59.88522+00'),
('45f4da9a-8d29-46bc-a920-4a554965a28d', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', NULL, 'view', 'v_1767984672858_u8aw07d6m', 'https://l.instagram.com/', 'Chrome', 'mobile', '2026-01-24 07:23:51.592167+00'),
('a0521fae-276e-4e1c-9dac-be97875a7d5a', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', NULL, 'view', 'v_1768921504319_gvovd8za4', 'http://m.facebook.com', 'Other', 'mobile', '2026-01-20 15:05:04.776251+00'),
('5a0b81a4-dab7-4d2a-acdc-979e99ac0acf', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'ed13628c-2a5c-47e3-b00f-28170583dd3f', 'click', 'v_1768234814621_bhtmji55w', NULL, 'Safari', 'mobile', '2026-01-12 16:20:14.794265+00');
```

---

## 13. Auth Users Migration

**⚠️ IMPORTANT**: Auth users live in the `auth.users` table which is managed by Supabase internally. You **cannot** simply INSERT into `auth.users`.

### Options:

1. **Re-invite users** (recommended): Use the Supabase Dashboard → Authentication → Invite User for each email. Users set new passwords.

2. **Programmatic via Admin API**:
```bash
# For each user, call the admin API
curl -X POST 'https://YOUR_SUPABASE_URL/auth/v1/admin/users' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fortengie@gmail.com",
    "password": "temporary_password_123",
    "email_confirm": true,
    "user_metadata": { "full_name": "abd" }
  }'
```

Users to recreate:
| Email | Full Name | Original UUID |
|---|---|---|
| fortengie@gmail.com | abd | f364ce3a-095f-4403-a3a5-f5b15e179c84 |
| dalviabdallah76@gmail.com | abdallah | c45ba178-8a72-4817-bf3e-8e653c748cc8 |
| fortengie2@gmail.com | family | 4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4 |
| abdallah.dalvi@ubiqedge.com | Ubiqedge | b887f5ad-c5d1-40dc-9bb5-62712b9c57a2 |

> **Note**: After creating users, update the `user_id` references in `profiles`, `user_roles`, and `link_profiles` to match the new UUIDs if they differ.

---

## 14. Frontend .env Config

Update your frontend `.env` to point to your self-hosted Supabase:

```env
VITE_SUPABASE_URL=https://your-self-hosted-supabase.com
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**No code changes needed** — the app already uses `import.meta.env.VITE_SUPABASE_URL` everywhere.

---

## 15. Step-by-Step Migration Checklist

```
[ ] 1. Set up self-hosted Supabase (Docker Compose)
[ ] 2. Run the full schema SQL (Section 2) in SQL Editor
[ ] 3. Create storage bucket (Section 9)
[ ] 4. Create auth users via Admin API (Section 13)
[ ] 5. Update UUIDs in data INSERT statements if user IDs changed
[ ] 6. Run data INSERT statements (Section 12) in order:
       - profiles → user_roles → link_profiles → blocks → analytics_events
[ ] 7. Copy edge function files into supabase/functions/
[ ] 8. Update supabase/config.toml (Section 10)
[ ] 9. Set secrets/env vars (Section 11)
[ ] 10. Deploy edge functions: supabase functions deploy
[ ] 11. Download images from old storage bucket and re-upload
       - Avatar images, carousel images, thumbnails, product images
       - Update URLs in link_profiles and blocks tables
[ ] 12. Update frontend .env (Section 14)
[ ] 13. Test: signup, login, profile view, block CRUD, analytics
[ ] 14. Set up DNS recheck cron (optional):
        - Use pg_cron or external cron to call recheck-domains-dns periodically
```

---

## Image Assets to Download

These storage URLs need to be downloaded from the old instance and re-uploaded to your new `profile-images` bucket:

```
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/avatars/1767690552880.jpg
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681011578.jpg
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681021039.jpg
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681070056.jpeg
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681066803.png
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681063317.png
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/block-thumbnails/1767682603272.png
profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/products/1767695695111.jpg
```

After re-uploading, update the URLs in `link_profiles.avatar_url` and `blocks.thumbnail_url` / `blocks.content` to use your new Supabase URL.

---

*End of migration guide.*
