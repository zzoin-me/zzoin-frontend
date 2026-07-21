import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { getPosts } from "@/api/community";
import type { Post } from "@/types";

const sortTabs = ["최신순", "인기순"] as const;
const categoryChips = ["전체", "내가 작성한 글", "내가 댓글 단 글"] as const;

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
    <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
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
            className="shrink-0 rounded-card bg-grey9 px-5 py-3 font-medium text-[16px] text-white hover:bg-grey8"
          >
            글쓰기
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
  );
}
