import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface LinkProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  theme_preset: string;
  custom_colors: Record<string, string>;
  custom_fonts: Record<string, string>;
  background_type: string;
  background_value: string;
  social_links: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  is_public: boolean;
  is_password_protected: boolean;
  total_views: number;
  meta_pixel_id: string | null;
  google_ads_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  profile_id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  url: string | null;
  thumbnail_url: string | null;
  icon: string | null;
  content: Record<string, unknown>;
  button_style: Record<string, unknown>;
  is_enabled: boolean;
  is_featured: boolean;
  open_in_new_tab: boolean;
  mobile_only: boolean;
  desktop_only: boolean;
  schedule_start: string | null;
  schedule_end: string | null;
  position: number;
  total_clicks: number;
  created_at: string;
  updated_at: string;
}

export function useLinkProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LinkProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setBlocks([]);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('link_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile({
          ...profileData,
          custom_colors: (profileData.custom_colors as Record<string, string>) || {},
          custom_fonts: (profileData.custom_fonts as Record<string, string>) || {},
          social_links: (profileData.social_links as Record<string, string>) || {},
        });

        const { data: blocksData } = await supabase
          .from('blocks')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true });

        if (blocksData) {
          setBlocks(blocksData.map(block => ({
            ...block,
            content: (block.content as Record<string, unknown>) || {},
            button_style: (block.button_style as Record<string, unknown>) || {},
          })));
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const createProfile = async (username: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('link_profiles')
      .insert({
        user_id: user.id,
        username,
        display_name: user.user_metadata?.full_name || username,
      })
      .select()
      .single();

    if (!error && data) {
      setProfile({
        ...data,
        custom_colors: (data.custom_colors as Record<string, string>) || {},
        custom_fonts: (data.custom_fonts as Record<string, string>) || {},
        social_links: (data.social_links as Record<string, string>) || {},
      });
      return data;
    }

    return null;
  };

  const updateProfile = async (updates: Partial<LinkProfile>) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('link_profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (!error && data) {
      setProfile({
        ...data,
        custom_colors: (data.custom_colors as Record<string, string>) || {},
        custom_fonts: (data.custom_fonts as Record<string, string>) || {},
        social_links: (data.social_links as Record<string, string>) || {},
      });
    }
  };

  const addBlock = async (block: Partial<Block>) => {
    if (!profile) return null;

    const insertData: {
      profile_id: string;
      type: string;
      title: string | null;
      subtitle: string | null;
      url: string | null;
      thumbnail_url: string | null;
      icon: string | null;
      content: Json;
      button_style: Json;
      is_enabled: boolean;
      is_featured: boolean;
      open_in_new_tab: boolean;
      mobile_only: boolean;
      desktop_only: boolean;
      schedule_start: string | null;
      schedule_end: string | null;
      position: number;
    } = {
      profile_id: profile.id,
      type: block.type || 'link',
      title: block.title || null,
      subtitle: block.subtitle || null,
      url: block.url || null,
      thumbnail_url: block.thumbnail_url || null,
      icon: block.icon || null,
      content: (block.content || {}) as Json,
      button_style: (block.button_style || {}) as Json,
      is_enabled: block.is_enabled ?? true,
      is_featured: block.is_featured ?? false,
      open_in_new_tab: block.open_in_new_tab ?? true,
      mobile_only: block.mobile_only ?? false,
      desktop_only: block.desktop_only ?? false,
      schedule_start: block.schedule_start || null,
      schedule_end: block.schedule_end || null,
      position: blocks.length,
    };

    const { data, error } = await supabase
      .from('blocks')
      .insert(insertData)
      .select()
      .single();

    if (!error && data) {
      const newBlock = {
        ...data,
        content: (data.content as Record<string, unknown>) || {},
        button_style: (data.button_style as Record<string, unknown>) || {},
      };
      setBlocks([...blocks, newBlock]);
      return newBlock;
    }

    return null;
  };

  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    // Prepare the update data, including content and button_style
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.thumbnail_url !== undefined) updateData.thumbnail_url = updates.thumbnail_url;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.is_enabled !== undefined) updateData.is_enabled = updates.is_enabled;
    if (updates.is_featured !== undefined) updateData.is_featured = updates.is_featured;
    if (updates.open_in_new_tab !== undefined) updateData.open_in_new_tab = updates.open_in_new_tab;
    if (updates.mobile_only !== undefined) updateData.mobile_only = updates.mobile_only;
    if (updates.desktop_only !== undefined) updateData.desktop_only = updates.desktop_only;
    if (updates.schedule_start !== undefined) updateData.schedule_start = updates.schedule_start;
    if (updates.schedule_end !== undefined) updateData.schedule_end = updates.schedule_end;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.button_style !== undefined) updateData.button_style = updates.button_style;
    
    const { data, error } = await supabase
      .from('blocks')
      .update(updateData)
      .eq('id', blockId)
      .select()
      .single();

    if (!error && data) {
      setBlocks(blocks.map(b => b.id === blockId ? {
        ...data,
        content: (data.content as Record<string, unknown>) || {},
        button_style: (data.button_style as Record<string, unknown>) || {},
      } : b));
    }
  };

  const deleteBlock = async (blockId: string) => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (!error) {
      setBlocks(blocks.filter(b => b.id !== blockId));
    }
  };

  const reorderBlocks = async (newOrder: Block[]) => {
    setBlocks(newOrder);

    const updates = newOrder.map((block, index) => ({
      id: block.id,
      position: index,
    }));

    for (const update of updates) {
      await supabase
        .from('blocks')
        .update({ position: update.position })
        .eq('id', update.id);
    }
  };

  return {
    profile,
    blocks,
    loading,
    createProfile,
    updateProfile,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
}
