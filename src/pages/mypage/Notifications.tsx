import { useState } from "react";
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
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationItem,
} from "@/api/notification";
import { formatKoreanDatetime } from "@/utils/datetime";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";
import { InlineLoading } from "@/components/common/InlineLoading";
import { NotificationListSkeleton } from "@/components/mypage/MyPageSkeletons";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { invalidateNotificationTargetQueries } from "@/utils/notificationTarget";

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
  const [markingAll, setMarkingAll] = useState(false);
  const [readingId, setReadingId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(0, 50),
    staleTime: 30_000,
  });

  const notifications = data?.content ?? [];
  const initialLoading = isLoading && !data;
  const refreshing = isFetching && !initialLoading;

  const handleClick = async (n: NotificationItem) => {
    setReadingId(n.id);
    try {
      if (!n.isRead) {
        await markAsRead(n.id);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      }
      if (n.targetUrl) {
        await invalidateNotificationTargetQueries(queryClient, n);
        const [path, hash] = n.targetUrl.split("#");
        let scrollTarget = hash || undefined;
        if (!scrollTarget && n.type === "APPLICATION_RECEIVED") {
          scrollTarget = "applicants";
        }
        navigate(path, { state: { scrollTo: scrollTarget } });
      }
    } finally {
      setReadingId(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    } finally {
      setMarkingAll(false);
    }
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
            disabled={markingAll}
            className="flex items-center gap-1.5 rounded-tag border border-grey3 bg-bg px-3 py-2 font-medium text-[13px] text-grey7 transition-colors hover:text-grey9"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="h-4 w-4" aria-hidden />
            )}
            {markingAll ? "처리 중" : "전체 읽음"}
          </button>
        )}
      </div>

      {initialLoading ? (
        <NotificationListSkeleton />
      ) : isError && !data ? (
        <QueryErrorState
          message="알림을 불러오지 못했습니다."
          onRetry={() => void refetch()}
        />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Bell className="h-12 w-12 text-grey4" aria-hidden />
          <p className="font-regular text-[16px] text-grey6">아직 알림이 없어요.</p>
        </div>
      ) : (
        <div className="relative">
          {refreshing && <InlineLoading className="absolute -top-5 right-0" />}
          <ul
            className={`flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3 bg-bg transition-opacity ${refreshing ? "opacity-70" : ""}`}
            aria-busy={refreshing}
          >
          {notifications.map((n) => {
            const Icon = iconMap[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  disabled={readingId === n.id}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-grey1 ${
                    !n.isRead ? "bg-primary-light" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      !n.isRead ? "bg-primary text-white" : "bg-grey3 text-grey7"
                    }`}
                  >
                    {readingId === n.id ? (
                      <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden />
                    )}
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
        </div>
      )}
    </div>
  );
}
