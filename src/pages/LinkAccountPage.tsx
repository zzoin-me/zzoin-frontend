import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { linkAccount } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/api/client";
import { Loader2 } from "lucide-react";

export default function LinkAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);

  const tempToken = searchParams.get("tempToken") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const providerId = searchParams.get("providerId") ?? "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await linkAccount({ tempToken, password, provider, providerId });
      await loginWithTokens(res.accessToken, res.refreshToken);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "계정 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken || !provider) {
    return (
      <div className="flex w-full max-w-[400px] flex-col items-center gap-4 py-20 text-center">
        <p className="font-regular text-[16px] text-grey6">잘못된 접근입니다.</p>
        <Button variant="outline" onClick={() => navigate("/login", { replace: true })}>
          로그인으로 돌아가기
        </Button>
      </div>
    );
  }

  const providerLabel = provider === "google" ? "구글" : provider === "kakao" ? "카카오" : provider;

  return (
    <div className="flex w-full max-w-[400px] flex-col md:max-w-[480px]">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <img src="/logo.svg" alt="Zzoin logo" width={40} height={40} />
        <h1 className="font-bold text-[22px] text-grey9 md:text-[24px]">계정 연결</h1>
        <p className="font-regular text-[14px] text-grey6">
          이 이메일로 이미 가입된 계정이 있습니다.
          <br />
          보안을 위해 비밀번호를 입력해주세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-tag bg-primary-light px-4 py-3">
          <p className="font-medium text-[13px] text-grey8">
            {providerLabel} 계정을 기존 계정에 연결합니다.
          </p>
        </div>
        <Input
          id="link-password"
          type="password"
          label="비밀번호"
          placeholder="기존 계정의 비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden />}
          {loading ? "연결 중" : "계정 연결하기"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={() => navigate("/login", { replace: true })}
        >
          취소
        </Button>
      </form>
    </div>
  );
}
