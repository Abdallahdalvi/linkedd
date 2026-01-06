import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const overviewStats = [
  { label: 'Total Views', value: '1.2M', change: '+12.5%', trend: 'up', icon: Eye },
  { label: 'Total Clicks', value: '3.4M', change: '+18.3%', trend: 'up', icon: MousePointerClick },
  { label: 'Avg. CTR', value: '28.3%', change: '+2.1%', trend: 'up', icon: TrendingUp },
  { label: 'Active Users', value: '11,234', change: '+5.7%', trend: 'up', icon: Users },
];

const topProfiles = [
  { rank: 1, name: 'Sarah Johnson', username: '@sarahj', views: 125000, clicks: 45000, ctr: 36.0 },
  { rank: 2, name: 'Mike Chen', username: '@mikechen', views: 89000, clicks: 32000, ctr: 35.9 },
  { rank: 3, name: 'Emily Davis', username: '@emilyd', views: 62000, clicks: 21000, ctr: 33.8 },
  { rank: 4, name: 'Alex Rivera', username: '@alexr', views: 48000, clicks: 15000, ctr: 31.2 },
  { rank: 5, name: 'Jordan Lee', username: '@jordanl', views: 35000, clicks: 11000, ctr: 31.4 },
  { rank: 6, name: 'Taylor Swift', username: '@taylor', views: 950000, clicks: 320000, ctr: 33.7 },
  { rank: 7, name: 'Chris Brown', username: '@chrisb', views: 28000, clicks: 8500, ctr: 30.4 },
  { rank: 8, name: 'Jessica Alba', username: '@jessicaa', views: 25000, clicks: 7200, ctr: 28.8 },
];

const countryData = [
  { country: 'United States', flag: '🇺🇸', views: 450000, percentage: 37.5 },
  { country: 'United Kingdom', flag: '🇬🇧', views: 180000, percentage: 15.0 },
  { country: 'Canada', flag: '🇨🇦', views: 120000, percentage: 10.0 },
  { country: 'Germany', flag: '🇩🇪', views: 96000, percentage: 8.0 },
  { country: 'France', flag: '🇫🇷', views: 84000, percentage: 7.0 },
  { country: 'Australia', flag: '🇦🇺', views: 72000, percentage: 6.0 },
  { country: 'Others', flag: '🌍', views: 198000, percentage: 16.5 },
];

const deviceData = [
  { device: 'Mobile', icon: Smartphone, percentage: 68, color: 'bg-primary' },
  { device: 'Desktop', icon: Monitor, percentage: 28, color: 'bg-accent' },
  { device: 'Tablet', icon: Monitor, percentage: 4, color: 'bg-muted' },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Platform Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Global platform performance and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
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

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Traffic by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card lg:col-span-1"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Traffic by Country
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {countryData.map((country) => (
              <div key={country.country} className="flex items-center gap-3">
                <span className="text-xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{country.country}</span>
                    <span className="text-sm text-muted-foreground">{country.percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Device Breakdown
            </h2>
          </div>
          <div className="p-6">
            <div className="flex justify-center gap-4 mb-8">
              {deviceData.map((device) => (
                <div key={device.device} className="text-center">
                  <div className={`w-20 h-20 rounded-full ${device.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl font-bold text-white">{device.percentage}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{device.device}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {deviceData.map((device) => (
                <div key={device.device} className="flex items-center gap-3">
                  <device.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{device.device}</span>
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${device.color} rounded-full`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{device.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Traffic Trend
            </h2>
          </div>
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Interactive charts coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Profiles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Top Performing Profiles</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProfiles.map((profile) => (
              <TableRow key={profile.rank}>
                <TableCell>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    profile.rank <= 3 
                      ? 'gradient-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {profile.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{profile.views.toLocaleString()}</TableCell>
                <TableCell className="text-right font-medium">{profile.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className="text-success font-medium">{profile.ctr}%</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
