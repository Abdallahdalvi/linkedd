-- Create custom_domains table
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  is_primary BOOLEAN DEFAULT false,
  ssl_status VARCHAR(50) DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Users can view their own domains
CREATE POLICY "Users can view their own domains"
ON public.custom_domains
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = auth.uid()
  )
);

-- Users can insert their own domains
CREATE POLICY "Users can insert their own domains"
ON public.custom_domains
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = auth.uid()
  )
);

-- Users can update their own domains
CREATE POLICY "Users can update their own domains"
ON public.custom_domains
FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = auth.uid()
  )
);

-- Users can delete their own domains
CREATE POLICY "Users can delete their own domains"
ON public.custom_domains
FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = auth.uid()
  )
);

-- Admins can view all domains
CREATE POLICY "Admins can view all domains"
ON public.custom_domains
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can manage all domains
CREATE POLICY "Admins can manage all domains"
ON public.custom_domains
FOR ALL
USING (public.is_admin(auth.uid()));

-- Public can read domains for routing (needed for domain lookup)
CREATE POLICY "Public can read domains for routing"
ON public.custom_domains
FOR SELECT
USING (status = 'active');

-- Add index for fast domain lookups
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX idx_custom_domains_profile_id ON public.custom_domains(profile_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();