import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const isNew = searchParams.get("isNew") === "true";

    if (!accessToken || !refreshToken) {
      navigate("/login?error=social_failed", { replace: true });
      return;
    }

    loginWithTokens(accessToken, refreshToken)
      .then(() => {
        navigate(isNew ? "/onboarding" : "/", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=social_failed", { replace: true });
      });
  }, [searchParams, loginWithTokens, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="font-regular text-[16px] text-grey6">로그인 처리 중...</p>
    </div>
  );
}
