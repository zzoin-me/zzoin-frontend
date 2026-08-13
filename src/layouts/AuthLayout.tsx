import { Outlet } from "react-router";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { CompactWebHeader } from "@/components/navigation/CompactWebHeader";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg pt-[env(safe-area-inset-top)]">
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-40 h-[env(safe-area-inset-top)] bg-bg"
      />
      <ScrollToTop />
      <CompactWebHeader />
      <main className="flex min-h-[calc(100dvh_-_env(safe-area-inset-top)_-_4rem)] flex-1 items-center justify-center px-5 py-8 lg:min-h-0 lg:py-12 native:min-h-[calc(100dvh_-_env(safe-area-inset-top))]">
        <Outlet />
      </main>
    </div>
  );
}
