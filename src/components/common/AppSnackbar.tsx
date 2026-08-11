import { useEffect, type CSSProperties } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useSnackbarStore, type SnackbarType } from "@/stores/snackbarStore";
import { useKeyboardState } from "@/hooks/useKeyboardState";
import { useIsMobile } from "@/utils/useMediaQuery";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
} satisfies Record<SnackbarType, typeof Info>;

const iconColors: Record<SnackbarType, string> = {
  info: "text-primary",
  success: "text-green-400",
  warning: "text-amber-400",
  error: "text-red-400",
};

export function AppSnackbar() {
  const item = useSnackbarStore((state) => state.queue[0]);
  const dismiss = useSnackbarStore((state) => state.dismiss);
  const { keyboardVisible, keyboardInset } = useKeyboardState();
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!item) return;
    const timer = window.setTimeout(() => dismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [dismiss, item]);

  if (!item) return null;

  const bottom = keyboardVisible
    ? `${keyboardInset + 12}px`
    : isMobile
      ? isNative
        ? "calc(env(safe-area-inset-bottom) + 88px)"
        : "96px"
      : "24px";
  const Icon = icons[item.type];

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      className="fixed left-1/2 z-[150] flex w-[calc(100%_-_32px)] max-w-[520px] -translate-x-1/2 items-center gap-3 rounded-card border border-[#4a5568] bg-[#1a202c] px-4 py-3 text-white shadow-xl transition-[bottom] duration-200"
      style={{ bottom } as CSSProperties}
    >
      <Icon className={`h-5 w-5 shrink-0 ${iconColors[item.type]}`} aria-hidden />
      <span className="min-w-0 flex-1 break-words font-medium text-[14px] leading-5">
        {item.message}
      </span>
      {item.actionLabel && item.onAction && (
        <button
          type="button"
          onClick={() => {
            dismiss(item.id);
            item.onAction?.();
          }}
          className="shrink-0 font-bold text-[13px] text-primary hover:underline"
        >
          {item.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="shrink-0 rounded-full p-1 text-grey5 transition-colors hover:bg-grey8 hover:text-white"
        aria-label="알림 닫기"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
