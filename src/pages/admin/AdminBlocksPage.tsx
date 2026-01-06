import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Blocks,
  Link,
  Type,
  Image,
  Video,
  Music,
  Phone,
  Code,
  Star,
  Grid3X3,
  Minus,
  Calendar,
  ToggleLeft,
  Lock,
  Unlock,
  FlaskConical,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const blockTypes = [
  { id: 'cta_button', name: 'CTA Button', icon: Link, enabled: true, beta: false, description: 'Primary call-to-action links' },
  { id: 'icon_link', name: 'Icon Link', icon: Link, enabled: true, beta: false, description: 'Links with custom icons' },
  { id: 'text_block', name: 'Text Block', icon: Type, enabled: true, beta: false, description: 'Rich text content' },
  { id: 'image_block', name: 'Image Block', icon: Image, enabled: true, beta: false, description: 'Image display with captions' },
  { id: 'video_embed', name: 'Video Embed', icon: Video, enabled: true, beta: false, description: 'YouTube, Vimeo embeds' },
  { id: 'spotify_embed', name: 'Spotify Embed', icon: Music, enabled: true, beta: false, description: 'Music & podcast embeds' },
  { id: 'contact_button', name: 'Contact Button', icon: Phone, enabled: true, beta: false, description: 'Call, WhatsApp, Email' },
  { id: 'custom_html', name: 'Custom HTML', icon: Code, enabled: false, beta: false, description: 'Advanced custom code' },
  { id: 'featured_card', name: 'Featured Card', icon: Star, enabled: true, beta: false, description: 'Highlighted content cards' },
  { id: 'carousel', name: 'Carousel', icon: Grid3X3, enabled: true, beta: true, description: 'Multiple links in slider' },
  { id: 'divider', name: 'Section Divider', icon: Minus, enabled: true, beta: false, description: 'Visual separators' },
  { id: 'scheduled_link', name: 'Scheduled Link', icon: Calendar, enabled: true, beta: true, description: 'Time-based visibility' },
];

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState(blockTypes);
  const [maxBlocksPerProfile, setMaxBlocksPerProfile] = useState(50);

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, enabled: !block.enabled } : block
    ));
  };

  const enabledCount = blocks.filter(b => b.enabled).length;
  const betaCount = blocks.filter(b => b.beta).length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Blocks className="w-7 h-7 text-primary" />
            Block Controls
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage available block types and limits for clients
          </p>
        </div>
        
        <Button className="gradient-primary text-primary-foreground">
          <Settings className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Block Types', value: blocks.length, icon: Blocks, color: 'text-primary' },
          { label: 'Enabled', value: enabledCount, icon: Unlock, color: 'text-success' },
          { label: 'Disabled', value: blocks.length - enabledCount, icon: Lock, color: 'text-muted-foreground' },
          { label: 'Beta Features', value: betaCount, icon: FlaskConical, color: 'text-warning' },
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

      {/* Global Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Global Limits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Max Blocks Per Profile</Label>
            <Input 
              type="number"
              value={maxBlocksPerProfile}
              onChange={(e) => setMaxBlocksPerProfile(Number(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Limit how many blocks each client can add
            </p>
          </div>
          <div>
            <Label>Max Featured Blocks</Label>
            <Input type="number" defaultValue={3} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              Maximum highlighted/featured blocks
            </p>
          </div>
          <div>
            <Label>Max Video Embeds</Label>
            <Input type="number" defaultValue={5} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              Limit video embeds for performance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Block Types Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`transition-all ${block.enabled ? '' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      block.enabled ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <block.icon className={`w-5 h-5 ${block.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {block.name}
                        {block.beta && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                            Beta
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <Switch 
                    checked={block.enabled}
                    onCheckedChange={() => toggleBlock(block.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{block.description}</CardDescription>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary" className="text-xs">
                    {block.enabled ? 'Available to clients' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="mt-8 flex gap-4">
        <Button 
          variant="outline"
          onClick={() => setBlocks(prev => prev.map(b => ({ ...b, enabled: true })))}
        >
          <ToggleLeft className="w-4 h-4 mr-2" />
          Enable All
        </Button>
        <Button 
          variant="outline"
          onClick={() => setBlocks(prev => prev.map(b => ({ ...b, enabled: !b.beta })))}
        >
          <FlaskConical className="w-4 h-4 mr-2" />
          Disable Beta Only
        </Button>
      </div>
    </div>
  );
}
