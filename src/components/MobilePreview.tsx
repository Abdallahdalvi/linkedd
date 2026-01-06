import { motion } from 'framer-motion';
import { Block, LinkProfile } from '@/hooks/useLinkProfile';
import { ExternalLink, MapPin, Instagram, Youtube, Linkedin, Twitter, MessageCircle, Mail, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MobilePreviewProps {
  profile: LinkProfile | null;
  blocks: Block[];
  deviceType?: 'iphone' | 'android';
  darkMode?: boolean;
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

// Default theme for fallback
const defaultTheme = { bg: '#ffffff', text: '#1a1a1a', accent: '#6366f1', cardBg: '#f8fafc' };

const getThemeColors = (profile: LinkProfile | null) => {
  if (!profile?.custom_colors) return defaultTheme;
  const colors = profile.custom_colors as Record<string, string>;
  return {
    bg: colors.bg || defaultTheme.bg,
    text: colors.text || defaultTheme.text,
    accent: colors.accent || defaultTheme.accent,
    cardBg: colors.cardBg || defaultTheme.cardBg,
  };
};

export default function MobilePreview({ 
  profile, 
  blocks, 
  deviceType = 'iphone',
  darkMode = false 
}: MobilePreviewProps) {
  const enabledBlocks = blocks.filter(b => b.is_enabled);
  const theme = getThemeColors(profile);

  const getBackgroundStyle = () => {
    if (!profile) return { backgroundColor: defaultTheme.bg };
    
    switch (profile.background_type) {
      case 'gradient':
        return { background: profile.background_value };
      case 'image':
        return { 
          backgroundImage: `url(${profile.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: profile.background_value || theme.bg };
    }
  };

  return (
    <div className="mobile-preview-frame w-[280px] h-[580px]">
      {/* Notch */}
      <div className="mobile-preview-notch" />
      
      {/* Screen */}
      <div 
        className={`mobile-preview-screen h-full ${darkMode ? 'dark' : ''}`}
        style={getBackgroundStyle()}
      >
        <div className="h-full overflow-y-auto scrollbar-hide pt-8 pb-6 px-4">
          {profile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {/* Profile Header */}
              <Avatar className="w-20 h-20 border-4 shadow-lg" style={{ borderColor: theme.accent }}>
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback style={{ backgroundColor: theme.accent, color: theme.cardBg }} className="text-2xl font-bold">
                  {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-lg font-bold" style={{ color: theme.text }}>
                    {profile.display_name || `@${profile.username}`}
                  </h1>
                  {profile.is_public && (
                    <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: theme.accent, color: theme.cardBg }}>
                      ✓
                    </Badge>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-xs mt-1 line-clamp-2 opacity-70" style={{ color: theme.text }}>
                    {profile.bio}
                  </p>
                )}

                {profile.location && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs opacity-70" style={{ color: theme.text }}>
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Icons */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {Object.entries(profile.social_links).map(([platform, url]) => {
                    const Icon = socialIcons[platform.toLowerCase()] || Globe;
                    return url ? (
                      <a
                        key={platform}
                        href={url as string}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `${theme.text}15`, color: theme.text }}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ) : null;
                  })}
                </div>
              )}

              {/* Blocks */}
              <div className="w-full mt-4 space-y-2">
                {enabledBlocks.map((block, index) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full"
                  >
                    <BlockPreview block={block} theme={theme} />
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-[10px] opacity-40" style={{ color: theme.text }}>
                  Powered by LinkBio
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Create your profile
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Your link-in-bio will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
}

function BlockPreview({ block, theme }: { block: Block; theme: ThemeColors }) {
  const cardStyle = {
    backgroundColor: theme.cardBg,
    borderColor: `${theme.text}10`,
    color: theme.text,
  };

  switch (block.type) {
    case 'link':
    case 'cta':
      return (
        <div 
          className="w-full p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md flex items-center gap-3"
          style={cardStyle}
        >
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">
              {block.title || 'Untitled Link'}
            </h3>
            {block.subtitle && (
              <p className="text-xs truncate opacity-70">{block.subtitle}</p>
            )}
          </div>
          <ExternalLink className="w-4 h-4 opacity-50 flex-shrink-0" />
        </div>
      );

    case 'text':
      return (
        <div className="w-full p-3 rounded-xl border" style={cardStyle}>
          <p className="text-sm">{block.title}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="py-2">
          <div className="h-px" style={{ backgroundColor: `${theme.text}20` }} />
        </div>
      );

    case 'featured':
      return (
        <div 
          className="w-full p-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-md"
          style={{ backgroundColor: theme.accent, color: theme.cardBg }}
        >
          <h3 className="text-sm font-bold">{block.title || 'Featured'}</h3>
          {block.subtitle && (
            <p className="text-xs opacity-90 mt-1">{block.subtitle}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="w-full p-3 rounded-xl border" style={cardStyle}>
          <h3 className="text-sm font-medium">
            {block.title || 'Block'}
          </h3>
        </div>
      );
  }
}
