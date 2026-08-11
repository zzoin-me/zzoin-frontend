import { RotateCcw } from "lucide-react";

interface QueryErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
  compact?: boolean;
}

export function QueryErrorState({
  message,
  onRetry,
  className = "",
  compact = false,
}: QueryErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-card border border-grey3 px-5 text-center ${compact ? "min-h-36" : "min-h-64"} ${className}`}
      role="alert"
    >
      <p className="font-medium text-[15px] text-grey7">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-tag border border-grey4 px-4 py-2 font-bold text-[14px] text-grey8 transition-colors hover:bg-grey1"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        다시 시도
      </button>
    </div>
  );
}
