import { useState, useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';
import DownloadAdModal from '@/components/DownloadAdModal';

interface RewardedAdWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  // AdMob config (for native)
  admobRewardedAdId?: string;
  // Fallback ad config (for web or when AdMob not available)
  fallbackAdDuration?: number;
  fallbackAdImageUrl?: string;
  fallbackAdLinkUrl?: string;
  fallbackAdText?: string;
  // Display
  fileName: string;
  theme: {
    text: string;
    cardBg: string;
    accent: string;
  };
}

export const RewardedAdWrapper = ({
  isOpen,
  onClose,
  onRewardEarned,
  admobRewardedAdId,
  fallbackAdDuration = 5,
  fallbackAdImageUrl,
  fallbackAdLinkUrl,
  fallbackAdText,
  fileName,
  theme,
}: RewardedAdWrapperProps) => {
  const { isNative, isReady, showRewardedAd } = useAdMob();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowFallback(false);
      return;
    }

    const handleAd = async () => {
      // If native and AdMob is ready, try to show AdMob rewarded ad
      if (isNative && isReady && admobRewardedAdId) {
        try {
          const success = await showRewardedAd(admobRewardedAdId);
          if (success) {
            onRewardEarned();
            onClose();
            return;
          }
        } catch (error) {
          console.error('AdMob rewarded ad failed:', error);
        }
      }

      // Fallback to custom ad modal
      setShowFallback(true);
    };

    handleAd();
  }, [isOpen, isNative, isReady, admobRewardedAdId, showRewardedAd, onRewardEarned, onClose]);

  // Show fallback modal (custom ad or AdSense)
  if (showFallback) {
    return (
      <DownloadAdModal
        isOpen={isOpen}
        onClose={onClose}
        onDownload={onRewardEarned}
        adDuration={fallbackAdDuration}
        adImageUrl={fallbackAdImageUrl}
        adLinkUrl={fallbackAdLinkUrl}
        adText={fallbackAdText}
        fileName={fileName}
        theme={theme}
      />
    );
  }

  // Return null while trying AdMob
  return null;
};

export default RewardedAdWrapper;
