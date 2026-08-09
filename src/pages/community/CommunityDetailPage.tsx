import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Pencil,
  Trash2,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import {
  getPostById,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  togglePostSave,
  deletePost,
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
  const [error, setError] = useState("");

  const postId = id ? Number(id) : NaN;

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !Number.isNaN(postId),
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !Number.isNaN(postId),
  });

  const post = postQuery.data ?? null;
  const comments = commentsQuery.data ?? [];
  const loading = postQuery.isLoading;

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
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/community");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (vars: { content: string; parentId?: number }) =>
      createComment(postId, vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previous = queryClient.getQueryData<Comment[]>(["comments", postId]);
      if (previous && user) {
        const tempComment: Comment = {
          id: -Date.now(),
          content: vars.content,
          author: { userId: 0, nickname: user.nickname },
          createdAt: new Date().toISOString(),
          parentId: vars.parentId ?? null,
          depth: vars.parentId ? 1 : 0,
          isMine: true,
          isDeleted: false,
          children: [],
        };
        if (vars.parentId) {
          const next = previous.map((c) =>
            c.id === vars.parentId
              ? { ...c, children: [...(c.children ?? []), tempComment] }
              : c,
          );
          queryClient.setQueryData<Comment[]>(["comments", postId], next);
        } else {
          queryClient.setQueryData<Comment[]>(["comments", postId], [
            ...previous,
            tempComment,
          ]);
        }
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["comments", postId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (vars: { commentId: number; content: string }) =>
      updateComment(vars.commentId, vars.content),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previous = queryClient.getQueryData<Comment[]>(["comments", postId]);
      if (previous) {
        const apply = (list: Comment[]): Comment[] =>
          list.map((c) =>
            c.id === vars.commentId
              ? { ...c, content: vars.content }
              : { ...c, children: apply(c.children ?? []) },
          );
        queryClient.setQueryData<Comment[]>(["comments", postId], apply(previous));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["comments", postId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previous = queryClient.getQueryData<Comment[]>(["comments", postId]);
      if (previous) {
        const apply = (list: Comment[]): Comment[] =>
          list
            .filter((c) => c.id !== commentId)
            .map((c) => ({ ...c, children: apply(c.children ?? []) }));
        queryClient.setQueryData<Comment[]>(["comments", postId], apply(previous));
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["comments", postId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
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
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다."),
    });
  };

  const handleCreateComment = () => {
    if (!newComment.trim()) return;
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
    if (!replyContent.trim()) return;
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
    if (!editContent.trim()) return;
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
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    deleteCommentMutation.mutate(commentId, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "댓글 삭제에 실패했습니다."),
    });
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">불러오는 중...</p>
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
      className={`${isReply ? "ml-6 border-l-2 border-grey3 pl-4 md:ml-10 md:pl-6" : "border-l-2 border-grey3 pl-4 md:pl-6"}`}
    >
      <div className="flex items-center gap-3">
        <Avatar nickname={c.author?.nickname} profileUrl={c.author?.profileUrl} size="sm" />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[14px] text-grey9">
            {c.author?.nickname ?? "알 수 없음"}
          </span>
          <span className="font-regular text-[12px] text-grey6">
            {formatKoreanDatetime(c.createdAt)}
          </span>
        </div>
      </div>

      {editingCommentId === c.id ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-tag border border-grey3 px-4 py-2 font-regular text-[14px] focus:border-grey9 focus:outline-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleUpdateComment(c.id)}>
              저장
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
        <p className="mt-3 font-regular text-[14px] text-grey9">{c.content}</p>
      )}

      <div className="mt-3 flex items-center gap-3">
        {!c.isDeleted && (
          <button
            onClick={() => {
              setReplyTo(replyTo === c.id ? null : c.id);
              setReplyContent("");
            }}
            className="flex items-center gap-1 font-regular text-[12px] text-grey6 hover:text-grey9"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            답글
          </button>
        )}
        {c.isMine && !c.isDeleted && (
          <>
            <button
              onClick={() => {
                setEditingCommentId(c.id);
                setEditContent(c.content);
              }}
              className="flex items-center gap-1 font-regular text-[12px] text-grey6 hover:text-grey9"
            >
              <Pencil className="h-3.5 w-3.5" />
              수정
            </button>
            <button
              onClick={() => handleDeleteComment(c.id)}
              className="flex items-center gap-1 font-regular text-[12px] text-grey6 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </>
        )}
      </div>

      {replyTo === c.id && (
        <div className="mt-3 flex items-start gap-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="대댓글을 입력하세요"
            rows={2}
            className="flex-1 resize-none rounded-tag border border-grey3 px-4 py-2 font-regular text-[14px] focus:border-grey9 focus:outline-none"
          />
          <Button size="sm" onClick={() => handleCreateReply(c.id)}>
            등록
          </Button>
        </div>
      )}

      {c.children && c.children.length > 0 && (
        <ul className="mt-5 flex flex-col gap-5">{c.children.map((r) => renderComment(r, true))}</ul>
      )}
    </li>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-grey9"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>

      {error && (
        <p className="mb-4 rounded-tag bg-red-50 px-4 py-2 font-regular text-[13px] text-red-500">
          {error}
        </p>
      )}

      <article className="border-b border-grey5 pb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <h1 className="font-bold text-[22px] text-grey9 md:text-[24px]">{post.title}</h1>
          {post.isMine && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/community/${post.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                수정
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDeletePost}>
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-4 font-regular text-[12px] text-grey6">
          <span className="font-medium text-grey9">{post.author.nickname}</span>
          <span>{formatKoreanDatetime(post.createdAt)}</span>
        </div>
        <p className="mt-8 whitespace-pre-wrap font-medium text-[16px] text-grey9 md:text-[18px]">
          {post.content}
        </p>
        <div className="mt-6 flex items-center gap-4 font-regular text-[14px] text-grey6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors hover:text-grey9 ${
              post.likedByMe ? "text-primary" : ""
            }`}
          >
            <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-primary" : ""}`} />
            {post.likeCount}
          </button>
          <button
            onClick={handleSave}
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
        <ul className="mt-6 flex flex-col gap-7">
          {comments.length === 0 ? (
            <li className="py-10 text-center font-regular text-[14px] text-grey6">
              첫 댓글을 작성해보세요.
            </li>
          ) : (
            comments.map((c) => renderComment(c))
          )}
        </ul>

        {user && isVerified && (
          <div className="mt-10 flex items-center gap-4">
            <Avatar nickname={user.nickname} profileUrl={user.profileImage} size="lg" />
            <input
              type="text"
              placeholder="댓글을 입력해주세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateComment();
              }}
              className="flex-1 rounded-card border border-grey6 px-5 py-3 font-regular text-[14px] focus:border-grey9 focus:outline-none"
            />
            <Button onClick={handleCreateComment} disabled={!newComment.trim()}>
              등록
            </Button>
          </div>
        )}

        {user && !isVerified && (
          <div className="mt-10 flex items-center justify-center gap-2 rounded-card border border-grey3 bg-grey1 px-5 py-4">
            <span className="font-regular text-[14px] text-grey6">
              댓글을 작성하려면 대학 인증이 필요합니다.
            </span>
            <Link to="/mypage/verify-univ" className="font-medium text-[14px] text-primary underline underline-offset-2">
              인증하기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
