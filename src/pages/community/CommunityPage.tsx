import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Eye,
  PencilLine,
  FileText,
  Flame,
  MessageSquare,
  HeartHandshake,
  LayoutGrid,
  Bookmark,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { getPosts } from "@/api/community";
import { formatKoreanDatetime } from "@/utils/datetime";
import { useAuthStore } from "@/stores/authStore";
import type { CommunityBoardType } from "@/types";

interface SidebarMenu {
  label: string;
  board: CommunityBoardType;
  sort?: "POPULAR";
  icon: LucideIcon;
  group: "explore" | "personal";
}

const sidebarMenus: SidebarMenu[] = [
  { label: "전체", board: "all", icon: LayoutGrid, group: "explore" },
  { label: "인기", board: "all", sort: "POPULAR", icon: Flame, group: "explore" },
  { label: "내가 쓴 글", board: "mine", icon: FileText, group: "personal" },
  { label: "댓글 단 글", board: "comments", icon: MessageSquare, group: "personal" },
  { label: "좋아요 누른 글", board: "likes", icon: HeartHandshake, group: "personal" },
  { label: "저장한 글", board: "saved", icon: Bookmark, group: "personal" },
];

const mobileTiles = [
  { label: "전체 게시판", to: "/community/all", icon: LayoutGrid },
  { label: "인기 게시판", to: "/community/popular", icon: Flame },
  { label: "내가 쓴 글", to: "/community/mine", icon: FileText },
  { label: "댓글 단 글", to: "/community/comments", icon: MessageSquare },
  { label: "좋아요 누른 글", to: "/community/likes", icon: HeartHandshake },
  { label: "저장한 글", to: "/community/saved", icon: Bookmark },
] as const;

export default function CommunityPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeSort, setActiveSort] = useState<"LATEST" | "POPULAR">("LATEST");
  const [activeBoard, setActiveBoard] = useState<CommunityBoardType>("all");
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(false);

  const isVerified = !!user?.verified;

  const handleWriteClick = () => {
    if (isVerified) {
      navigate("/community/new");
    } else {
      setToast(true);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["posts", { board: activeBoard, sort: activeSort, keyword: searchKeyword, page }],
    queryFn: () =>
      getPosts({
        board: activeBoard,
        sort: activeSort,
        keyword: searchKeyword || undefined,
        page,
        size: 9,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const posts = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(0);
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <SearchBar
            className="flex-1"
            placeholder="게시글을 검색해보세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
          />
          <button
            type="button"
            onClick={handleWriteClick}
            className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90 ${
              isVerified ? "border-primary bg-primary" : "border-grey4 bg-grey4"
            }`}
          >
            <PencilLine className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <nav className="mt-6 flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3 bg-white">
          {mobileTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-grey1"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-grey5" aria-hidden />
                  <span className="font-medium text-[16px] text-grey9">{tile.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
              </Link>
            );
          })}
        </nav>

        {searchKeyword && (
          <div className="mt-6">
            <p className="mb-3 font-medium text-[14px] text-grey8">
              "{searchKeyword}" 검색 결과
            </p>
            <ul className="flex flex-col gap-4">
              {isLoading ? (
                <li className="py-10 text-center font-regular text-[14px] text-grey6">
                  불러오는 중...
                </li>
              ) : posts.length === 0 ? (
                <li className="py-10 text-center font-regular text-[14px] text-grey6">
                  게시글이 없어요.
                </li>
              ) : (
                posts.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/community/${p.id}`}
                      className="block rounded-[16px] border border-grey3 p-5 transition-shadow hover:shadow-sm"
                    >
                      <h2 className="font-bold text-[16px] text-grey9">{p.title}</h2>
                      <p className="mt-1.5 line-clamp-2 font-medium text-[13px] text-grey7">
                        {p.contentPreview}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-grey3 pt-3">
                        <div className="flex items-center gap-2 font-regular text-[12px] text-grey6">
                          <span className="font-medium text-grey9">{p.author.nickname}</span>
                          <span aria-hidden>·</span>
                          <span>{formatKoreanDatetime(p.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 font-regular text-[12px] text-grey6">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" aria-hidden /> {p.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {p.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" aria-hidden /> {p.viewCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page + 1}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p - 1)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:flex lg:gap-8">
        <aside className="w-[200px] shrink-0">
          <nav className="flex flex-col gap-0.5">
            {sidebarMenus.map((menu, idx) => {
              const isActive =
                activeBoard === menu.board &&
                (menu.sort ? activeSort === menu.sort : activeSort === "LATEST");
              const showDivider = idx > 0 && menu.group !== sidebarMenus[idx - 1].group;
              const Icon = menu.icon;
              return (
                <div key={`${menu.label}-${idx}`}>
                  {showDivider && <div className="my-2 border-t border-grey3" />}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBoard(menu.board);
                      setActiveSort(menu.sort ?? "LATEST");
                      setPage(0);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-tag px-3 py-2.5 text-left font-medium text-[14px] transition-colors ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-grey7 hover:bg-grey1 hover:text-grey9"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{menu.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="shrink-0 font-bold text-[24px] text-grey9">
              {sidebarMenus.find(
                (m) =>
                  activeBoard === m.board &&
                  (m.sort ? activeSort === m.sort : activeSort === "LATEST"),
              )?.label ?? "전체"}
            </h1>
            <div className="flex items-center gap-3">
              <SearchBar
                className="w-[280px]"
                placeholder="게시글을 검색해보세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onSearch={handleSearch}
              />
              <button
                type="button"
                onClick={handleWriteClick}
                className={`flex h-[46px] shrink-0 items-center gap-2 rounded-tag border px-5 font-bold text-[14px] text-white transition-opacity hover:opacity-90 ${
                  isVerified ? "border-primary bg-primary" : "border-grey4 bg-grey4"
                }`}
              >
                <PencilLine className="h-4 w-4" aria-hidden />
                <span>새 글 작성</span>
              </button>
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-5">
            {isLoading ? (
              <li className="py-20 text-center font-regular text-[16px] text-grey6">
                불러오는 중...
              </li>
            ) : posts.length === 0 ? (
              <li className="py-20 text-center font-regular text-[16px] text-grey6">
                게시글이 없어요.
              </li>
            ) : (
              posts.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/community/${p.id}`}
                    className="block rounded-card border border-grey5 p-6 transition-shadow hover:shadow-sm"
                  >
                    <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">{p.title}</h2>
                    <p className="mt-2 line-clamp-2 font-medium text-[14px] text-grey7 md:text-[16px]">
                      {p.contentPreview}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-grey3 pt-4">
                      <div className="flex items-center gap-2 font-regular text-[12px] text-grey6">
                        <span className="font-medium text-grey9">{p.author.nickname}</span>
                        <span aria-hidden>·</span>
                        <span>{formatKoreanDatetime(p.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 font-regular text-[12px] text-grey6">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" aria-hidden /> {p.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {p.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" aria-hidden /> {p.viewCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-40 left-1/2 z-50 -translate-x-1/2 rounded-card bg-grey9 px-5 py-3 font-medium text-[14px] text-white shadow-xl lg:bottom-24">
          글을 작성하려면{" "}
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
