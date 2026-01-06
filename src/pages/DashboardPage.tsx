import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Copy,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLinkProfile } from '@/hooks/useLinkProfile';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MobilePreview from '@/components/MobilePreview';
import BlockEditor from '@/components/blocks/BlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    profile,
    blocks,
    loading,
    createProfile,
    updateProfile,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  } = useLinkProfile();
  
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      setShowSetup(true);
    }
  }, [loading, profile]);

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    setCreating(true);
    const result = await createProfile(username.trim().toLowerCase().replace(/\s+/g, '-'));
    
    if (result) {
      toast.success('Profile created!');
      setShowSetup(false);
    } else {
      toast.error('Username may already be taken. Try another.');
    }
    setCreating(false);
  };

  const copyProfileUrl = () => {
    if (!profile) return;
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const stats = [
    { label: 'Profile Views', value: profile?.total_views || 0, icon: Eye, change: '+12%' },
    { label: 'Link Clicks', value: blocks.reduce((acc, b) => acc + b.total_clicks, 0), icon: MousePointerClick, change: '+8%' },
    { label: 'Click Rate', value: profile?.total_views ? `${((blocks.reduce((acc, b) => acc + b.total_clicks, 0) / profile.total_views) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, change: '+5%' },
    { label: 'Active Links', value: blocks.filter(b => b.is_enabled).length, icon: Users, change: '' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Creator'}
            </h1>
            <p className="text-muted-foreground">
              Manage your link-in-bio and track performance
            </p>
          </div>
          
          {profile && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary">
                <span className="text-sm text-muted-foreground">linkbio.app/</span>
                <span className="text-sm font-medium">{profile.username}</span>
              </div>
              <Button variant="outline" size="icon" onClick={copyProfileUrl}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                {stat.change && (
                  <span className="badge-success">{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Left: Block Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Links</h2>
              <span className="text-sm text-muted-foreground">
                {blocks.length} block{blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <BlockEditor
              blocks={blocks}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onReorderBlocks={reorderBlocks}
            />
          </div>

          {/* Right: Mobile Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                Live Preview
              </h2>
              <div className="flex justify-center">
                <MobilePreview profile={profile} blocks={blocks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Create Your Profile</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex justify-center mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Choose your username</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">linkbio.app/</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="yourname"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <Button
                onClick={handleCreateProfile}
                disabled={creating || !username.trim()}
                className="w-full btn-primary"
              >
                {creating ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
