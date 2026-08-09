import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  UserPlus,
  UserX,
  CalendarX,
  MessageSquare,
  MessageCircle,
  CheckCheck,
  Bell,
} from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationItem,
} from "@/api/notification";
import { formatKoreanDatetime } from "@/utils/datetime";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";

const iconMap: Record<string, typeof Bell> = {
  APPLICATION_RECEIVED: UserPlus,
  APPLICATION_APPROVED: UserCheck,
  APPLICATION_REJECTED: UserX,
  DEADLINE_REACHED: CalendarX,
  POST_COMMENT: MessageSquare,
  COMMENT_REPLY: MessageCircle,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(0, 50),
    staleTime: 30_000,
  });

  const notifications = data?.content ?? [];

  const handleClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      await markAsRead(n.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    }
    if (n.targetUrl) {
      const [path, hash] = n.targetUrl.split("#");
      let scrollTarget = hash || undefined;
      if (!scrollTarget && n.type === "APPLICATION_RECEIVED") {
        scrollTarget = "applicants";
      }
      navigate(path, { state: { scrollTo: scrollTarget } });
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <MyPageTitle>알림</MyPageTitle>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 rounded-tag border border-grey3 bg-bg px-3 py-2 font-medium text-[13px] text-grey7 transition-colors hover:text-grey9"
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            전체 읽음
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="py-20 text-center font-regular text-[16px] text-grey6">불러오는 중...</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Bell className="h-12 w-12 text-grey4" aria-hidden />
          <p className="font-regular text-[16px] text-grey6">아직 알림이 없어요.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3 bg-bg">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-grey1 ${
                    !n.isRead ? "bg-primary-light" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      !n.isRead ? "bg-primary text-white" : "bg-grey3 text-grey7"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-grey9">{n.title}</span>
                      {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                    </div>
                    {n.content && (
                      <p className="mt-0.5 line-clamp-2 font-regular text-[13px] text-grey6">
                        {n.content}
                      </p>
                    )}
                    <span className="mt-1 block font-regular text-[11px] text-grey5">
                      {formatKoreanDatetime(n.createdAt)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
