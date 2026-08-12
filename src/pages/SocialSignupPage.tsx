import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { completeSocialSignup } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuthStore } from "@/stores/authStore";

type Step = "confirm" | "nickname";

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9.]{2,50}$/;

function createNicknameCandidate(value: string, providerLabel: string): string {
  const candidate = value.replace(/[^가-힣a-zA-Z0-9.]/g, "").slice(0, 50);
  return candidate.length >= 2 ? candidate : providerLabel;
}

export default function SocialSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((state) => state.loginWithTokens);

  const signupToken = searchParams.get("signupToken") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const email = searchParams.get("email") ?? "";
  const providerLabel = provider === "google" ? "구글" : provider === "kakao" ? "카카오" : "소셜";
  const suggestedNickname = searchParams.get("suggestedNickname") ?? "";

  const [step, setStep] = useState<Step>("confirm");
  const [nickname, setNickname] = useState(() =>
    createNicknameCandidate(suggestedNickname, providerLabel),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedNickname = nickname.trim();
    if (!NICKNAME_PATTERN.test(normalizedNickname)) {
      setError("영문, 한글, 숫자, 점으로 구성된 2~50자 닉네임을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const result = await completeSocialSignup({
        signupToken,
        nickName: normalizedNickname,
      });
      await loginWithTokens(result.accessToken, result.refreshToken);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!signupToken || !provider) {
    return (
      <div className="flex w-full max-w-[400px] flex-col items-center gap-4 py-20 text-center">
        <p className="font-regular text-[16px] text-grey6">가입 정보를 확인할 수 없습니다.</p>
        <Button variant="outline" onClick={() => navigate("/login", { replace: true })}>
          로그인으로 돌아가기
        </Button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex w-full max-w-[400px] flex-col md:max-w-[480px]">
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/logo.svg" alt="Zzoin logo" width={48} height={48} />
          <h1 className="font-bold text-[22px] text-grey9 md:text-[24px]">
            이 계정으로 가입할까요?
          </h1>
          <p className="font-regular text-[14px] text-grey6">아직 연결된 Zzoin 계정이 없습니다.</p>
        </header>

        <div className="mb-6 flex flex-col gap-1 rounded-tag border border-grey3 bg-grey1 px-4 py-4">
          <span className="font-medium text-[15px] text-grey9">{providerLabel} 계정</span>
          {email && <span className="break-all font-regular text-[14px] text-grey6">{email}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" size="lg" className="w-full" onClick={() => setStep("nickname")}>
            가입하기
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login", { replace: true })}
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col md:max-w-[480px]">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <img src="/logo.svg" alt="Zzoin logo" width={48} height={48} />
        <h1 className="font-bold text-[22px] text-grey9 md:text-[24px]">닉네임을 설정해주세요</h1>
        <p className="font-regular text-[14px] text-grey6">
          프로젝트에서 사용할 닉네임을 입력해주세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="social-signup-nickname"
          label="닉네임"
          placeholder="영문, 한글, 숫자, 점 2~50자"
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setError("");
          }}
          maxLength={50}
          autoFocus
        />
        {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden />}
          {loading ? "가입 중" : "가입 완료"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={() => {
            setError("");
            setStep("confirm");
          }}
          disabled={loading}
        >
          이전
        </Button>
      </form>
    </div>
  );
}
