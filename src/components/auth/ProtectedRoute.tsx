import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
