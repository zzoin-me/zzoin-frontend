import { useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ApiError } from "@/api/client";
import { sendWithdrawEmail, withdraw } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useModal } from "@/hooks/useModal";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const modalRef = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const resetState = () => {
    setCode("");
    setCodeSent(false);
    setLoading(false);
    setSending(false);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendCode = async () => {
    setError("");
    setSending(true);
    try {
      await sendWithdrawEmail();
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "인증번호 발송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await withdraw(code);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원 탈퇴에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    resetState();
    onClose();
    await logout();
    navigate("/");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-5"
      onClick={success ? handleComplete : handleClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="회원 탈퇴"
        className="max-h-[90dvh] w-full max-w-[500px] touch-pan-y overflow-y-auto overscroll-contain rounded-card bg-bg p-6 [-webkit-overflow-scrolling:touch] md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-grey2">
              <svg
                className="h-8 w-8 text-grey7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="font-bold text-[20px] text-grey9">탈퇴 완료</h2>
            <p className="font-regular text-[14px] text-grey6">
              그동안 이용해주셔서 감사합니다. 이용해주신 계정은 삭제되었습니다.
            </p>
            <Button onClick={handleComplete} className="mt-4">
              확인
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-[20px] text-red-600">회원 탈퇴</h2>
              <button
                onClick={handleClose}
                className="text-grey5 hover:text-grey9"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 rounded-tag border border-grey3 bg-grey1 px-4 py-3">
              <p className="font-medium text-[14px] text-grey8">탈퇴 전 확인해주세요</p>
              <p className="mt-1 font-regular text-[13px] text-grey6">
                탈퇴 시 계정과 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="withdraw-code" className="font-medium text-[14px] text-grey8">
                  인증번호
                </label>
                <div className="flex gap-2">
                  <Input
                    id="withdraw-code"
                    placeholder="인증번호 6자리"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    inputMode="numeric"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    variant="outline"
                    className="shrink-0"
                    disabled={sending || codeSent}
                  >
                    {codeSent ? "발송됨" : "인증번호 발송"}
                  </Button>
                </div>
                <span className="font-regular text-[12px] text-grey6">
                  가입하신 이메일로 발송된 인증번호를 입력해주세요.
                </span>
              </div>

              {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading || !codeSent}
              >
                {loading ? "탈퇴 중..." : "탈퇴하기"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
