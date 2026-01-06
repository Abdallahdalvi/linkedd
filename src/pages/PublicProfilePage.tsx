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
      <div className="min-h-screen">
        <div className="max-w-md mx-auto px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* Avatar with Glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-xl opacity-40 scale-110" />
              <Avatar className="w-28 h-28 border-4 border-white/50 shadow-2xl relative z-10">
                <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-3xl font-bold">
                  {profile?.display_name?.charAt(0) || profile?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name with Verified Badge */}
            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {profile?.display_name || `@${profile?.username}`}
                </h1>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {profile?.bio && (
                <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {profile?.location && (
                <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-muted-foreground/70">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Social Icons Row */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {Object.entries(profile.social_links).map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()] || Globe;
                  return url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-full bg-foreground/10 backdrop-blur-xl flex items-center justify-center hover:bg-foreground/20 hover:scale-110 transition-all duration-200"
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
            <div className="mt-16 text-center">
              <a 
                href="/"
                className="text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors font-medium tracking-wide uppercase text-xs"
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
  const pillClasses = "w-full py-4 px-5 rounded-full bg-card/90 backdrop-blur-xl border border-border/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg";

  switch (block.type) {
    case 'link':
    case 'cta':
      return (
        <button onClick={onClick} className={`${pillClasses} flex items-center gap-4`}>
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0 text-center">
            <h3 className="font-semibold text-foreground truncate">
              {block.title || 'Untitled Link'}
            </h3>
            {block.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{block.subtitle}</p>
            )}
          </div>
          {block.thumbnail_url && <div className="w-11 flex-shrink-0" />}
        </button>
      );

    case 'shop':
      const content = (block as any).content as { 
        price?: string; 
        currency?: string; 
        original_price?: string; 
        badge?: string;
        display_style?: string;
      } | undefined;
      const currencySymbols: Record<string, string> = {
        USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$',
      };
      const symbol = currencySymbols[content?.currency || 'USD'] || '$';
      const displayStyle = content?.display_style || 'card';

      // Square style
      if (displayStyle === 'square') {
        return (
          <button onClick={onClick} className="w-full rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg overflow-hidden">
            <div className="relative aspect-square">
              {block.thumbnail_url ? (
                <img 
                  src={block.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-6xl">🛍️</span>
                </div>
              )}
              {content?.badge && (
                <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-bold">
                  {content.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground text-lg">{block.title || 'Product'}</h3>
              {block.subtitle && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{block.subtitle}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-primary">
                    {symbol}{content?.price || '0.00'}
                  </span>
                  {content?.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {symbol}{content.original_price}
                    </span>
                  )}
                </div>
                <div className="px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
                  Buy Now
                </div>
              </div>
            </div>
          </button>
        );
      }

      // Minimal style
      if (displayStyle === 'minimal') {
        return (
          <button onClick={onClick} className={`${pillClasses} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🛍️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{block.title || 'Product'}</h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-bold text-primary">
                {symbol}{content?.price || '0.00'}
              </span>
              {content?.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  {content.badge}
                </span>
              )}
            </div>
          </button>
        );
      }

      // Default: Card style
      return (
        <button onClick={onClick} className="w-full rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            {block.thumbnail_url ? (
              <img 
                src={block.thumbnail_url} 
                alt="" 
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🛍️</span>
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{block.title || 'Product'}</h3>
                {content?.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                    {content.badge}
                  </span>
                )}
              </div>
              {block.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{block.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-primary">
                  {symbol}{content?.price || '0.00'}
                </span>
                {content?.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {symbol}{content.original_price}
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
              Buy Now
            </div>
          </div>
        </button>
      );

    case 'text':
      return (
        <div className="w-full py-4 px-5 rounded-2xl bg-card/90 backdrop-blur-xl">
          <p className="text-foreground text-center">{block.title}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="py-4">
          <div className="h-px bg-border/30 mx-8" />
        </div>
      );

    case 'featured':
      return (
        <button onClick={onClick} className="w-full rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl">
          <div className="gradient-primary p-6">
            <h3 className="font-bold text-lg text-primary-foreground">{block.title || 'Featured'}</h3>
            {block.subtitle && (
              <p className="text-primary-foreground/90 mt-1">{block.subtitle}</p>
            )}
          </div>
        </button>
      );

    default:
      return (
        <button onClick={onClick} className={pillClasses}>
          <h3 className="font-semibold text-foreground text-center w-full">
            {block.title || 'Block'}
          </h3>
        </button>
      );
  }
}
