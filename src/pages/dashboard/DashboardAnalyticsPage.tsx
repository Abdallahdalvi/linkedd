import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Link as LinkIcon,
  ShoppingBag,
  DollarSign,
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

interface DashboardAnalyticsPageProps {
  profile: any;
  blocks: any[];
}

const countryData = [
  { country: 'United States', flag: '🇺🇸', views: 450, percentage: 45 },
  { country: 'United Kingdom', flag: '🇬🇧', views: 180, percentage: 18 },
  { country: 'Canada', flag: '🇨🇦', views: 120, percentage: 12 },
  { country: 'Germany', flag: '🇩🇪', views: 96, percentage: 10 },
  { country: 'Others', flag: '🌍', views: 150, percentage: 15 },
];

const deviceData = [
  { device: 'Mobile', icon: Smartphone, percentage: 72, color: 'bg-primary' },
  { device: 'Desktop', icon: Monitor, percentage: 24, color: 'bg-accent' },
  { device: 'Tablet', icon: Monitor, percentage: 4, color: 'bg-muted' },
];

const referrerData = [
  { source: 'Instagram', visits: 320, percentage: 40 },
  { source: 'Twitter/X', visits: 180, percentage: 22 },
  { source: 'Direct', visits: 150, percentage: 19 },
  { source: 'TikTok', visits: 100, percentage: 12 },
  { source: 'Other', visits: 50, percentage: 7 },
];

export default function DashboardAnalyticsPage({ profile, blocks }: DashboardAnalyticsPageProps) {
  const totalViews = profile?.total_views || 0;
  const totalClicks = blocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  const topLinks = [...blocks]
    .sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))
    .slice(0, 5);

  // Shop-specific analytics
  const shopBlocks = blocks.filter(b => b.type === 'shop');
  const shopClicks = shopBlocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0);
  const topProducts = [...shopBlocks]
    .sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your profile performance and engagement
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
        {[
          { label: 'Profile Views', value: totalViews.toLocaleString(), change: '+18%', trend: 'up', icon: Eye },
          { label: 'Link Clicks', value: totalClicks.toLocaleString(), change: '+24%', trend: 'up', icon: MousePointerClick },
          { label: 'Click Rate (CTR)', value: `${ctr}%`, change: '+5%', trend: 'up', icon: TrendingUp },
          { label: 'Unique Visitors', value: Math.floor(totalViews * 0.7).toLocaleString(), change: '+12%', trend: 'up', icon: Globe },
        ].map((stat, i) => (
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
          className="glass-card"
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
                  <div className={`w-16 h-16 rounded-full ${device.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-lg font-bold text-white">{device.percentage}%</span>
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
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${device.color} rounded-full`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-10 text-right">{device.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Traffic Sources
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {referrerData.map((ref) => (
              <div key={ref.source} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{ref.source}</span>
                    <span className="text-sm text-muted-foreground">{ref.visits} visits</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${ref.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Performing Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            Top Performing Links
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No link data yet. Add some links to start tracking!
                </TableCell>
              </TableRow>
            ) : (
              topLinks.map((link, index) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      index < 3 
                        ? 'gradient-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{link.title || 'Untitled'}</p>
                      {link.url && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{link.url}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{link.total_clicks || 0}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-success font-medium">
                      {totalViews > 0 ? (((link.total_clicks || 0) / totalViews) * 100).toFixed(1) : 0}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Shop Analytics */}
      {shopBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card mt-8"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Shop Analytics
            </h2>
          </div>
          
          {/* Shop Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Products</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{shopBlocks.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Product Clicks</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{shopClicks}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Click Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {totalViews > 0 ? ((shopClicks / totalViews) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Avg. Price</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                ${shopBlocks.length > 0 
                  ? (shopBlocks.reduce((acc, b) => acc + parseFloat((b.content as any)?.price || '0'), 0) / shopBlocks.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>

          {/* Top Products Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No product data yet. Add shop blocks to start tracking!
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((product, index) => {
                  const productContent = product.content as { price?: string; currency?: string } | undefined;
                  const currencySymbols: Record<string, string> = {
                    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$',
                  };
                  const symbol = currencySymbols[productContent?.currency || 'USD'] || '$';
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          index < 3 
                            ? 'gradient-primary text-primary-foreground' 
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.title || 'Untitled Product'}</p>
                            {product.subtitle && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">{product.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {symbol}{productContent?.price || '0.00'}
                      </TableCell>
                      <TableCell className="text-right font-medium">{product.total_clicks || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-success font-medium">
                          {totalViews > 0 ? (((product.total_clicks || 0) / totalViews) * 100).toFixed(1) : 0}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
