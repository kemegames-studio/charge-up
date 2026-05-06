import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kemegames.chargeup',
  appName: 'Charge Up',
  webDir: 'www',
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
