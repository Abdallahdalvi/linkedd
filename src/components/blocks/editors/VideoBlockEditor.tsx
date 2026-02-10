import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Video, Youtube, Play } from 'lucide-react';
import DataCollectionSettings, { DataCollectionConfig } from './DataCollectionSettings';

interface VideoBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

const getVideoType = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'other';
};

const getVideoThumbnail = (url: string): string => {
  const type = getVideoType(url);
  if (type === 'youtube') {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return '';
};

export default function VideoBlockEditor({ block, onSave, onCancel }: VideoBlockEditorProps) {
  const existingContent = (block?.content || {}) as Record<string, unknown>;
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    url: block?.url || '',
    thumbnail_url: block?.thumbnail_url || '',
  });
  const [dataCollection, setDataCollection] = useState<DataCollectionConfig>({
    data_gate_enabled: (existingContent.data_gate_enabled as boolean) ?? false,
    collect_name: (existingContent.collect_name as boolean) ?? true,
    collect_email: (existingContent.collect_email as boolean) ?? true,
    collect_phone: (existingContent.collect_phone as boolean) ?? false,
  });

  const handleUrlChange = (url: string) => {
    const thumbnail = getVideoThumbnail(url);
    setForm({ 
      ...form, 
      url, 
      thumbnail_url: thumbnail || form.thumbnail_url 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'video',
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
      thumbnail_url: form.thumbnail_url,
      content: { video_type: getVideoType(form.url), ...dataCollection },
    });
  };

  const videoType = getVideoType(form.url);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Watch my latest video"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="A short description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Video URL *</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="pl-10"
            required
          />
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Vimeo, TikTok, and more
        </p>
      </div>

      {form.url && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
            {form.thumbnail_url ? (
              <>
                <img 
                  src={form.thumbnail_url} 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-foreground ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                {videoType === 'youtube' ? (
                  <Youtube className="w-8 h-8 text-red-500" />
                ) : (
                  <Video className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground capitalize">{videoType} video</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Custom Thumbnail URL</Label>
        <Input
          id="thumbnail"
          type="url"
          value={form.thumbnail_url}
          onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          placeholder="https://... (auto-fetched for YouTube)"
        />
      </div>

      <DataCollectionSettings config={dataCollection} onChange={setDataCollection} />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title || !form.url}>
          {block?.id ? 'Save Changes' : 'Add Video'}
        </Button>
      </div>
    </form>
  );
}
