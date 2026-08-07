import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { RecommendProjectBanner } from "@/components/project/RecommendProjectBanner";
import { getProjects, getRecommendProjects, type ProjectListParams } from "@/api/projects";
import { getPageList } from "@/utils/pagination";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/utils/useMediaQuery";
import {
  RECRUITMENT_CATEGORIES,
  getCategoryLabel,
  getSubRolesByCategory,
} from "@/constants/recruitment";
import type { RecruitmentCategory, GoalType } from "@/types";

const PAGE_SIZE = 12;

type FilterTab = "전체" | "추천" | "인기" | "신규" | "마감임박";

function sortFromTab(tab: FilterTab): string {
  if (tab === "마감임박") return "DEADLINE";
  if (tab === "인기") return "POPULAR";
  return "LATEST";
}

const goalOptions: { label: string; value: GoalType }[] = [
  { label: "포트폴리오용", value: "PORTFOLIO" },
  { label: "출시 목표", value: "PRODUCTION" },
  { label: "공모전", value: "COMPETITION" },
];

const SLIDER_MAX = 20;

interface FilterState {
  selectedCategory: RecruitmentCategory | null;
  names: string[];
  minCount: number;
  maxCount: number | null;
  goals: GoalType[];
  recruitingOnly: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  selectedCategory: null,
  names: [],
  minCount: 1,
  maxCount: null,
  goals: [],
  recruitingOnly: false,
};

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  const category = params.get("cat") as RecruitmentCategory | null;
  const namesRaw = params.get("roles");
  const goalsRaw = params.get("goals");
  return {
    selectedCategory:
      category && RECRUITMENT_CATEGORIES.some((c) => c.value === category) ? category : null,
    names: namesRaw ? namesRaw.split(",").filter(Boolean) : [],
    minCount: Number(params.get("min")) || 1,
    maxCount: params.get("max") ? Number(params.get("max")) : null,
    goals: goalsRaw ? (goalsRaw.split(",").filter(Boolean) as GoalType[]) : [],
    recruitingOnly: params.get("recruiting") === "1",
  };
}

function serializeFilters(f: FilterState): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.selectedCategory) out.cat = f.selectedCategory;
  if (f.names.length > 0) out.roles = f.names.join(",");
  if (f.minCount > 1) out.min = String(f.minCount);
  if (f.maxCount !== null) out.max = String(f.maxCount);
  if (f.goals.length > 0) out.goals = f.goals.join(",");
  if (f.recruitingOnly) out.recruiting = "1";
  return out;
}

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.get("tab") as FilterTab) || "전체",
  );
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [isSearching, setIsSearching] = useState(!!searchParams.get("q"));

  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams),
  );
  const [draftFilters, setDraftFilters] = useState<FilterState>(() =>
    parseFiltersFromParams(searchParams),
  );
  const [toast, setToast] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(() =>
    sessionStorage.getItem("recommend-banner-hidden") === "1",
  );

  const dismissBanner = () => {
    sessionStorage.setItem("recommend-banner-hidden", "1");
    setBannerHidden(true);
  };

  const tabs: FilterTab[] = isLoggedIn
    ? ["전체", "추천", "인기", "신규", "마감임박"]
    : ["전체", "인기", "신규", "마감임박"];

  const buildListParams = (): ProjectListParams | null => {
    if (activeTab === "추천") return null;
    const f = appliedFilters;
    return {
      keyword: keyword || undefined,
      sort: sortFromTab(activeTab),
      categories: f.selectedCategory ? [f.selectedCategory] : undefined,
      names: f.names.length > 0 ? f.names : undefined,
      goals: f.goals.length > 0 ? f.goals : undefined,
      recruitingOnly: f.recruitingOnly || undefined,
      minCount: f.minCount > 1 ? f.minCount : undefined,
      maxCount: f.maxCount ?? undefined,
      page: page - 1,
      size: PAGE_SIZE,
    };
  };

  const listParams = buildListParams();

  const { data, isLoading } = useQuery({
    queryKey: ["projects", "list", listParams],
    queryFn: () => getProjects(listParams!),
    enabled: listParams !== null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const { data: recommendData, isLoading: recommendLoading } = useQuery({
    queryKey: ["projects", "recommend-banner"],
    queryFn: () => getRecommendProjects(0, 10),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const { data: recommendTabData, isLoading: recommendTabLoading } = useQuery({
    queryKey: ["projects", "recommend-tab", page],
    queryFn: () => getRecommendProjects(page - 1, PAGE_SIZE),
    enabled: isLoggedIn && activeTab === "추천",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const allProjects = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const recommendProjects = recommendData?.content ?? [];
  const recommendTabProjects = recommendTabData?.content ?? [];
  const recommendTabTotal = recommendTabData?.totalElements ?? 0;
  const loading = isLoading && !data;

  useEffect(() => {
    setPage(1);
  }, [keyword, activeTab, appliedFilters]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (page > 1) next.set("page", String(page));
    if (keyword) next.set("q", keyword);
    if (activeTab !== "전체") next.set("tab", activeTab);
    const filterEntries = serializeFilters(appliedFilters);
    for (const [k, v] of Object.entries(filterEntries)) {
      next.set(k, v);
    }
    setSearchParams(next, { replace: true });
  }, [page, keyword, activeTab, appliedFilters, setSearchParams]);

  const hasActiveFilters =
    appliedFilters.selectedCategory !== null ||
    appliedFilters.names.length > 0 ||
    appliedFilters.minCount > 1 ||
    appliedFilters.maxCount !== null ||
    appliedFilters.goals.length > 0 ||
    appliedFilters.recruitingOnly;

  const effectiveTotalElements = activeTab === "추천" ? recommendTabTotal : totalElements;
  const totalPages = Math.max(1, Math.ceil(effectiveTotalElements / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const isMobile = useIsMobile();
  const pageList = getPageList(currentPage, totalPages, isMobile ? 1 : 2);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      {isLoggedIn && !isSearching && !bannerHidden && (
        <div className="mb-8 hidden lg:block">
          {recommendLoading ? (
            <section className="rounded-card bg-bg-elevated p-6 md:p-8">
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
            <RecommendProjectBanner
              projects={recommendProjects}
              nickname={user?.nickname}
              onDismiss={dismissBanner}
            />
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
              if (!showFilters) setDraftFilters({ ...appliedFilters });
              setShowFilters((v) => !v);
            }}
            className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border px-4 font-bold text-[14px] transition-opacity hover:opacity-90 ${
              hasActiveFilters
                ? "border-primary bg-primary text-white"
                : "border-primary bg-primary text-white"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">상세조건</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 flex flex-col gap-6 rounded-card border border-grey3 bg-grey1 p-5 md:p-6">
          <div>
            <span className="mb-3 block font-medium text-[14px] text-grey8">모집 직군</span>
            <div className="flex flex-wrap gap-2">
              {RECRUITMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      selectedCategory: prev.selectedCategory === cat.value ? null : cat.value,
                      names: [],
                    }))
                  }
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    draftFilters.selectedCategory === cat.value
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {draftFilters.selectedCategory && (
              <div className="mt-3 flex flex-wrap gap-2 border-l-2 border-grey4 pl-4">
                {getSubRolesByCategory(draftFilters.selectedCategory).map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        names: prev.names.includes(role.value)
                          ? prev.names.filter((n) => n !== role.value)
                          : [...prev.names, role.value],
                      }))
                    }
                    className={`rounded-tag border px-3 py-1.5 font-medium text-[13px] transition-colors ${
                      draftFilters.names.includes(role.value)
                        ? "border-primary bg-primary text-white"
                        : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {role.value}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-[14px] text-grey8">
                {draftFilters.selectedCategory
                  ? `${getCategoryLabel(draftFilters.selectedCategory)} 모집인원`
                  : "모집 인원"}
              </span>
              <span className="font-medium text-[14px] text-grey9">
                {draftFilters.minCount}명
                {draftFilters.maxCount === null ? " 이상" : ` ~ ${draftFilters.maxCount}명`}
              </span>
            </div>
            <div className="relative h-6">
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-grey3" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-grey9"
                style={{
                  left: `${((draftFilters.minCount - 1) / (SLIDER_MAX - 1)) * 100}%`,
                  right: `${((SLIDER_MAX - (draftFilters.maxCount ?? SLIDER_MAX)) / (SLIDER_MAX - 1)) * 100}%`,
                }}
              />
              <input
                type="range"
                min={1}
                max={SLIDER_MAX}
                value={draftFilters.minCount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDraftFilters((prev) => ({
                    ...prev,
                    minCount: v,
                    maxCount: prev.maxCount !== null && prev.maxCount < v ? null : prev.maxCount,
                  }));
                }}
                className="dual-range absolute top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent"
                style={{ zIndex: draftFilters.minCount > SLIDER_MAX - 2 ? 5 : 3 }}
              />
              <input
                type="range"
                min={1}
                max={SLIDER_MAX}
                value={draftFilters.maxCount ?? SLIDER_MAX}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDraftFilters((prev) => ({
                    ...prev,
                    maxCount: v >= SLIDER_MAX ? null : v,
                    minCount: prev.minCount > v ? v : prev.minCount,
                  }));
                }}
                className="dual-range absolute top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span className="font-regular text-[11px] text-grey5">1명</span>
              <button
                type="button"
                onClick={() =>
                  setDraftFilters((prev) => ({ ...prev, minCount: 1, maxCount: null }))
                }
                className="font-regular text-[11px] text-grey5 underline hover:text-grey7"
              >
                제한없음
              </button>
            </div>
          </div>

          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">프로젝트 목표</span>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      goals: prev.goals.includes(opt.value)
                        ? prev.goals.filter((g) => g !== opt.value)
                        : [...prev.goals, opt.value],
                    }))
                  }
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    draftFilters.goals.includes(opt.value)
                      ? "border-primary bg-primary text-white"
                      : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={draftFilters.recruitingOnly}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, recruitingOnly: e.target.checked }))
                }
                className="h-4 w-4 accent-grey9"
              />
              <span className="font-medium text-[14px] text-grey7">모집 중만 보기</span>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-grey3 pt-4">
            <button
              type="button"
              onClick={() => {
                setDraftFilters({ ...DEFAULT_FILTERS });
                setAppliedFilters({ ...DEFAULT_FILTERS });
                setShowFilters(false);
              }}
              className="rounded-tag border border-grey3 px-5 py-2.5 font-medium text-[14px] text-grey7 transition-colors hover:border-grey5 hover:text-grey9"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={() => {
                setAppliedFilters({ ...draftFilters });
                setShowFilters(false);
              }}
              className="rounded-tag bg-primary px-6 py-2.5 font-bold text-[14px] text-white transition-opacity hover:opacity-90"
            >
              적용
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {activeTab === "추천" ? (
          recommendTabLoading ? (
            <ProjectGrid>
              {Array.from({ length: 9 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </ProjectGrid>
          ) : recommendTabProjects.length === 0 ? (
            <p className="py-20 text-center font-regular text-[16px] text-grey6">
              표시할 프로젝트가 없습니다.
            </p>
          ) : (
            <ProjectGrid>
              {recommendTabProjects.map((p) => (
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
              <ProjectCard key={p.id} project={p} />
            ))}
          </ProjectGrid>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
            className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-bg text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-bg disabled:hover:shadow-none"
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
                    ? "cursor-default border-primary bg-primary text-white shadow-sm"
                    : "border-grey3 bg-bg text-grey7 hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm"
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
            className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-bg text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-bg disabled:hover:shadow-none"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {isLoggedIn && user?.verified && (
        <Link
          to="/projects/create"
          aria-label="프로젝트 등록"
          className="group fixed bottom-36 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 active:scale-95 lg:bottom-8 lg:right-[120px] lg:hover:w-44"
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

      {isLoggedIn && !user?.verified && (
        <button
          type="button"
          onClick={() => {
            setToast(true);
          }}
          aria-label="프로젝트 등록"
          className="group fixed bottom-36 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-grey4 text-grey6 shadow-lg transition-all duration-300 active:scale-95 lg:bottom-8 lg:right-[120px] lg:h-14 lg:hover:w-44"
        >
          <div className="flex items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-grey4">
              <Plus className="h-6 w-6 shrink-0" aria-hidden />
            </div>
            <span className="hidden whitespace-nowrap font-medium text-[15px] lg:block lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:max-w-[160px] lg:group-hover:opacity-100 lg:group-hover:pr-7">
              프로젝트 등록
            </span>
          </div>
        </button>
      )}

      {toast && (
        <div className="fixed bottom-40 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-card border border-grey7 bg-[#1a202c] px-5 py-3 font-medium text-[14px] text-white shadow-xl lg:bottom-24">
          프로젝트를 생성하려면{" "}
          <button
            type="button"
            onClick={() => navigate("/mypage/verify-univ")}
            className="underline underline-offset-2 hover:text-grey3"
          >
            대학 인증
          </button>
          이 필요합니다.
        </div>
      )}
    </div>
  );
}
