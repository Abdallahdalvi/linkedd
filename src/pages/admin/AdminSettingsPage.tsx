import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Shield,
  Mail,
  Database,
  Key,
  Save,
  RefreshCw,
  Lock,
  Zap,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure global platform settings and preferences
          </p>
        </div>
        
        <Button className="gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Advanced
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
              <h2 className="text-lg font-semibold text-foreground mb-6">Platform Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="LinkBio" className="mt-2" />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input defaultValue="Your links, beautifully organized" className="mt-2" />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input defaultValue="support@linkbio.app" type="email" className="mt-2" />
                </div>
                <div>
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Status & Maintenance</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable public access
                    </p>
                  </div>
                  <Switch 
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable new user sign-ups
                    </p>
                  </div>
                  <Switch 
                    checked={registrationEnabled}
                    onCheckedChange={setRegistrationEnabled}
                  />
                </div>

                <div>
                  <Label>Maintenance Message</Label>
                  <Textarea 
                    defaultValue="We're currently performing scheduled maintenance. Please check back soon!"
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Authentication
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify email before accessing
                    </p>
                  </div>
                  <Switch 
                    checked={emailVerification}
                    onCheckedChange={setEmailVerification}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require 2FA for Admins</Label>
                    <p className="text-sm text-muted-foreground">
                      Force two-factor authentication
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorRequired}
                    onCheckedChange={setTwoFactorRequired}
                  />
                </div>

                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue={60} className="mt-2" />
                </div>

                <div>
                  <Label>Max Login Attempts</Label>
                  <Input type="number" defaultValue={5} className="mt-2" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API & Tokens
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>API Rate Limit (requests/minute)</Label>
                  <Input type="number" defaultValue={100} className="mt-2" />
                </div>
                <div>
                  <Label>Token Expiry (days)</Label>
                  <Input type="number" defaultValue={30} className="mt-2" />
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate All API Keys
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label>SMTP Host</Label>
                <Input defaultValue="smtp.resend.com" className="mt-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Port</Label>
                  <Input defaultValue="587" className="mt-2" />
                </div>
                <div>
                  <Label>Encryption</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>From Email</Label>
                <Input defaultValue="noreply@linkbio.app" type="email" className="mt-2" />
              </div>
              <div>
                <Label>From Name</Label>
                <Input defaultValue="LinkBio" className="mt-2" />
              </div>
              <div className="pt-4">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Performance
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Cache Duration (seconds)</Label>
                  <Input type="number" defaultValue={3600} className="mt-2" />
                </div>
                <div>
                  <Label>Max File Upload Size (MB)</Label>
                  <Input type="number" defaultValue={10} className="mt-2" />
                </div>
                <div className="pt-4 space-y-3">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear All Cache
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Optimize Database
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
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-primary" />
                Storage & Data
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground">Storage Used</span>
                    <span className="text-sm font-medium text-foreground">45.2 GB / 100 GB</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Total Users</p>
                    <p className="text-xl font-bold text-foreground">12,847</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Total Profiles</p>
                    <p className="text-xl font-bold text-foreground">11,234</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Total Blocks</p>
                    <p className="text-xl font-bold text-foreground">89,456</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Media Files</p>
                    <p className="text-xl font-bold text-foreground">34,567</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Purge Unused Media
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
