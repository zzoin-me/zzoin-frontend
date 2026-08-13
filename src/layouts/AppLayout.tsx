import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { TabBar } from "@/components/navigation/TabBar";
import { Logo } from "@/components/common/Logo";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Avatar } from "@/components/common/Avatar";
import { NotificationBadge } from "@/components/common/NotificationBadge";
import { NotificationToast } from "@/components/common/NotificationToast";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/utils/useMediaQuery";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { useFCMPush } from "@/hooks/useFCMPush";
import { PULL_TO_REFRESH_THRESHOLD, usePullToRefresh } from "@/hooks/usePullToRefresh";

export function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isChatPage = /^\/projects\/\d+\/chat$/.test(location.pathname);
  const isNativeApp = Capacitor.isNativePlatform();
  const queryClient = useQueryClient();

  const realtimeNotification = useNotificationSSE();
  useFCMPush();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  const { pullDistance, isRefreshing, containerRef } = usePullToRefresh(
    handleRefresh,
    isNativeApp && !isChatPage,
  );
  const showSpinner = pullDistance > 0 || isRefreshing;
  const spinnerOffset = isRefreshing ? PULL_TO_REFRESH_THRESHOLD : pullDistance;
  const spinnerRotation = pullDistance * 3;

  if (!initialized) {
    return <LoadingState fullScreen />;
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

      {isNativeApp && showSpinner && (
        <div
          className="pointer-events-none fixed left-0 right-0 top-[env(safe-area-inset-top)] z-50 flex items-center justify-center"
          style={{
            transform: `translateY(${spinnerOffset - 32}px)`,
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
        <header className="flex items-center justify-between border-b border-grey3 bg-grey1 px-5 py-3 lg:hidden native:flex">
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

      <main
        className={
          isChatPage
            ? "pb-0"
            : "pb-[calc(4rem+max(env(safe-area-inset-bottom),16px))] lg:pb-0 native:pb-[calc(4rem+max(env(safe-area-inset-bottom),16px))]"
        }
      >
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
