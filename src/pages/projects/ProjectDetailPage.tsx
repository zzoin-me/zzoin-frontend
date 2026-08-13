import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, MessageCircle, Target, ClipboardPenLine } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { ApplyModal } from "@/components/project/ApplyModal";
import { getProjectById } from "@/api/projects";
import { getChatRooms } from "@/api/chat";
import { getReviewTargets } from "@/api/reviews";
import { useAuthStore } from "@/stores/authStore";
import { calculateDday } from "@/utils/dday";
import { formatKoreanDatetime } from "@/utils/datetime";
import { getCategoryLabel } from "@/constants/recruitment";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const projectId = id ? Number(id) : NaN;

  const { data: project, isLoading } = useQuery({
    queryKey: ["project-detail", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !Number.isNaN(projectId),
  });

  const { data: chatRooms = [] } = useQuery({
    queryKey: ["project-chats"],
    queryFn: getChatRooms,
    enabled: !!user?.verified,
    staleTime: 30_000,
  });

  const isAuthor = !!(user && project && project.authorNickname === user.nickname);

  const reviewTargetsQuery = useQuery({
    queryKey: ["reviews", "targets", projectId],
    queryFn: () => getReviewTargets(projectId),
    enabled: !!user?.verified && project?.projectStatus === "COMPLETED",
    retry: false,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] native:px-8">
        <PageHeader title="프로젝트 상세" backTo="/projects" className="mb-2" />
        <p className="py-10 font-regular text-[16px] text-grey6">프로젝트를 찾을 수 없습니다.</p>
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

  const chatStatus =
    project.projectStatus === "IN_PROGRESS" || project.projectStatus === "COMPLETED";
  const hasChatAccess =
    chatStatus && (isAuthor || chatRooms.some((room) => room.projectId === project.id));
  const renderPrimaryAction = (className: string) => {
    if (hasChatAccess) {
      return (
        <div className={`flex flex-col gap-2 ${className}`}>
          <Link
            to={`/projects/${id}/chat`}
            className="flex h-[54px] w-full items-center justify-center rounded-tag bg-primary px-6 font-bold text-[18px] text-white transition-opacity hover:opacity-90"
          >
            프로젝트 대화
          </Link>
          {project.projectStatus === "COMPLETED" && reviewTargetsQuery.isSuccess && (
            <Link
              to={`/mypage/reviews/${id}`}
              className="flex h-[54px] w-full items-center justify-center gap-2 rounded-tag border border-primary bg-bg px-6 font-bold text-[16px] text-primary transition-colors hover:bg-primary-light"
            >
              <ClipboardPenLine className="h-5 w-5" aria-hidden />
              프로젝트 후기
            </Link>
          )}
        </div>
      );
    }
    if (isAuthor) {
      return (
        <Link
          to={`/projects/${id}/manage`}
          className={`flex h-[54px] items-center justify-center rounded-tag bg-primary px-6 font-bold text-[18px] text-white transition-opacity hover:opacity-90 ${className}`}
        >
          관리하기
        </Link>
      );
    }
    if (project.projectStatus === "RECRUITING") {
      return (
        <Button size="lg" className={className} onClick={() => setShowApplyModal(true)}>
          지원하기
        </Button>
      );
    }
    return (
      <div
        className={`flex h-[54px] items-center justify-center whitespace-nowrap rounded-tag border border-grey4 bg-grey1 px-6 font-medium text-[15px] text-grey6 ${className}`}
      >
        모집이 마감되었습니다
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] native:px-8">
      <PageHeader title="프로젝트 상세" backTo="/projects" className="mb-2" />

      <div className="flex flex-col gap-6 border-b border-grey3 py-6 md:flex-row md:items-start md:gap-8 md:py-10 lg:items-end lg:justify-between native:flex-col native:items-stretch">
        <div className="flex items-start gap-4 md:gap-8 lg:gap-[50px]">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary md:h-[160px] md:w-[160px] lg:h-[200px] lg:w-[200px]">
            <span className="font-bold text-[24px] text-white md:text-[48px] lg:text-[60px]">
              {dday}
            </span>
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
              <Avatar nickname={project.authorNickname} size="sm" />
              <span className="font-semibold text-[14px] text-grey9 md:text-[16px]">
                {project.authorNickname ?? "알 수 없음"}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block native:hidden">
          {renderPrimaryAction("w-[180px]")}
        </div>
      </div>

      <section className="mt-10 flex flex-col gap-6 md:mt-12">
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

      <div className="mt-12 lg:hidden native:block">{renderPrimaryAction("w-full")}</div>

      {project && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          recruitments={project.recruitments}
          questions={project.questions ?? []}
        />
      )}
    </div>
  );
}
