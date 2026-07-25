import { apiFetch } from "@/api/client";
import type {
  ProjectPreview,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
  PageResponse,
  RecruitmentCategory,
  GoalType,
} from "@/types";

export interface ProjectListParams {
  keyword?: string;
  sort?: string;
  category?: RecruitmentCategory;
  name?: string;
  maxDays?: number;
  minCount?: number;
  maxCount?: number;
  goal?: GoalType;
  recruitingOnly?: boolean;
  page?: number;
  size?: number;
}

function buildQuery(params: ProjectListParams): string {
  const q = new URLSearchParams();
  if (params.keyword) q.set("keyword", params.keyword);
  q.set("sort", params.sort ?? "LATEST");
  if (params.category) q.set("category", params.category);
  if (params.name) q.set("name", params.name);
  if (params.maxDays) q.set("maxDays", String(params.maxDays));
  if (params.minCount != null) q.set("minCount", String(params.minCount));
  if (params.maxCount != null) q.set("maxCount", String(params.maxCount));
  if (params.goal) q.set("goal", params.goal);
  if (params.recruitingOnly) q.set("recruitingOnly", "true");
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

export async function getCategoryCounts(): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>("/api/projects/category-counts");
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

export async function updateProject(id: number, data: UpdateProjectRequest): Promise<void> {
  await apiFetch<void>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number): Promise<void> {
  await apiFetch<void>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}

export async function updateProjectStatus(id: number, status: ProjectStatus): Promise<void> {
  await apiFetch<void>(`/api/projects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
