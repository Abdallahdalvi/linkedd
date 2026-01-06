import { motion } from 'framer-motion';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import MobilePreview from '@/components/MobilePreview';
import BlockEditor from '@/components/blocks/BlockEditor';

interface DashboardOverviewPageProps {
  profile: any;
  blocks: any[];
  onAddBlock: (block: any) => Promise<any>;
  onUpdateBlock: (id: string, updates: any) => Promise<void>;
  onDeleteBlock: (id: string) => Promise<void>;
  onReorderBlocks: (blocks: any[]) => Promise<void>;
  userName: string;
}

export default function DashboardOverviewPage({
  profile,
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  userName,
}: DashboardOverviewPageProps) {
  const copyProfileUrl = () => {
    if (!profile) return;
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const stats = [
    { label: 'Profile Views', value: profile?.total_views || 0, icon: Eye, change: '+12%' },
    { label: 'Link Clicks', value: blocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0), icon: MousePointerClick, change: '+8%' },
    { label: 'Click Rate', value: profile?.total_views ? `${((blocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0) / profile.total_views) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, change: '+5%' },
    { label: 'Active Links', value: blocks.filter(b => b.is_enabled).length, icon: LinkIcon, change: '' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome back, {userName}
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
                <span className="flex items-center gap-1 text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Manage Links', href: '/dashboard/links', icon: LinkIcon },
          { label: 'View Analytics', href: '/dashboard/analytics', icon: TrendingUp },
          { label: 'Edit Profile', href: '/dashboard/profile', icon: Eye },
          { label: 'Settings', href: '/dashboard/settings', icon: ExternalLink },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Link
              to={action.href}
              className="glass-card p-4 hover-lift flex items-center gap-3 cursor-pointer block"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{action.label}</span>
            </Link>
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
            onAddBlock={onAddBlock}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onReorderBlocks={onReorderBlocks}
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
  );
}
