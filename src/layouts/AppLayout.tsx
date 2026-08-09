import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { TabBar } from "@/components/navigation/TabBar";
import { Logo } from "@/components/common/Logo";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Avatar } from "@/components/common/Avatar";
import { NotificationBadge } from "@/components/common/NotificationBadge";
import { NotificationToast } from "@/components/common/NotificationToast";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/utils/useMediaQuery";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { useFCMPush } from "@/hooks/useFCMPush";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

export function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const queryClient = useQueryClient();

  const realtimeNotification = useNotificationSSE();
  useFCMPush();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh(handleRefresh);
  const showSpinner = pullDistance > 0 || isRefreshing;
  const spinnerOffset = isRefreshing ? THRESHOLD : pullDistance;
  const spinnerRotation = pullDistance * 3;

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
          <p className="font-regular text-[16px] text-grey6">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && isMobile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-bg pt-[env(safe-area-inset-top)]">
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-40 h-[env(safe-area-inset-top)] bg-bg"
      />

      {isMobile && showSpinner && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-[env(safe-area-inset-top)] z-50 flex items-center justify-center"
          style={{
            transform: `translateY(${spinnerOffset - 40}px)`,
            transition: isRefreshing || pullDistance === 0 ? "transform 0.3s ease" : "none",
          }}
        >
          <Loader2
            className={`h-7 w-7 text-primary ${isRefreshing ? "animate-spin" : ""}`}
            style={{ transform: isRefreshing ? undefined : `rotate(${spinnerRotation}deg)` }}
            aria-hidden
          />
        </div>
      )}

      <ScrollToTop />
      <NotificationToast notification={realtimeNotification} />
      <Navbar />

      {isHomePage && (
        <header className="flex items-center justify-between border-b border-grey3 bg-grey1 px-5 py-3 lg:hidden">
          <Logo size={32} />
          <div className="flex items-center gap-3">
            {isLoggedIn && <NotificationBadge />}
            {isLoggedIn ? (
              <Link to="/mypage" aria-label="마이페이지" className="block">
                <Avatar nickname={user?.nickname} profileUrl={user?.profileImage} size="sm" />
              </Link>
            ) : (
              <Link to="/login" className="font-extralight text-[14px] text-grey9 hover:text-grey7">
                로그인
              </Link>
            )}
          </div>
        </header>
      )}

      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}

const THRESHOLD = 70;
