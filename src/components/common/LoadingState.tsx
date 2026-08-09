import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  fullScreen?: boolean;
  label?: string;
}

export function LoadingState({ fullScreen = false, label = "불러오는 중..." }: LoadingStateProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-3 bg-bg ${
        fullScreen ? "min-h-screen" : "min-h-[50dvh]"
      }`}
      role="status"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <span className="font-medium text-[15px] text-grey6">{label}</span>
    </div>
  );
}
