import { apiFetch } from "@/api/client";
import type {
  ApplyProjectRequest,
  DeleteApplicationRequest,
  ProjectApplicants,
  UpdateApplicantStatusRequest,
} from "@/types";

export async function applyProject(data: ApplyProjectRequest): Promise<void> {
  await apiFetch<void>("/api/projects/apply", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelApplication(data: DeleteApplicationRequest): Promise<void> {
  await apiFetch<void>("/api/projects/apply", {
    method: "DELETE",
    body: JSON.stringify(data),
  });
}

export async function getApplicants(projectId: number): Promise<ProjectApplicants> {
  return apiFetch<ProjectApplicants>(`/api/projects/${projectId}/applicants`);
}

export async function updateApplicantStatus(
  applicationId: number,
  data: UpdateApplicantStatusRequest,
): Promise<void> {
  await apiFetch<void>(`/api/projects/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
