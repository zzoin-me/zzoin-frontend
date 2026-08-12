import { ChevronLeft } from "lucide-react";
import type { To } from "react-router";
import { useBackNavigation } from "@/hooks/useBackNavigation";

interface PageBackButtonProps {
  fallbackTo: To;
  label?: string;
  className?: string;
}

export function PageBackButton({
  fallbackTo,
  label = "뒤로 가기",
  className = "",
}: PageBackButtonProps) {
  const handleBack = useBackNavigation(fallbackTo);

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-grey9 transition-colors hover:bg-grey1 active:bg-grey2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${className}`}
      aria-label={label}
    >
      <ChevronLeft className="h-6 w-6" aria-hidden />
    </button>
  );
}
