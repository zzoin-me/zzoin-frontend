import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { RecommendProjectBanner } from "@/components/project/RecommendProjectBanner";
import { getProjects, getCategoryCounts, type ProjectListParams } from "@/api/projects";
import { getPageList } from "@/utils/pagination";
import { useAuthStore } from "@/stores/authStore";
import {
  RECRUITMENT_CATEGORIES,
  getCategoryLabel,
  getSubRolesByCategory,
} from "@/constants/recruitment";
import type { ProjectPreview, RecruitmentCategory, GoalType } from "@/types";

const PAGE_SIZE = 9;

type FilterTab = "전체" | "추천" | "인기" | "신규" | "마감임박";

function sortFromTab(tab: FilterTab): string {
  if (tab === "마감임박") return "DEADLINE";
  return "LATEST";
}

const ddayOptions = [
  { label: "전체", value: null },
  { label: "7일 이내", value: 7 },
  { label: "14일 이내", value: 14 },
  { label: "마감임박", value: 3 },
];

const countOptions = [
  { label: "전체", value: null },
  { label: "1~3명", value: "1-3" },
  { label: "4~6명", value: "4-6" },
  { label: "7명+", value: "7-99" },
];

const goalOptions: { label: string; value: GoalType | null }[] = [
  { label: "전체", value: null },
  { label: "포트폴리오용", value: "PORTFOLIO" },
  { label: "출시 목표", value: "PRODUCTION" },
  { label: "공모전", value: "COMPETITION" },
];

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  const [allProjects, setAllProjects] = useState<ProjectPreview[]>([]);
  const [recommendProjects, setRecommendProjects] = useState<ProjectPreview[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.get("tab") as FilterTab) || "전체",
  );
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [isSearching, setIsSearching] = useState(!!searchParams.get("q"));

  const [showFilters, setShowFilters] = useState(searchParams.get("filters") === "1");
  const [categoryFilter, setCategoryFilter] = useState<RecruitmentCategory | null>(
    (searchParams.get("category") as RecruitmentCategory | null) ?? null,
  );
  const [nameFilter, setNameFilter] = useState<string | null>(searchParams.get("name"));
  const [ddayFilter, setDdayFilter] = useState<number | null>(
    searchParams.get("dday") ? Number(searchParams.get("dday")) : null,
  );
  const [countFilter, setCountFilter] = useState<string | null>(searchParams.get("count"));
  const [goalFilter, setGoalFilter] = useState<GoalType | null>(
    (searchParams.get("goal") as GoalType | null) ?? null,
  );
  const [recruitingOnly, setRecruitingOnly] = useState(searchParams.get("recruitingOnly") === "1");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const tabs: FilterTab[] = isLoggedIn
    ? ["전체", "추천", "인기", "신규", "마감임박"]
    : ["전체", "인기", "신규", "마감임박"];

  useEffect(() => {
    getCategoryCounts()
      .then(setCategoryCounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "추천") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params: ProjectListParams = {
      keyword: keyword || undefined,
      sort: sortFromTab(activeTab),
      category: categoryFilter ?? undefined,
      name: nameFilter ?? undefined,
      goal: goalFilter ?? undefined,
      recruitingOnly: recruitingOnly || undefined,
      maxDays: ddayFilter ?? undefined,
      page: page - 1,
      size: PAGE_SIZE,
    };
    if (countFilter) {
      const [min, max] = countFilter.split("-").map(Number);
      params.minCount = min;
      params.maxCount = max;
    }
    getProjects(params)
      .then((data) => {
        setAllProjects(data.content);
        setTotalElements(data.totalElements);
      })
      .catch(() => {
        setAllProjects([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [
    activeTab,
    keyword,
    page,
    categoryFilter,
    nameFilter,
    goalFilter,
    recruitingOnly,
    ddayFilter,
    countFilter,
  ]);

  useEffect(() => {
    if (isLoggedIn) {
      setRecommendLoading(true);
      getProjects({ size: 10 })
        .then((data) => setRecommendProjects(data.content))
        .catch(() => {})
        .finally(() => setRecommendLoading(false));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setPage(1);
  }, [
    keyword,
    activeTab,
    categoryFilter,
    nameFilter,
    goalFilter,
    recruitingOnly,
    ddayFilter,
    countFilter,
  ]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (page > 1) next.set("page", String(page));
    if (keyword) next.set("q", keyword);
    if (activeTab !== "전체") next.set("tab", activeTab);
    if (showFilters) next.set("filters", "1");
    if (categoryFilter) next.set("category", categoryFilter);
    if (nameFilter) next.set("name", nameFilter);
    if (goalFilter) next.set("goal", goalFilter);
    if (recruitingOnly) next.set("recruitingOnly", "1");
    if (ddayFilter !== null) next.set("dday", String(ddayFilter));
    if (countFilter) next.set("count", countFilter);
    setSearchParams(next, { replace: true });
  }, [
    page,
    keyword,
    activeTab,
    showFilters,
    categoryFilter,
    nameFilter,
    goalFilter,
    recruitingOnly,
    ddayFilter,
    countFilter,
    setSearchParams,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageList = getPageList(currentPage, totalPages);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      {isLoggedIn && !isSearching && (
        <div className="mb-8 hidden lg:block">
          {recommendLoading ? (
            <section className="rounded-card bg-[#F6F1EB] p-6 md:p-8">
              <div className="h-7 w-1/3 animate-pulse rounded bg-grey4" />
              <div className="mt-4 flex gap-6 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-full shrink-0 md:w-[280px]">
                    <ProjectCardSkeleton />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-2 w-2 animate-pulse rounded-full bg-grey4" />
                ))}
              </div>
            </section>
          ) : (
            <RecommendProjectBanner projects={recommendProjects} nickname={user?.nickname} />
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="rounded-tag bg-grey2 px-3 py-1 font-medium text-[14px] text-grey7">
            전체 {totalElements}개
          </span>
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-medium text-[16px] transition-colors ${
                  activeTab === tab
                    ? "text-primary underline underline-offset-4"
                    : "text-grey6 hover:text-grey9"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="검색어를 입력해주세요"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={() => {
              setKeyword(searchInput);
              setIsSearching(searchInput.trim().length > 0);
            }}
            className="flex-1 lg:w-[280px]"
          />
          <button
            onClick={() => {
              const next = !showFilters;
              setShowFilters(next);
              if (!next) {
                setCategoryFilter(null);
                setNameFilter(null);
                setDdayFilter(null);
                setCountFilter(null);
                setGoalFilter(null);
                setRecruitingOnly(false);
              }
            }}
            className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border border-primary bg-primary px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">상세조건</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 flex flex-col gap-6 rounded-card border border-grey3 bg-grey1 p-6">
          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">모집 직군</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCategoryFilter(null);
                  setNameFilter(null);
                }}
                className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                  categoryFilter === null
                    ? "border-primary bg-primary text-white"
                    : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
                }`}
              >
                전체
              </button>
              {RECRUITMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategoryFilter(cat.value);
                    setNameFilter(null);
                  }}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    categoryFilter === cat.value
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat.label}
                  {categoryCounts[cat.value] != null && (
                    <span className="ml-1 text-[12px] opacity-70">{categoryCounts[cat.value]}</span>
                  )}
                </button>
              ))}
            </div>
            {categoryFilter && categoryFilter !== "ETC" && (
              <div className="mt-3 flex flex-wrap gap-2 border-l-2 border-grey4 pl-4">
                <button
                  onClick={() => setNameFilter(null)}
                  className={`rounded-tag border px-3 py-1.5 font-medium text-[13px] transition-colors ${
                    nameFilter === null
                      ? "border-grey9 bg-grey9 text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-grey5"
                  }`}
                >
                  전체
                </button>
                {getSubRolesByCategory(categoryFilter).map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setNameFilter(role.value)}
                    className={`rounded-tag border px-3 py-1.5 font-medium text-[13px] transition-colors ${
                      nameFilter === role.value
                        ? "border-grey9 bg-grey9 text-white"
                        : "border-grey3 bg-white text-grey7 hover:border-grey5"
                    }`}
                  >
                    {role.value}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">
              {categoryFilter ? `${getCategoryLabel(categoryFilter)} 모집인원` : "모집 인원"}
            </span>
            <div className="flex flex-wrap gap-2">
              {countOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setCountFilter(opt.value)}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    countFilter === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">마감일</span>
            <div className="flex flex-wrap gap-2">
              {ddayOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setDdayFilter(opt.value)}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    ddayFilter === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">프로젝트 목표</span>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setGoalFilter(opt.value)}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    goalFilter === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setRecruitingOnly((v) => !v)}
              className={`flex items-center gap-2 rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                recruitingOnly
                  ? "border-primary bg-primary text-white"
                  : "border-grey3 bg-white text-grey7 hover:border-primary hover:text-primary"
              }`}
            >
              <span>{recruitingOnly ? "☑" : "☐"}</span>
              모집 중만 보기
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {activeTab === "추천" ? (
          recommendLoading ? (
            <ProjectGrid>
              {Array.from({ length: 9 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </ProjectGrid>
          ) : recommendProjects.length === 0 ? (
            <p className="py-20 text-center font-regular text-[16px] text-grey6">
              표시할 프로젝트가 없습니다.
            </p>
          ) : (
            <ProjectGrid>
              {recommendProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </ProjectGrid>
          )
        ) : loading ? (
          <ProjectGrid>
            {Array.from({ length: 9 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </ProjectGrid>
        ) : allProjects.length === 0 ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">
            표시할 프로젝트가 없습니다.
          </p>
        ) : (
          <ProjectGrid>
            {allProjects.map((p) => (
              <ProjectCard key={p.id} project={p} showThumbnail={false} />
            ))}
          </ProjectGrid>
        )}
      </div>

      {activeTab !== "추천" && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
            className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-white text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-white disabled:hover:shadow-none"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          {pageList.map((entry, i) =>
            entry === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-10 w-10 items-center justify-center font-regular text-[14px] text-grey5"
              >
                ...
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => setPage(entry)}
                aria-current={currentPage === entry ? "page" : undefined}
                className={`h-10 w-10 rounded-tag border font-medium text-[14px] transition-all ${
                  currentPage === entry
                    ? "cursor-default border-grey9 bg-grey9 text-white shadow-sm"
                    : "border-grey3 bg-white text-grey7 hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm"
                }`}
              >
                {entry}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
            className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-white text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-white disabled:hover:shadow-none"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {isLoggedIn && user?.verified && (
        <Link
          to="/projects/create"
          aria-label="프로젝트 등록"
          className="group fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 active:scale-95 lg:bottom-8 lg:right-[120px] lg:hover:w-44"
        >
          <div className="flex items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary">
              <Plus className="h-6 w-6 shrink-0" aria-hidden />
            </div>
            <span className="hidden whitespace-nowrap font-medium text-[15px] lg:block lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:max-w-[120px] lg:group-hover:opacity-100 lg:group-hover:pr-7">
              프로젝트 등록
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
