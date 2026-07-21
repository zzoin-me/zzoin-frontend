import { apiFetch } from "@/api/client";

export interface MyProfile {
  name: string;
  email: string;
  field?: string;
  bio?: string;
  profileUrl?: string;
  verified: boolean;
}

export async function getMyProfile(): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/users/me");
}
