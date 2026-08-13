import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { createPost, getPostById, updatePost, uploadPostImages } from "@/api/community";
import { ApiError } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";
import { PageHeader } from "@/components/common/PageHeader";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export default function CommunityNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { id } = useParams();
  const isEdit = Boolean(id);
  const postId = id ? Number(id) : null;
  const backTo = isEdit && postId ? `/community/${postId}` : "/community";
  const handleBack = useBackNavigation(backTo);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pendingImagesRef = useRef<PendingImage[]>([]);

  useEffect(() => {
    if (user && !user.verified) {
      navigate("/community", { replace: true });
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(
    () => () => {
      pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    },
    [],
  );

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
    setImageUrls(post.imageUrls ?? []);
  }, [editPostQuery.data, postId, navigate]);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    if (files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      setError("JPG, PNG, WebP, GIF 이미지만 첨부할 수 있습니다.");
      return;
    }
    if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setError("이미지는 한 장당 5MB 이하로 첨부해주세요.");
      return;
    }
    if (imageUrls.length + pendingImages.length + files.length > MAX_IMAGES) {
      setError("이미지는 최대 10장까지 첨부할 수 있습니다.");
      return;
    }

    setError("");
    setPendingImages((current) => [
      ...current,
      ...files.map((file) => ({
        id:
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removePendingImage = (id: string) => {
    setPendingImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  };

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
      let nextImageUrls = [...imageUrls];
      if (pendingImages.length > 0) {
        setUploading(true);
        const uploadedImageUrls = await uploadPostImages(pendingImages.map((image) => image.file));
        nextImageUrls = [...nextImageUrls, ...uploadedImageUrls];
        pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        setPendingImages([]);
        setImageUrls(nextImageUrls);
        setUploading(false);
      }

      if (isEdit && postId) {
        await updatePost(postId, {
          title: title.trim(),
          content: content.trim(),
          imageUrls: nextImageUrls,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["posts"] }),
          queryClient.invalidateQueries({ queryKey: ["post", postId] }),
        ]);
        navigate(`/community/${postId}`, { replace: true });
      } else {
        const createdPostId = await createPost({
          title: title.trim(),
          content: content.trim(),
          imageUrls: nextImageUrls,
        });
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        navigate(`/community/${createdPostId}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "등록에 실패했습니다.");
    } finally {
      setUploading(false);
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
      <PageHeader title={isEdit ? "게시글 수정" : "게시글 작성"} backTo={backTo} className="mb-6" />

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

        {(imageUrls.length > 0 || pendingImages.length > 0) && (
          <div className="mt-6 border-t border-grey3 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-[14px] text-grey8">첨부 이미지</span>
              <span className="font-regular text-[12px] text-grey6">
                {imageUrls.length + pendingImages.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3">
              {imageUrls.map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="relative aspect-square overflow-hidden rounded-tag bg-grey2"
                >
                  <img src={imageUrl} alt="첨부 이미지" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls((current) => current.filter((url) => url !== imageUrl))
                    }
                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white"
                    aria-label="이미지 삭제"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
              {pendingImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-tag bg-grey2"
                >
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingImage(image.id)}
                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white"
                    aria-label="이미지 삭제"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleImageSelection}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={loading || imageUrls.length + pendingImages.length >= MAX_IMAGES}
          className="flex items-center gap-2 rounded-card border border-grey5 bg-bg px-4 py-3 font-medium text-[14px] text-grey8 transition-colors hover:bg-grey1 disabled:cursor-not-allowed disabled:opacity-50 md:px-5 md:text-[16px]"
        >
          <ImageIcon className="h-5 w-5" aria-hidden />
          사진 추가
        </button>
        <div className="ml-auto flex gap-3 md:gap-4">
          <Button variant="outline" type="button" onClick={handleBack}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />}
            {uploading ? "이미지 업로드 중" : loading ? "저장 중" : isEdit ? "수정" : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
