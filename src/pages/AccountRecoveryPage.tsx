import { useState } from "react";
import { CalendarClock, RotateCcw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { recoverAccount } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/stores/authStore";

function formatDeadline(value: string | null): string {
  if (!value) return "탈퇴일로부터 30일 이내";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "탈퇴일로부터 30일 이내";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function providerLabel(provider: string | null): string {
  if (provider === "kakao") return "카카오";
  if (provider === "google") return "구글";
  return "이메일";
}

export default function AccountRecoveryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((state) => state.loginWithTokens);
  const deadline = formatDeadline(searchParams.get("recoverableUntil"));
  const loginMethod = providerLabel(searchParams.get("provider"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecover = async () => {
    const recoveryToken = sessionStorage.getItem("accountRecoveryToken") ?? undefined;
    setLoading(true);
    setError("");
    try {
      const result = await recoverAccount(recoveryToken);
      if (!result.accessToken || !result.refreshToken) {
        throw new Error("로그인 토큰이 없습니다.");
      }
      sessionStorage.removeItem("accountRecoveryToken");
      await loginWithTokens(result.accessToken, result.refreshToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "계정 복구에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex w-full max-w-[440px] flex-col items-center rounded-card border border-grey3 bg-bg px-6 py-8 text-center shadow-sm md:px-10 md:py-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
        <RotateCcw className="h-8 w-8" aria-hidden />
      </div>
      <p className="mt-5 font-medium text-[13px] text-primary">{loginMethod} 계정 확인 완료</p>
      <h1 className="mt-2 font-bold text-[24px] text-grey9">탈퇴 접수된 계정이에요</h1>
      <p className="mt-3 font-regular text-[14px] leading-6 text-grey6">
        복구하면 기존 프로필을 그대로 다시 이용할 수 있어요.
      </p>
      <div className="mt-6 flex w-full items-center gap-3 rounded-[14px] bg-grey1 px-4 py-4 text-left">
        <CalendarClock className="h-5 w-5 shrink-0 text-grey6" aria-hidden />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-regular text-[12px] text-grey5">복구 가능 기한</span>
          <span className="font-medium text-[14px] text-grey9">{deadline}</span>
        </div>
      </div>
      {error && <p className="mt-4 font-regular text-[13px] text-red-500">{error}</p>}
      <Button
        type="button"
        size="lg"
        className="mt-7 w-full"
        disabled={loading}
        onClick={handleRecover}
      >
        {loading ? "복구 중..." : "계정 복구하기"}
      </Button>
      <Link
        to="/login"
        className="mt-4 font-medium text-[14px] text-grey6 underline underline-offset-4"
      >
        복구하지 않고 로그인으로 돌아가기
      </Link>
    </section>
  );
}
