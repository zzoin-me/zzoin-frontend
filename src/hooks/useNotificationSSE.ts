import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

export function useNotificationSSE() {
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const token = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/notifications/stream?token=${token}`);

      eventSource.addEventListener("notification", () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      });

      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [isLoggedIn, queryClient]);
}
