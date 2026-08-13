import { Navigate, Outlet, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { TabBar } from "@/components/navigation/TabBar";
import { CompactWebHeader } from "@/components/navigation/CompactWebHeader";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { NotificationToast } from "@/components/common/NotificationToast";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationSSE } from "@/hooks/useNotificationSSE";
import { useFCMPush } from "@/hooks/useFCMPush";
import { PULL_TO_REFRESH_THRESHOLD, usePullToRefresh } from "@/hooks/usePullToRefresh";

export function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();
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

  if (!isLoggedIn && isNativeApp) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
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
      <CompactWebHeader />

      <main
        className={
          isChatPage ? "pb-0" : "pb-0 native:pb-[calc(4rem+max(env(safe-area-inset-bottom),16px))]"
        }
      >
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
