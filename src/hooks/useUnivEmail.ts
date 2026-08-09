import { useEffect, useState } from "react";
import { getUnivs } from "@/api/univ";
import type { UnivInfo } from "@/types";

export function useUnivEmail(email: string): { isUniv: boolean; univs: UnivInfo[] } {
  const [univs, setUnivs] = useState<UnivInfo[]>([]);

  useEffect(() => {
    getUnivs()
      .then(setUnivs)
      .catch(() => {});
  }, []);

  const domain = email.includes("@") ? email.split("@")[1] : "";
  const isUniv = univs.some(
    (u) => domain === u.domain || domain.endsWith("." + u.domain),
  );

  return { isUniv, univs };
}
