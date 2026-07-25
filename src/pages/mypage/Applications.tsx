import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CountTabs, type CountTab } from "@/components/common/CountTabs";
import { FilterDropdown, type FilterOption } from "@/components/common/FilterDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getMyApplications } from "@/api/user";
import { cancelApplication } from "@/api/application";
import { RECRUITMENT_CATEGORIES } from "@/constants/recruitment";
import type { ApplicationStatus, MyApplicationPreview, RecruitmentCategory } from "@/types";

type StatusFilter = "ALL" | ApplicationStatus;

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
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [period, setPeriod] = useState<string | null>(null);
  const [category, setCategory] = useState<RecruitmentCategory | null>(null);
  const [applications, setApplications] = useState<MyApplicationPreview[]>([]);
  const [counts, setCounts] = useState<Record<StatusFilter, number>>({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const status = activeTab === "ALL" ? undefined : (activeTab as ApplicationStatus);
    getMyApplications({ status, size: 100 })
      .then((data) => {
        setApplications(data.content);
        setCounts((prev) => ({
          ...prev,
          ALL: data.totalElements,
          ...(status ? { [activeTab]: data.totalElements } : {}),
        }));
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    getMyApplications({ size: 100 })
      .then((data) => {
        const c: Record<StatusFilter, number> = {
          ALL: data.totalElements,
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0,
        };
        data.content.forEach((a) => {
          c[a.status]++;
        });
        setCounts(c);
      })
      .catch(() => {
        // 카운트 로드 실패 시 무시 (탭별 fetch가 별도 동작)
      });
  }, []);

  const filtered = applications.filter(
    (a) =>
      withinPeriod(a.createdAt, period) && (!category || a.appliedRecruitmentCategory === category),
  );

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
      setApplications((prev) => prev.filter((a) => a.applicationId !== applicationId));
      setCounts((prev) => {
        const cancelled = applications.find((a) => a.applicationId === applicationId);
        return {
          ...prev,
          ALL: Math.max(0, prev.ALL - 1),
          ...(cancelled ? { [cancelled.status]: Math.max(0, prev[cancelled.status] - 1) } : {}),
        };
      });
    } catch {
      // 에러 무시 (사용자가 다시 시도 가능)
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-[22px] text-grey9 md:text-[26px] lg:text-[28px]">
        프로젝트 지원 현황
      </h1>

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
        {loading ? (
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                    className="shrink-0 self-start rounded-tag border border-red-200 bg-white px-4 py-2 font-medium text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 sm:self-auto"
                  >
                    {cancelingId === app.applicationId ? "취소 중..." : "지원 취소"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
