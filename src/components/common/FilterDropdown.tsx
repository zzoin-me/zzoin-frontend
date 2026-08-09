import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string | null;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-[10px] border border-grey5 px-2.5 py-2.5 font-medium text-[16px] text-grey7 transition-colors hover:border-grey7 hover:text-grey9"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 min-w-full whitespace-nowrap rounded-[10px] border border-grey3 bg-bg py-1 shadow-sm">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left font-regular text-[14px] transition-colors hover:bg-grey1 ${
                opt.value === value ? "font-medium text-grey9" : "text-grey7"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
