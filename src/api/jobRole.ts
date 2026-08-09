import { apiFetch } from "@/api/client";
import type { JobCategory, JobRole } from "@/types";

export async function getJobCategories(): Promise<JobCategory[]> {
  return apiFetch<JobCategory[]>("/api/job-roles/categories");
}

export async function getJobRoles(categoryCode?: string): Promise<JobRole[]> {
  const query = categoryCode ? `?category=${encodeURIComponent(categoryCode)}` : "";
  return apiFetch<JobRole[]>(`/api/job-roles${query}`);
}
