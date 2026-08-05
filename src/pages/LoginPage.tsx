import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { socialLoginUrl } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const socialError = searchParams.get("error");
    if (socialError === "social_conflict") {
      const existing = searchParams.get("existingProvider");
      const label =
        existing === "google" ? "구글" : existing === "kakao" ? "카카오" : existing ?? "다른";
      return `이미 ${label} 계정으로 가입된 이메일입니다. ${label} 로그인을 이용해주세요.`;
    }
    if (socialError === "social_failed") {
      return "소셜 로그인에 실패했습니다. 다시 시도해주세요.";
    }
    return "";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      const redirect = searchParams.get("redirect");
      const safe = redirect && redirect.startsWith("/") ? redirect : "/";
      navigate(safe, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[400px] flex-col">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <img src="/logo.svg" alt="Zzoin logo" width={48} height={48} />
        <img src="/logo-wordmark.svg" alt="Zzoin" height={40} className="h-[40px] w-auto" />
        <p className="font-regular text-[14px] text-grey6">로그인하고 프로젝트를 시작해보세요</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="email"
          type="email"
          label="이메일"
          placeholder="이메일을 입력해주세요"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
        <Input
          id="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-4">
        <div className="h-px flex-1 bg-grey3" />
        <span className="font-regular text-[12px] text-grey5">또는</span>
        <div className="h-px flex-1 bg-grey3" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => (window.location.href = socialLoginUrl("google"))}
          className="flex w-full items-center justify-center gap-2 rounded-tag border border-grey3 bg-white px-5 py-2.5 font-medium text-[14px] text-grey9 transition-colors hover:bg-grey1"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          구글로 로그인
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = socialLoginUrl("kakao"))}
          className="flex w-full items-center justify-center gap-2 rounded-tag bg-[#FEE500] px-5 py-2.5 font-medium text-[14px] text-black transition-filter hover:brightness-95"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.79 5.25 4.5 6.69-.2.62-.74 2.24-.85 2.59-.14.44.16.43.34.31.14-.09 2.23-1.52 3.13-2.14.94.13 1.92.2 2.88.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
          카카오로 로그인
        </button>
      </div>

      <p className="mt-8 text-center font-regular text-[13px] text-grey6">
        아직 계정이 없으신가요?{" "}
        <Link
          to={
            searchParams.get("redirect")
              ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/signup"
          }
          className="font-medium text-grey9 underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}
