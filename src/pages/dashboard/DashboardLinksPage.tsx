import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  MousePointerClick,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobilePreview from '@/components/MobilePreview';
import AddBlockDialog from '@/components/blocks/AddBlockDialog';
import SortableBlock from '@/components/blocks/SortableBlock';
import { Block } from '@/hooks/useLinkProfile';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DashboardLinksPageProps {
  profile: any;
  blocks: Block[];
  onAddBlock: (block: Partial<Block>) => Promise<any>;
  onUpdateBlock: (id: string, updates: Partial<Block>) => Promise<void>;
  onDeleteBlock: (id: string) => Promise<void>;
  onReorderBlocks?: (blocks: Block[]) => Promise<void>;
}

export default function DashboardLinksPage({
  profile,
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
}: DashboardLinksPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredBlocks = blocks.filter(block =>
    (block.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (block.url?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const enabledCount = blocks.filter(b => b.is_enabled).length;
  const totalClicks = blocks.reduce((acc, b) => acc + (b.total_clicks || 0), 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onReorderBlocks?.(newBlocks);
    }
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredBlocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {filteredBlocks.map((block, i) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <SortableBlock
                        block={block}
                        onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                        onDelete={() => onDeleteBlock(block.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
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
