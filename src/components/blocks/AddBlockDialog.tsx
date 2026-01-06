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

// Block type specific editors
import LinkBlockEditor from './editors/LinkBlockEditor';
import CarouselBlockEditor from './editors/CarouselBlockEditor';
import VideoBlockEditor from './editors/VideoBlockEditor';
import MusicBlockEditor from './editors/MusicBlockEditor';
import ContactBlockEditor from './editors/ContactBlockEditor';
import TextBlockEditor from './editors/TextBlockEditor';
import ImageBlockEditor from './editors/ImageBlockEditor';
import ScheduledBlockEditor from './editors/ScheduledBlockEditor';
import HtmlBlockEditor from './editors/HtmlBlockEditor';
import FeaturedBlockEditor from './editors/FeaturedBlockEditor';

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (block: Partial<Block>) => void;
}

const blockTypes = [
  { type: 'link', label: 'Link', icon: LinkIcon, description: 'Simple clickable link' },
  { type: 'cta', label: 'CTA Button', icon: ExternalLink, description: 'Call-to-action button' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Plain text content' },
  { type: 'image', label: 'Image Block', icon: Image, description: 'Display an image' },
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

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    
    // Divider doesn't need configuration
    if (type === 'divider') {
      onAdd({ type, title: 'Divider', is_enabled: true });
      handleClose();
      return;
    }
    
    setStep('configure');
  };

  const handleSave = (block: Partial<Block>) => {
    onAdd({ ...block, is_enabled: true });
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    onOpenChange(false);
  };

  const selectedTypeInfo = blockTypes.find((b) => b.type === selectedType);

  const renderEditor = () => {
    const commonProps = {
      onSave: handleSave,
      onCancel: () => setStep('select'),
    };

    switch (selectedType) {
      case 'link':
      case 'cta':
        return <LinkBlockEditor block={{ type: selectedType }} {...commonProps} />;
      case 'carousel':
        return <CarouselBlockEditor {...commonProps} />;
      case 'video':
        return <VideoBlockEditor {...commonProps} />;
      case 'music':
        return <MusicBlockEditor {...commonProps} />;
      case 'contact_call':
      case 'contact_whatsapp':
      case 'contact_email':
        return <ContactBlockEditor contactType={selectedType} {...commonProps} />;
      case 'text':
        return <TextBlockEditor {...commonProps} />;
      case 'image':
        return <ImageBlockEditor {...commonProps} />;
      case 'scheduled':
        return <ScheduledBlockEditor {...commonProps} />;
      case 'html':
        return <HtmlBlockEditor {...commonProps} />;
      case 'featured':
        return <FeaturedBlockEditor {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Add New Block' : `Add ${selectedTypeInfo?.label}`}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1">
          {step === 'select' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
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
            <div className="py-4">
              {renderEditor()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
