import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  ExternalLink,
  Type,
  Image,
  Star,
  Minus,
  Video,
  Music,
  Phone,
  MessageCircle,
  Mail,
  Code,
  Columns,
  Clock,
} from 'lucide-react';
import { Block } from '@/hooks/useLinkProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (block: Partial<Block>) => void;
}

const blockTypes = [
  { type: 'link', label: 'Link', icon: LinkIcon, description: 'Simple clickable link' },
  { type: 'cta', label: 'CTA Button', icon: ExternalLink, description: 'Call-to-action button' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Plain text content' },
  { type: 'featured', label: 'Featured Card', icon: Star, description: 'Highlighted content card' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Visual separator' },
  { type: 'video', label: 'Video Embed', icon: Video, description: 'YouTube, Vimeo, etc.' },
  { type: 'music', label: 'Music Embed', icon: Music, description: 'Spotify, SoundCloud, etc.' },
  { type: 'contact_call', label: 'Call Button', icon: Phone, description: 'Direct phone call' },
  { type: 'contact_whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'WhatsApp message' },
  { type: 'contact_email', label: 'Email', icon: Mail, description: 'Send email' },
  { type: 'html', label: 'Custom HTML', icon: Code, description: 'Embed custom code' },
  { type: 'carousel', label: 'Carousel', icon: Columns, description: 'Multiple links slider' },
  { type: 'scheduled', label: 'Scheduled Link', icon: Clock, description: 'Time-based visibility' },
];

export default function AddBlockDialog({ open, onOpenChange, onAdd }: AddBlockDialogProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    url: '',
  });

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    
    // Some types don't need configuration
    if (type === 'divider') {
      onAdd({ type, title: 'Divider' });
      handleClose();
      return;
    }
    
    setStep('configure');
  };

  const handleSubmit = () => {
    if (!selectedType) return;
    
    onAdd({
      type: selectedType,
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setForm({ title: '', subtitle: '', url: '' });
    onOpenChange(false);
  };

  const selectedTypeInfo = blockTypes.find((b) => b.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Add New Block' : `Add ${selectedTypeInfo?.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 max-h-[400px] overflow-y-auto">
            {blockTypes.map((blockType) => (
              <motion.button
                key={blockType.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectType(blockType.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <blockType.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{blockType.label}</p>
                  <p className="text-xs text-muted-foreground">{blockType.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter title"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Enter subtitle"
              />
            </div>
            
            {['link', 'cta', 'video', 'music'].includes(selectedType || '') && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!form.title}>
                Add Block
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
