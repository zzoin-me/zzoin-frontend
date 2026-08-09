import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { applyProject } from "@/api/application";
import { ApiError } from "@/api/client";
import { useModal } from "@/hooks/useModal";
import type { Recruitment, CustomQuestion } from "@/types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruitments: Recruitment[];
  questions?: CustomQuestion[];
}

export function ApplyModal({ isOpen, onClose, recruitments, questions = [] }: ApplyModalProps) {
  const [selectedRecruitment, setSelectedRecruitment] = useState<number | null>(null);
  const [letter, setLetter] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const modalRef = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const setAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMultiAnswer = (questionId: number, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? "";
      const selected = current ? current.split(",") : [];
      if (selected.includes(option)) {
        const next = selected.filter((s) => s !== option);
        return { ...prev, [questionId]: next.join(",") };
      }
      return { ...prev, [questionId]: [...selected, option].join(",") };
    });
  };

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

    const missingRequired = questions.filter((q) => q.required && !answers[q.id]?.trim());
    if (missingRequired.length > 0) {
      setError(`필수 질문에 답변해주세요: ${missingRequired[0].label}`);
      return;
    }

    setLoading(true);
    try {
      const answerList = questions
        .filter((q) => answers[q.id]?.trim())
        .map((q) => ({ questionId: q.id, answerText: answers[q.id].trim() }));

      await applyProject({
        recruitmentId: selectedRecruitment,
        letter,
        answers: answerList.length > 0 ? answerList : undefined,
      });
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
    setAnswers({});
    setError("");
    setSuccess(false);
    setLoading(false);
    onClose();
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
        aria-label="프로젝트 지원"
        className="max-h-[90dvh] w-full max-w-[500px] touch-pan-y overflow-y-auto overscroll-contain rounded-card bg-bg p-6 [-webkit-overflow-scrolling:touch] md:p-8"
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
                <label className="mb-2 block font-medium text-[14px] text-grey8">
                  지원할 역할 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {recruitments.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRecruitment(r.id)}
                      className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                        selectedRecruitment === r.id
                          ? "border-primary bg-primary text-white"
                          : "border-grey3 bg-bg text-grey7 hover:border-grey5"
                      }`}
                    >
                      {r.name} ({r.recruitmentCount}명)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">
                  자기소개서 <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="본인을 소개하고 이 프로젝트에 기여할 수 있는 이유를 적어주세요. (10~500자)"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  maxLength={500}
                  rows={6}
                  className="w-full resize-none rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                />
                <span className="mt-1 block text-right font-regular text-[12px] text-grey5">
                  {letter.length}/500
                </span>
              </div>

              {questions.map((q) => (
                <div key={q.id}>
                  <label className="mb-2 block font-medium text-[14px] text-grey8">
                    {q.label}
                    {q.required && <span className="text-red-500"> *</span>}
                  </label>
                  {q.type === "TEXT" && (
                    <textarea
                      placeholder="답변을 입력해주세요."
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full resize-none rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                    />
                  )}
                  {q.type === "SINGLE_CHOICE" && (
                    <div className="flex flex-wrap gap-2">
                      {(q.options ?? []).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(q.id, opt)}
                          className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                            answers[q.id] === opt
                              ? "border-primary bg-primary text-white"
                              : "border-grey3 bg-bg text-grey7 hover:border-grey5"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === "MULTI_CHOICE" && (
                    <div className="flex flex-wrap gap-2">
                      {(q.options ?? []).map((opt) => {
                        const selected = (answers[q.id] ?? "")
                          .split(",")
                          .filter(Boolean)
                          .includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleMultiAnswer(q.id, opt)}
                            className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                              selected
                                ? "border-primary bg-primary text-white"
                                : "border-grey3 bg-bg text-grey7 hover:border-grey5"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <p className="font-regular text-[12px] text-grey5">
                <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
              </p>

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
