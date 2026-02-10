import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import { ExternalLink, Star } from 'lucide-react';
import DataCollectionSettings, { DataCollectionConfig } from './DataCollectionSettings';

interface FeaturedBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function FeaturedBlockEditor({ block, onSave, onCancel }: FeaturedBlockEditorProps) {
  const existingContent = (block?.content || {}) as Record<string, unknown>;
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    url: block?.url || '',
    thumbnail_url: block?.thumbnail_url || '',
    open_in_new_tab: block?.open_in_new_tab ?? true,
  });
  const [dataCollection, setDataCollection] = useState<DataCollectionConfig>({
    data_gate_enabled: (existingContent.data_gate_enabled as boolean) ?? false,
    collect_name: (existingContent.collect_name as boolean) ?? true,
    collect_email: (existingContent.collect_email as boolean) ?? true,
    collect_phone: (existingContent.collect_phone as boolean) ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'featured',
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
      thumbnail_url: form.thumbnail_url,
      open_in_new_tab: form.open_in_new_tab,
      is_featured: true,
      content: { ...existingContent, ...dataCollection },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-primary/10 rounded-lg flex items-start gap-3">
        <Star className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium">Featured Card</p>
          <p className="text-xs text-muted-foreground">
            This block will be highlighted with special styling
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="🔥 New Product Launch"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Check out our latest release"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com"
            className="pl-10"
          />
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Featured Image</Label>
        <ImageUpload
          currentImage={form.thumbnail_url}
          onUpload={(url) => setForm({ ...form, thumbnail_url: url })}
          folder="featured-images"
          aspectRatio="video"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
        <div>
          <p className="text-sm font-medium">Open in new tab</p>
          <p className="text-xs text-muted-foreground">Link opens in a new browser tab</p>
        </div>
        <Switch
          checked={form.open_in_new_tab}
          onCheckedChange={(checked) => setForm({ ...form, open_in_new_tab: checked })}
        />
      </div>

      <DataCollectionSettings config={dataCollection} onChange={setDataCollection} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title}>
          {block?.id ? 'Save Changes' : 'Add Featured Card'}
        </Button>
      </div>
    </form>
  );
}
