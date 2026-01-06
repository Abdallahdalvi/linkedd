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
const defaultTheme = { 
  bg: '#ffffff', 
  text: '#1a1a1a', 
  accent: '#1a1a1a', 
  cardBg: 'rgba(255,255,255,0.95)', 
  gradient: false,
  buttonRadius: 16,
  buttonStyle: 'filled',
};

const getThemeColors = (profile: LinkProfile | null) => {
  if (!profile?.custom_colors) return defaultTheme;
  const colors = profile.custom_colors as Record<string, string | boolean | number>;
  return {
    bg: (colors.bg as string) || defaultTheme.bg,
    text: (colors.text as string) || defaultTheme.text,
    accent: (colors.accent as string) || defaultTheme.accent,
    cardBg: (colors.cardBg as string) || defaultTheme.cardBg,
    gradient: Boolean(colors.gradient),
    buttonRadius: (colors.buttonRadius as number) || defaultTheme.buttonRadius,
    buttonStyle: (colors.buttonStyle as string) || defaultTheme.buttonStyle,
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
  buttonRadius?: number;
  buttonStyle?: string;
}

interface CarouselItem {
  id: string;
  image_url: string;
  title: string;
  url: string;
}

function BlockPreview({ block, theme }: { block: Block; theme: ThemeColors }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const buttonRadius = theme.buttonRadius || 16;
  const buttonStyle = theme.buttonStyle || 'filled';

  // Get button style based on selected style
  const getButtonStyle = () => {
    const baseStyle = {
      color: theme.text,
      borderRadius: `${buttonRadius}px`,
    };

    switch (buttonStyle) {
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: `2px solid ${theme.text}`,
          boxShadow: 'none',
        };
      case 'soft-shadow':
        return {
          ...baseStyle,
          backgroundColor: theme.cardBg,
          border: 'none',
          boxShadow: '0 8px 30px -6px rgba(0,0,0,0.15), 0 4px 10px -4px rgba(0,0,0,0.1)',
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
        };
      case 'filled':
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.cardBg,
          backdropFilter: 'blur(12px)',
          boxShadow: theme.gradient 
            ? '0 4px 20px -4px rgba(0,0,0,0.15)' 
            : '0 2px 8px -2px rgba(0,0,0,0.08)',
        };
    }
  };

  const pillStyle = getButtonStyle();

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
          className="w-[110%] -ml-[5%] py-2 px-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer group"
          style={pillStyle}
        >
          {block.thumbnail_url ? (
            <img 
              src={block.thumbnail_url} 
              alt="" 
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : block.icon ? (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <span className="text-base">{block.icon}</span>
            </div>
          ) : null}
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-xs font-semibold leading-tight line-clamp-2">
              {block.title || 'Untitled Link'}
            </h3>
            {block.subtitle && (
              <p className="text-[10px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          {block.thumbnail_url || block.icon ? (
            <div className="w-7 h-7 flex-shrink-0" /> 
          ) : null}
        </div>
      );

    case 'text':
      const textContent = block.content as { text_size?: string; text_align?: string } | undefined;
      const textAlign = (textContent?.text_align || 'center') as 'left' | 'center' | 'right';
      const textSize = textContent?.text_size || 'normal';
      return (
        <div 
          className="w-full py-3 px-4"
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
          className="w-full overflow-hidden shadow-lg"
          style={{ backgroundColor: theme.cardBg, borderRadius: `${buttonRadius}px` }}
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
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, 
            color: '#ffffff',
            borderRadius: `${buttonRadius}px`,
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
          className="w-full overflow-hidden cursor-pointer shadow-lg"
          style={{ backgroundColor: theme.cardBg, borderRadius: `${buttonRadius}px` }}
        >
          <div className="relative aspect-video bg-black/10">
            {block.thumbnail_url ? (
              <>
                <img 
                  src={block.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                    style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                  >
                    <Play className="w-4 h-4 text-white/90 ml-0.5" fill="rgba(255,255,255,0.9)" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                >
                  <Play className="w-4 h-4 text-white/70 ml-0.5" />
                </div>
              </div>
            )}
          </div>
          <div className="p-3" style={{ color: theme.text }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide truncate">{block.title || 'Video'}</h3>
            {block.subtitle && (
              <p className="text-[11px] opacity-60 truncate">{block.subtitle}</p>
            )}
          </div>
        </div>
      );

    case 'music':
      return (
        <div 
          className="w-[110%] -ml-[5%] py-2 px-3 flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={pillStyle}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${theme.accent}40, ${theme.accent}20)` }}
          >
            {block.thumbnail_url ? (
              <img src={block.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-4 h-4" style={{ color: theme.accent }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold leading-tight line-clamp-2">{block.title || 'Track'}</h3>
            {block.subtitle && (
              <p className="text-[10px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.accent }}
          >
            <Play className="w-3 h-3 text-white ml-0.5" />
          </div>
        </div>
      );

    case 'contact_call':
    case 'contact_whatsapp':
    case 'contact_email':
      const contactIcons = {
        contact_call: Phone,
        contact_email: Mail,
      };
      const ContactIcon = block.type !== 'contact_whatsapp' ? contactIcons[block.type as 'contact_call' | 'contact_email'] : null;
      // Use same style as regular buttons - no special colors
      return (
        <div 
          className="w-[110%] -ml-[5%] py-2 px-3 flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={pillStyle}
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            {block.type === 'contact_whatsapp' ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill={theme.text}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            ) : (
              ContactIcon && <ContactIcon className="w-4 h-4" style={{ color: theme.text }} />
            )}
          </div>
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-xs font-semibold leading-tight line-clamp-2">{block.title}</h3>
            {block.subtitle && (
              <p className="text-[10px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          <div className="w-7 flex-shrink-0" />
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
                  className="flex-shrink-0 w-28 snap-center overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ backgroundColor: theme.cardBg, borderRadius: `${Math.min(buttonRadius, 16)}px` }}
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
          className="w-[110%] -ml-[5%] py-2 px-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          style={pillStyle}
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.accent}30, ${theme.accent}15)` }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          </div>
          <div className="flex-1 min-w-0 text-center">
            <h3 className="text-xs font-semibold leading-tight line-clamp-2">{block.title}</h3>
            {block.subtitle && (
              <p className="text-[10px] truncate opacity-60">{block.subtitle}</p>
            )}
          </div>
          <div className="w-7 flex-shrink-0" />
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
          className="w-[110%] -ml-[5%] py-2 px-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <h3 className="text-xs font-semibold text-center leading-tight line-clamp-2">
            {block.title || 'Block'}
          </h3>
        </div>
      );
  }
}
