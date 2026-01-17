// Ad Configuration
// These are your real production ad unit IDs

// Google AdSense (Web)
export const ADSENSE_CONFIG = {
  clientId: 'ca-pub-4440599855987610',
};

// Google AdMob (Native Mobile)
export const ADMOB_CONFIG = {
  // Android Configuration
  android: {
    appId: 'ca-app-pub-4440599855987610~1991629046',
    rewardedAdUnitId: 'ca-app-pub-4440599855987610/2715529689',
    interstitialAdUnitId: '', // Add when created
    bannerAdUnitId: '', // Add when created
  },
  
  // iOS Configuration (add your iOS ad unit IDs here)
  ios: {
    appId: '', // Add your iOS App ID
    rewardedAdUnitId: '', // Add your iOS Rewarded Ad Unit ID
    interstitialAdUnitId: '', // Add when created
    bannerAdUnitId: '', // Add when created
  },
  
  // Test Ad Unit IDs (for development/testing)
  test: {
    android: {
      rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
      interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
      bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
    },
    ios: {
      rewardedAdUnitId: 'ca-app-pub-3940256099942544/1712485313',
      interstitialAdUnitId: 'ca-app-pub-3940256099942544/4411468910',
      bannerAdUnitId: 'ca-app-pub-3940256099942544/2934735716',
    },
  },
};

// Helper to get the correct ad unit ID based on platform and environment
export const getAdUnitId = (
  type: 'rewarded' | 'interstitial' | 'banner',
  platform: 'android' | 'ios',
  isTesting: boolean = false
): string => {
  if (isTesting) {
    return ADMOB_CONFIG.test[platform][`${type}AdUnitId`];
  }
  return ADMOB_CONFIG[platform][`${type}AdUnitId`];
};

export default ADMOB_CONFIG;
