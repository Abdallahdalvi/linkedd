import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Code, AlertTriangle } from 'lucide-react';

interface HtmlBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function HtmlBlockEditor({ block, onSave, onCancel }: HtmlBlockEditorProps) {
  const existingContent = block?.content as { html?: string } | undefined;

  const [form, setForm] = useState({
    title: block?.title || 'Custom Embed',
    htmlCode: existingContent?.html || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'html',
      title: form.title,
      content: { html: form.htmlCode },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium">Custom HTML/Embed</p>
          <p className="text-xs text-muted-foreground">
            Only use trusted embed codes. Malicious code can harm your visitors.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Block Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Custom Embed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="html" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          HTML/Embed Code *
        </Label>
        <Textarea
          id="html"
          value={form.htmlCode}
          onChange={(e) => setForm({ ...form, htmlCode: e.target.value })}
          placeholder='<iframe src="..." />'
          rows={8}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground">
          Paste embed codes from platforms like Twitter, Instagram, calendars, forms, etc.
        </p>
      </div>

      {form.htmlCode && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-4 bg-secondary rounded-lg border border-dashed">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Code className="w-4 h-4" />
              <span className="text-sm">HTML embed will render here</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.htmlCode}>
          {block?.id ? 'Save Changes' : 'Add Embed'}
        </Button>
      </div>
    </form>
  );
}
