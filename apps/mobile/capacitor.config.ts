import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anonymous.oxisuretechmobile',
  appName: 'OxiSure',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      appendUserAgent: 'OxiSure'
    }
  }
};

export default config;
