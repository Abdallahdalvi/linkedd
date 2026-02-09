
-- Create table for collected visitor leads/data from gated blocks
CREATE TABLE public.block_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  visitor_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.block_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public visitors submitting their data)
CREATE POLICY "Anyone can submit lead data"
  ON public.block_leads FOR INSERT
  WITH CHECK (true);

-- Profile owners can view leads for their blocks
CREATE POLICY "Users can view own leads"
  ON public.block_leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM link_profiles
    WHERE link_profiles.id = block_leads.profile_id
    AND link_profiles.user_id = auth.uid()
  ));

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.block_leads FOR SELECT
  USING (is_admin(auth.uid()));

-- Profile owners can delete leads
CREATE POLICY "Users can delete own leads"
  ON public.block_leads FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM link_profiles
    WHERE link_profiles.id = block_leads.profile_id
    AND link_profiles.user_id = auth.uid()
  ));

-- Index for efficient lookups
CREATE INDEX idx_block_leads_block_id ON public.block_leads(block_id);
CREATE INDEX idx_block_leads_visitor ON public.block_leads(block_id, visitor_id);
