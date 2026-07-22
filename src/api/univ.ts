import { apiFetch } from "@/api/client";

export interface UnivInfo {
  id: number;
  name: string;
  domain: string;
}

export async function getUnivs(): Promise<UnivInfo[]> {
  const res = await apiFetch<{ univInfoList: UnivInfo[] }>("/api/univs");
  return res.univInfoList ?? [];
}
