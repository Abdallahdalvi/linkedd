import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import { Clock, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function ScheduledBlockEditor({ block, onSave, onCancel }: ScheduledBlockEditorProps) {
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    url: block?.url || '',
    thumbnail_url: block?.thumbnail_url || '',
    schedule_start: block?.schedule_start ? format(new Date(block.schedule_start), "yyyy-MM-dd'T'HH:mm") : '',
    schedule_end: block?.schedule_end ? format(new Date(block.schedule_end), "yyyy-MM-dd'T'HH:mm") : '',
    open_in_new_tab: block?.open_in_new_tab ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'scheduled',
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
      thumbnail_url: form.thumbnail_url,
      schedule_start: form.schedule_start ? new Date(form.schedule_start).toISOString() : null,
      schedule_end: form.schedule_end ? new Date(form.schedule_end).toISOString() : null,
      open_in_new_tab: form.open_in_new_tab,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-primary/10 rounded-lg flex items-start gap-3">
        <Clock className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium">Scheduled Link</p>
          <p className="text-xs text-muted-foreground">
            This link will only be visible during the scheduled time period
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Limited time offer!"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Only available for 24 hours"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com/promo"
            className="pl-10"
            required
          />
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thumbnail Image</Label>
        <ImageUpload
          currentImage={form.thumbnail_url}
          onUpload={(url) => setForm({ ...form, thumbnail_url: url })}
          folder="scheduled-thumbnails"
          aspectRatio="square"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date/Time
          </Label>
          <Input
            id="start"
            type="datetime-local"
            value={form.schedule_start}
            onChange={(e) => setForm({ ...form, schedule_start: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            End Date/Time
          </Label>
          <Input
            id="end"
            type="datetime-local"
            value={form.schedule_end}
            onChange={(e) => setForm({ ...form, schedule_end: e.target.value })}
          />
        </div>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title || !form.url}>
          {block?.id ? 'Save Changes' : 'Add Scheduled Link'}
        </Button>
      </div>
    </form>
  );
}
