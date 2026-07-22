import { apiFetch } from "@/api/client";

export interface MyProfile {
  name: string;
  email: string;
  field?: string;
  bio?: string;
  profileUrl?: string;
  verified: boolean;
  verifiedEmail?: string;
}

export async function getMyProfile(): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/users/me");
}

export interface SchoolProfile {
  schoolName: string;
  major?: string;
  grade?: number;
}

export async function getMySchoolProfile(): Promise<SchoolProfile> {
  return apiFetch<SchoolProfile>("/api/users/me/school-profile");
}
