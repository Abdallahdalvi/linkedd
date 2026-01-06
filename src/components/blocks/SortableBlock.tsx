import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Link as LinkIcon,
  Type,
  Image,
  Star,
  Minus,
  MoreVertical,
} from 'lucide-react';
import { Block } from '@/hooks/useLinkProfile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SortableBlockProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

const blockTypeIcons: Record<string, typeof LinkIcon> = {
  link: LinkIcon,
  cta: ExternalLink,
  text: Type,
  image: Image,
  featured: Star,
  divider: Minus,
};

const blockTypeLabels: Record<string, string> = {
  link: 'Link',
  cta: 'CTA Button',
  text: 'Text Block',
  image: 'Image',
  featured: 'Featured Card',
  divider: 'Divider',
};

export default function SortableBlock({ block, onUpdate, onDelete }: SortableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: block.title || '',
    subtitle: block.subtitle || '',
    url: block.url || '',
    thumbnail_url: block.thumbnail_url || '',
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = blockTypeIcons[block.type] || LinkIcon;

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          glass-card p-4 transition-all duration-200
          ${isDragging ? 'opacity-50 shadow-xl scale-[1.02]' : ''}
          ${!block.is_enabled ? 'opacity-60' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Block Icon */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${block.is_featured ? 'gradient-primary' : 'bg-secondary'}
          `}>
            <Icon className={`w-5 h-5 ${block.is_featured ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </div>

          {/* Block Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {block.title || 'Untitled'}
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {blockTypeLabels[block.type] || block.type}
              </span>
            </div>
            {block.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{block.subtitle}</p>
            )}
            {block.url && (
              <p className="text-xs text-primary truncate">{block.url}</p>
            )}
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-1">
            {block.is_enabled ? (
              <Eye className="w-4 h-4 text-success" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <Switch
              checked={block.is_enabled}
              onCheckedChange={(checked) => onUpdate({ is_enabled: checked })}
            />
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate({ is_featured: !block.is_featured })}>
                <Star className="w-4 h-4 mr-2" />
                {block.is_featured ? 'Unfeature' : 'Feature'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{block.total_clicks}</span> clicks
          </div>
          {block.open_in_new_tab && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              New tab
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input
                id="subtitle"
                value={editForm.subtitle}
                onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                placeholder="Enter subtitle"
              />
            </div>
            {(block.type === 'link' || block.type === 'cta') && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnail"
                value={editForm.thumbnail_url}
                onChange={(e) => setEditForm({ ...editForm, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
