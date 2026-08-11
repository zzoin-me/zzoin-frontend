import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { markAsRead } from "@/api/notification";
import type { RealtimeNotification } from "@/hooks/useNotificationSSE";
import { showSnackbar } from "@/stores/snackbarStore";

interface NotificationToastProps {
  notification: RealtimeNotification | null;
}

export function NotificationToast({ notification }: NotificationToastProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!notification) return;

    showSnackbar({
      dedupeKey: `notification:${notification.id}`,
      type: "info",
      duration: 5_000,
      message: notification.content
        ? `${notification.title} · ${notification.content}`
        : notification.title,
      actionLabel: notification.targetUrl ? "보기" : "확인",
      onAction: () => {
        void markAsRead(notification.id)
          .catch(() => undefined)
          .finally(() => {
            void queryClient.invalidateQueries({ queryKey: ["notifications"] });
            void queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
          });

        if (notification.targetUrl) {
          const [path, hash] = notification.targetUrl.split("#");
          navigate(path, { state: { scrollTo: hash || undefined } });
        }
      },
    });
  }, [navigate, notification, queryClient]);

  return null;
}
