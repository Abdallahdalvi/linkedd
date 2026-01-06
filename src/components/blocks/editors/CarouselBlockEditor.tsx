import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/ImageUpload';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselItem {
  id: string;
  image_url: string;
  title: string;
  url: string;
}

interface CarouselBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function CarouselBlockEditor({ block, onSave, onCancel }: CarouselBlockEditorProps) {
  const existingItems = (block?.content as { items?: CarouselItem[] })?.items || [];
  
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
  });

  const [items, setItems] = useState<CarouselItem[]>(
    existingItems.length > 0 ? existingItems : [
      { id: crypto.randomUUID(), image_url: '', title: '', url: '' }
    ]
  );

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), image_url: '', title: '', url: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<CarouselItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'carousel',
      title: form.title,
      subtitle: form.subtitle,
      content: { items: items.filter(item => item.image_url || item.title) },
    });
  };

  const validItems = items.filter(item => item.image_url || item.title);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Carousel Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Featured Products"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Check out our latest collection"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Carousel Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-lg p-4 space-y-3 bg-secondary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Item {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Image</Label>
                  <ImageUpload
                    currentImage={item.image_url}
                    onUpload={(url) => updateItem(item.id, { image_url: url })}
                    folder="carousel-images"
                    aspectRatio="video"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder="Item title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Link URL (optional)</Label>
                  <div className="relative">
                    <Input
                      type="url"
                      value={item.url}
                      onChange={(e) => updateItem(item.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="pl-10"
                    />
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {validItems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Add at least one item with an image or title
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={validItems.length === 0}>
          {block?.id ? 'Save Changes' : 'Add Carousel'}
        </Button>
      </div>
    </form>
  );
}
