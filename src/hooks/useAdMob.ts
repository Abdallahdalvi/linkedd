import { useState, useEffect, useCallback } from 'react';
import { ADMOB_CONFIG, getAdUnitId } from '@/config/admob';

// AdMob types for Capacitor
interface AdMobRewardItem {
  type: string;
  amount: number;
}

interface AdMobOptions {
  adId: string;
  isTesting?: boolean;
  npa?: boolean; // Non-personalized ads
}

// Detect platform
const getPlatform = (): 'android' | 'ios' => {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  }
  return 'android';
};

interface UseAdMobReturn {
  isNative: boolean;
  isReady: boolean;
  platform: 'android' | 'ios';
  showRewardedAd: (adId?: string) => Promise<boolean>;
  showInterstitialAd: (adId?: string) => Promise<boolean>;
  showBannerAd: (adId?: string, position?: 'top' | 'bottom') => Promise<void>;
  hideBannerAd: () => Promise<void>;
  // Pre-configured methods using your ad unit IDs
  showDefaultRewardedAd: () => Promise<boolean>;
  showDefaultInterstitialAd: () => Promise<boolean>;
  showDefaultBannerAd: (position?: 'top' | 'bottom') => Promise<void>;
}

// Check if running in Capacitor native environment
const isCapacitorNative = (): boolean => {
  return typeof window !== 'undefined' && 
         'Capacitor' in window && 
         (window as any).Capacitor?.isNativePlatform?.();
};

export const useAdMob = (): UseAdMobReturn => {
  const [isReady, setIsReady] = useState(false);
  const [AdMob, setAdMob] = useState<any>(null);
  const isNative = isCapacitorNative();
  const platform = getPlatform();
  const isTesting = import.meta.env.DEV;

  useEffect(() => {
    const initAdMob = async () => {
      if (!isNative) {
        setIsReady(false);
        return;
      }

      try {
        // Dynamic import for Capacitor AdMob plugin
        // @ts-ignore - Plugin only available in native builds
        const module = await import('@capacitor-community/admob');
        const AdMobPlugin = module.AdMob;
        
        if (AdMobPlugin) {
          await AdMobPlugin.initialize({
            initializeForTesting: import.meta.env.DEV,
          });

          setAdMob(AdMobPlugin);
          setIsReady(true);
          console.log('AdMob initialized successfully');
        }
      } catch (error) {
        // AdMob plugin not available (web build or plugin not installed)
        console.log('AdMob not available:', error);
        setIsReady(false);
      }
    };

    initAdMob();
  }, [isNative]);

  const showRewardedAd = useCallback(async (adId?: string): Promise<boolean> => {
    if (!isNative || !AdMob) {
      console.log('AdMob not available, simulating reward');
      return true; // Simulate success for web
    }

    // Use provided adId or fall back to configured one
    const effectiveAdId = adId || getAdUnitId('rewarded', platform, isTesting);
    
    if (!effectiveAdId) {
      console.error('No rewarded ad unit ID configured for', platform);
      return false;
    }

    try {
      const options: AdMobOptions = {
        adId: effectiveAdId,
        isTesting,
      };

      await AdMob.prepareRewardVideoAd(options);
      
      return new Promise((resolve) => {
        AdMob.addListener('onRewardedVideoAdReward', (reward: AdMobRewardItem) => {
          console.log('User earned reward:', reward);
          resolve(true);
        });

        AdMob.addListener('onRewardedVideoAdFailedToLoad', () => {
          console.error('Rewarded ad failed to load');
          resolve(false);
        });

        AdMob.showRewardVideoAd();
      });
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return false;
    }
  }, [isNative, AdMob, platform, isTesting]);

  const showInterstitialAd = useCallback(async (adId?: string): Promise<boolean> => {
    if (!isNative || !AdMob) {
      console.log('AdMob not available for interstitial');
      return true;
    }

    const effectiveAdId = adId || getAdUnitId('interstitial', platform, isTesting);
    
    if (!effectiveAdId) {
      console.error('No interstitial ad unit ID configured for', platform);
      return false;
    }

    try {
      const options: AdMobOptions = {
        adId: effectiveAdId,
        isTesting,
      };

      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [isNative, AdMob, platform, isTesting]);

  const showBannerAd = useCallback(async (adId?: string, position: 'top' | 'bottom' = 'bottom'): Promise<void> => {
    if (!isNative || !AdMob) {
      console.log('AdMob banner not available on web');
      return;
    }

    const effectiveAdId = adId || getAdUnitId('banner', platform, isTesting);
    
    if (!effectiveAdId) {
      console.error('No banner ad unit ID configured for', platform);
      return;
    }

    try {
      const options = {
        adId: effectiveAdId,
        adSize: 'BANNER',
        position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
        isTesting,
      };

      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Error showing banner ad:', error);
    }
  }, [isNative, AdMob, platform, isTesting]);

  const hideBannerAd = useCallback(async (): Promise<void> => {
    if (!isNative || !AdMob) return;

    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Error hiding banner ad:', error);
    }
  }, [isNative, AdMob]);

  // Pre-configured convenience methods using your ad unit IDs
  const showDefaultRewardedAd = useCallback(async (): Promise<boolean> => {
    return showRewardedAd();
  }, [showRewardedAd]);

  const showDefaultInterstitialAd = useCallback(async (): Promise<boolean> => {
    return showInterstitialAd();
  }, [showInterstitialAd]);

  const showDefaultBannerAd = useCallback(async (position: 'top' | 'bottom' = 'bottom'): Promise<void> => {
    return showBannerAd(undefined, position);
  }, [showBannerAd]);

  return {
    isNative,
    isReady,
    platform,
    showRewardedAd,
    showInterstitialAd,
    showBannerAd,
    hideBannerAd,
    showDefaultRewardedAd,
    showDefaultInterstitialAd,
    showDefaultBannerAd,
  };
};

export default useAdMob;
