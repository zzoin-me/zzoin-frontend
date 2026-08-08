import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { useAuthStore } from "@/stores/authStore";
import { registerDeviceToken } from "@/api/notification";

export function useFCMPush() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== "granted") return;

        await PushNotifications.register();

        const registrationListener = await PushNotifications.addListener(
          "registration",
          async (token) => {
            const platform = Capacitor.getPlatform().toUpperCase();
            try {
              await registerDeviceToken(token.value, platform);
            } catch {
              // no-op
            }
          },
        );

        const notificationListener = await PushNotifications.addListener(
          "pushNotificationReceived",
          () => {
            // 포그라운드에서는 SSE가 처리하므로 여기서는 무시
          },
        );

        const actionListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (notification) => {
            const targetUrl = notification.notification.data?.targetUrl;
            if (targetUrl) {
              window.location.href = targetUrl;
            }
          },
        );

        cleanup = () => {
          registrationListener.remove();
          notificationListener.remove();
          actionListener.remove();
        };
      } catch {
        // no-op
      }
    })();

    return () => cleanup?.();
  }, [isLoggedIn]);
}
