import { useState, useEffect, useCallback } from 'react';

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

interface UseAdMobReturn {
  isNative: boolean;
  isReady: boolean;
  showRewardedAd: (adId: string) => Promise<boolean>;
  showInterstitialAd: (adId: string) => Promise<boolean>;
  showBannerAd: (adId: string, position?: 'top' | 'bottom') => Promise<void>;
  hideBannerAd: () => Promise<void>;
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

  const showRewardedAd = useCallback(async (adId: string): Promise<boolean> => {
    if (!isNative || !AdMob) {
      console.log('AdMob not available, simulating reward');
      return true; // Simulate success for web
    }

    try {
      const options: AdMobOptions = {
        adId,
        isTesting: import.meta.env.DEV,
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
  }, [isNative, AdMob]);

  const showInterstitialAd = useCallback(async (adId: string): Promise<boolean> => {
    if (!isNative || !AdMob) {
      console.log('AdMob not available for interstitial');
      return true;
    }

    try {
      const options: AdMobOptions = {
        adId,
        isTesting: import.meta.env.DEV,
      };

      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [isNative, AdMob]);

  const showBannerAd = useCallback(async (adId: string, position: 'top' | 'bottom' = 'bottom'): Promise<void> => {
    if (!isNative || !AdMob) {
      console.log('AdMob banner not available on web');
      return;
    }

    try {
      const options = {
        adId,
        adSize: 'BANNER',
        position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
        isTesting: import.meta.env.DEV,
      };

      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Error showing banner ad:', error);
    }
  }, [isNative, AdMob]);

  const hideBannerAd = useCallback(async (): Promise<void> => {
    if (!isNative || !AdMob) return;

    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Error hiding banner ad:', error);
    }
  }, [isNative, AdMob]);

  return {
    isNative,
    isReady,
    showRewardedAd,
    showInterstitialAd,
    showBannerAd,
    hideBannerAd,
  };
};

export default useAdMob;
