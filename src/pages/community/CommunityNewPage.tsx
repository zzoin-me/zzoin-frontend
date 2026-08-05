import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/common/Button";
import { createPost, getPostById, updatePost } from "@/api/community";
import { ApiError } from "@/api/client";
import type { PostDetail } from "@/types";

export default function CommunityNewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const postId = id ? Number(id) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit || !postId) return;
    getPostById(postId)
      .then((p: PostDetail) => {
        if (!p.isMine) {
          navigate(`/community/${postId}`, { replace: true });
          return;
        }
        setTitle(p.title);
        setContent(p.content);
      })
      .catch(() => navigate("/community", { replace: true }));
  }, [isEdit, postId, navigate]);

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

    setLoading(true);
    try {
      if (isEdit && postId) {
        await updatePost(postId, { title: title.trim(), content: content.trim() });
        navigate(`/community/${postId}`, { replace: true });
      } else {
        await createPost({ title: title.trim(), content: content.trim() });
        navigate("/community", { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
          className="mt-6 w-full font-medium text-[16px] placeholder:text-grey6 focus:outline-none md:text-[18px]"
        />
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
