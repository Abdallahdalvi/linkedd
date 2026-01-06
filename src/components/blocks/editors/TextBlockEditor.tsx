import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TextBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function TextBlockEditor({ block, onSave, onCancel }: TextBlockEditorProps) {
  const existingContent = block?.content as { text_size?: string; text_align?: string } | undefined;
  
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    textSize: existingContent?.text_size || 'normal',
    textAlign: existingContent?.text_align || 'center',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'text',
      title: form.title,
      subtitle: form.subtitle,
      content: { 
        text_size: form.textSize, 
        text_align: form.textAlign 
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Heading</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Section heading (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Text Content *</Label>
        <Textarea
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Write your text here..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Text Size</Label>
          <Select value={form.textSize} onValueChange={(v) => setForm({ ...form, textSize: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select value={form.textAlign} onValueChange={(v) => setForm({ ...form, textAlign: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 bg-secondary rounded-lg">
        <p className="text-sm font-medium mb-2">Preview</p>
        <div 
          className={`text-${form.textAlign}`}
          style={{ textAlign: form.textAlign as 'left' | 'center' | 'right' }}
        >
          {form.title && (
            <h3 className={`font-semibold mb-1 ${
              form.textSize === 'small' ? 'text-sm' : 
              form.textSize === 'large' ? 'text-lg' : 'text-base'
            }`}>
              {form.title}
            </h3>
          )}
          <p className={`text-muted-foreground ${
            form.textSize === 'small' ? 'text-xs' : 
            form.textSize === 'large' ? 'text-base' : 'text-sm'
          }`}>
            {form.subtitle || 'Your text will appear here...'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.subtitle}>
          {block?.id ? 'Save Changes' : 'Add Text Block'}
        </Button>
      </div>
    </form>
  );
}
