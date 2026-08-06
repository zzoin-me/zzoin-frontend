import { Outlet } from "react-router";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-8 md:py-12">
      <ScrollToTop />
      <Outlet />
    </div>
  );
}
