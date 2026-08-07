import { Outlet } from "react-router";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5 pb-8 pt-[calc(env(safe-area-inset-top)+32px)] md:py-12">
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-40 h-[env(safe-area-inset-top)] bg-bg"
      />
      <ScrollToTop />
      <Outlet />
    </div>
  );
}
