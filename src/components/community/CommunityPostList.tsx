import { Link } from "react-router";
import { Eye, Heart, Loader2, MessageCircle, RotateCcw } from "lucide-react";
import { formatCommunityListDate, formatKoreanDatetime } from "@/utils/datetime";
import type { PostPreview } from "@/types";

interface CommunityPostListProps {
  posts: PostPreview[];
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyLabel?: string;
}

function formatCount(count: number): string {
  if (count >= 10_000) return `${Math.floor(count / 1000) / 10}만`;
  if (count >= 1_000) return `${Math.floor(count / 100) / 10}천`;
  return String(count);
}

export function CommunityPostList({
  posts,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
  emptyLabel = "게시글이 없어요.",
}: CommunityPostListProps) {
  if (isLoading) {
    return (
      <ul className="flex flex-col gap-4 md:gap-5" aria-label="게시글 불러오는 중">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="animate-pulse rounded-[16px] border border-grey3 p-5 md:rounded-card md:p-6"
          >
            <div className="h-5 w-2/5 rounded bg-grey3" />
            <div className="mt-3 h-4 w-full rounded bg-grey2" />
            <div className="mt-2 h-4 w-3/4 rounded bg-grey2" />
            <div className="mt-5 flex justify-between border-t border-grey3 pt-4">
              <div className="h-3 w-32 rounded bg-grey3" />
              <div className="h-3 w-24 rounded bg-grey3" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-card border border-grey3 text-center">
        <p className="font-medium text-[15px] text-grey7">게시글을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-tag border border-grey4 px-4 py-2 font-bold text-[14px] text-grey8"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-card border border-grey3">
        <p className="font-medium text-[15px] text-grey6">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute -top-8 right-0 flex items-center gap-1.5 font-medium text-[12px] text-grey6">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
          목록 갱신 중
        </div>
      )}
      <ul className={`flex flex-col gap-4 md:gap-5 ${isFetching ? "opacity-70" : ""}`}>
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              to={`/community/${post.id}`}
              className="block rounded-[16px] border border-grey3 p-5 transition-shadow hover:shadow-sm md:rounded-card md:border-grey5 md:p-6"
            >
              <h2 className="font-bold text-[16px] text-grey9 md:text-[20px]">{post.title}</h2>
              <p className="mt-2 line-clamp-2 font-medium text-[13px] text-grey7 md:text-[16px]">
                {post.contentPreview}
              </p>
              <div className="mt-4 flex min-w-0 items-center gap-2 overflow-hidden border-t border-grey3 pt-3 md:mt-5 md:pt-4">
                <div className="flex min-w-0 flex-1 items-center gap-1.5 font-regular text-[11px] text-grey6 md:gap-2 md:text-[12px]">
                  <span className="min-w-0 truncate font-medium text-grey9">
                    {post.author.nickname}
                  </span>
                  <span className="shrink-0" aria-hidden>
                    ·
                  </span>
                  <span className="shrink-0 md:hidden native:inline">
                    {formatCommunityListDate(post.createdAt)}
                  </span>
                  <span className="hidden shrink-0 md:inline native:hidden">
                    {formatKoreanDatetime(post.createdAt)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-regular text-[11px] text-grey6 md:gap-3 md:text-[12px]">
                  <span
                    className="flex items-center gap-0.5 md:gap-1"
                    aria-label={`좋아요 ${post.likeCount}개`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${post.likedByMe ? "fill-primary text-primary" : ""}`}
                      aria-hidden
                    />
                    {formatCount(post.likeCount)}
                  </span>
                  <span
                    className="flex items-center gap-0.5 md:gap-1"
                    aria-label={`댓글 ${post.commentCount}개`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    {formatCount(post.commentCount)}
                  </span>
                  <span
                    className="flex items-center gap-0.5 md:gap-1"
                    aria-label={`조회 ${post.viewCount}회`}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    {formatCount(post.viewCount)}
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
