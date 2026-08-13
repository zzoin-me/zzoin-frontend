import { useState } from "react";
import { Link2Off, X } from "lucide-react";
import { unlinkSocial } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useModal } from "@/hooks/useModal";

interface SocialUnlinkModalProps {
  isOpen: boolean;
  providerLabel: string;
  onClose: () => void;
  onUnlinked: () => void;
}

export function SocialUnlinkModal({
  isOpen,
  providerLabel,
  onClose,
  onUnlinked,
}: SocialUnlinkModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await unlinkSocial(password);
      setPassword("");
      onUnlinked();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "소셜 연동 해제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-5"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${providerLabel} 연동 해제`}
        className="w-full max-w-[460px] rounded-card bg-bg p-6 md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-grey1 text-grey7">
              <Link2Off className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-bold text-[20px] text-grey9">{providerLabel} 연동 해제</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-grey5 hover:text-grey9"
            aria-label="닫기"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>
        <p className="mt-5 font-regular text-[14px] leading-6 text-grey6">
          연동을 해제하면 {providerLabel} 로그인을 사용할 수 없어요. 이메일 로그인은 계속 사용할 수
          있습니다.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            id="social-unlink-password"
            type="password"
            label="비밀번호 확인"
            placeholder="현재 비밀번호를 입력해주세요"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
          />
          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "해제 중..." : "연동 해제"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
