import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/api/notification";
import { useAuthStore } from "@/stores/authStore";

interface NotificationBadgeProps {
  size?: "default" | "large";
}

export function NotificationBadge({ size = "default" }: NotificationBadgeProps) {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadCount,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  const count = unread ?? 0;

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/mypage/notifications");
    } else {
      navigate("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="알림"
      className={`relative flex items-center justify-center rounded-full text-grey7 transition-colors hover:bg-grey2 hover:text-grey9 ${
        size === "large" ? "h-11 w-11" : "h-9 w-9"
      }`}
    >
      <Bell className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-bold text-[10px] text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
