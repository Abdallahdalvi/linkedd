import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  MapPin,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Globe,
  Save,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import MobilePreview from '@/components/MobilePreview';

interface DashboardProfilePageProps {
  profile: any;
  blocks: any[];
  onUpdateProfile: (updates: any) => Promise<void>;
}

export default function DashboardProfilePage({ 
  profile, 
  blocks,
  onUpdateProfile 
}: DashboardProfilePageProps) {
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  
  const [socialLinks, setSocialLinks] = useState({
    instagram: profile?.social_links?.instagram || '',
    twitter: profile?.social_links?.twitter || '',
    youtube: profile?.social_links?.youtube || '',
    linkedin: profile?.social_links?.linkedin || '',
    email: profile?.social_links?.email || '',
    phone: profile?.social_links?.phone || '',
    website: profile?.social_links?.website || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        display_name: displayName,
        bio,
        location,
        social_links: socialLinks,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const socialInputs = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: '@username' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel URL' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'Profile URL' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 234 567 8900' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
  ];

  const updatedProfile = {
    ...profile,
    display_name: displayName,
    bio,
    location,
    social_links: socialLinks,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <User className="w-7 h-7 text-primary" />
            Edit Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your public profile appearance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href={`/${profile?.username}`} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              View Public Profile
            </a>
          </Button>
          <Button 
            className="gradient-primary text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Left: Profile Form */}
        <div className="space-y-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Basic Information</h2>
            
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {displayName?.charAt(0) || profile?.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Profile Photo</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a profile picture for your page
                </p>
                <Button variant="outline" size="sm">
                  Upload Image
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Username</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-muted-foreground">linkbio.app/</span>
                  <Input 
                    value={profile?.username || ''}
                    disabled
                    className="flex-1 opacity-60"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Username cannot be changed
                </p>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell visitors about yourself..."
                  className="mt-2"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bio.length}/160 characters
                </p>
              </div>

              <div>
                <Label>Location</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Social Links
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Add your social media profiles to display as icons on your page
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {socialInputs.map((social) => (
                <div key={social.key}>
                  <Label className="flex items-center gap-2">
                    <social.icon className="w-4 h-4" />
                    {social.label}
                  </Label>
                  <Input 
                    value={socialLinks[social.key as keyof typeof socialLinks]}
                    onChange={(e) => handleSocialChange(social.key, e.target.value)}
                    placeholder={social.placeholder}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Cover Image</h2>
            
            <div className="h-32 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a cover image
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Mobile Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
              Live Preview
            </h2>
            <div className="flex justify-center">
              <MobilePreview profile={updatedProfile} blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
