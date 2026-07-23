import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { applyProject } from "@/api/application";
import { ApiError } from "@/api/client";
import type { Recruitment } from "@/types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruitments: Recruitment[];
}

export function ApplyModal({ isOpen, onClose, recruitments }: ApplyModalProps) {
  const [selectedRecruitment, setSelectedRecruitment] = useState<number | null>(null);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRecruitment) {
      setError("지원할 역할을 선택해주세요.");
      return;
    }

    if (letter.trim().length < 10) {
      setError("자기소개서를 10자 이상 입력해주세요.");
      return;
    }

    if (letter.length > 500) {
      setError("자기소개서는 500자 이하로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await applyProject({ recruitmentId: selectedRecruitment, letter });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "지원에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRecruitment(null);
    setLetter("");
    setError("");
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-card bg-white p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            <h2 className="font-bold text-[20px] text-grey9">지원 완료!</h2>
            <p className="font-regular text-[14px] text-grey6">
              결과는 마이페이지에서 확인할 수 있어요.
            </p>
            <Button onClick={handleClose} className="mt-4">
              확인
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-[20px] text-grey9">지원하기</h2>
              <button
                onClick={handleClose}
                className="text-grey5 hover:text-grey9"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">지원할 역할</label>
                <div className="flex flex-wrap gap-2">
                  {recruitments.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRecruitment(r.id)}
                      className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                        selectedRecruitment === r.id
                          ? "border-grey9 bg-grey9 text-white"
                          : "border-grey3 bg-white text-grey7 hover:border-grey5"
                      }`}
                    >
                      {r.name} ({r.recruitmentCount}명)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">자기소개서</label>
                <textarea
                  placeholder="본인을 소개하고 이 프로젝트에 기여할 수 있는 이유를 적어주세요. (10~500자)"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  maxLength={500}
                  rows={6}
                  className="w-full resize-none rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                />
                <span className="mt-1 block text-right font-regular text-[12px] text-grey5">
                  {letter.length}/500
                </span>
              </div>

              {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "지원 중..." : "지원하기"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
