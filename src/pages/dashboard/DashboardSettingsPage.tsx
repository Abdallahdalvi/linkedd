import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Copy,
  Key,
  Mail,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DashboardSettingsPageProps {
  profile: any;
  onUpdateProfile: (updates: any) => Promise<void>;
  userEmail: string;
}

export default function DashboardSettingsPage({ 
  profile, 
  onUpdateProfile,
  userEmail,
}: DashboardSettingsPageProps) {
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(profile?.is_password_protected ?? false);
  const [password, setPassword] = useState('');
  
  const [seoTitle, setSeoTitle] = useState(profile?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(profile?.seo_description || '');

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        is_public: isPublic,
        is_password_protected: isPasswordProtected,
      });
      toast.success('Privacy settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleSaveSEO = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        seo_title: seoTitle,
        seo_description: seoDescription,
      });
      toast.success('SEO settings saved!');
    } catch (error) {
      toast.error('Failed to save SEO settings');
    }
    setSaving(false);
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${profile?.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Profile URL copied!');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and profile settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Profile URL</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Your Link</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 p-3 bg-secondary rounded-lg font-mono text-sm">
                      linkbio.app/{profile?.username}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyProfileUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-medium text-foreground mb-2">Custom Domain</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your own domain to your profile (coming soon)
                  </p>
                  <Button variant="outline" disabled>
                    <Globe className="w-4 h-4 mr-2" />
                    Add Custom Domain
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Notifications</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important updates
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Analytics Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Milestone Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you hit view milestones
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    Public Profile
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, only you can view your profile
                  </p>
                </div>
                <Switch 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password Protection
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require a password to view your profile
                  </p>
                </div>
                <Switch 
                  checked={isPasswordProtected}
                  onCheckedChange={setIsPasswordProtected}
                />
              </div>

              {isPasswordProtected && (
                <div>
                  <Label>Profile Password</Label>
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Visitors will need this password to view your profile
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Hide from Search Engines</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent your profile from appearing in search results
                  </p>
                </div>
                <Switch />
              </div>

              <Button 
                onClick={handleSavePrivacy}
                disabled={saving}
                className="gradient-primary text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              SEO Settings
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Optimize how your profile appears in search results and social shares
            </p>
            
            <div className="space-y-6">
              <div>
                <Label>SEO Title</Label>
                <Input 
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={profile?.display_name || profile?.username}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoTitle.length}/60 characters recommended
                </p>
              </div>

              <div>
                <Label>SEO Description</Label>
                <Textarea 
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="A brief description of your profile for search engines..."
                  className="mt-2"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoDescription.length}/160 characters recommended
                </p>
              </div>

              <div>
                <Label>Social Share Image (OG Image)</Label>
                <div className="mt-2 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <div className="text-center">
                    <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload an image (1200x630 recommended)
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveSEO}
                disabled={saving}
                className="gradient-primary text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{userEmail}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Data & Export</h2>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Profile Layout
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 border-destructive/20"
            >
              <h2 className="text-lg font-semibold text-destructive mb-6">Danger Zone</h2>
              
              <div className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your 
                        profile and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Profile
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all associated data.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
