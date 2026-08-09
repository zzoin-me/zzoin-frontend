import { useEffect, useState } from "react";
import { getUnivs } from "@/api/univ";
import type { UnivInfo } from "@/types";

export function useUnivEmail(email: string): {
  isUniv: boolean;
  matchedUniv: UnivInfo | null;
  univs: UnivInfo[];
} {
  const [univs, setUnivs] = useState<UnivInfo[]>([]);

  useEffect(() => {
    getUnivs()
      .then(setUnivs)
      .catch(() => {});
  }, []);

  const normalizedEmail = email.trim().toLowerCase();
  const emailParts = normalizedEmail.split("@");
  const domain = emailParts.length === 2 && emailParts[0] && emailParts[1] ? emailParts[1] : "";
  const matchedUniv = univs.find((univ) => {
    const universityDomain = univ.domain.trim().toLowerCase();
    return domain === universityDomain || domain.endsWith("." + universityDomain);
  });

  return { isUniv: !!matchedUniv, matchedUniv: matchedUniv ?? null, univs };
}
