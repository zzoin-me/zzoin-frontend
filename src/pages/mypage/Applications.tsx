import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CountTabs, type CountTab } from "@/components/common/CountTabs";
import { FilterDropdown, type FilterOption } from "@/components/common/FilterDropdown";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getMyApplications } from "@/api/user";
import { cancelApplication } from "@/api/application";
import { RECRUITMENT_CATEGORIES } from "@/constants/recruitment";
import type { ApplicationStatus, RecruitmentCategory } from "@/types";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";

type StatusFilter = "ALL" | ApplicationStatus;

const PAGE_SIZE = 10;

const periodOptions: FilterOption[] = [
  { label: "전체 기간", value: null },
  { label: "지난 1개월", value: "1m" },
  { label: "지난 3개월", value: "3m" },
  { label: "지난 6개월", value: "6m" },
];

const categoryOptions: FilterOption[] = [
  { label: "전체 직군", value: null },
  ...RECRUITMENT_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
];

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

export default function MyPageApplicationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [period, setPeriod] = useState<string | null>(null);
  const [category, setCategory] = useState<RecruitmentCategory | null>(null);
  const [page, setPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const status = activeTab === "ALL" ? undefined : (activeTab as ApplicationStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", { status, page }],
    queryFn: () => getMyApplications({ status, page: page - 1, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const { data: countsData } = useQuery({
    queryKey: ["my-applications", "counts"],
    queryFn: async () => {
      const all = await getMyApplications({ size: 1 });
      const pending = await getMyApplications({ status: "PENDING", size: 1 });
      const approved = await getMyApplications({ status: "APPROVED", size: 1 });
      const rejected = await getMyApplications({ status: "REJECTED", size: 1 });
      return {
        ALL: all.totalElements,
        PENDING: pending.totalElements,
        APPROVED: approved.totalElements,
        REJECTED: rejected.totalElements,
      } as Record<StatusFilter, number>;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, period, category]);

  const applications = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const counts = countsData ?? { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };

  const filtered = applications.filter(
    (a) =>
      withinPeriod(a.createdAt, period) && (!category || a.appliedRecruitmentCategory === category),
  );

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  const tabs: CountTab[] = [
    { label: "전체", value: "ALL", count: counts.ALL },
    { label: "대기중", value: "PENDING", count: counts.PENDING },
    { label: "수락됨", value: "APPROVED", count: counts.APPROVED },
    { label: "거절됨", value: "REJECTED", count: counts.REJECTED },
  ];

  const handleCancel = async (applicationId: number) => {
    setCancelingId(applicationId);
    try {
      await cancelApplication({ applicationId });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    } catch {
      setError("지원 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <MyPageTitle>프로젝트 지원 현황</MyPageTitle>

      <CountTabs tabs={tabs} active={activeTab} onChange={(v) => setActiveTab(v as StatusFilter)} />

      <div className="flex flex-wrap items-center gap-3 lg:gap-6">
        <FilterDropdown
          label="지난 1개월"
          options={periodOptions}
          value={period}
          onChange={setPeriod}
        />
        <FilterDropdown
          label="지원 직군"
          options={categoryOptions}
          value={category}
          onChange={(v) => setCategory(v as RecruitmentCategory | null)}
        />
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        {isLoading ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">
            지원한 프로젝트가 없어요.
          </p>
        ) : (
          filtered.map((app) => (
            <div
              key={app.applicationId}
              className="flex flex-col gap-2 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/projects/${app.projectId}`}
                  className="flex min-w-0 flex-1 flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[16px] text-grey9 md:text-[18px] lg:text-[20px]">
                      {app.projectTitle}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <span className="font-medium text-[14px] text-grey7 sm:border-r sm:border-grey7 sm:pr-5 md:text-[16px]">
                      {app.appliedRecruitmentName}
                    </span>
                    <span className="font-medium text-[14px] text-grey7 md:text-[16px]">
                      지원일 {formatDate(app.createdAt)}
                    </span>
                  </div>
                </Link>
                {app.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(app.applicationId)}
                    disabled={cancelingId === app.applicationId}
                    className="shrink-0 self-start rounded-tag border border-red-200 bg-bg px-4 py-2 font-medium text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 sm:self-center"
                  >
                    {cancelingId === app.applicationId ? "취소 중..." : "지원 취소"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

      <Pagination
        currentPage={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
