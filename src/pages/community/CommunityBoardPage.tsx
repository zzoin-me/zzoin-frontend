import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, Heart, MessageCircle, Eye, PencilLine } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { getPosts } from "@/api/community";
import type { Post } from "@/types";

export type CommunityBoardType = "all" | "popular" | "mine" | "comments" | "likes" | "saved";

const boardMeta: Record<CommunityBoardType, { title: string; description: string }> = {
  all: { title: "전체 게시판", description: "모든 게시글을 확인해보세요" },
  popular: { title: "인기 게시판", description: "가장 인기 있는 게시글이에요" },
  mine: { title: "내가 쓴 글", description: "내가 작성한 게시글이에요" },
  comments: { title: "댓글 단 글", description: "내가 댓글을 단 게시글이에요" },
  likes: { title: "좋아요 누른 글", description: "내가 좋아요 누른 게시글이에요" },
  saved: { title: "내가 저장한 글", description: "내가 저장한 게시글이에요" },
};

export default function CommunityBoardPage({ board }: { board: CommunityBoardType }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setLoading(true);
    getPosts()
      .then((data) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const list = [...posts];
    if (board === "popular") {
      list.sort((a, b) => b.likes + b.views * 0.1 - (a.likes + a.views * 0.1));
    }
    return list;
  }, [posts, board]);

  const meta = boardMeta[board];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="flex shrink-0 items-center text-grey9"
          aria-label="커뮤니티로 돌아가기"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-[20px] text-grey9">{meta.title}</h1>
      </div>

      <div className="hidden items-center justify-between lg:flex">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-grey9">{meta.title}</h1>
          <p className="font-regular text-[14px] text-grey6">{meta.description}</p>
        </div>
        <Link
          to="/community/new"
          className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border border-primary bg-primary px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90"
        >
          <PencilLine className="h-4 w-4" aria-hidden />
          <span>글쓰기</span>
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <SearchBar
          className="flex-1"
          placeholder="게시글을 검색해보세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Link
          to="/community/new"
          className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border border-primary bg-primary px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90 lg:hidden"
          aria-label="글쓰기"
        >
          <PencilLine className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-8 flex flex-col gap-4 md:gap-6">
        {loading ? (
          <li className="py-20 text-center font-regular text-[16px] text-grey6">불러오는 중...</li>
        ) : filtered.length === 0 ? (
          <li className="py-20 text-center font-regular text-[16px] text-grey6">
            게시글이 없어요.
          </li>
        ) : (
          filtered.map((p) => (
            <li key={p.id}>
              <Link
                to={`/community/${p.id}`}
                className="block rounded-[16px] border border-grey3 p-5 transition-shadow hover:shadow-sm md:rounded-card md:border-grey5 md:p-6 lg:p-8"
              >
                <h2 className="font-bold text-[16px] text-grey9 md:text-[18px] lg:text-[20px]">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-2 font-medium text-[13px] text-grey7 md:text-[14px] lg:text-[16px]">
                  {p.content}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-grey3 pt-3 md:mt-5 md:pt-4">
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
          ))
        )}
      </ul>
    </div>
  );
}
