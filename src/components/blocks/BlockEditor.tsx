import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Block } from '@/hooks/useLinkProfile';
import SortableBlock from './SortableBlock';
import AddBlockDialog from './AddBlockDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BlockEditorProps {
  blocks: Block[];
  onAddBlock: (block: Partial<Block>) => Promise<Block | null>;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
  onReorderBlocks: (newOrder: Block[]) => Promise<void>;
}

export default function BlockEditor({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
}: BlockEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newOrder = arrayMove(blocks, oldIndex, newIndex);
      onReorderBlocks(newOrder);
    }
  };

  const handleAddBlock = async (block: Partial<Block>) => {
    await onAddBlock(block);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Block Button */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="w-full h-14 border-2 border-dashed border-border bg-transparent hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
        variant="ghost"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Block
      </Button>

      {/* Blocks List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <SortableBlock
                  block={block}
                  onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center py-12 glass-card">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No blocks yet
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Add your first block to start building your link-in-bio page
          </p>
        </div>
      )}

      {/* Add Block Dialog */}
      <AddBlockDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddBlock}
      />
    </div>
  );
}
