import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft, Users, Calendar, MessageCircle, Target } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ApplyModal } from "@/components/project/ApplyModal";
import { getProjectById } from "@/api/projects";
import { useAuthStore } from "@/stores/authStore";
import { calculateDday } from "@/utils/dday";
import { formatKoreanDatetime } from "@/utils/datetime";
import { getCategoryLabel } from "@/constants/recruitment";
import type { ProjectDetail } from "@/types";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const isAuthor = !!(user && project && project.authorNickname === user.nickname);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProjectById(Number(id))
      .then((data) => setProject(data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">불러오는 중...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const dday = calculateDday(project.recruitmentDeadline);
  const totalApplicants = project.recruitments.reduce((sum, r) => sum + r.applicantCount, 0);
  const totalRecruitment = project.recruitments.reduce((sum, r) => sum + r.recruitmentCount, 0);
  const progressPercent =
    totalRecruitment > 0
      ? Math.min(100, Math.round((totalApplicants / totalRecruitment) * 100))
      : 0;

  const collabLabels: Record<string, string> = {
    ONLINE: "온라인",
    OFFLINE: "오프라인",
    BOTH: "온·오프라인",
  };

  const goalLabels: Record<string, string> = {
    PORTFOLIO: "포트폴리오",
    PRODUCTION: "실 서비스",
    COMPETITION: "공모전",
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-grey9"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>

      <div className="flex flex-col gap-6 border-b border-grey3 py-6 md:flex-row md:items-start md:gap-8 md:py-10 lg:items-end lg:justify-between">
        <div className="flex items-start gap-4 md:gap-8 lg:gap-[50px]">
          <div className="h-20 w-20 shrink-0 rounded-card bg-grey5 md:h-[160px] md:w-[160px] lg:h-[200px] lg:w-[200px]">
            {project.imageUrl && (
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-full w-full rounded-card object-cover"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-[22px]">
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-[20px] text-grey9 md:text-[24px]">{project.title}</h1>
              <p className="font-regular text-[14px] text-grey9 md:text-[16px]">
                {project.description}
              </p>
            </div>
            <span className="font-regular text-[14px] text-grey9 md:text-[16px]">
              기한: ~ {formatKoreanDatetime(project.recruitmentDeadline)}
            </span>
            <div className="flex flex-wrap gap-2">
              {project.recruitments.map((r) => (
                <span
                  key={r.id}
                  className="rounded-[5px] border border-grey5 px-[5px] py-[2px] font-regular text-[12px] text-grey7"
                >
                  {r.name}
                </span>
              ))}
              <span className="rounded-[5px] border border-grey5 px-[5px] py-[2px] font-regular text-[12px] text-grey7">
                {goalLabels[project.goalType] ?? project.goalType}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-grey4" />
              <span className="font-semibold text-[14px] text-grey9 md:text-[16px]">
                {project.authorNickname ?? "알 수 없음"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center self-center rounded-full bg-grey5 h-20 w-20 md:h-28 md:w-28 lg:hidden">
          <span className="font-bold text-[16px] text-grey9 md:text-[20px]">{dday}</span>
        </div>

        <div className="hidden shrink-0 self-center lg:flex lg:h-40 lg:w-40 lg:items-center lg:justify-center lg:rounded-full lg:bg-grey5">
          <span className="font-bold text-[36px] text-grey1">{dday}</span>
        </div>
      </div>

      <section className="mt-10 flex flex-col gap-6 md:mt-12 lg:flex-row lg:items-end lg:justify-center lg:gap-[86px]">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">지원현황</h2>
            <span className="font-medium text-[14px] text-grey6 md:text-[16px]">
              {totalApplicants}명 지원 / {totalRecruitment}명 모집
            </span>
          </div>
          <div className="h-7 w-full overflow-hidden rounded-full bg-grey2">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {isAuthor ? (
          <Link
            to={`/projects/${id}/manage`}
            className="hidden h-[54px] w-[160px] shrink-0 items-center justify-center rounded-tag bg-primary px-6 font-bold text-[18px] text-white transition-opacity hover:opacity-90 lg:flex"
          >
            관리하기
          </Link>
        ) : (
          <Button
            size="lg"
            className="hidden w-[160px] lg:flex"
            onClick={() => setShowApplyModal(true)}
          >
            지원하기
          </Button>
        )}
      </section>

      <section className="mt-12 md:mt-16">
        <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">
          지금 모집 중인 직군이에요
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {project.recruitments.map((r) => (
            <div key={r.id} className="rounded-card border border-grey5 p-5 md:p-6">
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-[20px] text-grey9 md:text-[24px]">{r.name}</h3>
                <span className="font-regular text-[12px] text-grey6 md:text-[14px]">
                  {getCategoryLabel(r.category)}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <span className="font-medium text-[12px] text-grey6">지원자격</span>
                  <p className="mt-1 font-regular text-[14px] text-grey9 md:text-[16px]">
                    {r.qualification}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-[12px] text-grey6">우대사항</span>
                  <p className="mt-1 font-regular text-[14px] text-grey9 md:text-[16px]">
                    {r.preferred}
                  </p>
                </div>
                <div className="flex items-center gap-1 font-regular text-[12px] text-grey6">
                  <Users className="h-4 w-4" aria-hidden />
                  모집 인원: {r.recruitmentCount}명 (지원 {r.applicantCount}명)
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 md:mt-16">
        <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">정보</h2>
        <div className="mt-6 flex flex-col gap-8 md:gap-10">
          <div className="rounded-card bg-grey2 p-5 md:p-6">
            <p className="font-medium text-[14px] text-grey6 md:text-[16px]">
              {project.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-grey6" aria-hidden />
                <span className="font-medium text-[12px] text-grey6 md:text-[14px]">진행방식</span>
              </div>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                {collabLabels[project.collaborationType] ?? project.collaborationType}
              </p>
            </div>
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-grey6" aria-hidden />
                <span className="font-medium text-[12px] text-grey6 md:text-[14px]">정기 모임</span>
              </div>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                {project.meetingSchedule || "-"}
              </p>
            </div>
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-grey6" aria-hidden />
                <span className="font-medium text-[12px] text-grey6 md:text-[14px]">
                  커뮤니케이션
                </span>
              </div>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                {project.communicationTool}
              </p>
            </div>
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-grey6" aria-hidden />
                <span className="font-medium text-[12px] text-grey6 md:text-[14px]">목표</span>
              </div>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                {goalLabels[project.goalType] ?? project.goalType}
              </p>
            </div>
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <span className="font-medium text-[12px] text-grey6 md:text-[14px]">예상 기간</span>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                {project.period || "-"}
              </p>
            </div>
            <div className="rounded-card border border-grey5 p-4 md:p-5">
              <span className="font-medium text-[12px] text-grey6 md:text-[14px]">모집 마감</span>
              <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">{dday}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 lg:hidden">
        {isAuthor ? (
          <Link
            to={`/projects/${id}/manage`}
            className="flex h-[54px] w-full items-center justify-center rounded-tag bg-primary px-6 font-bold text-[18px] text-white transition-opacity hover:opacity-90"
          >
            관리하기
          </Link>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setShowApplyModal(true)}>
            지원하기
          </Button>
        )}
      </div>

      {project && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          recruitments={project.recruitments}
        />
      )}
    </div>
  );
}
