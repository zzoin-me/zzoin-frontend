import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  ChevronRight,
  Copyright,
  ExternalLink,
  FileText,
  Code2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { useModal } from "@/hooks/useModal";

interface UsageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inactiveMenus = [
  { label: "개인정보 처리방침", icon: ShieldCheck },
  { label: "서비스 이용약관", icon: FileText },
  { label: "문의하기", icon: Mail },
];

export function UsageGuideModal({ isOpen, onClose }: UsageGuideModalProps) {
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [sheetEntered, setSheetEntered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const draggingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const isNativeApp = Capacitor.isNativePlatform();
  const modalRef = useModal(isOpen, onClose);

  const closeWithAnimation = useCallback(() => {
    if (!isNativeApp) {
      onClose();
      return;
    }

    draggingRef.current = false;
    setIsDragging(false);
    setSheetEntered(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(onClose, 240);
  }, [isNativeApp, onClose]);

  useEffect(() => {
    if (!isOpen || !isNativeApp) return;

    setDragOffset(0);
    setSheetEntered(false);
    const frame = window.requestAnimationFrame(() => setSheetEntered(true));

    return () => window.cancelAnimationFrame(frame);
  }, [isNativeApp, isOpen]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !isNativeApp) {
      setAppVersion(null);
      return;
    }

    let active = true;
    App.getInfo()
      .then((info) => {
        if (!active) return;
        setAppVersion(`v${info.version}${info.build ? ` (${info.build})` : ""}`);
      })
      .catch(() => {
        if (active) setAppVersion(null);
      });

    return () => {
      active = false;
    };
  }, [isNativeApp, isOpen]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isNativeApp || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    dragStartYRef.current = event.clientY;
    dragStartTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setDragOffset(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);
    const distance = Math.max(0, event.clientY - dragStartYRef.current);
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current);
    const velocity = distance / elapsed;

    if (distance >= 100 || (distance >= 36 && velocity >= 0.65)) {
      closeWithAnimation();
      return;
    }

    setDragOffset(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/50 transition-opacity duration-200 md:items-center md:justify-center md:px-5 native:items-end native:px-0"
      style={{ opacity: isNativeApp && !sheetEntered ? 0 : 1 }}
      onClick={closeWithAnimation}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-guide-title"
        className="max-h-[90dvh] w-full touch-pan-y overflow-y-auto overscroll-contain rounded-t-[24px] bg-bg px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-xl [-webkit-overflow-scrolling:touch] md:max-w-[460px] md:rounded-card md:p-6 native:max-w-none native:rounded-t-[24px] native:rounded-b-none native:px-5 native:pt-3 native:pb-[calc(env(safe-area-inset-bottom)+20px)]"
        style={
          isNativeApp
            ? {
                transform: sheetEntered
                  ? `translate3d(0, ${dragOffset}px, 0)`
                  : "translate3d(0, 100%, 0)",
                transition: isDragging ? "none" : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }
            : undefined
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="-mx-5 -mt-3 flex h-8 touch-none cursor-grab items-center justify-center active:cursor-grabbing md:hidden native:flex"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          aria-hidden
        >
          <div className="h-1 w-10 rounded-full bg-grey4" />
        </div>

        <div className="flex min-h-12 items-center justify-between border-b border-grey3">
          <h2 id="usage-guide-title" className="font-bold text-[20px] text-grey9">
            이용 안내
          </h2>
          <button
            type="button"
            onClick={closeWithAnimation}
            aria-label="이용 안내 닫기"
            className="flex h-11 w-11 items-center justify-center rounded-full text-grey7 transition-colors hover:bg-grey1 hover:text-grey9"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="py-2">
          {inactiveMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.label}
                type="button"
                disabled
                className="flex min-h-14 w-full cursor-default items-center gap-3 rounded-tag px-2 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-grey1 text-grey6">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="flex-1 font-medium text-[15px] text-grey9">{menu.label}</span>
                <ChevronRight className="h-4 w-4 text-grey5" aria-hidden />
              </button>
            );
          })}

          <a
            href="https://github.com/zzoin-me"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-14 w-full items-center gap-3 rounded-tag px-2 text-left transition-colors hover:bg-grey1"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-light text-primary">
              <Code2 className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="flex-1 font-medium text-[15px] text-grey9">GitHub</span>
            <ExternalLink className="h-4 w-4 text-grey5" aria-hidden />
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-grey3 px-2 pt-4 font-regular text-[13px] text-grey6">
          <span className="flex items-center gap-1.5">
            <Copyright className="h-3.5 w-3.5" aria-hidden />
            <span className="font-medium text-grey8">Zzoin</span>
          </span>
          {appVersion && <span>{appVersion}</span>}
        </div>
      </div>
    </div>
  );
}
