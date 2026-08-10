import { useEffect, useRef } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CommunityActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  label: string;
  disabled?: boolean;
}

export function CommunityActionMenu({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  label,
  disabled = false,
}: CommunityActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-tag bg-transparent text-grey7 transition-colors hover:bg-grey1 hover:text-grey9 disabled:opacity-50"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-2 w-max min-w-24 overflow-hidden rounded-tag border border-grey4 bg-bg shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            className="flex min-h-11 w-full items-center gap-2 whitespace-nowrap px-3 py-2.5 text-left font-medium text-[14px] text-grey9 transition-colors hover:bg-grey1"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            수정
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
            className="flex min-h-11 w-full items-center gap-2 border-t border-grey3 px-3 py-2.5 text-left font-medium text-[14px] text-grey9 transition-colors hover:bg-grey1"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
