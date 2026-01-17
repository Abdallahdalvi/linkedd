# Google AdMob & AdSense Integration Guide

## 🎯 Your Production Ad Unit IDs

### Android
| Type | ID |
|------|-----|
| **App ID** | `ca-app-pub-4440599855987610~1991629046` |
| **Rewarded Ad** | `ca-app-pub-4440599855987610/2715529689` |

### iOS (Add when created)
| Type | ID |
|------|-----|
| **App ID** | _(pending)_ |
| **Rewarded Ad** | _(pending)_ |

> These IDs are configured in `src/config/admob.ts`

---

This project supports both **Google AdSense** (for web) and **Google AdMob** (for native mobile apps).

## Table of Contents
- [Quick Start](#quick-start)
- [Google AdSense Setup (Web)](#google-adsense-setup-web)
- [Google AdMob Setup (Native Mobile)](#google-admob-setup-native-mobile)
- [Using Ads in Download Blocks](#using-ads-in-download-blocks)
- [Testing Ads](#testing-ads)
- [Best Practices](#best-practices)

---

## Quick Start

### For Web (AdSense)
```bash
# 1. Add your AdSense client ID to .env
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# 2. Add AdSense script to index.html (see below)

# 3. Configure ad slots in your download blocks
```

### For Native Mobile (AdMob)
```bash
# 1. Install Capacitor and AdMob plugin
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor-community/admob

# 2. Add your AdMob App ID and Ad Unit IDs
# 3. Build and run on device
```

---

## Google AdSense Setup (Web)

### Step 1: Create AdSense Account
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Add your website and verify ownership
4. Wait for approval (can take 1-14 days)

### Step 2: Get Your Publisher ID
After approval, find your Publisher ID:
- Go to AdSense Dashboard → Account → Account Information
- Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Create Ad Units
1. Go to Ads → By ad unit → Display ads
2. Create a new ad unit
3. Name it (e.g., "Download Reward Ad")
4. Copy the Ad Unit ID (format: `1234567890`)

### Step 4: Configure Your App

**Add to `.env`:**
```env
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_DOWNLOAD_AD_SLOT=1234567890
```

**Add to `index.html` (in `<head>`):**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

### Step 5: Use AdSense Component
```tsx
import { AdSenseAd } from '@/components/ads/AdSenseAd';

// In your component
<AdSenseAd 
  adSlot="1234567890"
  adFormat="rectangle"
  className="my-4"
/>
```

---

## Google AdMob Setup (Native Mobile)

### Step 1: Create AdMob Account
1. Go to [Google AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Accept terms and conditions

### Step 2: Create Apps in AdMob
1. Click "Apps" → "Add App"
2. Select platform (iOS or Android)
3. Enter app details
4. Note your **App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)

### Step 3: Create Ad Units
1. In your app, click "Ad units" → "Add ad unit"
2. Create these ad types:
   - **Rewarded** - For download reward ads
   - **Interstitial** - For between-content ads
   - **Banner** - For persistent banner ads

3. Note each Ad Unit ID

### Step 4: Install Capacitor

```bash
# Install Capacitor core
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init "Linkedd" "app.lovable.linkedd"

# Add platforms
npx cap add ios
npx cap add android

# Install AdMob plugin
npm install @capacitor-community/admob
```

### Step 5: Configure iOS

**ios/App/App/Info.plist** - Add before `</dict>`:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

**ios/App/Podfile** - Add:
```ruby
pod 'Google-Mobile-Ads-SDK'
```

Then run:
```bash
cd ios/App && pod install && cd ../..
```

### Step 6: Configure Android

**android/app/src/main/AndroidManifest.xml** - Add inside `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

**android/app/build.gradle** - Add to dependencies:
```gradle
implementation 'com.google.android.gms:play-services-ads:22.6.0'
```

### Step 7: Add Environment Variables

```env
# AdMob App IDs
VITE_ADMOB_APP_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
VITE_ADMOB_APP_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ

# Ad Unit IDs (Rewarded)
VITE_ADMOB_REWARDED_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/1111111111
VITE_ADMOB_REWARDED_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/2222222222

# Ad Unit IDs (Interstitial)
VITE_ADMOB_INTERSTITIAL_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/3333333333
VITE_ADMOB_INTERSTITIAL_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/4444444444

# Ad Unit IDs (Banner)
VITE_ADMOB_BANNER_ID_IOS=ca-app-pub-XXXXXXXXXXXXXXXX/5555555555
VITE_ADMOB_BANNER_ID_ANDROID=ca-app-pub-XXXXXXXXXXXXXXXX/6666666666
```

### Step 8: Use AdMob Hook

```tsx
import { useAdMob } from '@/hooks/useAdMob';

function MyComponent() {
  const { isNative, isReady, showRewardedAd } = useAdMob();

  const handleShowAd = async () => {
    const adId = Platform.OS === 'ios' 
      ? import.meta.env.VITE_ADMOB_REWARDED_ID_IOS
      : import.meta.env.VITE_ADMOB_REWARDED_ID_ANDROID;
    
    const success = await showRewardedAd(adId);
    if (success) {
      // User watched the ad, give reward
      startDownload();
    }
  };

  return (
    <button onClick={handleShowAd}>
      Download (Watch Ad)
    </button>
  );
}
```

---

## Using Ads in Download Blocks

### Dashboard Configuration

When creating a Download block:

1. **Enable Reward Ad** - Toggle on
2. **Ad Duration** - Set fallback duration (3-15 seconds)
3. **Ad Image** - Upload banner for web/fallback
4. **Ad Link** - Sponsor URL (optional)
5. **AdMob Rewarded ID** - For native apps (optional)

### How It Works

```
User clicks download
        ↓
Is Native App + AdMob Ready?
    ↓ YES              ↓ NO
Show AdMob         Show Custom Ad
Rewarded Ad        (Image + Timer)
    ↓                   ↓
User completes     Timer completes
    ↓                   ↓
    └──── Start Download ────┘
```

---

## Testing Ads

### AdSense Test Mode
AdSense automatically shows test ads on localhost. For production testing:
```html
<!-- Add to index.html temporarily -->
<script>
  (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
</script>
```

### AdMob Test IDs
Use these test IDs during development:

| Ad Type | iOS Test ID | Android Test ID |
|---------|-------------|-----------------|
| Banner | `ca-app-pub-3940256099942544/2934735716` | `ca-app-pub-3940256099942544/6300978111` |
| Interstitial | `ca-app-pub-3940256099942544/4411468910` | `ca-app-pub-3940256099942544/1033173712` |
| Rewarded | `ca-app-pub-3940256099942544/1712485313` | `ca-app-pub-3940256099942544/5224354917` |

```tsx
// Use test IDs in development
const adId = import.meta.env.DEV 
  ? 'ca-app-pub-3940256099942544/5224354917' // Test ID
  : import.meta.env.VITE_ADMOB_REWARDED_ID_ANDROID;
```

---

## Best Practices

### 1. Ad Placement
- ✅ Show ads before valuable content (downloads)
- ✅ Keep ad duration reasonable (5-15 seconds)
- ❌ Don't spam ads on every action
- ❌ Don't place ads that block main content

### 2. User Experience
- Always show a clear countdown timer
- Provide skip option for premium users
- Show what they'll get after the ad
- Handle ad failures gracefully

### 3. Compliance
- Follow AdSense/AdMob policies strictly
- Don't click your own ads
- Don't encourage users to click ads
- Clearly label sponsored content
- Include privacy policy with ad disclosure

### 4. Revenue Optimization
- Test different ad placements
- Use A/B testing for ad formats
- Monitor fill rates and eCPM
- Consider mediation for better fill rates

---

## Troubleshooting

### AdSense Not Showing
- Check if site is approved
- Verify Publisher ID in .env
- Check browser console for errors
- Ensure script is in index.html

### AdMob Not Loading
```bash
# Check Capacitor sync
npx cap sync

# Rebuild iOS
cd ios/App && pod install && cd ../..
npx cap run ios

# Rebuild Android
npx cap run android
```

### Common Errors
| Error | Solution |
|-------|----------|
| "Ad not ready" | Wait for ad to load before showing |
| "Invalid ad unit" | Check App ID and Ad Unit ID match |
| "No fill" | Normal in testing, will improve in production |
| "Account suspended" | Check AdMob/AdSense policy violations |

---

## Revenue Tracking

### AdSense
View earnings in AdSense Dashboard → Reports

### AdMob
View earnings in AdMob Dashboard → Reports

### In-App Analytics
Track ad events in your analytics:
```tsx
// Track ad impressions
supabase.from('analytics_events').insert({
  event_type: 'ad_impression',
  profile_id: profileId,
  block_id: blockId,
});

// Track ad clicks
supabase.from('analytics_events').insert({
  event_type: 'ad_click',
  profile_id: profileId,
  block_id: blockId,
});
```

---

## Need Help?

- [AdSense Help Center](https://support.google.com/adsense/)
- [AdMob Help Center](https://support.google.com/admob/)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)
