import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ProjectCard } from "@/components/project/ProjectCard";
import { RecommendProjectBanner } from "@/components/project/RecommendProjectBanner";
import { getProjects } from "@/api/projects";
import { useAuthStore } from "@/stores/authStore";
import { getPageList } from "@/utils/pagination";
import type { Project } from "@/types";

const PAGE_SIZE = 9;

type FilterTab = "전체" | "추천" | "인기" | "신규";
const VALID_TABS: FilterTab[] = ["전체", "추천", "인기", "신규"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("전체");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  const tabs: FilterTab[] = isLoggedIn
    ? ["전체", "추천", "인기", "신규"]
    : ["전체", "인기", "신규"];

  useEffect(() => {
    let active = true;
    getProjects().then((data) => {
      if (active) setProjects(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));
    const q = searchParams.get("q") ?? "";
    const tabParam = searchParams.get("tab") as FilterTab | null;

    if (Number.isFinite(pageParam) && pageParam > 0) setPage(pageParam);
    if (q) {
      setSearchInput(q);
      setKeyword(q);
      setIsSearching(true);
    }
    if (tabParam && VALID_TABS.includes(tabParam) && tabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (searchInput.trim() === "") {
      setKeyword("");
      setIsSearching(false);
    }
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return projects;
    const k = keyword.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(k) ||
        p.description.toLowerCase().includes(k) ||
        p.tags.some((t) => t.toLowerCase().includes(k)),
    );
  }, [projects, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageList = getPageList(currentPage, totalPages);

  useEffect(() => {
    if (!hydrated) return;
    setPage(1);
  }, [keyword, activeTab, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const next = new URLSearchParams();
    if (currentPage !== 1) next.set("page", String(currentPage));
    if (keyword) next.set("q", keyword);
    if (activeTab !== "전체") next.set("tab", activeTab);
    setSearchParams(next, { replace: true });
  }, [currentPage, keyword, activeTab, hydrated, setSearchParams]);

  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, hydrated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setIsSearching(searchInput.trim().length > 0);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-bold text-[20px] text-grey9">프로젝트</h1>
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-3 md:max-w-[640px]">
          <SearchBar
            className="flex-1"
            placeholder="프로젝트명, 키워드, 직군 등을 검색해보세요"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isLoggedIn && !isSearching && (
            <Link
              to="/projects/create"
              className="inline-flex shrink-0 items-center gap-1 rounded-tag bg-grey9 px-4 py-3 font-medium text-[16px] text-white hover:bg-grey8"
            >
              <Plus className="h-5 w-5" aria-hidden />
              <span className="hidden md:inline">프로젝트 생성</span>
            </Link>
          )}
        </form>
      </div>

      {isLoggedIn && !isSearching && (
        <div className="mt-8">
          <RecommendProjectBanner projects={projects} nickname={user?.nickname} />
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <span className="rounded-tag bg-grey2 px-3 py-1 font-medium text-[14px] text-grey7">
          전체 {filtered.length}개
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

      <div className="mt-8">
        {paged.length === 0 ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">
            표시할 프로젝트가 없습니다.
          </p>
        ) : (
          <ProjectGrid>
            {paged.map((p) => (
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
    </div>
  );
}
