import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken, refreshStoredTokens } from "@/api/client";
import type { NotificationItem } from "@/api/notification";
import { apiBaseUrl } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { invalidateNotificationTargetQueries } from "@/utils/notificationTarget";

const TOKEN_REFRESH_MARGIN_MS = 30_000;
const RECONNECT_DELAY_MS = 5_000;

export type RealtimeNotification = Omit<NotificationItem, "isRead">;

function normalizeToken(token: string): string {
  return token.startsWith("Bearer ") ? token.substring(7) : token;
}

function getTokenExpiration(token: string): number {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return 0;

    const normalizedPayload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [latestNotification, setLatestNotification] = useState<RealtimeNotification | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLatestNotification(null);
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const disconnect = () => {
      if (eventSource) {
        eventSource.onerror = null;
        eventSource.close();
        eventSource = null;
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
    };

    const refreshAndConnect = async () => {
      const refreshed = await refreshStoredTokens();
      if (stopped) return;

      if (!refreshed) {
        await useAuthStore.getState().logout();
        return;
      }

      connect();
    };

    const connect = () => {
      if (stopped) return;

      disconnect();
      const accessToken = getAccessToken();
      if (!accessToken) {
        void useAuthStore.getState().logout();
        return;
      }

      const token = normalizeToken(accessToken);
      const expiresAt = getTokenExpiration(token);

      if (expiresAt <= Date.now() + TOKEN_REFRESH_MARGIN_MS) {
        void refreshAndConnect();
        return;
      }

      eventSource = new EventSource(
        `${apiBaseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`,
      );

      eventSource.addEventListener("notification", (event) => {
        try {
          const notification = JSON.parse(event.data) as RealtimeNotification;
          setLatestNotification(notification);
          void invalidateNotificationTargetQueries(queryClient, notification);
        } catch {
          setLatestNotification(null);
        }
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      });

      eventSource.onerror = () => {
        disconnect();
        if (stopped) return;

        if (expiresAt <= Date.now() + TOKEN_REFRESH_MARGIN_MS) {
          void refreshAndConnect();
          return;
        }

        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      refreshTimer = setTimeout(
        () => {
          disconnect();
          void refreshAndConnect();
        },
        expiresAt - Date.now() - TOKEN_REFRESH_MARGIN_MS,
      );
    };

    connect();

    return () => {
      stopped = true;
      disconnect();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [isLoggedIn, queryClient]);

  return latestNotification;
}
