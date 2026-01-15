import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';
import { Block } from '@/hooks/useLinkProfile';
import { Download, Clock, FileText, Image as ImageIcon, Video, Music, Archive, FileCode } from 'lucide-react';

interface DownloadBlockEditorProps {
  block?: Partial<Block>;
  onSave: (block: Partial<Block>) => void;
  onCancel: () => void;
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  document: FileText,
  image: ImageIcon,
  video: Video,
  audio: Music,
  archive: Archive,
  code: FileCode,
  other: Download,
};

const adDurations = [
  { value: '3', label: '3 seconds' },
  { value: '5', label: '5 seconds (recommended)' },
  { value: '10', label: '10 seconds' },
  { value: '15', label: '15 seconds' },
];

export default function DownloadBlockEditor({ block, onSave, onCancel }: DownloadBlockEditorProps) {
  const content = block?.content as {
    file_url?: string;
    file_type?: string;
    file_size?: string;
    ad_enabled?: boolean;
    ad_type?: 'google' | 'custom';
    ad_duration?: number;
    ad_image_url?: string;
    ad_link_url?: string;
    ad_text?: string;
    // AdMob fields
    admob_rewarded_id_ios?: string;
    admob_rewarded_id_android?: string;
  } | undefined;

  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    thumbnail_url: block?.thumbnail_url || '',
    file_url: content?.file_url || '',
    file_type: content?.file_type || 'other',
    file_size: content?.file_size || '',
    ad_enabled: content?.ad_enabled ?? true,
    ad_type: content?.ad_type || 'custom' as 'google' | 'custom',
    ad_duration: content?.ad_duration || 5,
    ad_image_url: content?.ad_image_url || '',
    ad_link_url: content?.ad_link_url || '',
    ad_text: content?.ad_text || 'This download is sponsored by:',
    // AdMob fields
    admob_rewarded_id_ios: content?.admob_rewarded_id_ios || '',
    admob_rewarded_id_android: content?.admob_rewarded_id_android || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'download',
      title: form.title,
      subtitle: form.subtitle,
      thumbnail_url: form.thumbnail_url,
      url: form.file_url, // Main URL is the file URL
      content: {
        file_url: form.file_url,
        file_type: form.file_type,
        file_size: form.file_size,
        ad_enabled: form.ad_enabled,
        ad_type: form.ad_type,
        ad_duration: form.ad_duration,
        ad_image_url: form.ad_image_url,
        ad_link_url: form.ad_link_url,
        ad_text: form.ad_text,
        admob_rewarded_id_ios: form.admob_rewarded_id_ios,
        admob_rewarded_id_android: form.admob_rewarded_id_android,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File Details Section */}
      <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Download className="w-4 h-4" />
          File Details
        </h4>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="My Awesome Download"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Description</Label>
          <Input
            id="subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="PDF guide, 2.5 MB"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file_url">File URL *</Label>
          <Input
            id="file_url"
            type="url"
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })}
            placeholder="https://example.com/file.pdf"
            required
          />
          <p className="text-xs text-muted-foreground">
            Direct link to your file (PDF, APK, ZIP, etc.)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="file_type">File Type</Label>
            <Select
              value={form.file_type}
              onValueChange={(value) => setForm({ ...form, file_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="archive">Archive (ZIP/RAR)</SelectItem>
                <SelectItem value="code">Code/App</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_size">File Size</Label>
            <Input
              id="file_size"
              value={form.file_size}
              onChange={(e) => setForm({ ...form, file_size: e.target.value })}
              placeholder="2.5 MB"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Thumbnail Image</Label>
          <ImageUpload
            currentImage={form.thumbnail_url}
            onUpload={(url) => setForm({ ...form, thumbnail_url: url })}
            folder="block-thumbnails"
            aspectRatio="square"
          />
        </div>
      </div>

      {/* Reward Ad Section */}
      <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Reward Ad (Monetization)
          </h4>
          <Switch
            checked={form.ad_enabled}
            onCheckedChange={(checked) => setForm({ ...form, ad_enabled: checked })}
          />
        </div>

        {form.ad_enabled && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-muted-foreground">
              Show a short ad before download starts. Great for monetizing free downloads!
            </p>

            {/* Ad Type Selector */}
            <div className="space-y-2">
              <Label>Ad Type</Label>
              <Select
                value={form.ad_type}
                onValueChange={(value: 'google' | 'custom') => setForm({ ...form, ad_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">
                    <div className="flex items-center gap-2">
                      <span>🔷</span>
                      <span>Google Ads (AdMob/AdSense)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <span>🎨</span>
                      <span>Custom Ad (Your own banner)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Google Ads Section */}
            {form.ad_type === 'google' && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-1">🔷 Google Ads</h5>
                  <p className="text-xs text-muted-foreground">
                    Google controls the ad content, banner, and duration. You just provide the Ad Unit IDs.
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ <strong>Note:</strong> Google shows their own ads automatically. You cannot customize the banner image or duration - Google optimizes this for best revenue.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="admob_ios" className="text-sm">📱 iOS Rewarded Ad ID (AdMob)</Label>
                    <Input
                      id="admob_ios"
                      value={form.admob_rewarded_id_ios}
                      onChange={(e) => setForm({ ...form, admob_rewarded_id_ios: e.target.value })}
                      placeholder="ca-app-pub-XXXXXXXX/YYYYYYYY"
                    />
                    <p className="text-xs text-muted-foreground">For native iOS app only</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admob_android" className="text-sm">🤖 Android Rewarded Ad ID (AdMob)</Label>
                    <Input
                      id="admob_android"
                      value={form.admob_rewarded_id_android}
                      onChange={(e) => setForm({ ...form, admob_rewarded_id_android: e.target.value })}
                      placeholder="ca-app-pub-XXXXXXXX/ZZZZZZZZ"
                    />
                    <p className="text-xs text-muted-foreground">For native Android app only</p>
                  </div>
                </div>

                <div className="p-3 bg-secondary/50 rounded">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Web visitors:</strong> Will see AdSense ads if configured in your app settings, or a simple countdown timer before download.
                  </p>
                </div>
              </div>
            )}

            {/* Custom Ad Section */}
            {form.ad_type === 'custom' && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-1">🎨 Custom Ad</h5>
                  <p className="text-xs text-muted-foreground">
                    You control everything - upload your own banner, set duration, and link to your sponsor.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad_duration">Ad Duration</Label>
                    <Select
                      value={String(form.ad_duration)}
                      onValueChange={(value) => setForm({ ...form, ad_duration: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {adDurations.map((dur) => (
                          <SelectItem key={dur.value} value={dur.value}>
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad_text">Ad Text</Label>
                    <Input
                      id="ad_text"
                      value={form.ad_text}
                      onChange={(e) => setForm({ ...form, ad_text: e.target.value })}
                      placeholder="This download is sponsored by:"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ad Banner Image *</Label>
                    <ImageUpload
                      currentImage={form.ad_image_url}
                      onUpload={(url) => setForm({ ...form, ad_image_url: url })}
                      folder="ad-images"
                      aspectRatio="video"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your sponsor's banner (recommended: 728x90 or 300x250)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad_link_url">Ad Click URL</Label>
                    <Input
                      id="ad_link_url"
                      type="url"
                      value={form.ad_link_url}
                      onChange={(e) => setForm({ ...form, ad_link_url: e.target.value })}
                      placeholder="https://sponsor.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Where users go when they click your ad
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-primary">
          {block?.id ? 'Save Changes' : 'Add Download'}
        </Button>
      </div>
    </form>
  );
}
