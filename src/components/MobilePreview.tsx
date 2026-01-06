import { motion } from 'framer-motion';
import { Block, LinkProfile } from '@/hooks/useLinkProfile';
import { 
  ExternalLink, 
  MapPin, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  Mail, 
  Globe,
  Phone,
  Play,
  Music,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRef } from 'react';

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

interface CarouselItem {
  id: string;
  image_url: string;
  title: string;
  url: string;
}

function BlockPreview({ block, theme }: { block: Block; theme: ThemeColors }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const cardStyle = {
    backgroundColor: theme.cardBg,
    borderColor: `${theme.text}10`,
    color: theme.text,
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -120 : 120;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  switch (block.type) {
    case 'link':
    case 'cta':
      return (
        <div 
          className="w-full p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md flex items-center gap-3 cursor-pointer"
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
      const textContent = block.content as { text_size?: string; text_align?: string } | undefined;
      const textAlign = (textContent?.text_align || 'center') as 'left' | 'center' | 'right';
      const textSize = textContent?.text_size || 'normal';
      return (
        <div 
          className="w-full p-3 rounded-xl"
          style={{ ...cardStyle, textAlign }}
        >
          {block.title && (
            <h3 className={`font-semibold ${
              textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
            }`}>
              {block.title}
            </h3>
          )}
          <p className={`opacity-80 ${
            textSize === 'small' ? 'text-[10px]' : textSize === 'large' ? 'text-sm' : 'text-xs'
          }`}>
            {block.subtitle}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: `${theme.text}10` }}>
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt={block.title || ''} 
              className="w-full object-cover"
            />
          )}
          {(block.title || block.subtitle) && (
            <div className="p-2" style={cardStyle}>
              {block.title && <p className="text-xs font-medium">{block.title}</p>}
              {block.subtitle && <p className="text-[10px] opacity-70">{block.subtitle}</p>}
            </div>
          )}
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
          className="w-full rounded-xl transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden cursor-pointer"
          style={{ backgroundColor: theme.accent, color: theme.cardBg }}
        >
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-full h-20 object-cover"
            />
          )}
          <div className="p-3">
            <h3 className="text-sm font-bold">{block.title || 'Featured'}</h3>
            {block.subtitle && (
              <p className="text-xs opacity-90 mt-0.5">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'video':
      return (
        <div 
          className="w-full rounded-xl border overflow-hidden cursor-pointer"
          style={cardStyle}
        >
          <div className="relative aspect-video bg-black/10">
            {block.thumbnail_url ? (
              <>
                <img 
                  src={block.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
          <div className="p-2">
            <h3 className="text-xs font-medium truncate">{block.title || 'Video'}</h3>
            {block.subtitle && (
              <p className="text-[10px] opacity-70 truncate">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'music':
      return (
        <div 
          className="w-full p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
          style={cardStyle}
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            {block.thumbnail_url ? (
              <img src={block.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-6 h-6" style={{ color: theme.accent }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{block.title || 'Track'}</h3>
            {block.subtitle && (
              <p className="text-xs truncate opacity-70">{block.subtitle}</p>
            )}
          </div>
          <Play className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
        </div>
      );

    case 'contact_call':
    case 'contact_whatsapp':
    case 'contact_email':
      const contactIcons = {
        contact_call: Phone,
        contact_whatsapp: MessageCircle,
        contact_email: Mail,
      };
      const ContactIcon = contactIcons[block.type];
      const contactColors = {
        contact_call: '#22c55e',
        contact_whatsapp: '#25D366',
        contact_email: theme.accent,
      };
      return (
        <div 
          className="w-full p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02]"
          style={{ backgroundColor: contactColors[block.type], color: '#ffffff' }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ContactIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{block.title}</h3>
            {block.subtitle && (
              <p className="text-xs truncate opacity-90">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'carousel':
      const carouselContent = block.content as { items?: CarouselItem[] } | undefined;
      const items = carouselContent?.items || [];
      return (
        <div className="w-full space-y-2">
          {(block.title || block.subtitle) && (
            <div className="text-center">
              {block.title && <h3 className="text-sm font-medium" style={{ color: theme.text }}>{block.title}</h3>}
              {block.subtitle && <p className="text-xs opacity-70" style={{ color: theme.text }}>{block.subtitle}</p>}
            </div>
          )}
          <div className="relative group">
            <div 
              ref={carouselRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.length > 0 ? items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="flex-shrink-0 w-24 snap-center rounded-lg overflow-hidden border cursor-pointer transition-transform hover:scale-105"
                  style={{ borderColor: `${theme.text}10` }}
                >
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-16 object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-16 flex items-center justify-center"
                      style={{ backgroundColor: `${theme.accent}10` }}
                    >
                      <Globe className="w-6 h-6 opacity-50" />
                    </div>
                  )}
                  {item.title && (
                    <div className="p-1.5" style={cardStyle}>
                      <p className="text-[10px] font-medium truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              )) : (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="flex-shrink-0 w-24 snap-center rounded-lg overflow-hidden border"
                    style={{ borderColor: `${theme.text}10`, backgroundColor: `${theme.accent}10` }}
                  >
                    <div className="w-full h-16 flex items-center justify-center">
                      <Globe className="w-6 h-6 opacity-30" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {items.length > 2 && (
              <>
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      );

    case 'scheduled':
      return (
        <div 
          className="w-full p-3 rounded-xl border transition-all hover:scale-[1.02] flex items-center gap-3 cursor-pointer"
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
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: theme.accent }} />
              <h3 className="text-sm font-medium truncate">{block.title}</h3>
            </div>
            {block.subtitle && (
              <p className="text-xs truncate opacity-70">{block.subtitle}</p>
            )}
          </div>
          <ExternalLink className="w-4 h-4 opacity-50 flex-shrink-0" />
        </div>
      );

    case 'html':
      return (
        <div className="w-full p-3 rounded-xl border" style={cardStyle}>
          <div className="text-center">
            <p className="text-xs opacity-50">[Custom Embed]</p>
            <p className="text-[10px] opacity-40">{block.title}</p>
          </div>
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
