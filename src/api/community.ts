import { apiFetch } from "@/api/client";
import type {
  PostPreview,
  PostDetail,
  Comment,
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

export async function getPosts(
  params: PostListParams = {},
): Promise<PageResponse<PostPreview>> {
  const query = buildQuery(params);
  return apiFetch<PageResponse<PostPreview>>(`/api/posts?${query}`);
}

export async function getPostById(id: number): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/posts/${id}`);
}

export async function createPost(data: CreatePostRequest): Promise<void> {
  await apiFetch<void>("/api/posts", {
    method: "POST",
    body: JSON.stringify(data),
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

export async function getComments(postId: number): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/api/posts/${postId}/comments`);
}

export async function createComment(
  postId: number,
  data: CreateCommentRequest,
): Promise<Comment> {
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
