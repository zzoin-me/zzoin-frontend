import { Star, X } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ProjectApplicant } from "@/types";

interface ApplicantDetailModalProps {
  applicant: ProjectApplicant | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}`;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-[12px] text-grey6 md:text-[14px]">{label}</span>
      <span className="font-medium text-[14px] text-grey9 md:text-[16px]">{value || "-"}</span>
    </div>
  );
}

export function ApplicantDetailModal({ applicant, onClose }: ApplicantDetailModalProps) {
  if (!applicant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-card bg-white p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-[20px] text-grey9">지원자 정보</h2>
          <button onClick={onClose} className="text-grey5 hover:text-grey9" aria-label="닫기">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            {applicant.profileUrl ? (
              <img
                src={applicant.profileUrl}
                alt={applicant.nickName}
                className="h-[64px] w-[64px] rounded-full object-cover md:h-[76px] md:w-[76px]"
              />
            ) : (
              <div className="h-[64px] w-[64px] rounded-full bg-grey4 md:h-[76px] md:w-[76px]" />
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[18px] text-grey9 md:text-[20px]">
                  {applicant.nickName}
                </span>
                <StatusBadge status={applicant.status} />
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-grey9 text-grey9" aria-hidden />
                <span className="font-medium text-[14px] text-grey7">
                  {applicant.ratingAvg.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoRow label="지원 직군" value={applicant.recruitmentName} />
            <InfoRow label="학교" value={applicant.schoolName} />
            <InfoRow label="전공" value={applicant.major} />
            <InfoRow label="학년" value={applicant.grade ? `${applicant.grade}학년` : "-"} />
            <InfoRow label="지원일" value={formatDate(applicant.applicationDate)} />
            <InfoRow
              label="기술 스택"
              value={applicant.stackNames.length > 0 ? applicant.stackNames.join(", ") : "-"}
            />
          </div>

          <div className="rounded-tag border border-grey3 bg-grey1 px-4 py-4">
            <span className="mb-2 block font-medium text-[14px] text-grey8">지원 동기</span>
            <p className="font-regular text-[14px] leading-relaxed text-grey9 md:text-[16px]">
              {applicant.letter}
            </p>
          </div>

          {applicant.answers && applicant.answers.length > 0 && (
            <div>
              <span className="mb-3 block font-medium text-[14px] text-grey8">추가 질문 답변</span>
              <div className="flex flex-col gap-3">
                {applicant.answers.map((a, i) => (
                  <div key={i} className="rounded-tag border border-grey3 bg-grey1 px-4 py-4">
                    <span className="mb-1 block font-medium text-[13px] text-grey7">{a.questionLabel}</span>
                    <p className="font-regular text-[14px] leading-relaxed text-grey9 md:text-[16px]">
                      {a.answerText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {applicant.histories.length > 0 && (
            <div>
              <span className="mb-3 block font-medium text-[14px] text-grey8">참여 이력</span>
              <div className="flex flex-col gap-2">
                {applicant.histories.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-tag border border-grey3 px-4 py-3"
                  >
                    <span className="font-medium text-[14px] text-grey9">{h.projectName}</span>
                    <span className="font-regular text-[12px] text-grey6">
                      {formatDate(h.joinedAt)} ~{" "}
                      {h.completedAt ? formatDate(h.completedAt) : "진행중"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
