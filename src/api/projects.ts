import type { Project } from "@/types";
import { mockProjects } from "@/data/mockProjects";

export async function getProjects(): Promise<Project[]> {
  // TODO: 백엔드 연동 후 fetch() 호출로 교체
  return mockProjects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  // TODO: 백엔드 연동 후 fetch(`/api/projects/${id}`) 호출로 교체
  return mockProjects.find((p) => p.id === id);
}
