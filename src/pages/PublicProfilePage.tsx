import { useEffect, useState, useCallback, useRef } from 'react';
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
  Lock,
  ShieldCheck,
  Play,
  Music,
  Phone,
  Facebook,
  Music2,
  Ghost,
  ShoppingBag,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  FileCode,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { isMainDomain } from '@/config/domain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import DownloadAdModal from '@/components/DownloadAdModal';
import DataCollectionGate from '@/components/blocks/DataCollectionGate';
import { useTrackingPixels } from '@/hooks/useTrackingPixels';

// Generate or retrieve a persistent visitor ID
const getVisitorId = (): string => {
  const storageKey = 'linksdc_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  return visitorId;
};

// Detect browser name
const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
};

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
  custom_colors: Record<string, string | boolean | number> | null;
  is_public: boolean;
  is_password_protected: boolean;
  meta_pixel_id?: string | null;
  google_ads_id?: string | null;
}

interface Block {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  url: string | null;
  thumbnail_url: string | null;
  content: Record<string, any> | null;
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

// Default theme
const defaultTheme = { 
  bg: '#ffffff', 
  text: '#1a1a1a', 
  accent: '#1a1a1a', 
  cardBg: 'rgba(255,255,255,0.95)', 
  gradient: false,
  buttonRadius: 16,
  buttonStyle: 'filled',
};

interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  cardBg: string;
  gradient: boolean;
  buttonRadius: number;
  buttonStyle: string;
}

const getThemeColors = (profile: Profile | null): ThemeColors => {
  if (!profile?.custom_colors) return defaultTheme;
  const colors = profile.custom_colors;
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

interface PublicProfilePageProps {
  forcedUsername?: string;
}

export default function PublicProfilePage({ forcedUsername }: PublicProfilePageProps = {}) {
  const { username: paramUsername } = useParams<{ username: string }>();
  const username = forcedUsername || paramUsername;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Password protection state
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const { trackClick, trackLead } = useTrackingPixels({
    metaPixelId: profile?.meta_pixel_id,
    googleAdsId: profile?.google_ads_id,
  });

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      // First check if profile exists and if it's password protected
      const { data: profileData, error: profileError } = await supabase
        .from('link_profiles')
        .select('id, username, display_name, bio, avatar_url, cover_url, location, background_type, background_value, social_links, custom_colors, is_public, is_password_protected, total_views, meta_pixel_id, google_ads_id')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle();

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const parsedProfile: Profile = {
        ...profileData,
        social_links: (profileData.social_links as Record<string, string>) || {},
        custom_colors: (profileData.custom_colors as Record<string, string | boolean | number>) || null,
      };

      // Check if password protected
      if (profileData.is_password_protected) {
        setIsPasswordProtected(true);
        // Check session storage for access token
        const accessToken = sessionStorage.getItem(`profile_access_${username}`);
        if (accessToken) {
          setIsUnlocked(true);
        } else {
          setProfile(parsedProfile);
          setLoading(false);
          return;
        }
      }

      setProfile(parsedProfile);

      // Check for canonical domain redirect (only on main domain)
      // Only redirect to custom domain if not already on a custom domain and not forced username
      const currentHost = window.location.hostname;
      const isOnMainDomain = isMainDomain(currentHost);
      
      if (isOnMainDomain && !forcedUsername) {
        const { data: primaryDomain } = await supabase
          .from('custom_domains')
          .select('domain')
          .eq('profile_id', profileData.id)
          .eq('status', 'active')
          .eq('is_primary', true)
          .maybeSingle();

        if (primaryDomain?.domain) {
          // 302 redirect to the custom domain (preserve current protocol)
          window.location.replace(`${window.location.protocol}//${primaryDomain.domain}/`);
          return;
        }
      }

      // Track view and increment total_views
      const visitorId = getVisitorId();
      const newViewCount = (profileData.total_views || 0) + 1;
      await Promise.all([
        supabase.from('analytics_events').insert({
          profile_id: profileData.id,
          event_type: 'view',
          device_type: getDeviceType(),
          browser: getBrowserName(),
          referrer: document.referrer || null,
          visitor_id: visitorId,
        }),
        supabase
          .from('link_profiles')
          .update({ total_views: newViewCount })
          .eq('id', profileData.id),
      ]);

      // Fetch blocks
      const { data: blocksData } = await supabase
        .from('blocks')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_enabled', true)
        .order('position', { ascending: true });

      if (blocksData) {
        setBlocks(blocksData.map(b => ({
          id: b.id,
          type: b.type,
          title: b.title,
          subtitle: b.subtitle,
          url: b.url,
          thumbnail_url: b.thumbnail_url,
          content: (b.content as Record<string, any>) || null,
          is_enabled: b.is_enabled ?? true,
          is_featured: b.is_featured ?? false,
          open_in_new_tab: b.open_in_new_tab ?? true,
          position: b.position ?? 0,
        })));
      }

      setLoading(false);
    };

    fetchProfile();
  }, [username, isUnlocked]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !passwordInput) return;

    setVerifyingPassword(true);
    setPasswordError('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-profile-password', {
        body: { username, password: passwordInput },
      });

      if (error) throw error;

      if (data?.valid) {
        // Store access token in session storage
        if (data.accessToken) {
          sessionStorage.setItem(`profile_access_${username}`, data.accessToken);
        }
        setIsUnlocked(true);
        setPasswordInput('');
      } else {
        setPasswordError(data?.error || 'Invalid password');
      }
    } catch (error: any) {
      console.error('Password verification error:', error);
      setPasswordError('Failed to verify password. Please try again.');
    }

    setVerifyingPassword(false);
  };

  const handleBlockClick = useCallback(async (block: Block) => {
    if (!block.url) return;

    // Fire tracking pixel events
    trackClick(block.title);

    // Track click and increment total_clicks
    const visitorId = getVisitorId();
    
    // Fire tracking in background, don't wait for it
    Promise.all([
      supabase.from('analytics_events').insert({
        profile_id: profile?.id,
        block_id: block.id,
        event_type: 'click',
        device_type: getDeviceType(),
        browser: getBrowserName(),
        referrer: document.referrer || null,
        visitor_id: visitorId,
      }),
      // Get current clicks then increment
      supabase
        .from('blocks')
        .select('total_clicks')
        .eq('id', block.id)
        .single()
        .then(({ data }) => {
          const currentClicks = data?.total_clicks || 0;
          return supabase
            .from('blocks')
            .update({ total_clicks: currentClicks + 1 })
            .eq('id', block.id);
        }),
    ]).catch(console.error);

    // Open link immediately
    if (block.open_in_new_tab) {
      window.open(block.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = block.url;
    }
  }, [profile?.id, trackClick]);

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

  // Show password protection screen
  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-4"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Protected Profile</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                This profile is password protected
              </p>
            </div>

            {profile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-6">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile.display_name?.charAt(0) || profile.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{profile.display_name || `@${profile.username}`}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className="mt-1.5"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-1.5">{passwordError}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyingPassword || !passwordInput}
              >
                {verifyingPassword ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Unlock Profile
                  </span>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Contact the profile owner if you need access
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const theme = getThemeColors(profile);

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
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50 scale-110"
                style={{ background: theme.accent }}
              />
              <Avatar 
                className="w-28 h-28 border-4 shadow-2xl relative z-10"
                style={{ 
                  borderColor: theme.gradient ? 'rgba(255,255,255,0.5)' : theme.accent,
                  boxShadow: `0 8px 32px -8px ${theme.accent}40`
                }}
              >
                <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
                <AvatarFallback 
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, 
                    color: '#ffffff' 
                  }} 
                  className="text-3xl font-bold"
                >
                  {profile?.display_name?.charAt(0) || profile?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name with Verified Badge */}
            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 
                  className="text-2xl font-display font-bold"
                  style={{ color: theme.text }}
                >
                  {profile?.display_name || `@${profile?.username}`}
                </h1>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ 
                    background: theme.gradient ? 'rgba(255,255,255,0.2)' : theme.accent,
                    color: theme.gradient ? theme.text : '#ffffff'
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              
              {profile?.bio && (
                <p 
                  className="mt-3 max-w-sm leading-relaxed opacity-80"
                  style={{ color: theme.text }}
                >
                  {profile.bio}
                </p>
              )}

              {profile?.location && (
                <div 
                  className="flex items-center justify-center gap-1.5 mt-3 text-sm opacity-60"
                  style={{ color: theme.text }}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Social Icons Row with Brand Colors */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex items-center justify-center flex-wrap gap-3 mt-5">
                {Object.entries(profile.social_links).map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()] || Globe;
                  const brandColor = socialColors[platform.toLowerCase()] || theme.accent;
                  return url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                      style={{ 
                        backgroundColor: brandColor,
                        color: platform.toLowerCase() === 'snapchat' ? '#000000' : '#ffffff',
                      }}
                    >
                      <Icon className="w-5 h-5" />
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
                  <BlockRenderer 
                    block={block} 
                    theme={theme} 
                    onClick={() => handleBlockClick(block)} 
                    profileId={profile?.id}
                    onLeadSubmit={() => trackLead(block.title)}
                  />
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block, theme, onClick, profileId, onLeadSubmit }: { block: Block; theme: ThemeColors; onClick: () => void; profileId?: string; onLeadSubmit?: () => void }) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [showDataGate, setShowDataGate] = useState(false);
  const buttonRadius = theme.buttonRadius || 16;
  const buttonStyle = theme.buttonStyle || 'filled';

  // Check if data collection gate is needed
  const content = block.content as Record<string, any> | null;
  const dataGateEnabled = content?.data_gate_enabled === true;
  const hasAlreadySubmitted = dataGateEnabled
    ? localStorage.getItem(`data_gate_${block.id}`) === 'true'
    : true;

  const handleGatedClick = (originalAction: () => void) => {
    if (dataGateEnabled && !hasAlreadySubmitted) {
      // Store the pending action and show the gate
      pendingActionRef.current = originalAction;
      setShowDataGate(true);
    } else {
      originalAction();
    }
  };

  // Use a ref to store the pending action after data collection
  const pendingActionRef = useRef<(() => void) | null>(null);

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

  const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$',
  };

  const fileTypeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    document: FileText,
    image: ImageIcon,
    video: Video,
    audio: Music,
    archive: Archive,
    code: FileCode,
    other: Download,
  };

  // Handle download block click
  const handleDownloadClick = () => {
    const downloadContent = block.content as {
      ad_enabled?: boolean;
      ad_duration?: number;
      ad_image_url?: string;
      ad_link_url?: string;
      ad_text?: string;
    } | undefined;

    if (downloadContent?.ad_enabled) {
      setShowAdModal(true);
    } else {
      // Direct download
      triggerDownload();
    }
  };

  // Trigger the actual download
  const triggerDownload = () => {
    if (!block.url) return;

    // Track the click
    const visitorId = localStorage.getItem('linksdc_visitor_id') || `v_${Date.now()}`;
    
    Promise.all([
      supabase.from('analytics_events').insert({
        profile_id: profileId,
        block_id: block.id,
        event_type: 'download',
        device_type: /Tablet|iPad/i.test(navigator.userAgent) ? 'tablet' : /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
        referrer: document.referrer || null,
        visitor_id: visitorId,
      }),
      supabase
        .from('blocks')
        .select('total_clicks')
        .eq('id', block.id)
        .single()
        .then(({ data }) => {
          const currentClicks = data?.total_clicks || 0;
          return supabase
            .from('blocks')
            .update({ total_clicks: currentClicks + 1 })
            .eq('id', block.id);
        }),
    ]).catch(console.error);

    // Trigger download
    window.open(block.url, '_blank', 'noopener,noreferrer');
  };

  const visitorId = localStorage.getItem('linksdc_visitor_id') || `v_${Date.now()}`;
  
  const dataGateElement = showDataGate && profileId ? (
    <DataCollectionGate
      blockId={block.id}
      profileId={profileId}
      visitorId={visitorId}
      collectName={content?.collect_name}
      collectEmail={content?.collect_email}
      collectPhone={content?.collect_phone}
      theme={{ text: theme.text, accent: theme.accent, cardBg: theme.cardBg }}
      onComplete={() => {
        setShowDataGate(false);
        onLeadSubmit?.();
        if (pendingActionRef.current) {
          pendingActionRef.current();
          pendingActionRef.current = null;
        }
      }}
    />
  ) : null;

  switch (block.type) {
    case 'download':
      const downloadContent = block.content as {
        file_type?: string;
        file_size?: string;
        ad_enabled?: boolean;
        ad_duration?: number;
        ad_image_url?: string;
        ad_link_url?: string;
        ad_text?: string;
      } | undefined;

      const FileIcon = fileTypeIcons[downloadContent?.file_type || 'other'] || Download;

      return (
        <>
          <button 
            onClick={() => handleGatedClick(handleDownloadClick)}
            className="block w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={pillStyle}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <FileIcon className="w-5 h-5" style={{ color: theme.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold leading-tight truncate" style={{ color: theme.text }}>
                  {block.title || 'Download'}
                </h3>
                {(block.subtitle || downloadContent?.file_size) && (
                  <p className="text-sm truncate opacity-60" style={{ color: theme.text }}>
                    {block.subtitle || downloadContent?.file_size}
                  </p>
                )}
              </div>
              <div 
                className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 flex-shrink-0"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
              >
                <Download className="w-4 h-4" />
                {downloadContent?.ad_enabled ? 'Free' : 'Get'}
              </div>
            </div>
          </button>

          <DownloadAdModal
            isOpen={showAdModal}
            onClose={() => setShowAdModal(false)}
            onDownload={triggerDownload}
            adDuration={downloadContent?.ad_duration || 5}
            adImageUrl={downloadContent?.ad_image_url}
            adLinkUrl={downloadContent?.ad_link_url}
            adText={downloadContent?.ad_text}
            fileName={block.title || 'File'}
            theme={{ text: theme.text, cardBg: theme.cardBg, accent: theme.accent }}
          />
          {dataGateElement}
        </>
      );

    case 'link':
    case 'cta':
      return (
        <>
        <button 
          onClick={() => handleGatedClick(onClick)}
          className="block w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <div className="flex items-center gap-3">
            {block.thumbnail_url ? (
              <img 
                src={block.thumbnail_url} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : null}
            <div className="flex-1 min-w-0 text-center">
              <h3 className="font-semibold leading-tight line-clamp-2" style={{ color: theme.text }}>
                {block.title || 'Untitled Link'}
              </h3>
              {block.subtitle && (
                <p className="text-sm truncate opacity-60" style={{ color: theme.text }}>{block.subtitle}</p>
              )}
            </div>
            {block.thumbnail_url && <div className="w-10 flex-shrink-0" />}
          </div>
        </button>
        {dataGateElement}
        </>
      );

    case 'video':
      return (
        <button 
          onClick={onClick}
          className="block w-full overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-transform"
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
                    className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                    style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                  >
                    <Play className="w-6 h-6 text-white/90 ml-0.5" fill="rgba(255,255,255,0.9)" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
                >
                  <Play className="w-6 h-6 text-white/70 ml-0.5" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4" style={{ color: theme.text }}>
            <h3 className="font-semibold uppercase tracking-wide truncate">{block.title || 'Video'}</h3>
            {block.subtitle && (
              <p className="text-sm opacity-60 truncate">{block.subtitle}</p>
            )}
          </div>
        </button>
      );

    case 'music':
      return (
        <button 
          onClick={onClick}
          className="block w-full py-4 px-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={pillStyle}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <Music className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold leading-tight truncate" style={{ color: theme.text }}>
                {block.title || 'Music'}
              </h3>
              {block.subtitle && (
                <p className="text-sm truncate opacity-60" style={{ color: theme.text }}>{block.subtitle}</p>
              )}
            </div>
          </div>
        </button>
      );

    case 'contact_whatsapp':
      return (
        <button 
          onClick={onClick}
          className="block w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <h3 className="font-semibold leading-tight" style={{ color: theme.text }}>
                {block.title || 'Message on WhatsApp'}
              </h3>
            </div>
            <div className="w-10 flex-shrink-0" />
          </div>
        </button>
      );

    case 'contact_email':
      return (
        <button 
          onClick={onClick}
          className="block w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <Mail className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <h3 className="font-semibold leading-tight" style={{ color: theme.text }}>
                {block.title || 'Send Email'}
              </h3>
            </div>
            <div className="w-10 flex-shrink-0" />
          </div>
        </button>
      );

    case 'contact_call':
      return (
        <button 
          onClick={onClick}
          className="block w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <Phone className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <h3 className="font-semibold leading-tight" style={{ color: theme.text }}>
                {block.title || 'Call'}
              </h3>
            </div>
            <div className="w-10 flex-shrink-0" />
          </div>
        </button>
      );

    case 'shop':
      const shopContent = block.content as { 
        price?: string; 
        currency?: string; 
        original_price?: string; 
        badge?: string;
        display_style?: string;
      } | undefined;
      const symbol = currencySymbols[shopContent?.currency || 'USD'] || '$';
      const displayStyle = shopContent?.display_style || 'card';

      // Square style
      if (displayStyle === 'square') {
        return (
          <button 
            onClick={onClick} 
            className="w-full overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: theme.cardBg, borderRadius: `${buttonRadius}px` }}
          >
            <div className="relative aspect-square">
              {block.thumbnail_url ? (
                <img 
                  src={block.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}15` }}
                >
                  <ShoppingBag className="w-16 h-16" style={{ color: theme.accent }} />
                </div>
              )}
              {shopContent?.badge && (
                <span 
                  className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ backgroundColor: theme.accent, color: '#fff' }}
                >
                  {shopContent.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg leading-tight" style={{ color: theme.text }}>
                {block.title || 'Product'}
              </h3>
              {block.subtitle && (
                <p className="text-sm opacity-60 mt-1 line-clamp-2" style={{ color: theme.text }}>{block.subtitle}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: theme.accent }}>
                    {symbol}{shopContent?.price || '0.00'}
                  </span>
                  {shopContent?.original_price && (
                    <span className="text-sm line-through opacity-50" style={{ color: theme.text }}>
                      {symbol}{shopContent.original_price}
                    </span>
                  )}
                </div>
                <div 
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: theme.accent, color: '#fff' }}
                >
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
          <button 
            onClick={onClick} 
            className="w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={pillStyle}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <ShoppingBag className="w-5 h-5" style={{ color: theme.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold leading-tight truncate" style={{ color: theme.text }}>
                  {block.title || 'Product'}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold" style={{ color: theme.accent }}>
                  {symbol}{shopContent?.price || '0.00'}
                </span>
                {shopContent?.badge && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                  >
                    {shopContent.badge}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      }

      // Default: Card style
      return (
        <button 
          onClick={onClick} 
          className="w-full overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ backgroundColor: theme.cardBg, borderRadius: `${buttonRadius}px` }}
        >
          <div className="flex items-center gap-3 p-4">
            {block.thumbnail_url ? (
              <img 
                src={block.thumbnail_url} 
                alt="" 
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${theme.accent}15` }}
              >
                <ShoppingBag className="w-7 h-7" style={{ color: theme.accent }} />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate" style={{ color: theme.text }}>{block.title || 'Product'}</h3>
                {shopContent?.badge && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                  >
                    {shopContent.badge}
                  </span>
                )}
              </div>
              {block.subtitle && (
                <p className="text-sm truncate opacity-60" style={{ color: theme.text }}>{block.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold" style={{ color: theme.accent }}>
                  {symbol}{shopContent?.price || '0.00'}
                </span>
                {shopContent?.original_price && (
                  <span className="text-sm line-through opacity-50" style={{ color: theme.text }}>
                    {symbol}{shopContent.original_price}
                  </span>
                )}
              </div>
            </div>
            <div 
              className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: theme.accent, color: '#fff' }}
            >
              Buy
            </div>
          </div>
        </button>
      );

    case 'text':
      const textContent = block.content as { text_size?: string; text_align?: string } | undefined;
      const textAlign = (textContent?.text_align || 'center') as 'left' | 'center' | 'right';
      const textSize = textContent?.text_size || 'normal';
      return (
        <div 
          className="w-full py-4 px-5"
          style={{ ...pillStyle, textAlign }}
        >
          {block.title && (
            <h3 className={`font-semibold ${
              textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
            }`} style={{ color: theme.text }}>
              {block.title}
            </h3>
          )}
          {block.subtitle && (
            <p className={`opacity-70 ${
              textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
            }`} style={{ color: theme.text }}>
              {block.subtitle}
            </p>
          )}
        </div>
      );

    case 'image':
      return (
        <button 
          onClick={block.url ? onClick : undefined}
          className={`block w-full overflow-hidden shadow-lg ${block.url ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
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
            <div className="p-4" style={{ color: theme.text }}>
              {block.title && <p className="font-semibold">{block.title}</p>}
              {block.subtitle && <p className="text-sm opacity-60">{block.subtitle}</p>}
            </div>
          )}
        </button>
      );

    case 'divider':
      return (
        <div className="py-4">
          <div 
            className="h-px mx-8" 
            style={{ backgroundColor: `${theme.text}15` }} 
          />
        </div>
      );

    case 'featured':
      return (
        <button 
          onClick={onClick} 
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
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-5">
            <h3 className="font-bold text-lg">{block.title || 'Featured'}</h3>
            {block.subtitle && (
              <p className="opacity-90 mt-1">{block.subtitle}</p>
            )}
          </div>
        </button>
      );

    case 'carousel':
      interface CarouselItem {
        id: string;
        image_url: string;
        title: string;
        url: string;
      }
      const carouselContent = block.content as { items?: CarouselItem[] } | undefined;
      const carouselItems = carouselContent?.items || [];
      return (
        <div className="w-full space-y-3">
          {(block.title || block.subtitle) && (
            <div className="text-center">
              {block.title && <h3 className="font-semibold text-lg" style={{ color: theme.text }}>{block.title}</h3>}
              {block.subtitle && <p className="text-sm opacity-60" style={{ color: theme.text }}>{block.subtitle}</p>}
            </div>
          )}
          <div 
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {carouselItems.length > 0 ? carouselItems.map((item, idx) => (
              <a 
                key={item.id || idx}
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-36 snap-center overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ backgroundColor: theme.cardBg, borderRadius: `${buttonRadius}px` }}
              >
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-24 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10)` }}
                  >
                    <Globe className="w-8 h-8 opacity-40" style={{ color: theme.text }} />
                  </div>
                )}
                {item.title && (
                  <div className="p-3" style={{ color: theme.text }}>
                    <p className="text-sm font-medium truncate">{item.title}</p>
                  </div>
                )}
              </a>
            )) : (
              <div className="w-full text-center py-6 opacity-50" style={{ color: theme.text }}>
                <p className="text-sm">No items in carousel</p>
              </div>
            )}
          </div>
        </div>
      );

    case 'scheduled':
      const scheduledContent = block.content as { message?: string } | undefined;
      return (
        <div 
          className="w-full py-4 px-5 flex items-center gap-3"
          style={pillStyle}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            <Clock className="w-5 h-5" style={{ color: theme.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight" style={{ color: theme.text }}>
              {block.title || 'Scheduled Content'}
            </h3>
            {scheduledContent?.message && (
              <p className="text-sm truncate opacity-60" style={{ color: theme.text }}>{scheduledContent.message}</p>
            )}
          </div>
        </div>
      );

    case 'html':
      const htmlContent = block.content as { html?: string } | undefined;
      return (
        <div 
          className="w-full overflow-hidden"
          style={{ ...pillStyle, padding: 0 }}
        >
          {htmlContent?.html ? (
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: htmlContent.html }}
              style={{ color: theme.text }}
            />
          ) : (
            <div className="p-4 text-center opacity-50" style={{ color: theme.text }}>
              <p className="text-sm">HTML content</p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <button 
          onClick={onClick} 
          className="w-full py-4 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={pillStyle}
        >
          <h3 className="font-semibold text-center w-full" style={{ color: theme.text }}>
            {block.title || 'Block'}
          </h3>
        </button>
      );
  }
}
