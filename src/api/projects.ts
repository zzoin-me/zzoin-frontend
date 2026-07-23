import { apiFetch } from "@/api/client";
import type { ProjectPreview, ProjectDetail, CreateProjectRequest } from "@/types";

export interface ProjectListParams {
  keyword?: string;
  sort?: string;
  field?: string;
  maxDays?: number;
  minCount?: number;
  maxCount?: number;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  first: boolean;
  last: boolean;
}

function buildQuery(params: ProjectListParams): string {
  const q = new URLSearchParams();
  if (params.keyword) q.set("keyword", params.keyword);
  q.set("sort", params.sort ?? "LATEST");
  if (params.field) q.set("field", params.field);
  if (params.maxDays) q.set("maxDays", String(params.maxDays));
  if (params.minCount != null) q.set("minCount", String(params.minCount));
  if (params.maxCount != null) q.set("maxCount", String(params.maxCount));
  if (params.page != null) q.set("page", String(params.page));
  q.set("size", String(params.size ?? 9));
  return q.toString();
}

export async function getProjects(
  params: ProjectListParams = {},
): Promise<PageResponse<ProjectPreview>> {
  const query = buildQuery(params);
  return apiFetch<PageResponse<ProjectPreview>>(`/api/projects?${query}`);
}

export async function getProjectById(id: number): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${id}`);
}

export async function createProject(data: CreateProjectRequest): Promise<void> {
  await apiFetch<void>("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecommendProjects(count = 10): Promise<ProjectPreview[]> {
  return apiFetch<ProjectPreview[]>(`/api/projects/recommend?count=${count}`);
}
