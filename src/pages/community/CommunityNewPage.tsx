import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { createPost, getPostById, updatePost } from "@/api/community";
import { ApiError } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";

export default function CommunityNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { id } = useParams();
  const isEdit = Boolean(id);
  const postId = id ? Number(id) : null;

  useEffect(() => {
    if (user && !user.verified) {
      navigate("/community", { replace: true });
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editPostQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId!),
    enabled: isEdit && postId != null,
  });

  useEffect(() => {
    const post = editPostQuery.data;
    if (!post || !postId) return;
    if (!post.isMine) {
      navigate(`/community/${postId}`, { replace: true });
      return;
    }
    setTitle(post.title);
    setContent(post.content);
  }, [editPostQuery.data, postId, navigate]);

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (title.length > 100) {
      setError("제목은 100자 이하로 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    if (content.length > 10000) {
      setError("내용은 10,000자 이하로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && postId) {
        await updatePost(postId, { title: title.trim(), content: content.trim() });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["posts"] }),
          queryClient.invalidateQueries({ queryKey: ["post", postId] }),
        ]);
        navigate(`/community/${postId}`, { replace: true });
      } else {
        const createdPostId = await createPost({ title: title.trim(), content: content.trim() });
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        navigate(`/community/${createdPostId}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && editPostQuery.isLoading) {
    return <LoadingState label="게시글을 불러오는 중..." />;
  }

  if (isEdit && editPostQuery.isError) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-medium text-[15px] text-grey7">게시글을 불러오지 못했습니다.</p>
        <Button variant="outline" onClick={() => void editPostQuery.refetch()}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] native:px-8">
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

      <div className="rounded-card border border-grey5 p-5 md:p-9">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full border-b border-grey5 pb-4 font-bold text-[18px] placeholder:text-grey6 focus:outline-none md:text-[20px]"
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          maxLength={10000}
          className="mt-6 w-full font-medium text-[16px] placeholder:text-grey6 focus:outline-none md:text-[18px]"
        />
        <p className="mt-2 text-right font-medium text-[12px] text-grey5">
          {content.length.toLocaleString()}/10,000
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-2 rounded-card border border-grey5 bg-grey3 px-5 py-3 font-medium text-[16px] text-grey6 opacity-60"
          title="이미지 첨부는 추후 지원됩니다"
        >
          <ImageIcon className="h-5 w-5" aria-hidden />
          사진 불러오기
        </button>
        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "등록 중..." : isEdit ? "수정" : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
