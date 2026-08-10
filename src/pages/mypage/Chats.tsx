import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { getChatRooms } from "@/api/chat";
import { LoadingState } from "@/components/common/LoadingState";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";
import { useAuthStore } from "@/stores/authStore";

function formatTime(value?: string): string {
  if (!value) return "대화를 시작해보세요";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MyPageChatsPage() {
  const verified = useAuthStore((state) => state.user?.verified === true);
  const {
    data: rooms = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project-chats"],
    queryFn: getChatRooms,
    refetchInterval: 30_000,
    enabled: verified,
  });

  return (
    <div className="flex flex-col gap-6">
      <MyPageTitle>프로젝트 대화</MyPageTitle>
      <p className="font-medium text-[14px] text-grey7 md:text-[16px]">
        진행 중이거나 완료된 프로젝트 팀원들과 나눈 대화예요.
      </p>

      {!verified ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-card border border-grey3 text-center">
          <MessageCircle className="h-8 w-8 text-grey5" aria-hidden />
          <p className="font-regular text-[15px] text-grey6">
            대학 인증을 완료하면 프로젝트 대화를 이용할 수 있어요.
          </p>
        </div>
      ) : isLoading ? (
        <LoadingState />
      ) : isError ? (
        <div className="flex min-h-64 items-center justify-center rounded-card border border-grey3 text-center">
          <p className="font-regular text-[15px] text-red-500">대화방을 불러오지 못했습니다.</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-card border border-grey3 text-center">
          <MessageCircle className="h-8 w-8 text-grey5" aria-hidden />
          <p className="font-regular text-[15px] text-grey6">참여 중인 프로젝트 대화방이 없어요.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3">
          {rooms.map((room) => (
            <Link
              key={room.projectId}
              to={`/projects/${room.projectId}/chat`}
              className="flex items-center gap-4 bg-bg p-4 transition-colors hover:bg-grey1 md:p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-bold text-[15px] text-grey9 md:text-[17px]">
                    {room.projectTitle}
                  </h2>
                  {room.projectStatus === "COMPLETED" && (
                    <span className="shrink-0 rounded-tag bg-grey2 px-2 py-0.5 font-medium text-[11px] text-grey6">
                      읽기 전용
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-regular text-[13px] text-grey6">
                  {room.lastMessage || "아직 메시지가 없어요."}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-regular text-[11px] text-grey5">
                  {formatTime(room.lastMessageAt)}
                </span>
                {room.unreadCount > 0 && (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-bold text-[11px] text-white">
                    {room.unreadCount > 99 ? "99+" : room.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
