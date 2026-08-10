import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Pencil,
  Trash2,
  CornerDownRight,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import { LoadingState } from "@/components/common/LoadingState";
import { CommunityActionMenu } from "@/components/community/CommunityActionMenu";
import {
  getPostById,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  togglePostSave,
  deletePost,
  recordPostView,
} from "@/api/community";
import { formatKoreanDatetime } from "@/utils/datetime";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/api/client";
import type { PostDetail, Comment } from "@/types";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [error, setError] = useState("");

  const postId = id ? Number(id) : NaN;

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !Number.isNaN(postId),
  });

  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => getComments(postId, pageParam),
    enabled: !Number.isNaN(postId),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });

  const post = postQuery.data ?? null;
  const comments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];
  const loading = postQuery.isLoading;

  useEffect(() => {
    if (Number.isNaN(postId)) return;
    const viewedHour = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date());
    const viewedKey = `community-viewed-${postId}-${viewedHour}`;
    if (sessionStorage.getItem(viewedKey)) return;

    recordPostView(postId)
      .then(({ counted }) => {
        sessionStorage.setItem(viewedKey, "1");
        if (counted) {
          queryClient.setQueryData<PostDetail>(["post", postId], (current) =>
            current ? { ...current, viewCount: current.viewCount + 1 } : current,
          );
          void queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      })
      .catch(() => {});
  }, [postId, queryClient]);

  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previous = queryClient.getQueryData<PostDetail>(["post", postId]);
      if (previous) {
        queryClient.setQueryData<PostDetail>(["post", postId], {
          ...previous,
          likedByMe: !previous.likedByMe,
          likeCount: previous.likedByMe ? previous.likeCount - 1 : previous.likeCount + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["post", postId], ctx.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => togglePostSave(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previous = queryClient.getQueryData<PostDetail>(["post", postId]);
      if (previous) {
        queryClient.setQueryData<PostDetail>(["post", postId], {
          ...previous,
          savedByMe: !previous.savedByMe,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["post", postId], ctx.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/community");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (vars: { content: string; parentId?: number }) => createComment(postId, vars),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (vars: { commentId: number; content: string }) =>
      updateComment(vars.commentId, vars.content),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const isVerified = !!user?.verified;

  const handleLike = () => {
    if (!isVerified) {
      setError("좋아요를 누르려면 대학 인증이 필요합니다.");
      return;
    }
    likeMutation.mutate(undefined, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "좋아요 처리에 실패했습니다."),
    });
  };

  const handleSave = () => {
    if (!isVerified) {
      setError("저장하려면 대학 인증이 필요합니다.");
      return;
    }
    saveMutation.mutate(undefined, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "저장 처리에 실패했습니다."),
    });
  };

  const handleDeletePost = () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    deletePostMutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다."),
    });
  };

  const handleCreateComment = () => {
    if (!newComment.trim() || createCommentMutation.isPending) return;
    if (!isVerified) {
      setError("댓글을 작성하려면 대학 인증이 필요합니다.");
      return;
    }
    createCommentMutation.mutate(
      { content: newComment.trim() },
      {
        onSuccess: () => setNewComment(""),
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : "댓글 등록에 실패했습니다."),
      },
    );
  };

  const handleCreateReply = (parentId: number) => {
    if (!replyContent.trim() || createCommentMutation.isPending) return;
    if (!isVerified) {
      setError("대댓글을 작성하려면 대학 인증이 필요합니다.");
      return;
    }
    createCommentMutation.mutate(
      { content: replyContent.trim(), parentId },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyTo(null);
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : "대댓글 등록에 실패했습니다."),
      },
    );
  };

  const handleUpdateComment = (commentId: number) => {
    if (!editContent.trim() || updateCommentMutation.isPending) return;
    updateCommentMutation.mutate(
      { commentId, content: editContent.trim() },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditContent("");
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : "댓글 수정에 실패했습니다."),
      },
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (deleteCommentMutation.isPending) return;
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    deleteCommentMutation.mutate(commentId, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "댓글 삭제에 실패했습니다."),
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (postQuery.isError) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-medium text-[15px] text-grey7">게시글을 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={() => void postQuery.refetch()}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          다시 시도
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const renderComment = (c: Comment, isReply = false) => (
    <li
      key={c.id}
      className={
        isReply
          ? "ml-3 min-w-0 rounded-card border border-grey3 bg-grey1 p-3 md:ml-5 md:p-4 native:ml-3"
          : "min-w-0 border-b border-grey3 pb-6 last:border-b-0"
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        <Avatar nickname={c.author?.nickname} profileUrl={c.author?.profileUrl} size="sm" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 pt-1">
          <span className="min-w-0 break-words font-semibold text-[14px] text-grey9">
            {c.author?.nickname ?? "알 수 없음"}
          </span>
          <span className="shrink-0 font-regular text-[12px] text-grey6">
            {formatKoreanDatetime(c.createdAt)}
          </span>
        </div>
        {c.isMine && !c.isDeleted && (
          <div className="shrink-0 md:hidden native:block">
            <CommunityActionMenu
              open={openActionMenu === `comment-${c.id}`}
              onOpenChange={(open) => setOpenActionMenu(open ? `comment-${c.id}` : null)}
              onEdit={() => {
                setEditingCommentId(c.id);
                setEditContent(c.content);
              }}
              onDelete={() => handleDeleteComment(c.id)}
              label="댓글 작업 메뉴"
              disabled={deleteCommentMutation.isPending}
            />
          </div>
        )}
      </div>

      {editingCommentId === c.id ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value.slice(0, 1000))}
            maxLength={1000}
            rows={2}
            className="w-full resize-none rounded-tag border border-grey3 px-4 py-2 font-regular text-[14px] focus:border-grey9 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              onClick={() => handleUpdateComment(c.id)}
              disabled={updateCommentMutation.isPending}
            >
              {updateCommentMutation.isPending ? "저장 중" : "저장"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingCommentId(null);
                setEditContent("");
              }}
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 break-words font-regular text-[14px] leading-relaxed text-grey9 [overflow-wrap:anywhere]">
          {c.content}
        </p>
      )}

      <div className="mt-3 flex min-h-11 flex-wrap items-center gap-2">
        {!c.isDeleted && (
          <button
            type="button"
            onClick={() => {
              setReplyTo(replyTo === c.id ? null : c.id);
              setReplyContent("");
            }}
            className="inline-flex min-h-11 items-center gap-1 rounded-tag px-2 font-regular text-[12px] text-grey6 hover:bg-grey1 hover:text-grey9"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            답글
          </button>
        )}
        {c.isMine && !c.isDeleted && (
          <div className="hidden items-center gap-2 md:flex native:hidden">
            <button
              type="button"
              onClick={() => {
                setEditingCommentId(c.id);
                setEditContent(c.content);
              }}
              className="inline-flex min-h-9 items-center gap-1 rounded-tag border border-grey3 px-3 font-regular text-[12px] text-grey7 hover:bg-grey1 hover:text-grey9"
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </button>
            <button
              type="button"
              onClick={() => handleDeleteComment(c.id)}
              disabled={deleteCommentMutation.isPending}
              className="inline-flex min-h-9 items-center gap-1 rounded-tag border border-grey3 px-3 font-regular text-[12px] text-grey7 hover:bg-grey1 hover:text-grey9 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        )}
      </div>

      {replyTo === c.id && (
        <div className="mt-3 flex min-w-0 flex-col gap-2 md:flex-row md:items-start native:flex-col">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value.slice(0, 1000))}
            maxLength={1000}
            placeholder="대댓글을 입력하세요"
            rows={2}
            className="min-w-0 flex-1 resize-none rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[14px] focus:border-grey9 focus:outline-none"
          />
          <Button
            size="sm"
            onClick={() => handleCreateReply(c.id)}
            disabled={createCommentMutation.isPending}
            className="shrink-0 self-end"
          >
            {createCommentMutation.isPending ? "등록 중" : "등록"}
          </Button>
        </div>
      )}

      {c.children && c.children.length > 0 && (
        <ul className="mt-4 flex min-w-0 flex-col gap-3 md:mt-5 md:gap-4">
          {c.children.map((r) => renderComment(r, true))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-grey9 transition-colors hover:bg-grey1"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      {error && (
        <p className="mb-4 rounded-tag bg-red-50 px-4 py-2 font-regular text-[13px] text-red-500">
          {error}
        </p>
      )}

      <article className="border-b border-grey5 pb-10">
        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 break-words font-bold text-[22px] leading-snug text-grey9 [overflow-wrap:anywhere] md:text-[24px]">
            {post.title}
          </h1>
          {post.isMine && (
            <>
              <div className="hidden shrink-0 gap-2 md:flex native:hidden">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/community/${post.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeletePost}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletePostMutation.isPending ? "삭제 중" : "삭제"}
                </Button>
              </div>
              <div className="shrink-0 md:hidden native:block">
                <CommunityActionMenu
                  open={openActionMenu === "post"}
                  onOpenChange={(open) => setOpenActionMenu(open ? "post" : null)}
                  onEdit={() => navigate(`/community/${post.id}/edit`)}
                  onDelete={handleDeletePost}
                  label="게시글 작업 메뉴"
                  disabled={deletePostMutation.isPending}
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 font-regular text-[12px] text-grey6">
          <span className="min-w-0 break-words font-medium text-grey9">{post.author.nickname}</span>
          <span className="shrink-0">{formatKoreanDatetime(post.createdAt)}</span>
        </div>
        <p className="mt-8 whitespace-pre-wrap break-words font-medium text-[16px] leading-relaxed text-grey9 [overflow-wrap:anywhere] md:text-[18px]">
          {post.content}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-regular text-[14px] text-grey6">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1 transition-colors hover:text-grey9 ${
              post.likedByMe ? "text-primary" : ""
            }`}
          >
            <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-primary" : ""}`} />
            {post.likeCount}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`flex items-center gap-1 transition-colors hover:text-grey9 ${
              post.savedByMe ? "text-primary" : ""
            }`}
          >
            <Bookmark className={`h-4 w-4 ${post.savedByMe ? "fill-primary" : ""}`} />
            저장
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {post.viewCount}
          </span>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">
          댓글 {post.commentCount}
        </h2>
        <ul className="mt-6 flex min-w-0 flex-col gap-6">
          {commentsQuery.isLoading ? (
            <li className="flex flex-col gap-6" aria-label="댓글 불러오는 중">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse border-b border-grey3 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-grey3" />
                    <div className="h-4 w-32 rounded bg-grey3" />
                  </div>
                  <div className="mt-4 h-4 w-full rounded bg-grey2" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-grey2" />
                </div>
              ))}
            </li>
          ) : commentsQuery.isError ? (
            <li className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="font-medium text-[14px] text-grey6">댓글을 불러오지 못했습니다.</p>
              <Button variant="outline" size="sm" onClick={() => void commentsQuery.refetch()}>
                다시 시도
              </Button>
            </li>
          ) : comments.length === 0 ? (
            <li className="py-10 text-center font-regular text-[14px] text-grey6">
              첫 댓글을 작성해보세요.
            </li>
          ) : (
            comments.map((c) => renderComment(c))
          )}
        </ul>

        {commentsQuery.hasNextPage && (
          <div className="mt-7 flex justify-center">
            <Button
              variant="outline"
              onClick={() => void commentsQuery.fetchNextPage()}
              disabled={commentsQuery.isFetchingNextPage}
            >
              {commentsQuery.isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  불러오는 중
                </>
              ) : (
                "댓글 더보기"
              )}
            </Button>
          </div>
        )}

        {user && isVerified && (
          <div className="mt-10 flex min-w-0 items-start gap-3 rounded-card border border-grey3 p-4 md:gap-4 md:p-5">
            <Avatar
              nickname={user.nickname}
              profileUrl={user.profileImage}
              size="md"
              className="hidden sm:flex"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <textarea
                placeholder="댓글을 입력해주세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 1000))}
                maxLength={1000}
                rows={3}
                className="min-w-0 resize-none rounded-tag border border-grey4 bg-bg px-4 py-3 font-regular text-[14px] focus:border-grey9 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="font-regular text-[12px] text-grey5">
                  {newComment.length}/1000
                </span>
                <Button
                  size="sm"
                  onClick={handleCreateComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="shrink-0"
                >
                  {createCommentMutation.isPending ? "등록 중" : "등록"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {user && !isVerified && (
          <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-card border border-grey3 bg-grey1 px-5 py-4 text-center sm:flex-row">
            <span className="font-regular text-[14px] text-grey6">
              댓글을 작성하려면 대학 인증이 필요합니다.
            </span>
            <Link
              to="/mypage/verify-univ"
              className="font-medium text-[14px] text-primary underline underline-offset-2"
            >
              인증하기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
