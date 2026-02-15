import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Search,
  Filter,
  Globe,
  Shield,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalUsers: number;
  profileViews: number;
  linkClicks: number;
  avgCtr: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  username: string;
  views: number;
  status: string;
}

interface TopProfile {
  rank: number;
  name: string;
  username: string;
  views: number;
  clicks: number;
  ctr: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    profileViews: 0,
    linkClicks: 0,
    avgCtr: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topProfiles, setTopProfiles] = useState<TopProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total profile views
      const { data: viewsData } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'page_view');

      // Fetch total link clicks
      const { data: clicksData } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_type', 'link_click');

      const totalViews = viewsData?.length || 0;
      const totalClicks = clicksData?.length || 0;
      const avgCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      setStats({
        totalUsers: usersCount || 0,
        profileViews: totalViews,
        linkClicks: totalClicks,
        avgCtr: Math.round(avgCtr * 10) / 10,
      });

      // Fetch recent users with their link profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_suspended, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (profilesData) {
        const recentUsersWithProfiles = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: linkProfile } = await supabase
              .from('link_profiles')
              .select('username, total_views')
              .eq('user_id', profile.id)
              .maybeSingle();

            return {
              id: profile.id,
              name: profile.full_name || profile.email,
              email: profile.email,
              username: linkProfile?.username ? `@${linkProfile.username}` : 'No profile',
              views: linkProfile?.total_views || 0,
              status: profile.is_suspended ? 'suspended' : 'active',
            };
          })
        );
        setRecentUsers(recentUsersWithProfiles);
      }

      // Fetch top profiles by views
      const { data: topProfilesData } = await supabase
        .from('link_profiles')
        .select('id, username, display_name, total_views')
        .order('total_views', { ascending: false })
        .limit(5);

      if (topProfilesData) {
        const topProfilesWithClicks = await Promise.all(
          topProfilesData.map(async (profile, index) => {
            const { count: clickCount } = await supabase
              .from('analytics_events')
              .select('*', { count: 'exact', head: true })
              .eq('profile_id', profile.id)
              .eq('event_type', 'link_click');

            const clicks = clickCount || 0;
            const views = profile.total_views || 0;
            const ctr = views > 0 ? (clicks / views) * 100 : 0;

            return {
              rank: index + 1,
              name: profile.display_name || profile.username,
              username: `@${profile.username}`,
              views: views,
              clicks: clicks,
              ctr: Math.round(ctr * 10) / 10,
            };
          })
        );
        setTopProfiles(topProfilesWithClicks);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statsDisplay = [
    { 
      label: 'Total Users', 
      value: formatNumber(stats.totalUsers), 
      change: '+0%', 
      trend: 'up',
      icon: Users,
      color: 'text-primary'
    },
    { 
      label: 'Profile Views', 
      value: formatNumber(stats.profileViews), 
      change: '+0%', 
      trend: 'up',
      icon: Eye,
      color: 'text-success'
    },
    { 
      label: 'Link Clicks', 
      value: formatNumber(stats.linkClicks), 
      change: '+0%', 
      trend: 'up',
      icon: MousePointerClick,
      color: 'text-accent'
    },
    { 
      label: 'Avg. CTR', 
      value: `${stats.avgCtr}%`, 
      change: '+0%', 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-warning'
    },
  ];

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
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Overview
          </h1>
          <p className="text-muted-foreground">
            Platform statistics and management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsDisplay.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Users</h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No users found
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {user.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Top Profiles</h2>
            <Link to="/admin/analytics">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topProfiles.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No profiles found
              </div>
            ) : (
              topProfiles.map((profile) => (
                <div key={profile.rank} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      profile.rank <= 3 
                        ? 'gradient-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {profile.rank}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatNumber(profile.views)} views</p>
                    <p className="text-sm text-success">{profile.ctr}% CTR</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Users', icon: Users, href: '/admin/users' },
          { label: 'Design System', icon: Activity, href: '/admin/design-system' },
          { label: 'Domain Settings', icon: Globe, href: '/admin/domains' },
          { label: 'Security', icon: Shield, href: '/admin/moderation' },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Link
              to={action.href}
              className="glass-card p-6 hover-lift flex flex-col items-center text-center cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-foreground">{action.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
