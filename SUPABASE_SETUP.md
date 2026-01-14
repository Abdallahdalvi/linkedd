# Supabase Database Setup Guide

This guide provides complete instructions for setting up the Supabase backend for this link-in-bio application.

## Quick Start

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts below in the SQL Editor (Dashboard → SQL Editor)
3. Update your `.env` file with your project credentials
4. Deploy!

---

## Step 1: Environment Variables

Create a `.env` file in your project root with:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

You can find these values in your Supabase Dashboard → Settings → API.

---

## Step 2: Database Setup

Run these SQL scripts **in order** in the Supabase SQL Editor.

### 2.1 Create Enum Types

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');
```

### 2.2 Create Core Tables

```sql
-- ============================================
-- PROFILES TABLE (synced with auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role app_role NOT NULL DEFAULT 'client',
    is_verified BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- USER ROLES TABLE (for granular permissions)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ============================================
-- LINK PROFILES TABLE (public bio pages)
-- ============================================
CREATE TABLE public.link_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    is_public BOOLEAN DEFAULT TRUE,
    is_password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    total_views INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}'::jsonb,
    custom_fonts JSONB DEFAULT '{}'::jsonb,
    custom_colors JSONB DEFAULT '{}'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- BLOCKS TABLE (content blocks on profiles)
-- ============================================
CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    schedule_start TIMESTAMP WITH TIME ZONE,
    schedule_end TIMESTAMP WITH TIME ZONE,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- CUSTOM DOMAINS TABLE
-- ============================================
CREATE TABLE public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
    domain VARCHAR NOT NULL UNIQUE,
    status VARCHAR NOT NULL DEFAULT 'pending',
    ssl_status VARCHAR DEFAULT 'pending',
    is_primary BOOLEAN DEFAULT FALSE,
    dns_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID,
    block_id UUID,
    event_type TEXT NOT NULL,
    visitor_id TEXT,
    referrer TEXT,
    browser TEXT,
    device_type TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### 2.3 Create Database Functions

```sql
-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin (super_admin or admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new user signup (creates profile + assigns client role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;
```

### 2.4 Create Triggers

```sql
-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
```

### 2.5 Enable Row Level Security

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
```

### 2.6 Create RLS Policies

```sql
-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (is_admin(auth.uid()));

-- ============================================
-- USER ROLES POLICIES
-- ============================================
CREATE POLICY "Users can view own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles FOR ALL 
  USING (is_admin(auth.uid()));

-- ============================================
-- LINK PROFILES POLICIES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.link_profiles FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can manage own link profiles" 
  ON public.link_profiles FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all link profiles" 
  ON public.link_profiles FOR ALL 
  USING (is_admin(auth.uid()));

-- ============================================
-- BLOCKS POLICIES
-- ============================================
CREATE POLICY "Public blocks are viewable" 
  ON public.blocks FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM link_profiles 
    WHERE link_profiles.id = blocks.profile_id 
    AND link_profiles.is_public = true
  ));

CREATE POLICY "Users can manage own blocks" 
  ON public.blocks FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM link_profiles 
    WHERE link_profiles.id = blocks.profile_id 
    AND link_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all blocks" 
  ON public.blocks FOR ALL 
  USING (is_admin(auth.uid()));

-- ============================================
-- CUSTOM DOMAINS POLICIES
-- ============================================
CREATE POLICY "Public can read domains for routing" 
  ON public.custom_domains FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Users can view their own domains" 
  ON public.custom_domains FOR SELECT 
  USING (profile_id IN (
    SELECT id FROM link_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own domains" 
  ON public.custom_domains FOR INSERT 
  WITH CHECK (profile_id IN (
    SELECT id FROM link_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own domains" 
  ON public.custom_domains FOR UPDATE 
  USING (profile_id IN (
    SELECT id FROM link_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own domains" 
  ON public.custom_domains FOR DELETE 
  USING (profile_id IN (
    SELECT id FROM link_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all domains" 
  ON public.custom_domains FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all domains" 
  ON public.custom_domains FOR ALL 
  USING (is_admin(auth.uid()));

-- ============================================
-- ANALYTICS EVENTS POLICIES
-- ============================================
CREATE POLICY "Anyone can insert analytics" 
  ON public.analytics_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view own analytics" 
  ON public.analytics_events FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM link_profiles 
    WHERE link_profiles.id = analytics_events.profile_id 
    AND link_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all analytics" 
  ON public.analytics_events FOR SELECT 
  USING (is_admin(auth.uid()));

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (is_admin(auth.uid()));

-- ============================================
-- ADMIN SETTINGS POLICIES
-- ============================================
CREATE POLICY "Admins can manage settings" 
  ON public.admin_settings FOR ALL 
  USING (is_admin(auth.uid()));
```

### 2.7 Create Storage Bucket

```sql
-- Create storage bucket for profile images
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

## Step 3: Authentication Settings

Go to **Dashboard → Authentication → Settings** and configure:

1. **Enable Email Signup**: ON
2. **Enable Email Confirmations**: OFF (for development) or ON (for production)
3. **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
4. **Redirect URLs**: Add your app URLs

---

## Step 4: Create Super Admin

After your first user signs up, grant them super_admin access:

```sql
-- Replace 'user@email.com' with the actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'user@email.com';
```

---

## Step 5: Edge Functions (Optional)

If using custom domains, deploy these edge functions from the `supabase/functions/` folder:

- `verify-domain-dns` - Verifies domain DNS configuration
- `recheck-domains-dns` - Periodic DNS recheck
- `set-profile-password` - Sets password protection
- `verify-profile-password` - Verifies password protection

Deploy using Supabase CLI:
```bash
supabase functions deploy verify-domain-dns
supabase functions deploy recheck-domains-dns
supabase functions deploy set-profile-password
supabase functions deploy verify-profile-password
```

---

## Quick Reference: Complete Setup Script

Copy and paste this entire script to set up everything at once:

```sql
-- ============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');

-- 2. Create all tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role app_role NOT NULL DEFAULT 'client',
    is_verified BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

CREATE TABLE public.link_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    is_public BOOLEAN DEFAULT TRUE,
    is_password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    total_views INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}'::jsonb,
    custom_fonts JSONB DEFAULT '{}'::jsonb,
    custom_colors JSONB DEFAULT '{}'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    schedule_start TIMESTAMP WITH TIME ZONE,
    schedule_end TIMESTAMP WITH TIME ZONE,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
    domain VARCHAR NOT NULL UNIQUE,
    status VARCHAR NOT NULL DEFAULT 'pending',
    ssl_status VARCHAR DEFAULT 'pending',
    is_primary BOOLEAN DEFAULT FALSE,
    dns_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID,
    block_id UUID,
    event_type TEXT NOT NULL,
    visitor_id TEXT,
    referrer TEXT,
    browser TEXT,
    device_type TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin', 'admin')) $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), NEW.raw_user_meta_data ->> 'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

-- 4. Create triggers
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_link_profiles_updated_at BEFORE UPDATE ON public.link_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON public.blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON public.custom_domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create all RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public profiles are viewable by everyone" ON public.link_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own link profiles" ON public.link_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all link profiles" ON public.link_profiles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public blocks are viewable" ON public.blocks FOR SELECT USING (EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = blocks.profile_id AND link_profiles.is_public = true));
CREATE POLICY "Users can manage own blocks" ON public.blocks FOR ALL USING (EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = blocks.profile_id AND link_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can manage all blocks" ON public.blocks FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public can read domains for routing" ON public.custom_domains FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view their own domains" ON public.custom_domains FOR SELECT USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own domains" ON public.custom_domains FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own domains" ON public.custom_domains FOR UPDATE USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own domains" ON public.custom_domains FOR DELETE USING (profile_id IN (SELECT id FROM link_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all domains" ON public.custom_domains FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage all domains" ON public.custom_domains FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own analytics" ON public.analytics_events FOR SELECT USING (EXISTS (SELECT 1 FROM link_profiles WHERE link_profiles.id = analytics_events.profile_id AND link_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can view all analytics" ON public.analytics_events FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage settings" ON public.admin_settings FOR ALL USING (is_admin(auth.uid()));

-- 7. Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
CREATE POLICY "Public can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Troubleshooting

### "Permission denied" errors
- Make sure RLS is properly configured
- Check if the user has the correct role in `user_roles` table

### New users not showing in profiles
- Verify the `on_auth_user_created` trigger exists
- Check if `handle_new_user` function is created correctly

### Storage upload fails
- Ensure the `profile-images` bucket exists
- Check storage policies are in place

---

## Support

For issues with this setup, check:
1. Supabase Dashboard → Logs → Postgres Logs
2. Browser console for client-side errors
3. Network tab for API response details
