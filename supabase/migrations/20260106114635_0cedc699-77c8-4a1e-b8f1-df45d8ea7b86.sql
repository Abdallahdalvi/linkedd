-- Drop the security definer view and use regular RLS instead
DROP VIEW IF EXISTS public.public_link_profiles;

-- The existing RLS policy already protects the table properly
-- The password_hash is stored securely and only accessed via edge function with service role
-- The public SELECT policy allows reading profiles, but password verification happens server-side