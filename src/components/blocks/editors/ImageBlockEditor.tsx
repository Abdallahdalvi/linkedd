import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';
import { ExternalLink } from 'lucide-react';

interface ImageBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function ImageBlockEditor({ block, onSave, onCancel }: ImageBlockEditorProps) {
  const existingContent = block?.content as { aspect_ratio?: string } | undefined;

  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    thumbnail_url: block?.thumbnail_url || '',
    url: block?.url || '',
    aspectRatio: existingContent?.aspect_ratio || 'auto',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'image',
      title: form.title,
      subtitle: form.subtitle,
      thumbnail_url: form.thumbnail_url,
      url: form.url,
      content: { aspect_ratio: form.aspectRatio },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Image *</Label>
        <ImageUpload
          currentImage={form.thumbnail_url}
          onUpload={(url) => setForm({ ...form, thumbnail_url: url })}
          folder="image-blocks"
          aspectRatio="video"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Caption/Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Image caption (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Description</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Short description (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Click Link (optional)</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://... (opens when image is clicked)"
            className="pl-10"
          />
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Aspect Ratio</Label>
        <Select value={form.aspectRatio} onValueChange={(v) => setForm({ ...form, aspectRatio: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Original)</SelectItem>
            <SelectItem value="square">Square (1:1)</SelectItem>
            <SelectItem value="video">Landscape (16:9)</SelectItem>
            <SelectItem value="portrait">Portrait (4:5)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.thumbnail_url}>
          {block?.id ? 'Save Changes' : 'Add Image'}
        </Button>
      </div>
    </form>
  );
}
