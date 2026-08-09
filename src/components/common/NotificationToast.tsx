import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";
import { markAsRead } from "@/api/notification";
import type { RealtimeNotification } from "@/hooks/useNotificationSSE";

interface NotificationToastProps {
  notification: RealtimeNotification | null;
}

export function NotificationToast({ notification }: NotificationToastProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 5_000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification || !visible) return null;

  const handleOpen = () => {
    setVisible(false);
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
  };

  return (
    <div
      role="status"
      className="fixed top-[calc(env(safe-area-inset-top)+20px)] right-5 left-5 z-[100] flex items-start gap-3 rounded-card border border-grey3 bg-bg p-4 shadow-lg md:left-auto md:w-[380px]"
    >
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Bell className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-[14px] text-grey9">{notification.title}</span>
          {notification.content && (
            <span className="mt-1 block font-regular text-[13px] text-grey6">
              {notification.content}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-full p-1 text-grey5 transition-colors hover:bg-grey2 hover:text-grey9"
        aria-label="알림 닫기"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
