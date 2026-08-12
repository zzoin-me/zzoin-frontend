import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PencilLine } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { PageBackButton } from "@/components/common/PageBackButton";
import { CommunityPostList } from "@/components/community/CommunityPostList";
import { getPosts } from "@/api/community";
import { useAuthStore } from "@/stores/authStore";
import { showSnackbar } from "@/stores/snackbarStore";
import type { CommunityBoardType } from "@/types";

const boardMeta: Record<CommunityBoardType, { title: string; description: string }> = {
  all: { title: "전체 게시판", description: "모든 게시글을 확인해보세요" },
  popular: { title: "인기 게시판", description: "가장 인기 있는 게시글이에요" },
  mine: { title: "내가 쓴 글", description: "내가 작성한 게시글이에요" },
  comments: { title: "댓글 단 글", description: "내가 댓글을 단 게시글이에요" },
  likes: { title: "좋아요 누른 글", description: "내가 좋아요 누른 게시글이에요" },
  saved: { title: "저장한 글", description: "내가 저장한 게시글이에요" },
};

export default function CommunityBoardPage({ board }: { board: CommunityBoardType }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);

  const isVerified = !!user?.verified;

  const handleWriteClick = () => {
    if (isVerified) {
      navigate("/community/new");
    } else {
      showSnackbar({
        type: "warning",
        message: "글을 작성하려면 대학 인증이 필요합니다.",
        actionLabel: "인증하기",
        onAction: () => navigate("/mypage/verify-univ"),
      });
    }
  };

  const apiBoard: CommunityBoardType = board === "popular" ? "all" : board;
  const apiSort = board === "popular" ? "POPULAR" : "LATEST";

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["posts", { board: apiBoard, sort: apiSort, keyword: searchKeyword, page }],
    queryFn: () =>
      getPosts({
        board: apiBoard,
        sort: apiSort,
        keyword: searchKeyword || undefined,
        page,
        size: 9,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const posts = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const meta = boardMeta[board];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-10 native:px-8 native:py-6">
      <div className="flex items-center gap-3 lg:hidden native:flex">
        <PageBackButton fallbackTo="/community" label="커뮤니티로 돌아가기" className="-ml-2" />
        <h1 className="font-bold text-[20px] text-grey9">{meta.title}</h1>
      </div>

      <div className="hidden items-center justify-between lg:flex native:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-grey9">{meta.title}</h1>
          <p className="font-regular text-[14px] text-grey6">{meta.description}</p>
        </div>
        <button
          type="button"
          onClick={handleWriteClick}
          className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90 ${
            isVerified ? "border-primary bg-primary" : "border-grey4 bg-grey4"
          }`}
        >
          <PencilLine className="h-4 w-4" aria-hidden />
          <span>글쓰기</span>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <SearchBar
          className="flex-1"
          placeholder="게시글을 검색해보세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={() => {
            setSearchKeyword(keyword);
            setPage(0);
          }}
        />
        <button
          type="button"
          onClick={handleWriteClick}
          className={`flex h-[46px] shrink-0 items-center gap-1.5 rounded-tag border px-4 font-bold text-[14px] text-white transition-opacity hover:opacity-90 lg:hidden native:flex ${
            isVerified ? "border-primary bg-primary" : "border-grey4 bg-grey4"
          }`}
          aria-label="글쓰기"
        >
          <PencilLine className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-8">
        <CommunityPostList
          posts={posts}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => void refetch()}
        />
      </div>

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
  );
}
