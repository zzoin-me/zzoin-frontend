import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Bell } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { TabBar } from "@/components/navigation/TabBar";
import { Logo } from "@/components/common/Logo";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Avatar } from "@/components/common/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/utils/useMediaQuery";

export function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (!initialized) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white pt-[env(safe-area-inset-top)]">
      <ScrollToTop />
      <Navbar />

      {isHomePage && (
        <header className="flex items-center justify-between border-b border-grey3 bg-grey1 px-5 py-3 lg:hidden">
          <Logo size={32} />
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button type="button" aria-label="알림" className="text-grey9 hover:text-grey7">
                <Bell className="h-6 w-6" />
              </button>
            )}
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
