import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { socialLoginUrl } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/api/client";
import { sendSignupEmail, verifySignupEmail } from "@/api/auth";
import { getUnivs } from "@/api/univ";
import type { UnivInfo } from "@/api/univ";

type Step = "method" | "email" | "password" | "nickname";

function GoogleIcon() {
  return (
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
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.79 5.25 4.5 6.69-.2.62-.74 2.24-.85 2.59-.14.44.16.43.34.31.14-.09 2.23-1.52 3.13-2.14.94.13 1.92.2 2.88.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const signupAndLogin = useAuthStore((s) => s.signupAndLogin);

  const [step, setStep] = useState<Step>("method");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [univs, setUnivs] = useState<UnivInfo[]>([]);

  useEffect(() => {
    getUnivs()
      .then(setUnivs)
      .catch(() => {});
  }, []);

  const emailDomain = email.includes("@") ? email.split("@")[1] : "";
  const isUnivEmail = univs.some(
    (u) => emailDomain === u.domain || emailDomain.endsWith("." + u.domain),
  );

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendSignupEmail(email);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "이메일 발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifySignupEmail(email, code);
      setSignupToken(res.token);
      setStep("password");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,50}$/.test(password)) {
      setError("영문과 숫자를 포함하여 8자 이상 50자 이하로 입력해주세요.");
      return;
    }
    if (!passwordConfirm) {
      setError("비밀번호 확인을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setStep("nickname");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (!/^[가-힣a-zA-Z0-9.]{2,50}$/.test(nickname)) {
      setError("영문, 한글, 숫자, 점으로 구성된 2~50자 닉네임을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await signupAndLogin({ nickName: nickname, email, password, signupToken });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[400px] flex-col">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <img src="/logo.svg" alt="Zzoin logo" width={48} height={48} />
        <img src="/logo-wordmark.svg" alt="Zzoin" height={40} className="h-[40px] w-auto" />
        <p className="font-regular text-[14px] text-grey6">회원가입이 프로젝트의 첫걸음입니다</p>
      </header>

      {step === "method" && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => (window.location.href = socialLoginUrl("google"))}
            className="flex w-full items-center justify-center gap-2 rounded-tag border border-grey3 bg-bg px-5 py-2.5 font-medium text-[14px] text-grey9 transition-colors hover:bg-grey1"
          >
            <GoogleIcon />
            구글로 회원가입
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = socialLoginUrl("kakao"))}
            className="flex w-full items-center justify-center gap-2 rounded-tag bg-[#FEE500] px-5 py-2.5 font-medium text-[14px] text-black transition-filter hover:brightness-95"
          >
            <KakaoIcon />
            카카오로 회원가입
          </button>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex items-center gap-1.5 cursor-pointer font-medium text-[14px] text-grey9 underline underline-offset-4`"
            >
              이메일로 계속하기
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setCodeSent(false);
            }}
          />

          {isUnivEmail && (
            <p className="-mt-1 font-medium text-[13px] text-green-600">
              ✓ 학교 이메일로 회원가입시 2차 학교 인증이 즉시 완료됩니다!
            </p>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="verify-code"
                label="인증번호"
                placeholder="인증번호 6자리"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleSendCode}
                variant="outline"
                className="shrink-0"
                disabled={loading || codeSent}
              >
                {codeSent ? "발송됨" : "인증번호 발송"}
              </Button>
            </div>
          </div>

          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || !codeSent}>
            {loading ? "인증번호 발송 중" : "이메일 인증 완료하기"}
          </Button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordNext} className="flex flex-col gap-3">
          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="영문 숫자 포함 8자 이상"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          <Input
            id="password-confirm"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setError("");
            }}
          />
          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="mt-2 w-full">
            다음
          </Button>
        </form>
      )}

      {step === "nickname" && (
        <form onSubmit={handleFinalSubmit} className="flex flex-col gap-3">
          <Input
            id="nickname"
            label="닉네임"
            placeholder="영문, 한글, 숫자, 점 2~50자"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
          />
          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? "가입 중..." : "가입 완료"}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center font-regular text-[13px] text-grey6">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="font-medium text-grey9 underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
