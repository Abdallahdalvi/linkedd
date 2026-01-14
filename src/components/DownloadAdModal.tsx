import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  adDuration: number;
  adImageUrl?: string;
  adLinkUrl?: string;
  adText?: string;
  fileName?: string;
  theme?: {
    text: string;
    cardBg: string;
    accent: string;
  };
}

export default function DownloadAdModal({
  isOpen,
  onClose,
  onDownload,
  adDuration,
  adImageUrl,
  adLinkUrl,
  adText,
  fileName,
  theme,
}: DownloadAdModalProps) {
  const [countdown, setCountdown] = useState(adDuration);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(adDuration);
      setCanDownload(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanDownload(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, adDuration]);

  const handleAdClick = () => {
    if (adLinkUrl) {
      window.open(adLinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    onDownload();
    onClose();
  };

  const defaultTheme = {
    text: '#ffffff',
    cardBg: 'rgba(30, 30, 30, 0.95)',
    accent: '#8b5cf6',
  };

  const activeTheme = theme || defaultTheme;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: activeTheme.cardBg }}
          >
            {/* Close button - only if user hasn't waited */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full transition-colors z-10"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: activeTheme.text 
              }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Ad Text */}
              <p 
                className="text-sm text-center opacity-70"
                style={{ color: activeTheme.text }}
              >
                {adText || 'This download is sponsored by:'}
              </p>

              {/* Ad Image/Banner */}
              {adImageUrl ? (
                <motion.div
                  className={`relative overflow-hidden rounded-xl ${adLinkUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  onClick={handleAdClick}
                  whileHover={adLinkUrl ? { scale: 1.02 } : undefined}
                  whileTap={adLinkUrl ? { scale: 0.98 } : undefined}
                >
                  <img
                    src={adImageUrl}
                    alt="Sponsored content"
                    className="w-full h-auto max-h-48 object-contain mx-auto"
                  />
                  {adLinkUrl && (
                    <div 
                      className="absolute bottom-2 right-2 px-2 py-1 rounded-lg flex items-center gap-1 text-xs"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Learn more</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div 
                  className="h-32 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <p 
                    className="text-sm opacity-50"
                    style={{ color: activeTheme.text }}
                  >
                    Your ad here
                  </p>
                </div>
              )}

              {/* File Info */}
              {fileName && (
                <div 
                  className="text-center text-sm opacity-80"
                  style={{ color: activeTheme.text }}
                >
                  Preparing: <span className="font-medium">{fileName}</span>
                </div>
              )}

              {/* Countdown / Download Button */}
              <div className="pt-2">
                {!canDownload ? (
                  <div className="text-center space-y-3">
                    <div 
                      className="flex items-center justify-center gap-2"
                      style={{ color: activeTheme.text }}
                    >
                      <Clock className="w-5 h-5" />
                      <span className="text-lg font-bold">{countdown}s</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: activeTheme.accent }}
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: adDuration, ease: 'linear' }}
                      />
                    </div>
                    <p 
                      className="text-xs opacity-60"
                      style={{ color: activeTheme.text }}
                    >
                      Please wait while your download is prepared...
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-2"
                  >
                    <Button
                      onClick={handleDownload}
                      className="w-full h-12 text-lg font-semibold"
                      style={{ 
                        backgroundColor: activeTheme.accent,
                        color: '#fff'
                      }}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Now
                    </Button>
                    <p 
                      className="text-xs text-center opacity-60"
                      style={{ color: activeTheme.text }}
                    >
                      Your download is ready!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
