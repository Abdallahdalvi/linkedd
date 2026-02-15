import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  AlertTriangle,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  Flag,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SuspendedProfile {
  id: string;
  username: string;
  displayName: string | null;
  suspendedAt: string;
  userId: string;
}

interface FlaggedBlock {
  id: string;
  username: string;
  blockTitle: string;
  type: string;
  url: string | null;
}

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suspendedProfiles, setSuspendedProfiles] = useState<SuspendedProfile[]>([]);
  const [flaggedBlocks, setFlaggedBlocks] = useState<FlaggedBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      // Fetch suspended users
      const { data: suspendedData } = await supabase
        .from('profiles')
        .select('id, email, updated_at, is_suspended')
        .eq('is_suspended', true);

      if (suspendedData) {
        const suspendedWithProfiles = await Promise.all(
          suspendedData.map(async (profile) => {
            const { data: linkProfile } = await supabase
              .from('link_profiles')
              .select('username, display_name')
              .eq('user_id', profile.id)
              .maybeSingle();

            return {
              id: profile.id,
              username: linkProfile?.username || profile.email.split('@')[0],
              displayName: linkProfile?.display_name,
              suspendedAt: new Date(profile.updated_at).toLocaleDateString(),
              userId: profile.id,
            };
          })
        );
        setSuspendedProfiles(suspendedWithProfiles);
      }

      // Fetch blocks with external URLs (potential flagged content)
      const { data: blocksData } = await supabase
        .from('blocks')
        .select(`
          id,
          title,
          type,
          url,
          profile_id,
          link_profiles!inner(username)
        `)
        .not('url', 'is', null)
        .limit(20);

      if (blocksData) {
        const flagged: FlaggedBlock[] = blocksData.map((block: any) => ({
          id: block.id,
          username: block.link_profiles?.username || 'unknown',
          blockTitle: block.title || 'Untitled',
          type: block.type,
          url: block.url,
        }));
        setFlaggedBlocks(flagged);
      }
    } catch (error) {
      console.error('Error fetching moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: false })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User unsuspended');
      fetchModerationData();
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      toast.success('Block removed');
      fetchModerationData();
    } catch (error) {
      console.error('Error removing block:', error);
      toast.error('Failed to remove block');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review reports, manage profiles, and enforce policies
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Reports', value: '0', icon: AlertTriangle, color: 'text-warning' },
          { label: 'Suspended Users', value: suspendedProfiles.length.toString(), icon: EyeOff, color: 'text-destructive' },
          { label: 'Blocks with URLs', value: flaggedBlocks.length.toString(), icon: Flag, color: 'text-accent' },
          { label: 'Resolved Today', value: '0', icon: CheckCircle, color: 'text-success' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="suspended" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="suspended" className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Suspended
              {suspendedProfiles.length > 0 && (
                <Badge variant="destructive" className="ml-1">{suspendedProfiles.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blocks" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Review Blocks
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Suspended Users Tab */}
        <TabsContent value="suspended">
          <div className="space-y-4">
            {suspendedProfiles.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <EyeOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No suspended users</h3>
                <p className="text-muted-foreground">All users are currently active</p>
              </div>
            ) : (
              suspendedProfiles
                .filter(p => 
                  p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
                )
                .map((profile, i) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <EyeOff className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">@{profile.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            {profile.displayName || 'No display name'} • Suspended since {profile.suspendedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/${profile.username}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-success"
                          onClick={() => handleUnsuspend(profile.userId)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Unsuspend
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </TabsContent>

        {/* Review Blocks Tab */}
        <TabsContent value="blocks">
          <div className="space-y-4">
            {flaggedBlocks.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No blocks to review</h3>
                <p className="text-muted-foreground">All blocks look good</p>
              </div>
            ) : (
              flaggedBlocks
                .filter(b => 
                  b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.blockTitle.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((block, i) => (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                          <Flag className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{block.blockTitle}</h3>
                            <Badge variant="secondary">{block.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            @{block.username} • {block.url ? block.url.slice(0, 50) + '...' : 'No URL'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {block.url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(block.url!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Inspect
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-success"
                          onClick={() => toast.success('Block approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRemoveBlock(block.id)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
