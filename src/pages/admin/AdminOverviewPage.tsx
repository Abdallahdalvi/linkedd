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

const stats = [
  { 
    label: 'Total Users', 
    value: '12,847', 
    change: '+12.5%', 
    trend: 'up',
    icon: Users,
    color: 'text-primary'
  },
  { 
    label: 'Profile Views', 
    value: '1.2M', 
    change: '+8.3%', 
    trend: 'up',
    icon: Eye,
    color: 'text-success'
  },
  { 
    label: 'Link Clicks', 
    value: '3.4M', 
    change: '+15.2%', 
    trend: 'up',
    icon: MousePointerClick,
    color: 'text-accent'
  },
  { 
    label: 'Avg. CTR', 
    value: '28.3%', 
    change: '-2.1%', 
    trend: 'down',
    icon: TrendingUp,
    color: 'text-warning'
  },
];

const recentUsers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', username: '@sarahj', views: 12500, status: 'active' },
  { id: 2, name: 'Mike Chen', email: 'mike@example.com', username: '@mikechen', views: 8900, status: 'active' },
  { id: 3, name: 'Emily Davis', email: 'emily@example.com', username: '@emilyd', views: 6200, status: 'suspended' },
  { id: 4, name: 'Alex Rivera', email: 'alex@example.com', username: '@alexr', views: 4800, status: 'active' },
  { id: 5, name: 'Jordan Lee', email: 'jordan@example.com', username: '@jordanl', views: 3500, status: 'active' },
];

const topProfiles = [
  { rank: 1, name: 'Sarah Johnson', username: '@sarahj', views: 125000, clicks: 45000, ctr: 36 },
  { rank: 2, name: 'Mike Chen', username: '@mikechen', views: 89000, clicks: 32000, ctr: 36 },
  { rank: 3, name: 'Emily Davis', username: '@emilyd', views: 62000, clicks: 21000, ctr: 34 },
  { rank: 4, name: 'Alex Rivera', username: '@alexr', views: 48000, clicks: 15000, ctr: 31 },
  { rank: 5, name: 'Jordan Lee', username: '@jordanl', views: 35000, clicks: 11000, ctr: 31 },
];

export default function AdminOverviewPage() {
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
        {stats.map((stat, i) => (
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
            {recentUsers.map((user) => (
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
            ))}
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
            {topProfiles.map((profile) => (
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
                  <p className="font-medium text-foreground">{(profile.views / 1000).toFixed(0)}K views</p>
                  <p className="text-sm text-success">{profile.ctr}% CTR</p>
                </div>
              </div>
            ))}
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
