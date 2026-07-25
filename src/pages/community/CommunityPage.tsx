import { useEffect, useState } from "react";
import { Link } from "react-router";
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
} from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { getPosts } from "@/api/community";
import type { Post } from "@/types";

const sortTabs = ["최신순", "인기순"] as const;
const categoryChips = ["전체", "내가 작성한 글", "내가 댓글 단 글"] as const;

const mobileTiles = [
  {
    label: "전체 게시판",
    to: "/community/all",
    icon: LayoutGrid,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "인기 게시판",
    to: "/community/popular",
    icon: Flame,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "내가 쓴 글",
    to: "/community/mine",
    icon: FileText,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "댓글 단 글",
    to: "/community/comments",
    icon: MessageSquare,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "좋아요 누른 글",
    to: "/community/likes",
    icon: HeartHandshake,
    color: "bg-pink-50 text-pink-600",
  },
  {
    label: "내가 저장한 글",
    to: "/community/saved",
    icon: Bookmark,
    color: "bg-cyan-50 text-cyan-600",
  },
] as const;

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeSort, setActiveSort] = useState<(typeof sortTabs)[number]>("최신순");
  const [activeChip, setActiveChip] = useState<(typeof categoryChips)[number]>("전체");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let active = true;
    getPosts().then((data) => {
      if (active) setPosts(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <SearchBar
            className="flex-1"
            placeholder="게시글을 검색해보세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Link
            to="/community/new"
            className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border border-primary bg-primary px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90"
          >
            <PencilLine className="h-4 w-4" aria-hidden />
          </Link>
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
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${tile.color}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="font-medium text-[16px] text-grey9">{tile.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="font-bold text-[24px] text-grey9">커뮤니티</h1>
          <div className="flex flex-1 items-center gap-3 md:max-w-[640px]">
            <SearchBar
              className="flex-1"
              placeholder="게시글을 검색해보세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Link
              to="/community/new"
              className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border border-primary bg-primary px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90"
            >
              <PencilLine className="h-4 w-4" aria-hidden />
              <span>글쓰기</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 flex gap-20 border-b border-grey3">
          {sortTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveSort(t)}
              className={`py-3 font-bold text-[16px] ${
                activeSort === t
                  ? "border-b-2 border-grey9 text-grey9"
                  : "text-grey7 hover:text-grey9"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          {categoryChips.map((c) => (
            <button
              key={c}
              onClick={() => setActiveChip(c)}
              className={`rounded-card border px-5 py-2 font-medium text-[16px] transition-colors ${
                activeChip === c
                  ? "border-grey5 bg-grey3 text-grey9"
                  : "border-grey5 text-grey7 hover:text-grey9"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <ul className="mt-8 flex flex-col gap-6">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                to={`/community/${p.id}`}
                className="block rounded-card border border-grey5 p-6 transition-shadow hover:shadow-sm md:p-8"
              >
                <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">{p.title}</h2>
                <p className="mt-2 line-clamp-2 font-medium text-[14px] text-grey7 md:text-[16px]">
                  {p.content}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-grey3 pt-4">
                  <div className="flex items-center gap-2 font-regular text-[12px] text-grey6">
                    <span className="font-medium text-grey9">{p.author}</span>
                    <span aria-hidden>·</span>
                    <span>{p.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-3 font-regular text-[12px] text-grey6">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" aria-hidden /> {p.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {p.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" aria-hidden /> {p.views}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
