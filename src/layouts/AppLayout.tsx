import { Link, Navigate, Outlet } from "react-router";
import { Bell } from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { TabBar } from "@/components/navigation/TabBar";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/utils/useMediaQuery";

export function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isMobile = useIsMobile();

  if (!isLoggedIn && isMobile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <header className="flex items-center justify-between border-b border-grey3 bg-grey1 px-5 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-tag bg-grey4" aria-label="Zzoin logo" />
          <span className="font-bold text-[18px] text-grey9">Zzoin</span>
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button type="button" aria-label="알림" className="text-grey9 hover:text-grey7">
              <Bell className="h-6 w-6" />
            </button>
          )}
          {isLoggedIn ? (
            <Link to="/mypage" aria-label="마이페이지" className="block">
              <div className="h-8 w-8 rounded-full bg-grey4" />
            </Link>
          ) : (
            <Link to="/login" className="font-extralight text-[14px] text-grey9 hover:text-grey7">
              로그인
            </Link>
          )}
        </div>
      </header>

      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
