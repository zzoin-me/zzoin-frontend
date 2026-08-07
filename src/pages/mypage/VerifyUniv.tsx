import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { sendUnivEmail, verifyUnivEmail } from "@/api/auth";
import { ApiError } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";

export default function VerifyUnivPage() {
  const navigate = useNavigate();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [emailPrefix, setEmailPrefix] = useState("");
  const [domain, setDomain] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fullEmail = `${emailPrefix}@${domain}`;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailPrefix || !domain) {
      setError("이메일을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await sendUnivEmail(fullEmail);
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
    if (!code) {
      setError("인증번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await verifyUnivEmail(fullEmail, code);
      await restoreSession();
      navigate("/mypage", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-bold text-[24px] text-grey9">대학교 인증</h1>
      <p className="mt-2 font-regular text-[14px] text-grey6">
        대학교 이메일로 인증하면 모든 기능을 사용할 수 있어요.
      </p>

      <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-2 block font-medium text-[14px] text-grey8">대학교 이메일</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="이메일"
              value={emailPrefix}
              onChange={(e) => {
                setEmailPrefix(e.target.value);
                setCodeSent(false);
                setError("");
              }}
              className="w-1/2 rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
            />
            <span className="shrink-0 font-medium text-[16px] text-grey6">@</span>
            <input
              type="text"
              placeholder="도메인"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setCodeSent(false);
                setError("");
              }}
              className="w-1/2 rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
            />
          </div>
        </div>

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
              disabled={loading || codeSent || !emailPrefix || !domain}
            >
              {codeSent ? "발송됨" : "인증번호 발송"}
            </Button>
          </div>
        </div>

        {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || !codeSent}>
          {loading ? "인증번호 발송 중" : "인증 완료하기"}
        </Button>
      </form>
    </div>
  );
}
