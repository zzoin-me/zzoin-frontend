import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { getProjectById } from "@/api/projects";
import type { Project } from "@/types";

interface RecruitRole {
  role: string;
  qualification: string;
  preferred: string;
}

interface Attribute {
  label: string;
  value: string;
}

const recruitRoles: RecruitRole[] = [
  {
    role: "기획",
    qualification: "프로젝트 기획 경험 1회 이상",
    preferred: "UX 리서치 경험자",
  },
  {
    role: "프론트엔드",
    qualification: "React 경험 6개월 이상",
    preferred: "TypeScript, Next.js 경험자",
  },
  {
    role: "디자인",
    qualification: "Figma 사용 가능",
    preferred: "UX/UI 디자인 경험자",
  },
];

const attributes: Attribute[] = [
  { label: "진행방식", value: "온라인" },
  { label: "정기 모임", value: "매주 화, 목 20시" },
  { label: "회의", value: "Discord" },
  { label: "모집 인원", value: "4명" },
  { label: "예상 기간", value: "3개월" },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProjectById(id).then((p) => {
      if (active) setProject(p ?? null);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const appliedCount = 12;
  const progressPercent = Math.min(100, (project.currentMembers / project.maxMembers) * 100);

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
            {project.thumbnail && (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="h-full w-full rounded-card object-cover"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-4 lg:gap-[22px]">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-bold text-[20px] text-grey9 md:text-[24px] lg:text-[28px]">
                {project.title}
              </h1>
              <span className="shrink-0 rounded-tag bg-grey9 px-2 py-1 font-bold text-[12px] text-white md:hidden">
                {project.dday}
              </span>
            </div>
            <p className="font-medium text-[14px] text-grey7 md:text-[16px]">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-tag bg-grey2 px-2 py-1 font-regular text-[12px] text-grey7"
                >
                  {t}
                </span>
              ))}
            </div>
            <span className="font-regular text-[12px] text-grey6 md:text-[14px]">
              {project.author} · {project.currentMembers}/{project.maxMembers}명 모집
            </span>
          </div>
        </div>

        <div className="hidden h-40 w-40 shrink-0 items-center justify-center self-center rounded-full bg-grey5 lg:flex">
          <span className="font-bold text-[36px] text-grey1">{project.dday}</span>
        </div>
      </div>

      <section className="mt-10 flex flex-col gap-6 md:mt-12 lg:flex-row lg:items-end lg:justify-center lg:gap-[86px]">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">지원현황</h2>
            <span className="font-medium text-[14px] text-grey6">
              {appliedCount}명 지원 / {project.maxMembers}명 모집
            </span>
          </div>
          <div className="h-7 w-full overflow-hidden rounded-full bg-grey2">
            <div
              className="h-full rounded-full bg-grey9 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <Button size="lg" className="hidden w-[160px] lg:flex">
          지원하기
        </Button>
      </section>

      <section className="mt-12 md:mt-16">
        <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">
          지금 모집 중인 직군이에요
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {recruitRoles.map((r) => (
            <div key={r.role} className="rounded-card border border-grey5 p-5 md:p-6">
              <h3 className="font-bold text-[20px] text-grey9 md:text-[24px]">{r.role}</h3>
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
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 md:mt-16">
        <h2 className="font-bold text-[20px] text-grey9 md:text-[24px]">정보</h2>
        <div className="mt-6 flex flex-col gap-8 md:mt-8 md:gap-10">
          <div className="rounded-card bg-grey2 p-5 md:p-6">
            <p className="font-medium text-[14px] text-grey6 md:text-[16px] md:text-[20px]">
              {project.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {attributes.map((attr) => (
              <div key={attr.label} className="rounded-card border border-grey5 p-4 md:p-5">
                <span className="font-medium text-[12px] text-grey6 md:text-[14px]">
                  {attr.label}
                </span>
                <p className="mt-2 font-medium text-[14px] text-grey9 md:text-[16px]">
                  {attr.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12 lg:hidden">
        <Button size="lg" className="w-full">
          지원하기
        </Button>
      </div>
    </div>
  );
}
