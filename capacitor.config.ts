import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.50e6d70f75f443feb6c5c243769d7516',
  appName: 'linkedd',
  webDir: 'dist',
  server: {
    url: 'https://50e6d70f-75f4-43fe-b6c5-c243769d7516.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    AdMob: {
      // Your real Android App ID
      appId: 'ca-app-pub-4440599855987610~1991629046',
      // Add iOS App ID when available
      // iosAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
