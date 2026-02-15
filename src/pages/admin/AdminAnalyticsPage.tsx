import { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/schema-prefix';

interface TopProfile {
  rank: number;
  name: string;
  username: string;
  views: number;
  clicks: number;
  ctr: number;
}

interface CountryData {
  country: string;
  flag: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  icon: typeof Smartphone;
  percentage: number;
  color: string;
}

const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Australia': '🇦🇺',
  'India': '🇮🇳',
  'Brazil': '🇧🇷',
  'Japan': '🇯🇵',
  'Others': '🌍',
};

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [topProfiles, setTopProfiles] = useState<TopProfile[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch total page views
      const { data: viewsData } = await supabase
        .from(t('analytics_events'))
        .select('id')
        .eq('event_type', 'page_view');

      // Fetch total clicks
      const { data: clicksData } = await supabase
        .from(t('analytics_events'))
        .select('id')
        .eq('event_type', 'link_click');

      // Fetch active users count
      const { count: usersCount } = await supabase
        .from(t('profiles'))
        .select('*', { count: 'exact', head: true })
        .eq('is_suspended', false);

      setTotalViews(viewsData?.length || 0);
      setTotalClicks(clicksData?.length || 0);
      setActiveUsers(usersCount || 0);

      // Fetch top profiles by views
      const { data: profilesData } = await supabase
        .from(t('link_profiles'))
        .select('id, username, display_name, total_views')
        .order('total_views', { ascending: false })
        .limit(8);

      if (profilesData) {
        const profilesWithClicks = await Promise.all(
          profilesData.map(async (profile, index) => {
            const { count: clickCount } = await supabase
              .from(t('analytics_events'))
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
        setTopProfiles(profilesWithClicks);
      }

      // Fetch country data
      const { data: countryAnalytics } = await supabase
        .from(t('analytics_events'))
        .select('country')
        .not('country', 'is', null);

      if (countryAnalytics) {
        const countryCounts: Record<string, number> = {};
        countryAnalytics.forEach((event) => {
          const country = event.country || 'Unknown';
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        });

        const totalCountryViews = Object.values(countryCounts).reduce((a, b) => a + b, 0);
        const sortedCountries = Object.entries(countryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([country, views]) => ({
            country,
            flag: countryFlags[country] || '🌍',
            views,
            percentage: totalCountryViews > 0 ? Math.round((views / totalCountryViews) * 100) : 0,
          }));

        // Add "Others" if there are more countries
        if (Object.keys(countryCounts).length > 6) {
          const topViews = sortedCountries.reduce((a, b) => a + b.views, 0);
          sortedCountries.push({
            country: 'Others',
            flag: '🌍',
            views: totalCountryViews - topViews,
            percentage: Math.round(((totalCountryViews - topViews) / totalCountryViews) * 100),
          });
        }

        setCountryData(sortedCountries);
      }

      // Fetch device data
      const { data: deviceAnalytics } = await supabase
        .from(t('analytics_events'))
        .select('device_type')
        .not('device_type', 'is', null);

      if (deviceAnalytics) {
        const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
        deviceAnalytics.forEach((event) => {
          const device = event.device_type || 'Desktop';
          if (device.toLowerCase().includes('mobile')) {
            deviceCounts['Mobile']++;
          } else if (device.toLowerCase().includes('tablet')) {
            deviceCounts['Tablet']++;
          } else {
            deviceCounts['Desktop']++;
          }
        });

        const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
        setDeviceData([
          { device: 'Mobile', icon: Smartphone, percentage: totalDevices > 0 ? Math.round((deviceCounts['Mobile'] / totalDevices) * 100) : 0, color: 'bg-primary' },
          { device: 'Desktop', icon: Monitor, percentage: totalDevices > 0 ? Math.round((deviceCounts['Desktop'] / totalDevices) * 100) : 0, color: 'bg-accent' },
          { device: 'Tablet', icon: Monitor, percentage: totalDevices > 0 ? Math.round((deviceCounts['Tablet'] / totalDevices) * 100) : 0, color: 'bg-muted' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const avgCtr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

  const overviewStats = [
    { label: 'Total Views', value: formatNumber(totalViews), change: '+0%', trend: 'up', icon: Eye },
    { label: 'Total Clicks', value: formatNumber(totalClicks), change: '+0%', trend: 'up', icon: MousePointerClick },
    { label: 'Avg. CTR', value: `${avgCtr}%`, change: '+0%', trend: 'up', icon: TrendingUp },
    { label: 'Active Users', value: formatNumber(activeUsers), change: '+0%', trend: 'up', icon: Users },
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
              <div className={`flex items-center gap-1 text-sm text-success`}>
                <ArrowUpRight className="w-4 h-4" />
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
            {countryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No country data available</p>
            ) : (
              countryData.map((country) => (
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
              ))
            )}
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
            {topProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              topProfiles.map((profile) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
