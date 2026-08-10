import type { CapacitorConfig } from "@capacitor/cli";

const localHttp = process.env.CAPACITOR_LOCAL_HTTP === "true";

const config: CapacitorConfig = {
  appId: "com.zzoin.app",
  appName: "Zzoin",
  webDir: "dist",
  server: {
    androidScheme: localHttp ? "http" : "https",
    cleartext: localHttp,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
