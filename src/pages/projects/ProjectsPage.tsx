import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCard } from "@/components/project/ProjectCard";
import { RecommendProjectBanner } from "@/components/project/RecommendProjectBanner";
import { getProjects, type ProjectListParams } from "@/api/projects";
import { getPageList } from "@/utils/pagination";
import { useAuthStore } from "@/stores/authStore";
import type { ProjectPreview } from "@/types";

const PAGE_SIZE = 9;

type FilterTab = "전체" | "인기" | "신규";

const fieldOptions = [
  { label: "전체", value: null },
  { label: "기획", value: "기획" },
  { label: "프론트엔드", value: "프론트엔드" },
  { label: "백엔드", value: "백엔드" },
  { label: "디자인", value: "디자인" },
  { label: "기타", value: "기타" },
];

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

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  const [allProjects, setAllProjects] = useState<ProjectPreview[]>([]);
  const [recommendProjects, setRecommendProjects] = useState<ProjectPreview[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.get("tab") as FilterTab) || "전체",
  );
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [isSearching, setIsSearching] = useState(!!searchParams.get("q"));

  const [showFilters, setShowFilters] = useState(false);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [ddayFilter, setDdayFilter] = useState<number | null>(null);
  const [countFilter, setCountFilter] = useState<string | null>(null);

  const tabs: FilterTab[] = ["전체", "인기", "신규"];

  useEffect(() => {
    setLoading(true);
    const params: ProjectListParams = {
      keyword: keyword || undefined,
      sort: "LATEST",
      field: fieldFilter ?? undefined,
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
  }, [keyword, page, fieldFilter, ddayFilter, countFilter]);

  useEffect(() => {
    if (isLoggedIn) {
      getProjects({ size: 10 })
        .then((data) => setRecommendProjects(data.content))
        .catch(() => {});
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setPage(1);
  }, [keyword, activeTab, fieldFilter, ddayFilter, countFilter]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (page > 1) next.set("page", String(page));
    if (keyword) next.set("q", keyword);
    if (activeTab !== "전체") next.set("tab", activeTab);
    setSearchParams(next, { replace: true });
  }, [page, keyword, activeTab, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageList = getPageList(currentPage, totalPages);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      {isLoggedIn && !isSearching && (
        <div className="mb-8">
          <RecommendProjectBanner projects={recommendProjects} nickname={user?.nickname} />
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
                    ? "text-grey9 underline underline-offset-4"
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
                setFieldFilter(null);
                setDdayFilter(null);
                setCountFilter(null);
              }
            }}
            className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border px-4 font-medium text-[14px] transition-colors ${
              showFilters
                ? "border-grey9 bg-grey9 text-white"
                : "border-grey3 bg-white text-grey7 hover:border-grey5 hover:text-grey9"
            }`}
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
              {fieldOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setFieldFilter(opt.value)}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    fieldFilter === opt.value
                      ? "border-grey9 bg-grey9 text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-grey5"
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
                      ? "border-grey9 bg-grey9 text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-grey5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-medium text-[14px] text-grey8">모집 인원</span>
            <div className="flex flex-wrap gap-2">
              {countOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setCountFilter(opt.value)}
                  className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                    countFilter === opt.value
                      ? "border-grey9 bg-grey9 text-white"
                      : "border-grey3 bg-white text-grey7 hover:border-grey5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">불러오는 중...</p>
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
          className="group fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-grey9 text-white shadow-lg transition-all duration-300 active:scale-95 lg:bottom-8 lg:right-[120px] lg:hover:w-44"
        >
          <div className="flex items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-grey9">
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
