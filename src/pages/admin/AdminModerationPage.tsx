import { useState } from 'react';
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
  MessageSquare,
  ExternalLink,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const reportedProfiles = [
  { 
    id: '1', 
    username: 'spammer123', 
    reason: 'Spam content',
    reportCount: 15,
    status: 'pending',
    reportedAt: '2026-01-05',
  },
  { 
    id: '2', 
    username: 'fakeprofile', 
    reason: 'Impersonation',
    reportCount: 8,
    status: 'pending',
    reportedAt: '2026-01-04',
  },
  { 
    id: '3', 
    username: 'scamlinks', 
    reason: 'Malicious links',
    reportCount: 23,
    status: 'reviewed',
    reportedAt: '2026-01-03',
  },
  { 
    id: '4', 
    username: 'inappropriate', 
    reason: 'Inappropriate content',
    reportCount: 5,
    status: 'dismissed',
    reportedAt: '2026-01-02',
  },
];

const hiddenProfiles = [
  { id: '1', username: 'suspended_user1', reason: 'Policy violation', hiddenAt: '2025-12-20' },
  { id: '2', username: 'banned_user2', reason: 'Spam', hiddenAt: '2025-12-15' },
  { id: '3', username: 'removed_profile', reason: 'Scam content', hiddenAt: '2025-12-10' },
];

const flaggedBlocks = [
  { id: '1', username: 'user123', blockTitle: 'Free Money Click Here', type: 'link', flagReason: 'Suspicious URL' },
  { id: '2', username: 'promo_acct', blockTitle: 'Limited Time Offer!!!', type: 'text', flagReason: 'Potential spam' },
  { id: '3', username: 'newuser456', blockTitle: 'Download Now', type: 'link', flagReason: 'Malware detected' },
];

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const pendingCount = reportedProfiles.filter(p => p.status === 'pending').length;

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
          { label: 'Pending Reports', value: pendingCount, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Hidden Profiles', value: hiddenProfiles.length, icon: EyeOff, color: 'text-destructive' },
          { label: 'Flagged Blocks', value: flaggedBlocks.length, icon: Flag, color: 'text-accent' },
          { label: 'Resolved Today', value: 12, icon: CheckCircle, color: 'text-success' },
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

      <Tabs defaultValue="reports" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reports
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="hidden" className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Hidden
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Flagged Blocks
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

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-4">
            {reportedProfiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">@{profile.username}</h3>
                        <Badge variant="outline" className="text-xs">
                          {profile.reportCount} reports
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile.reason} • Reported {profile.reportedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {profile.status === 'pending' ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm" className="text-success">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                        <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          <Ban className="w-4 h-4 mr-2" />
                          Take Action
                        </Button>
                      </>
                    ) : (
                      <Badge className={profile.status === 'reviewed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                      }>
                        {profile.status === 'reviewed' ? 'Reviewed' : 'Dismissed'}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Hidden Tab */}
        <TabsContent value="hidden">
          <div className="space-y-4">
            {hiddenProfiles.map((profile, i) => (
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
                        {profile.reason} • Hidden since {profile.hiddenAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Flagged Blocks Tab */}
        <TabsContent value="flagged">
          <div className="space-y-4">
            {flaggedBlocks.map((block, i) => (
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
                        @{block.username} • {block.flagReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Inspect
                    </Button>
                    <Button variant="outline" size="sm" className="text-success">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      <Ban className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
