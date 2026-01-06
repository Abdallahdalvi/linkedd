import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  MousePointerClick,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobilePreview from '@/components/MobilePreview';
import AddBlockDialog from '@/components/blocks/AddBlockDialog';
import { useState } from 'react';

interface DashboardLinksPageProps {
  profile: any;
  blocks: any[];
  onAddBlock: (block: any) => Promise<any>;
  onUpdateBlock: (id: string, updates: any) => Promise<void>;
  onDeleteBlock: (id: string) => Promise<void>;
}

export default function DashboardLinksPage({
  profile,
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
}: DashboardLinksPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredBlocks = blocks.filter(block =>
    (block.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (block.url?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const enabledCount = blocks.filter(b => b.is_enabled).length;
  const totalClicks = blocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0);

  const handleToggleBlock = (id: string, currentState: boolean) => {
    onUpdateBlock(id, { is_enabled: !currentState });
  };

  const handleToggleFeatured = (id: string, currentState: boolean) => {
    onUpdateBlock(id, { is_featured: !currentState });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <LinkIcon className="w-7 h-7 text-primary" />
            Links & Blocks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your links, buttons, and content blocks
          </p>
        </div>
        
        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Block
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Blocks', value: blocks.length, icon: LinkIcon, color: 'text-primary' },
          { label: 'Active', value: enabledCount, icon: Eye, color: 'text-success' },
          { label: 'Hidden', value: blocks.length - enabledCount, icon: EyeOff, color: 'text-muted-foreground' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-accent' },
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

      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Left: Blocks List */}
        <div>
          {/* Search & Filter */}
          <div className="glass-card p-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search blocks..." 
                  className="pl-10"
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

          {/* Blocks List */}
          <div className="space-y-3">
            {filteredBlocks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No blocks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding links and content to your profile
                </p>
                <Button 
                  className="gradient-primary text-primary-foreground"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Block
                </Button>
              </motion.div>
            ) : (
              filteredBlocks.map((block, i) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-4 ${!block.is_enabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-muted-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">
                          {block.title || 'Untitled Block'}
                        </h3>
                        {block.is_featured && (
                          <Star className="w-4 h-4 text-warning fill-warning" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {block.type}
                        </Badge>
                      </div>
                      {block.url && (
                        <p className="text-sm text-muted-foreground truncate">{block.url}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {block.total_clicks || 0} clicks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={block.is_enabled}
                        onCheckedChange={() => handleToggleBlock(block.id, block.is_enabled)}
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Block
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(block.id, block.is_featured)}>
                            <Star className="w-4 h-4 mr-2" />
                            {block.is_featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          {block.url && (
                            <DropdownMenuItem asChild>
                              <a href={block.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Link
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onDeleteBlock(block.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
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

      <AddBlockDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={async (block) => {
          await onAddBlock(block);
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
}
