import { apiFetch } from "@/api/client";
import type {
  CreateReviewRequest,
  PageResponse,
  ProjectWrittenReviewsResponse,
  ReceivedReviewsResponse,
  ReviewableProject,
  ReviewTargetsResponse,
  WrittenReview,
} from "@/types";

interface ReviewPageParams {
  page?: number;
  size?: number;
  sort?: "latest" | "oldest";
}

function pageQuery({ page = 0, size = 10, sort = "latest" }: ReviewPageParams): string {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: `createdAt,${sort === "oldest" ? "asc" : "desc"}`,
  });
  return query.toString();
}

export function getReviewableProjects(
  params: ReviewPageParams = {},
): Promise<PageResponse<ReviewableProject>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sort: "completedAt,desc",
  });
  return apiFetch<PageResponse<ReviewableProject>>(
    `/api/users/me/reviews/reviewable?${query.toString()}`,
  );
}

export function getReviewTargets(projectId: number): Promise<ReviewTargetsResponse> {
  return apiFetch<ReviewTargetsResponse>(`/api/projects/${projectId}/review-targets`);
}

export function getPendingReviewCount(): Promise<number> {
  return apiFetch<number>("/api/users/me/reviews/reviewable/pending-count");
}

export function getMyProjectReviews(projectId: number): Promise<ProjectWrittenReviewsResponse> {
  return apiFetch<ProjectWrittenReviewsResponse>(`/api/projects/${projectId}/reviews`);
}

export async function createReview(projectId: number, request: CreateReviewRequest): Promise<void> {
  await apiFetch<void>(`/api/projects/${projectId}/reviews`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getReceivedReviews(
  params: ReviewPageParams = {},
): Promise<ReceivedReviewsResponse> {
  return apiFetch<ReceivedReviewsResponse>(`/api/users/me/reviews/received?${pageQuery(params)}`);
}

export function getWrittenReviews(
  params: ReviewPageParams = {},
): Promise<PageResponse<WrittenReview>> {
  return apiFetch<PageResponse<WrittenReview>>(
    `/api/users/me/reviews/written?${pageQuery(params)}`,
  );
}
