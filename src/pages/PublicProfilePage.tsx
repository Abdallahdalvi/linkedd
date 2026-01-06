import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  Mail,
  Globe,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  background_type: string;
  background_value: string;
  social_links: Record<string, string>;
  is_public: boolean;
}

interface Block {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  url: string | null;
  thumbnail_url: string | null;
  is_enabled: boolean;
  is_featured: boolean;
  open_in_new_tab: boolean;
  position: number;
}

const socialIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  whatsapp: MessageCircle,
  email: Mail,
  website: Globe,
};

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('link_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle();

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile({
        ...profileData,
        social_links: (profileData.social_links as Record<string, string>) || {},
      });

      // Track view
      await supabase.from('analytics_events').insert({
        profile_id: profileData.id,
        event_type: 'view',
        device_type: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        referrer: document.referrer || null,
      });

      // Fetch blocks
      const { data: blocksData } = await supabase
        .from('blocks')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_enabled', true)
        .order('position', { ascending: true });

      if (blocksData) {
        setBlocks(blocksData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  const handleBlockClick = async (block: Block) => {
    if (!block.url) return;

    // Track click
    await supabase.from('analytics_events').insert({
      profile_id: profile?.id,
      block_id: block.id,
      event_type: 'click',
      device_type: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });

    // Open link
    if (block.open_in_new_tab) {
      window.open(block.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = block.url;
    }
  };

  const getBackgroundStyle = () => {
    if (!profile) return {};
    
    switch (profile.background_type) {
      case 'gradient':
        return { background: profile.background_value };
      case 'image':
        return { 
          backgroundImage: `url(${profile.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        };
      default:
        return { backgroundColor: profile.background_value || '#f8fafc' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4 py-12 space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="w-32 h-6 mt-4" />
            <Skeleton className="w-48 h-4 mt-2" />
          </div>
          <div className="space-y-3 mt-8">
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-6xl font-display font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">This profile doesn't exist</p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium"
          >
            Create your own
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={getBackgroundStyle()}
    >
      <div className="min-h-screen backdrop-blur-sm bg-background/30">
        <div className="max-w-md mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* Avatar */}
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {profile?.display_name?.charAt(0) || profile?.username.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {profile?.display_name || `@${profile?.username}`}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              
              {profile?.bio && (
                <p className="text-muted-foreground mt-2 max-w-sm">
                  {profile.bio}
                </p>
              )}

              {profile?.location && (
                <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Social Icons */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex items-center gap-4 mt-4">
                {Object.entries(profile.social_links).map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()] || Globe;
                  return url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-foreground/10 backdrop-blur flex items-center justify-center hover:bg-foreground/20 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-foreground" />
                    </a>
                  ) : null;
                })}
              </div>
            )}

            {/* Blocks */}
            <div className="w-full mt-8 space-y-3">
              {blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BlockRenderer block={block} onClick={() => handleBlockClick(block)} />
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <a 
                href="/"
                className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Powered by LinkBio
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block, onClick }: { block: Block; onClick: () => void }) {
  const baseClasses = "w-full p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]";

  switch (block.type) {
    case 'link':
    case 'cta':
      return (
        <button onClick={onClick} className={`${baseClasses} flex items-center gap-4 text-left`}>
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-12 h-12 rounded-xl object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {block.title || 'Untitled Link'}
            </h3>
            {block.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{block.subtitle}</p>
            )}
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>
      );

    case 'text':
      return (
        <div className={`${baseClasses} cursor-default hover:scale-100`}>
          <p className="text-foreground">{block.title}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="py-2">
          <div className="h-px bg-border/50" />
        </div>
      );

    case 'featured':
      return (
        <button onClick={onClick} className={`${baseClasses} gradient-primary text-primary-foreground p-6`}>
          <h3 className="font-bold text-lg">{block.title || 'Featured'}</h3>
          {block.subtitle && (
            <p className="opacity-90 mt-1">{block.subtitle}</p>
          )}
        </button>
      );

    default:
      return (
        <button onClick={onClick} className={baseClasses}>
          <h3 className="font-semibold text-foreground">
            {block.title || 'Block'}
          </h3>
        </button>
      );
  }
}
