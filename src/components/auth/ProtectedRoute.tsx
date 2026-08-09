import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { LoadingState } from "@/components/common/LoadingState";

export function ProtectedRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();

  if (!initialized) {
    return <LoadingState />;
  }

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
