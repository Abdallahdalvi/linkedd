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
  Clock,
  Facebook,
  Music2,
  Ghost,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  tiktok: Music2,
  facebook: Facebook,
  snapchat: Ghost,
  pinterest: MapPin,
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  website: Globe,
};

const socialColors: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  x: '#000000',
  tiktok: '#000000',
  facebook: '#1877F2',
  snapchat: '#FFFC00',
  pinterest: '#E60023',
  whatsapp: '#25D366',
  email: '#EA4335',
  phone: '#25D366',
  website: '#6366F1',
};

// Default theme for fallback
const defaultTheme = { bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a1a', cardBg: 'rgba(255,255,255,0.95)', gradient: false };

const getThemeColors = (profile: LinkProfile | null) => {
  if (!profile?.custom_colors) return defaultTheme;
  const colors = profile.custom_colors as Record<string, string | boolean>;
  return {
    bg: (colors.bg as string) || defaultTheme.bg,
    text: (colors.text as string) || defaultTheme.text,
    accent: (colors.accent as string) || defaultTheme.accent,
    cardBg: (colors.cardBg as string) || defaultTheme.cardBg,
    gradient: Boolean(colors.gradient),
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
        <div className="h-full overflow-y-auto scrollbar-hide pt-10 pb-6 px-5">
          {profile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {/* Profile Avatar with Ring */}
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full blur-lg opacity-50"
                  style={{ background: theme.accent }}
                />
                <Avatar 
                  className="w-24 h-24 border-4 shadow-2xl relative z-10" 
                  style={{ 
                    borderColor: theme.gradient ? 'rgba(255,255,255,0.5)' : theme.accent,
                    boxShadow: `0 8px 32px -8px ${theme.accent}40`
                  }}
                >
                  <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                  <AvatarFallback 
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, 
                      color: '#ffffff' 
                    }} 
                    className="text-2xl font-bold"
                  >
                    {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <h1 
                    className="text-lg font-bold tracking-tight" 
                    style={{ color: theme.text }}
                  >
                    {profile.display_name || `@${profile.username}`}
                  </h1>
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ 
                      background: theme.gradient ? 'rgba(255,255,255,0.2)' : theme.accent,
                      color: theme.gradient ? theme.text : '#ffffff'
                    }}
                  >
                    ✓
                  </div>
                </div>
                
                {profile.bio && (
                  <p 
                    className="text-xs mt-2 leading-relaxed opacity-80 max-w-[200px]" 
                    style={{ color: theme.text }}
                  >
                    {profile.bio}
                  </p>
                )}

                {profile.location && (
                  <div 
                    className="flex items-center justify-center gap-1 mt-2 text-[11px] opacity-60" 
                    style={{ color: theme.text }}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Icons Row */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
                  {Object.entries(profile.social_links).map(([platform, url]) => {
                    const Icon = socialIcons[platform.toLowerCase()] || Globe;
                    const brandColor = socialColors[platform.toLowerCase()] || theme.accent;
                    return url ? (
                      <a
                        key={platform}
                        href={url as string}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                        style={{ 
                          backgroundColor: brandColor,
                          color: platform.toLowerCase() === 'snapchat' ? '#000000' : '#ffffff',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ) : null;
                  })}
                </div>
              )}

              {/* Blocks */}
              <div className="w-full mt-5 space-y-2.5">
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
              <div className="mt-8 text-center">
                <p 
                  className="text-[10px] font-medium opacity-40 tracking-wide uppercase" 
                  style={{ color: theme.text }}
                >
                  Powered by LinkBio
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Globe className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                Create your profile
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
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
  gradient?: boolean;
}

interface CarouselItem {
  id: string;
  image_url: string;
  title: string;
  url: string;
}

function BlockPreview({ block, theme }: { block: Block; theme: ThemeColors }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Pill-shaped button style like Linktree
  const pillStyle = {
    backgroundColor: theme.cardBg,
    backdropFilter: 'blur(12px)',
    color: theme.text,
    boxShadow: theme.gradient 
      ? '0 4px 20px -4px rgba(0,0,0,0.15)' 
      : '0 2px 8px -2px rgba(0,0,0,0.08)',
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
          className="w-full py-3.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 cursor-pointer group"
          style={pillStyle}
        >
          {block.thumbnail_url ? (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : block.icon ? (
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <span className="text-lg">{block.icon}</span>
            </div>
          ) : null}
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-sm font-semibold truncate">
              {block.title || 'Untitled Link'}
            </h3>
            {block.subtitle && (
              <p className="text-[11px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          {block.thumbnail_url || block.icon ? (
            <div className="w-9 h-9 flex-shrink-0" /> 
          ) : null}
        </div>
      );

    case 'text':
      const textContent = block.content as { text_size?: string; text_align?: string } | undefined;
      const textAlign = (textContent?.text_align || 'center') as 'left' | 'center' | 'right';
      const textSize = textContent?.text_size || 'normal';
      return (
        <div 
          className="w-full py-3 px-4 rounded-2xl"
          style={{ ...pillStyle, textAlign }}
        >
          {block.title && (
            <h3 className={`font-semibold ${
              textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
            }`}>
              {block.title}
            </h3>
          )}
          <p className={`opacity-70 ${
            textSize === 'small' ? 'text-[10px]' : textSize === 'large' ? 'text-sm' : 'text-xs'
          }`}>
            {block.subtitle}
          </p>
        </div>
      );

    case 'image':
      return (
        <div 
          className="w-full rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: theme.cardBg }}
        >
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt={block.title || ''} 
              className="w-full object-cover"
            />
          )}
          {(block.title || block.subtitle) && (
            <div className="p-3" style={{ color: theme.text }}>
              {block.title && <p className="text-xs font-semibold">{block.title}</p>}
              {block.subtitle && <p className="text-[11px] opacity-60">{block.subtitle}</p>}
            </div>
          )}
        </div>
      );

    case 'divider':
      return (
        <div className="py-3">
          <div 
            className="h-px mx-8" 
            style={{ backgroundColor: `${theme.text}15` }} 
          />
        </div>
      );

    case 'featured':
      return (
        <div 
          className="w-full rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, 
            color: '#ffffff' 
          }}
        >
          {block.thumbnail_url && (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-full h-24 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-sm font-bold">{block.title || 'Featured'}</h3>
            {block.subtitle && (
              <p className="text-xs opacity-90 mt-1">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'video':
      return (
        <div 
          className="w-full rounded-2xl overflow-hidden cursor-pointer shadow-lg"
          style={{ backgroundColor: theme.cardBg }}
        >
          <div className="relative aspect-video bg-black/10">
            {block.thumbnail_url ? (
              <>
                <img 
                  src={block.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                  >
                    <Play className="w-6 h-6 text-black ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-10 h-10 opacity-40" />
              </div>
            )}
          </div>
          <div className="p-3" style={{ color: theme.text }}>
            <h3 className="text-xs font-semibold truncate">{block.title || 'Video'}</h3>
            {block.subtitle && (
              <p className="text-[11px] opacity-60 truncate">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'music':
      return (
        <div 
          className="w-full py-3 px-4 rounded-full flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={pillStyle}
        >
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${theme.accent}40, ${theme.accent}20)` }}
          >
            {block.thumbnail_url ? (
              <img src={block.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-5 h-5" style={{ color: theme.accent }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{block.title || 'Track'}</h3>
            {block.subtitle && (
              <p className="text-[11px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.accent }}
          >
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
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
        contact_call: 'linear-gradient(135deg, #22c55e, #16a34a)',
        contact_whatsapp: 'linear-gradient(135deg, #25D366, #128C7E)',
        contact_email: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
      };
      return (
        <div 
          className="w-full py-3 px-4 rounded-full flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ background: contactColors[block.type], color: '#ffffff' }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <ContactIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-sm font-semibold truncate">{block.title}</h3>
            {block.subtitle && (
              <p className="text-[11px] truncate opacity-90">{block.subtitle}</p>
            )}
          </div>
          <div className="w-10 flex-shrink-0" />
        </div>
      );

    case 'carousel':
      const carouselContent = block.content as { items?: CarouselItem[] } | undefined;
      const items = carouselContent?.items || [];
      return (
        <div className="w-full space-y-2">
          {(block.title || block.subtitle) && (
            <div className="text-center px-2">
              {block.title && <h3 className="text-sm font-semibold" style={{ color: theme.text }}>{block.title}</h3>}
              {block.subtitle && <p className="text-xs opacity-60" style={{ color: theme.text }}>{block.subtitle}</p>}
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
                  className="flex-shrink-0 w-28 snap-center rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ backgroundColor: theme.cardBg }}
                >
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-20 object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-20 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10)` }}
                    >
                      <Globe className="w-6 h-6 opacity-40" />
                    </div>
                  )}
                  {item.title && (
                    <div className="p-2" style={{ color: theme.text }}>
                      <p className="text-[10px] font-medium truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              )) : (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="flex-shrink-0 w-28 snap-center rounded-xl overflow-hidden shadow-md"
                    style={{ backgroundColor: theme.cardBg }}
                  >
                    <div 
                      className="w-full h-20 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}05)` }}
                    >
                      <Globe className="w-6 h-6 opacity-20" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {items.length > 2 && (
              <>
                <button 
                  onClick={() => scrollCarousel('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollCarousel('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="w-full py-3 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 cursor-pointer"
          style={pillStyle}
        >
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)` }}
          >
            <Clock className="w-4 h-4" style={{ color: theme.accent }} />
          </div>
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-sm font-semibold truncate">{block.title}</h3>
            {block.subtitle && (
              <p className="text-[11px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          <div className="w-9 flex-shrink-0" />
        </div>
      );

    case 'html':
      return (
        <div 
          className="w-full py-4 px-4 rounded-2xl" 
          style={pillStyle}
        >
          <div className="text-center">
            <p className="text-xs opacity-50">[Custom Embed]</p>
            <p className="text-[10px] opacity-40">{block.title}</p>
          </div>
        </div>
      );

    default:
      return (
        <div 
          className="w-full py-3.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <h3 className="text-sm font-semibold text-center">
            {block.title || 'Block'}
          </h3>
        </div>
      );
  }
}
