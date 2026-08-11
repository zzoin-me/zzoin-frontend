import { Loader2 } from "lucide-react";

interface InlineLoadingProps {
  label?: string;
  className?: string;
}

export function InlineLoading({
  label = "목록 갱신 중",
  className = "",
}: InlineLoadingProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium text-[12px] text-grey6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
