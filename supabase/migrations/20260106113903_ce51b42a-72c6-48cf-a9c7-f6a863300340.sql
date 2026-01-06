-- Update the RLS policy to prevent password_hash from being exposed in public queries
-- Create a view for public profile access that excludes sensitive fields

-- First, drop any existing public profiles view
DROP VIEW IF EXISTS public.public_link_profiles;

-- Create a secure view for public profile access (without password_hash)
CREATE VIEW public.public_link_profiles AS
SELECT 
  id, 
  user_id, 
  username, 
  display_name, 
  bio, 
  avatar_url, 
  cover_url, 
  location, 
  theme_preset, 
  custom_colors, 
  custom_fonts,
  background_type, 
  background_value, 
  social_links, 
  seo_title,
  seo_description, 
  og_image_url, 
  is_public, 
  is_password_protected,
  total_views, 
  created_at, 
  updated_at
FROM link_profiles
WHERE is_public = true;

-- Grant SELECT on the view to anonymous and authenticated users
GRANT SELECT ON public.public_link_profiles TO anon, authenticated;