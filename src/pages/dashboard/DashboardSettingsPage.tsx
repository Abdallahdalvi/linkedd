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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(profile?.is_password_protected ?? false);
  const [password, setPassword] = useState('');
  
  const [seoTitle, setSeoTitle] = useState(profile?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(profile?.seo_description || '');

  // Change password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        is_public: isPublic,
        is_password_protected: isPasswordProtected,
        password_hash: isPasswordProtected && password ? password : null,
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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  const handleExportData = async () => {
    try {
      // Gather all user data
      const exportData = {
        profile: profile,
        exportedAt: new Date().toISOString(),
      };

      // Get blocks
      if (profile?.id) {
        const { data: blocks } = await supabase
          .from('blocks')
          .select('*')
          .eq('profile_id', profile.id);
        
        if (blocks) {
          (exportData as any).blocks = blocks;
        }
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkbio-export-${profile?.username || 'data'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDuplicateLayout = async () => {
    try {
      // Copy profile settings to clipboard
      const layoutData = {
        theme_preset: profile?.theme_preset,
        background_type: profile?.background_type,
        background_value: profile?.background_value,
        custom_colors: profile?.custom_colors,
        custom_fonts: profile?.custom_fonts,
      };

      await navigator.clipboard.writeText(JSON.stringify(layoutData, null, 2));
      toast.success('Layout settings copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy layout');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      if (profile?.id) {
        // Delete blocks first
        await supabase
          .from('blocks')
          .delete()
          .eq('profile_id', profile.id);

        // Delete profile
        await supabase
          .from('link_profiles')
          .delete()
          .eq('id', profile.id);
      }

      toast.success('Profile deleted. Redirecting...');
      // Refresh the page to show setup dialog
      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Sign out first
      await signOut();
      toast.success('Account deletion requested. Please contact support to complete.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved!');
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
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Analytics Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch 
                    checked={weeklyReport}
                    onCheckedChange={setWeeklyReport}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Milestone Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you hit view milestones
                    </p>
                  </div>
                  <Switch 
                    checked={milestoneAlerts}
                    onCheckedChange={setMilestoneAlerts}
                  />
                </div>

                <Button onClick={handleSaveNotifications} variant="outline" className="mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notifications
                </Button>
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
                  <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
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
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>

                <Button variant="outline" className="w-full justify-start" onClick={handleDuplicateLayout}>
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
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteProfile}
                      >
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
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteAccount}
                      >
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

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Password must be at least 6 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Password</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="gradient-primary text-primary-foreground"
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
