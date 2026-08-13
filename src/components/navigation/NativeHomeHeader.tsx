import { Link } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Avatar } from "@/components/common/Avatar";
import { NotificationBadge } from "@/components/common/NotificationBadge";
import { useAuthStore } from "@/stores/authStore";

export function NativeHomeHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-[env(safe-area-inset-top)] z-40 border-b border-grey3 bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[768px] items-center px-5 md:px-8">
        <Logo size={34} className="mr-auto gap-2" />

        <div className="flex items-center gap-1">
          <NotificationBadge size="large" />
          <Link
            to="/mypage"
            aria-label="마이페이지"
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-grey2"
          >
            <Avatar
              nickname={user?.nickname}
              profileUrl={user?.profileImage}
              size="sm"
              className="ring-1 ring-grey3"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
