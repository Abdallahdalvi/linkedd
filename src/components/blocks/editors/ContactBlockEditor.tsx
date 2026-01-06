import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Mail } from 'lucide-react';

interface ContactBlockEditorProps {
  block?: Partial<Block>;
  contactType: 'contact_call' | 'contact_whatsapp' | 'contact_email';
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

const contactConfig = {
  contact_call: {
    icon: Phone,
    label: 'Phone Number',
    placeholder: '+1 234 567 8900',
    prefix: 'tel:',
    defaultTitle: 'Call Me',
  },
  contact_whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp Number',
    placeholder: '+1234567890',
    prefix: 'https://wa.me/',
    defaultTitle: 'Message on WhatsApp',
  },
  contact_email: {
    icon: Mail,
    label: 'Email Address',
    placeholder: 'hello@example.com',
    prefix: 'mailto:',
    defaultTitle: 'Send Email',
  },
};

export default function ContactBlockEditor({ 
  block, 
  contactType, 
  onSave, 
  onCancel 
}: ContactBlockEditorProps) {
  const config = contactConfig[contactType];
  const Icon = config.icon;

  // Extract the contact value from URL (remove prefix)
  const extractContact = (url: string | null | undefined) => {
    if (!url) return '';
    return url.replace(config.prefix, '').replace('https://wa.me/', '');
  };

  const [form, setForm] = useState({
    title: block?.title || config.defaultTitle,
    subtitle: block?.subtitle || '',
    contact: extractContact(block?.url),
    prefilledMessage: (block?.content as { message?: string })?.message || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let url = '';
    if (contactType === 'contact_call') {
      url = `tel:${form.contact.replace(/\s/g, '')}`;
    } else if (contactType === 'contact_whatsapp') {
      const cleanNumber = form.contact.replace(/\D/g, '');
      url = `https://wa.me/${cleanNumber}${form.prefilledMessage ? `?text=${encodeURIComponent(form.prefilledMessage)}` : ''}`;
    } else if (contactType === 'contact_email') {
      url = `mailto:${form.contact}${form.prefilledMessage ? `?subject=${encodeURIComponent(form.prefilledMessage)}` : ''}`;
    }

    onSave({
      type: contactType,
      title: form.title,
      subtitle: form.subtitle,
      url,
      content: { message: form.prefilledMessage },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Button Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={config.defaultTitle}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Available 9am - 5pm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">{config.label} *</Label>
        <div className="relative">
          <Input
            id="contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder={config.placeholder}
            className="pl-10"
            required
          />
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {(contactType === 'contact_whatsapp' || contactType === 'contact_email') && (
        <div className="space-y-2">
          <Label htmlFor="message">
            {contactType === 'contact_whatsapp' ? 'Pre-filled Message' : 'Subject Line'}
          </Label>
          <Input
            id="message"
            value={form.prefilledMessage}
            onChange={(e) => setForm({ ...form, prefilledMessage: e.target.value })}
            placeholder={contactType === 'contact_whatsapp' ? 'Hi! I found you via your link...' : 'Inquiry from your link page'}
          />
        </div>
      )}

      <div className="p-4 bg-secondary rounded-lg">
        <p className="text-sm font-medium mb-2">Preview</p>
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{form.title || config.defaultTitle}</p>
            {form.subtitle && (
              <p className="text-xs text-muted-foreground">{form.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title || !form.contact}>
          {block?.id ? 'Save Changes' : 'Add Contact'}
        </Button>
      </div>
    </form>
  );
}
