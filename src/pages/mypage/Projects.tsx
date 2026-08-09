import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CountTabs, type CountTab } from "@/components/common/CountTabs";
import { FilterDropdown, type FilterOption } from "@/components/common/FilterDropdown";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ApplicantDetailModal } from "@/components/project/ApplicantDetailModal";
import { getMyProjects } from "@/api/user";
import { getApplicants, updateApplicantStatus } from "@/api/application";
import type { ProjectApplicant, ProjectStatus } from "@/types";

type StatusFilter = "ALL" | "RECRUITING" | "CLOSED";

const PAGE_SIZE = 10;

const periodOptions: FilterOption[] = [
  { label: "전체 기간", value: null },
  { label: "지난 1개월", value: "1m" },
  { label: "지난 3개월", value: "3m" },
  { label: "지난 6개월", value: "6m" },
];

function isRecruiting(status: ProjectStatus): boolean {
  return status === "RECRUITING";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}`;
}

function withinPeriod(iso: string, period: string | null): boolean {
  if (!period) return true;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  const months = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  return d >= cutoff;
}

export default function MyPageProjectsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [period, setPeriod] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [applicantsByProject, setApplicantsByProject] = useState<
    Record<number, ProjectApplicant[]>
  >({});
  const [applicantsLoadingId, setApplicantsLoadingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<ProjectApplicant | null>(null);
  const [error, setError] = useState("");

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading } = useQuery({
    queryKey: ["my-projects", { status: statusParam, page }],
    queryFn: () => getMyProjects({ status: statusParam, page: page - 1, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["my-projects", "stats"],
    queryFn: async () => {
      const all = await getMyProjects({ size: 200 });
      const projects = all.content ?? [];
      return {
        ALL: all.totalElements,
        RECRUITING: projects.filter((p) => p.status === "RECRUITING").length,
        CLOSED: projects.filter((p) => p.status !== "RECRUITING").length,
        totalApplicants: projects.reduce((s, p) => s + p.applicantCount, 0),
      };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, period]);

  const loadApplicants = useCallback((projectId: number) => {
    setApplicantsLoadingId(projectId);
    getApplicants(projectId)
      .then((data) => {
        setApplicantsByProject((prev) => ({ ...prev, [projectId]: data.applicants }));
      })
      .catch(() => {
        setApplicantsByProject((prev) => ({ ...prev, [projectId]: [] }));
      })
      .finally(() => setApplicantsLoadingId(null));
  }, []);

  const handleToggleExpand = (projectId: number) => {
    setExpandedId((prev) => {
      const next = prev === projectId ? null : projectId;
      if (next !== null && !applicantsByProject[next]) {
        loadApplicants(next);
      }
      return next;
    });
  };

  const handleApplicantStatus = async (
    projectId: number,
    applicationId: number,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setProcessingId(applicationId);
    try {
      await updateApplicantStatus(applicationId, { status: newStatus });
      loadApplicants(projectId);
      queryClient.invalidateQueries({ queryKey: ["my-projects", "stats"] });
    } catch {
      setError("지원자 상태 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setProcessingId(null);
    }
  };

  const allProjects = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const counts = {
    ALL: statsData?.ALL ?? 0,
    RECRUITING: statsData?.RECRUITING ?? 0,
    CLOSED: statsData?.CLOSED ?? 0,
  };
  const totalApplicants = statsData?.totalApplicants ?? 0;

  const pagedProjects = allProjects.filter((p) => withinPeriod(p.createdAt, period));
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const tabs: CountTab[] = [
    { label: "전체", value: "ALL", count: counts.ALL },
    { label: "모집중", value: "RECRUITING", count: counts.RECRUITING },
    { label: "마감됨", value: "CLOSED", count: counts.CLOSED },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-[22px] text-grey9 md:text-[26px] lg:text-[28px]">
        내 프로젝트 관리
      </h1>
      <p className="font-medium text-[14px] text-grey7 md:text-[16px]">
        내가 생성한 프로젝트예요. 클릭하면 지원자를 바로 확인할 수 있어요.
      </p>

      <CountTabs tabs={tabs} active={activeTab} onChange={(v) => setActiveTab(v as StatusFilter)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:gap-6">
        <div className="flex items-center justify-between rounded-[20px] border border-grey5 px-5 py-4 md:px-8 md:py-5 lg:w-[280px]">
          <span className="font-medium text-[16px] text-grey7 md:text-[18px] lg:text-[20px]">
            모집완료 프로젝트
          </span>
          <span className="font-bold text-[22px] text-grey9 md:text-[24px] lg:text-[28px]">
            {counts.CLOSED}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[20px] border border-grey5 px-5 py-4 md:px-8 md:py-5 lg:w-[280px]">
          <span className="font-medium text-[16px] text-grey7 md:text-[18px] lg:text-[20px]">
            누적 지원자
          </span>
          <span className="font-bold text-[22px] text-grey9 md:text-[24px] lg:text-[28px]">
            {totalApplicants}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:gap-6">
        <FilterDropdown
          label="지난 1개월"
          options={periodOptions}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        {isLoading ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">불러오는 중...</p>
        ) : pagedProjects.length === 0 ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">
            생성한 프로젝트가 없어요.
          </p>
        ) : (
          pagedProjects.map((project) => {
            const isExpanded = expandedId === project.id;
            const applicants = applicantsByProject[project.id];
            return (
              <div
                key={project.id}
                className={`overflow-hidden rounded-[20px] border transition-colors ${
                  isExpanded ? "border-grey7" : "border-grey5"
                }`}
              >
                <div className="flex items-center justify-between gap-3 p-5 md:p-6 lg:p-8">
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(project.id)}
                    className={`flex min-w-0 flex-1 flex-col gap-2 text-left ${
                      !isRecruiting(project.status) ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <h3 className="font-bold text-[16px] text-grey9 md:text-[18px] lg:text-[20px]">
                        {project.title}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
                      <span className="font-medium text-[14px] text-grey7 sm:border-r sm:border-grey7 sm:pr-5 md:text-[16px]">
                        지원자 {project.applicantCount}명
                      </span>
                      <span className="font-medium text-[14px] text-grey7 md:text-[16px]">
                        등록일 {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </button>
                  <Link
                    to={`/projects/${project.id}/manage`}
                    className="shrink-0 self-center rounded-[20px] border border-grey5 px-4 py-2 font-medium text-[14px] text-grey7 transition-colors hover:border-grey7 hover:text-grey9 md:px-4 md:py-4 md:text-[20px]"
                  >
                    관리
                  </Link>
                </div>

                {isExpanded && (
                  <div className="border-t border-grey3 bg-grey1 px-5 py-5 md:px-6 lg:px-8">
                    {applicantsLoadingId === project.id ? (
                      <p className="font-regular text-[14px] text-grey6">불러오는 중...</p>
                    ) : !applicants || applicants.length === 0 ? (
                      <p className="font-regular text-[14px] text-grey6">아직 지원자가 없어요.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <span className="font-medium text-[14px] text-grey8 md:text-[16px]">
                          지원자 ({applicants.length}명)
                        </span>
                        {applicants.map((a) => (
                          <div
                            key={a.applicationId}
                            className="flex flex-col gap-3 rounded-[16px] border border-grey3 bg-bg p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {a.profileUrl ? (
                                <img
                                  src={a.profileUrl}
                                  alt={a.nickName}
                                  loading="lazy"
                                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 shrink-0 rounded-full bg-grey4" />
                              )}
                              <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate font-medium text-[15px] text-grey9">
                                    {a.nickName}
                                  </span>
                                  <StatusBadge status={a.status} />
                                </div>
                                <span className="truncate font-regular text-[13px] text-grey6">
                                  {a.recruitmentName} · 지원일 {formatDate(a.applicationDate)}
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedApplicant(a)}
                                className="rounded-tag border border-primary bg-bg px-3 py-2 font-medium text-[13px] text-primary transition-colors hover:bg-primary-light"
                                aria-label="지원자 정보"
                              >
                                정보
                              </button>
                              {a.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplicantStatus(project.id, a.applicationId, "APPROVED")
                                    }
                                    disabled={processingId === a.applicationId}
                                    className="rounded-tag bg-green-600 px-4 py-2 font-medium text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                  >
                                    승인
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplicantStatus(project.id, a.applicationId, "REJECTED")
                                    }
                                    disabled={processingId === a.applicationId}
                                    className="rounded-tag border border-red-200 bg-bg px-4 py-2 font-medium text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                  >
                                    거절
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

      <ApplicantDetailModal
        applicant={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
      />
    </div>
  );
}
