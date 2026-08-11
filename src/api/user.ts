import { apiFetch } from "@/api/client";
import type {
  MyProfile,
  SchoolProfile,
  UpdateProfileRequest,
  UpdateSchoolProfileRequest,
  MyApplicationPreview,
  MyProjectPreview,
  ApplicationStatus,
  StackInfo,
  PageResponse,
} from "@/types";

export type { MyProfile, SchoolProfile };

export interface MyApplicationListParams {
  status?: ApplicationStatus;
  page?: number;
  size?: number;
}

export async function getMyProfile(): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/users/me");
}

export async function getMySchoolProfile(): Promise<SchoolProfile> {
  return apiFetch<SchoolProfile>("/api/users/me/school-profile");
}

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await apiFetch<void>("/api/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function uploadProfileImage(image: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", image);
  const result = await apiFetch<{ profileUrl: string | null }>("/api/users/me/profile-image", {
    method: "PATCH",
    body: formData,
  });
  return result.profileUrl;
}

export async function deleteProfileImage(): Promise<string | null> {
  const result = await apiFetch<{ profileUrl: string | null }>("/api/users/me/profile-image", {
    method: "DELETE",
  });
  return result.profileUrl;
}

export async function updateSchoolProfile(data: UpdateSchoolProfileRequest): Promise<void> {
  await apiFetch<void>("/api/users/me/school-profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getMyApplications(
  params: MyApplicationListParams = {},
): Promise<PageResponse<MyApplicationPreview>> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const query = q.toString();
  return apiFetch<PageResponse<MyApplicationPreview>>(
    `/api/users/me/applications${query ? `?${query}` : ""}`,
  );
}

export async function getMyProjects(
  params: { status?: string; hasApplicants?: boolean; page?: number; size?: number } = {},
): Promise<PageResponse<MyProjectPreview>> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.hasApplicants) q.set("hasApplicants", "true");
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const query = q.toString();
  return apiFetch<PageResponse<MyProjectPreview>>(
    `/api/users/me/projects${query ? `?${query}` : ""}`,
  );
}

export async function getStacks(): Promise<StackInfo[]> {
  const data = await apiFetch<{ stackInfoList: StackInfo[] } | StackInfo[]>("/api/stacks");
  if (Array.isArray(data)) return data;
  if (data?.stackInfoList) return data.stackInfoList;
  console.error("[getStacks] unexpected response shape:", data);
  return [];
}
