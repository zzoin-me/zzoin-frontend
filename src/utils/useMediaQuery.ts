import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform() || window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = () => setIsMobile(Capacitor.isNativePlatform() || mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
