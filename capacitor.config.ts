import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zzoin.app',
  appName: 'Zzoin',
  webDir: 'dist',
  // android http testing
  server: {
      cleartext: true
  },
  plugins: {
      CapacitorHttp: {
        enabled: true,
      },
  },
};

export default config;
