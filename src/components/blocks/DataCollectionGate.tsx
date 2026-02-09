import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, User, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface DataCollectionGateProps {
  blockId: string;
  profileId: string;
  visitorId: string;
  collectName?: boolean;
  collectEmail?: boolean;
  collectPhone?: boolean;
  theme: {
    text: string;
    accent: string;
    cardBg: string;
  };
  onComplete: () => void;
}

export default function DataCollectionGate({
  blockId,
  profileId,
  visitorId,
  collectName,
  collectEmail,
  collectPhone,
  theme,
  onComplete,
}: DataCollectionGateProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (collectEmail && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (collectPhone && phone) {
      const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
      if (phoneClean.length < 7 || phoneClean.length > 15) {
        setError('Please enter a valid phone number');
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('block_leads').insert({
        block_id: blockId,
        profile_id: profileId,
        visitor_id: visitorId,
        name: collectName ? name.trim() : null,
        email: collectEmail ? email.trim() : null,
        phone: collectPhone ? phone.trim() : null,
      });

      if (insertError) throw insertError;

      // Mark as completed in localStorage
      const gatedKey = `data_gate_${blockId}`;
      localStorage.setItem(gatedKey, 'true');

      onComplete();
    } catch (err) {
      console.error('Failed to submit lead data:', err);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onComplete()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
          style={{ backgroundColor: theme.cardBg, color: theme.text }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.accent}20` }}
            >
              <ClipboardList className="w-5 h-5" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: theme.text }}>
                Quick Info Required
              </h3>
              <p className="text-sm opacity-60" style={{ color: theme.text }}>
                Fill in to continue (one-time only)
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {collectName && (
              <div className="space-y-1">
                <Label className="text-xs opacity-70" style={{ color: theme.text }}>
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 bg-white/10 border-white/20"
                    style={{ color: theme.text }}
                    required
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            {collectEmail && (
              <div className="space-y-1">
                <Label className="text-xs opacity-70" style={{ color: theme.text }}>
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 bg-white/10 border-white/20"
                    style={{ color: theme.text }}
                    required
                    maxLength={255}
                  />
                </div>
              </div>
            )}

            {collectPhone && (
              <div className="space-y-1">
                <Label className="text-xs opacity-70" style={{ color: theme.text }}>
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="pl-10 bg-white/10 border-white/20"
                    style={{ color: theme.text }}
                    required
                    maxLength={20}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-2"
              style={{ backgroundColor: theme.accent, color: '#fff' }}
            >
              {submitting ? 'Submitting...' : 'Continue'}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
