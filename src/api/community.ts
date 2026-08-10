import { apiFetch } from "@/api/client";
import type {
  PostPreview,
  PostDetail,
  Comment,
  CommentPageResponse,
  PostListParams,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  PageResponse,
  CommunityBoardType,
} from "@/types";

function buildQuery(params: PostListParams): string {
  const q = new URLSearchParams();
  q.set("board", (params.board ?? "all").toUpperCase());
  q.set("sort", params.sort ?? "LATEST");
  if (params.keyword) q.set("keyword", params.keyword);
  if (params.page != null) q.set("page", String(params.page));
  q.set("size", String(params.size ?? 9));
  return q.toString();
}

export async function getPosts(params: PostListParams = {}): Promise<PageResponse<PostPreview>> {
  const query = buildQuery(params);
  return apiFetch<PageResponse<PostPreview>>(`/api/posts?${query}`);
}

export async function getPostById(id: number): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/posts/${id}`);
}

export async function createPost(data: CreatePostRequest): Promise<number> {
  return apiFetch<number>("/api/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function recordPostView(id: number): Promise<{ counted: boolean }> {
  let viewerId = localStorage.getItem("community-viewer-id");
  if (!viewerId) {
    viewerId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("community-viewer-id", viewerId);
  }
  return apiFetch<{ counted: boolean }>(`/api/posts/${id}/view`, {
    method: "POST",
    headers: { "X-Viewer-Id": viewerId },
  });
}

export async function updatePost(id: number, data: UpdatePostRequest): Promise<void> {
  await apiFetch<void>(`/api/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: number): Promise<void> {
  await apiFetch<void>(`/api/posts/${id}`, { method: "DELETE" });
}

export async function togglePostLike(id: number): Promise<{ active: boolean }> {
  return apiFetch<{ active: boolean }>(`/api/posts/${id}/like`, { method: "POST" });
}

export async function togglePostSave(id: number): Promise<{ active: boolean }> {
  return apiFetch<{ active: boolean }>(`/api/posts/${id}/save`, { method: "POST" });
}

export async function getComments(
  postId: number,
  afterId?: number | null,
  size = 20,
): Promise<CommentPageResponse> {
  const query = new URLSearchParams({ size: String(size) });
  if (afterId != null) query.set("afterId", String(afterId));
  return apiFetch<CommentPageResponse>(`/api/posts/${postId}/comments?${query.toString()}`);
}

export async function createComment(postId: number, data: CreateCommentRequest): Promise<Comment> {
  return apiFetch<Comment>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateComment(commentId: number, content: string): Promise<void> {
  await apiFetch<void>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiFetch<void>(`/api/comments/${commentId}`, { method: "DELETE" });
}

export function resolveBoardParam(board: CommunityBoardType): CommunityBoardType {
  return board === "popular" ? "all" : board;
}
