# LinkBio — Complete Database Schema & Data Export

> Generated: 2026-02-11  
> Source: Lovable Cloud (PostgreSQL)  

---

## Table of Contents

1. [Enum Types](#enum-types)
2. [Tables & Columns](#tables--columns)
3. [Foreign Keys & Constraints](#foreign-keys--constraints)
4. [Indexes](#indexes)
5. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Database Functions](#database-functions)
7. [Triggers](#triggers)
8. [Storage Buckets](#storage-buckets)
9. [Live Data Snapshot](#live-data-snapshot)
10. [Full Reproducible SQL](#full-reproducible-sql)
11. [Entity Relationship Diagram](#entity-relationship-diagram)
12. [Edge Functions](#edge-functions)
13. [Self-Hosting Import Guide](#self-hosting-import-guide)

---

## Enum Types

```sql
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');
```

---

## Tables & Columns

### 1. `profiles` — User account info (auto-created on signup)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | — (FK → auth.users) |
| `email` | text | NO | — |
| `full_name` | text | YES | — |
| `avatar_url` | text | YES | — |
| `role` | app_role | NO | `'client'` |
| `is_verified` | boolean | YES | `false` |
| `is_suspended` | boolean | YES | `false` |
| `last_login_at` | timestamptz | YES | — |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### 2. `user_roles` — Role assignments (separate from profiles for security)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | NO | FK → auth.users |
| `role` | app_role | NO | — |
| `created_at` | timestamptz | NO | `now()` |

**Unique constraint:** `(user_id, role)`

### 3. `link_profiles` — Public link-in-bio pages

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | NO | FK → auth.users |
| `username` | text | NO | — (UNIQUE) |
| `display_name` | text | YES | — |
| `bio` | text | YES | — |
| `avatar_url` | text | YES | — |
| `cover_url` | text | YES | — |
| `location` | text | YES | — |
| `theme_preset` | text | YES | `'default'` |
| `background_type` | text | YES | `'solid'` |
| `background_value` | text | YES | `'#ffffff'` |
| `custom_colors` | jsonb | YES | `'{}'` |
| `custom_fonts` | jsonb | YES | `'{}'` |
| `social_links` | jsonb | YES | `'{}'` |
| `seo_title` | text | YES | — |
| `seo_description` | text | YES | — |
| `og_image_url` | text | YES | — |
| `is_public` | boolean | YES | `true` |
| `is_password_protected` | boolean | YES | `false` |
| `password_hash` | text | YES | — |
| `total_views` | integer | YES | `0` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### 4. `blocks` — Content blocks on link profiles

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `profile_id` | uuid | NO | FK → link_profiles |
| `type` | text | NO | — |
| `title` | text | YES | — |
| `subtitle` | text | YES | — |
| `url` | text | YES | — |
| `thumbnail_url` | text | YES | — |
| `icon` | text | YES | — |
| `content` | jsonb | YES | `'{}'` |
| `button_style` | jsonb | YES | `'{}'` |
| `is_enabled` | boolean | YES | `true` |
| `is_featured` | boolean | YES | `false` |
| `open_in_new_tab` | boolean | YES | `true` |
| `mobile_only` | boolean | YES | `false` |
| `desktop_only` | boolean | YES | `false` |
| `schedule_start` | timestamptz | YES | — |
| `schedule_end` | timestamptz | YES | — |
| `position` | integer | YES | `0` |
| `total_clicks` | integer | YES | `0` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Block types:** `link`, `video`, `shop`, `carousel`, `contact_email`, `contact_whatsapp`, `download`, `featured`, `image`, `music`, `text`, `html`, `scheduled`

### 5. `block_leads` — Visitor data collected via data gates

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `block_id` | uuid | NO | FK → blocks |
| `profile_id` | uuid | NO | FK → link_profiles |
| `visitor_id` | text | YES | — |
| `name` | text | YES | — |
| `email` | text | YES | — |
| `phone` | text | YES | — |
| `created_at` | timestamptz | NO | `now()` |

### 6. `analytics_events` — Page view & click tracking

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `profile_id` | uuid | YES | FK → link_profiles |
| `block_id` | uuid | YES | FK → blocks |
| `event_type` | text | NO | — |
| `visitor_id` | text | YES | — |
| `referrer` | text | YES | — |
| `browser` | text | YES | — |
| `device_type` | text | YES | — |
| `country` | text | YES | — |
| `city` | text | YES | — |
| `created_at` | timestamptz | NO | `now()` |

**Event types:** `page_view`, `block_click`

### 7. `custom_domains` — Custom domain mappings

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `profile_id` | uuid | NO | FK → link_profiles |
| `domain` | varchar | NO | — (UNIQUE) |
| `status` | varchar | NO | `'pending'` |
| `dns_verified` | boolean | YES | `false` |
| `ssl_status` | varchar | YES | `'pending'` |
| `verification_token` | varchar | YES | — |
| `is_primary` | boolean | YES | `false` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### 8. `admin_settings` — Platform configuration

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `setting_key` | text | NO | — (UNIQUE) |
| `setting_value` | jsonb | NO | — |
| `updated_by` | uuid | YES | FK → auth.users |
| `updated_at` | timestamptz | NO | `now()` |

### 9. `audit_logs` — Admin action log

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | NO | `gen_random_uuid()` |
| `user_id` | uuid | YES | FK → auth.users |
| `action` | text | NO | — |
| `entity_type` | text | YES | — |
| `entity_id` | uuid | YES | — |
| `details` | jsonb | YES | `'{}'` |
| `ip_address` | text | YES | — |
| `created_at` | timestamptz | NO | `now()` |

---

## Foreign Keys & Constraints

| Table | Constraint | Definition |
|-------|-----------|------------|
| profiles | `profiles_id_fkey` | FK(id) → auth.users(id) ON DELETE CASCADE |
| user_roles | `user_roles_user_id_fkey` | FK(user_id) → auth.users(id) ON DELETE CASCADE |
| user_roles | `user_roles_user_id_role_key` | UNIQUE(user_id, role) |
| link_profiles | `link_profiles_user_id_fkey` | FK(user_id) → auth.users(id) ON DELETE CASCADE |
| link_profiles | `link_profiles_username_key` | UNIQUE(username) |
| blocks | `blocks_profile_id_fkey` | FK(profile_id) → link_profiles(id) ON DELETE CASCADE |
| block_leads | `block_leads_block_id_fkey` | FK(block_id) → blocks(id) ON DELETE CASCADE |
| block_leads | `block_leads_profile_id_fkey` | FK(profile_id) → link_profiles(id) ON DELETE CASCADE |
| analytics_events | `analytics_events_profile_id_fkey` | FK(profile_id) → link_profiles(id) ON DELETE CASCADE |
| analytics_events | `analytics_events_block_id_fkey` | FK(block_id) → blocks(id) ON DELETE SET NULL |
| custom_domains | `custom_domains_profile_id_fkey` | FK(profile_id) → link_profiles(id) ON DELETE CASCADE |
| custom_domains | `custom_domains_domain_key` | UNIQUE(domain) |
| admin_settings | `admin_settings_updated_by_fkey` | FK(updated_by) → auth.users(id) |
| admin_settings | `admin_settings_setting_key_key` | UNIQUE(setting_key) |
| audit_logs | `audit_logs_user_id_fkey` | FK(user_id) → auth.users(id) ON DELETE SET NULL |

---

## Indexes

| Table | Index | Definition |
|-------|-------|------------|
| block_leads | `idx_block_leads_block_id` | btree(block_id) |
| block_leads | `idx_block_leads_visitor` | btree(block_id, visitor_id) |
| custom_domains | `idx_custom_domains_domain` | btree(domain) |
| custom_domains | `idx_custom_domains_profile_id` | btree(profile_id) |

---

## Row-Level Security (RLS) Policies

All tables have RLS **enabled**.

### profiles

| Policy | Command | Expression |
|--------|---------|------------|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| Admins can view all profiles | SELECT | `is_admin(auth.uid())` |
| Admins can update all profiles | UPDATE | `is_admin(auth.uid())` |

> No INSERT (created by trigger), no DELETE.

### user_roles

| Policy | Command | Expression |
|--------|---------|------------|
| Users can view own roles | SELECT | `auth.uid() = user_id` |
| Admins can manage roles | ALL | `is_admin(auth.uid())` |

### link_profiles

| Policy | Command | Expression |
|--------|---------|------------|
| Public profiles are viewable by everyone | SELECT | `is_public = true` |
| Users can manage own link profiles | ALL | `auth.uid() = user_id` |
| Admins can manage all link profiles | ALL | `is_admin(auth.uid())` |

### blocks

| Policy | Command | Expression |
|--------|---------|------------|
| Public blocks are viewable | SELECT | `EXISTS(SELECT 1 FROM link_profiles WHERE id = blocks.profile_id AND is_public = true)` |
| Users can manage own blocks | ALL | `EXISTS(SELECT 1 FROM link_profiles WHERE id = blocks.profile_id AND user_id = auth.uid())` |
| Admins can manage all blocks | ALL | `is_admin(auth.uid())` |

### block_leads

| Policy | Command | Expression |
|--------|---------|------------|
| Anyone can submit lead data | INSERT | `true` |
| Users can view own leads | SELECT | `EXISTS(... link_profiles.user_id = auth.uid())` |
| Users can delete own leads | DELETE | `EXISTS(... link_profiles.user_id = auth.uid())` |
| Admins can view all leads | SELECT | `is_admin(auth.uid())` |

### analytics_events

| Policy | Command | Expression |
|--------|---------|------------|
| Anyone can insert analytics | INSERT | `true` |
| Users can view own analytics | SELECT | `EXISTS(... link_profiles.user_id = auth.uid())` |
| Admins can view all analytics | SELECT | `is_admin(auth.uid())` |

### custom_domains

| Policy | Command | Expression |
|--------|---------|------------|
| Public can read domains for routing | SELECT | `status = 'active'` |
| Users can view/insert/update/delete own | CRUD | `profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid())` |
| Admins can view all domains | SELECT | `is_admin(auth.uid())` |
| Admins can manage all domains | ALL | `is_admin(auth.uid())` |

### admin_settings

| Policy | Command | Expression |
|--------|---------|------------|
| Admins can manage settings | ALL | `is_admin(auth.uid())` |

### audit_logs

| Policy | Command | Expression |
|--------|---------|------------|
| System can insert audit logs | INSERT | `true` |
| Admins can view audit logs | SELECT | `is_admin(auth.uid())` |

---

## Database Functions

### `has_role(_user_id uuid, _role app_role) → boolean`

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### `is_admin(_user_id uuid) → boolean`

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;
```

### `handle_new_user() → trigger`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;
```

> **Trigger:** `on_auth_user_created` AFTER INSERT on `auth.users` → `handle_new_user()`

### `update_updated_at_column() → trigger`

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## Triggers

The `handle_new_user` trigger lives on `auth.users` (managed by the auth system). No triggers currently exist on public schema tables. For self-hosting, attach `update_updated_at_column` to tables with `updated_at`.

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `profile-images` | Yes | Avatars, covers, block thumbnails |

---

## Live Data Snapshot

### Users (profiles table) — 4 users

| Email | Name | Role | Verified | Created |
|-------|------|------|----------|---------|
| fortengie@gmail.com | abd | client | ✗ | 2026-01-06 |
| dalviabdallah76@gmail.com | abdallah | client | ✗ | 2026-01-06 |
| fortengie2@gmail.com | family | client | ✗ | 2026-01-15 |
| abdallah.dalvi@ubiqedge.com | Ubiqedge | client | ✗ | 2026-01-16 |

### User Roles — 5 assignments

| User | Roles |
|------|-------|
| dalviabdallah76@gmail.com | **super_admin**, client |
| fortengie@gmail.com | **admin** |
| fortengie2@gmail.com | client |
| abdallah.dalvi@ubiqedge.com | client |

### Link Profiles — 4 profiles

| Username | Display Name | Theme | Public |
|----------|-------------|-------|--------|
| admin76 | abdallah | default | ✓ |
| abdallah | abdallah | forest | ✓ |
| family | family | default | ✓ |
| ubiqedge | Ubiqedge | default | ✓ |

### Blocks — 7 blocks

| Title | Type | Profile | Enabled |
|-------|------|---------|---------|
| hi | link | family | ✓ |
| work | carousel | abdallah | ✓ |
| Send Email | contact_email | abdallah | ✗ |
| Website | link | abdallah | ✓ |
| Watch my latest video | video | abdallah | ✓ |
| Message on WhatsApp | contact_whatsapp | abdallah | ✓ |
| Mental Health Book | shop | abdallah | ✓ |

### Row Counts

| Table | Rows |
|-------|------|
| analytics_events | 133 |
| block_leads | 0 |
| custom_domains | 0 |
| admin_settings | 0 |
| audit_logs | 0 |

---

## Full Reproducible SQL

Copy-paste this to recreate the entire schema on any PostgreSQL instance.  
For MySQL self-hosting, see `docker/init.sql`.

```sql
-- ═══════════════════════════════════════════════════════
-- LinkBio Full Schema — PostgreSQL
-- ═══════════════════════════════════════════════════════

-- 1. ENUM
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');

-- 2. PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role app_role NOT NULL DEFAULT 'client',
  is_verified boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. USER_ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. LINK_PROFILES
CREATE TABLE public.link_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  location text,
  theme_preset text DEFAULT 'default',
  background_type text DEFAULT 'solid',
  background_value text DEFAULT '#ffffff',
  custom_colors jsonb DEFAULT '{}',
  custom_fonts jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  seo_title text,
  seo_description text,
  og_image_url text,
  is_public boolean DEFAULT true,
  is_password_protected boolean DEFAULT false,
  password_hash text,
  total_views integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. BLOCKS
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  subtitle text,
  url text,
  thumbnail_url text,
  icon text,
  content jsonb DEFAULT '{}',
  button_style jsonb DEFAULT '{}',
  is_enabled boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  open_in_new_tab boolean DEFAULT true,
  mobile_only boolean DEFAULT false,
  desktop_only boolean DEFAULT false,
  schedule_start timestamptz,
  schedule_end timestamptz,
  position integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. BLOCK_LEADS
CREATE TABLE public.block_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
  visitor_id text,
  name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_block_leads_block_id ON block_leads(block_id);
CREATE INDEX idx_block_leads_visitor ON block_leads(block_id, visitor_id);

-- 7. ANALYTICS_EVENTS
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES link_profiles(id) ON DELETE CASCADE,
  block_id uuid REFERENCES blocks(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  visitor_id text,
  referrer text,
  browser text,
  device_type text,
  country text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. CUSTOM_DOMAINS
CREATE TABLE public.custom_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
  domain varchar NOT NULL UNIQUE,
  status varchar NOT NULL DEFAULT 'pending',
  dns_verified boolean DEFAULT false,
  ssl_status varchar DEFAULT 'pending',
  verification_token varchar,
  is_primary boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_profile_id ON custom_domains(profile_id);

-- 9. ADMIN_SETTINGS
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. AUDIT_LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin', 'admin'))
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════
-- RLS (enable on all tables)
-- ═══════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (is_admin(auth.uid()));

-- link_profiles
CREATE POLICY "Public profiles are viewable" ON link_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own link profiles" ON link_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all link profiles" ON link_profiles FOR ALL USING (is_admin(auth.uid()));

-- blocks
CREATE POLICY "Public blocks are viewable" ON blocks FOR SELECT USING (EXISTS (SELECT 1 FROM link_profiles WHERE id = blocks.profile_id AND is_public = true));
CREATE POLICY "Users can manage own blocks" ON blocks FOR ALL USING (EXISTS (SELECT 1 FROM link_profiles WHERE id = blocks.profile_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all blocks" ON blocks FOR ALL USING (is_admin(auth.uid()));

-- block_leads
CREATE POLICY "Anyone can submit lead data" ON block_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own leads" ON block_leads FOR SELECT USING (EXISTS (SELECT 1 FROM link_profiles WHERE id = block_leads.profile_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own leads" ON block_leads FOR DELETE USING (EXISTS (SELECT 1 FROM link_profiles WHERE id = block_leads.profile_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all leads" ON block_leads FOR SELECT USING (is_admin(auth.uid()));

-- analytics_events
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (EXISTS (SELECT 1 FROM link_profiles WHERE id = analytics_events.profile_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all analytics" ON analytics_events FOR SELECT USING (is_admin(auth.uid()));

-- custom_domains
CREATE POLICY "Public can read active domains" ON custom_domains FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view own domains" ON custom_domains FOR SELECT USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own domains" ON custom_domains FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own domains" ON custom_domains FOR UPDATE USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own domains" ON custom_domains FOR DELETE USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all domains" ON custom_domains FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage all domains" ON custom_domains FOR ALL USING (is_admin(auth.uid()));

-- admin_settings
CREATE POLICY "Admins can manage settings" ON admin_settings FOR ALL USING (is_admin(auth.uid()));

-- audit_logs
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin(auth.uid()));
```

---

## Entity Relationship Diagram

```
auth.users (managed by auth system)
  │
  ├── 1:1 ──→ profiles (account info, auto-created)
  ├── 1:N ──→ user_roles (role assignments)
  └── 1:N ──→ link_profiles (public pages)
                │
                ├── 1:N ──→ blocks (content blocks)
                │             └── 1:N ──→ block_leads (visitor data)
                ├── 1:N ──→ analytics_events (tracking)
                └── 1:N ──→ custom_domains (domain mapping)

admin_settings (global config, admin-only)
audit_logs (action log, admin-only)
```

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `verify-domain-dns` | Checks DNS records for custom domain verification |
| `recheck-domains-dns` | Batch re-checks all pending domain DNS records |
| `set-profile-password` | Hashes and stores password for protected profiles |
| `verify-profile-password` | Validates visitor-entered password against hash |

---

## Self-Hosting Import Guide

### PostgreSQL

```bash
createdb linkbio
psql -d linkbio -f DATABASE_EXPORT.md  # copy the SQL block above into a .sql file
```

### MySQL (Docker self-host)

Use `docker/init.sql` which contains the MySQL-compatible version of this schema.

```bash
cd docker
docker-compose up -d
# MySQL auto-imports init.sql on first boot
```

### Create First Super Admin (self-hosted)

```sql
-- After registering your first user via the app:
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'super_admin');
```

See `DOCKER_SELF_HOST.md` for full Portainer deployment instructions.
