import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface MusicBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

const getMusicType = (url: string): string => {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  if (url.includes('music.apple.com')) return 'apple_music';
  if (url.includes('deezer.com')) return 'deezer';
  return 'other';
};

export default function MusicBlockEditor({ block, onSave, onCancel }: MusicBlockEditorProps) {
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    url: block?.url || '',
    thumbnail_url: block?.thumbnail_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'music',
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
      thumbnail_url: form.thumbnail_url,
      content: { music_type: getMusicType(form.url) },
    });
  };

  const musicType = getMusicType(form.url);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Track/Album Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="My Latest Track"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Artist / Description</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Artist Name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Music URL *</Label>
        <div className="relative">
          <Input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://open.spotify.com/track/..."
            className="pl-10"
            required
          />
          <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Supports Spotify, SoundCloud, Apple Music, and more
        </p>
      </div>

      {form.url && (
        <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium capitalize">{musicType.replace('_', ' ')}</p>
            <p className="text-xs text-muted-foreground">Detected platform</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Cover Art</Label>
        <ImageUpload
          currentImage={form.thumbnail_url}
          onUpload={(url) => setForm({ ...form, thumbnail_url: url })}
          folder="music-covers"
          aspectRatio="square"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title || !form.url}>
          {block?.id ? 'Save Changes' : 'Add Music'}
        </Button>
      </div>
    </form>
  );
}
