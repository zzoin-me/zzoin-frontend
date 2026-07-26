import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { UnivInfo } from "@/api/univ";

interface EmailDomainSelectProps {
  univs: UnivInfo[];
  value: string;
  onChange: (domain: string, univId: number | null) => void;
  onInquiry?: () => void;
}

export function EmailDomainSelect({ univs, value, onChange, onInquiry }: EmailDomainSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!value.trim()) return univs;
    const q = value.toLowerCase();
    return univs.filter((u) => {
      const name = u.name.toLowerCase();
      const domain = u.domain.toLowerCase();
      return (
        name.includes(q) ||
        domain.includes(q) ||
        q.includes(domain) ||
        q.endsWith("." + domain) ||
        domain.endsWith("." + q)
      );
    });
  }, [univs, value]);

  const handleSelect = (univ: UnivInfo) => {
    onChange(univ.domain, univ.id);
    setOpen(false);
  };

  const findMatchingUniv = (domain: string): UnivInfo | undefined => {
    const d = domain.toLowerCase().trim();
    if (!d) return undefined;
    return (
      univs.find((u) => u.domain === d) ??
      univs.find((u) => d.endsWith("." + u.domain)) ??
      univs.find((u) => u.domain.endsWith("." + d)) ??
      univs.find((u) => d.includes(u.domain))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const domain = e.target.value;
    const matched = findMatchingUniv(domain);
    onChange(domain, matched ? matched.id : null);
    if (domain) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleInquiry = () => {
    setOpen(false);
    onInquiry?.();
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center rounded-tag border border-grey3 bg-white px-4 py-3 focus-within:border-grey9">
        <input
          type="text"
          placeholder="대학교 도메인"
          value={value}
          onChange={handleInputChange}
          className="w-full min-w-0 bg-transparent font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-1 shrink-0 text-grey5"
          aria-label="대학 선택"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 max-h-64 min-w-full w-max max-w-[300px] overflow-y-auto rounded-tag border border-grey3 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <button
              type="button"
              onClick={handleInquiry}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-regular text-[14px] text-grey6 hover:bg-grey1"
            >
              <span>일치하는 결과가 없습니다</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-grey5" aria-hidden />
            </button>
          ) : (
            <ul>
              {filtered.map((univ) => (
                <li key={univ.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(univ)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left font-regular text-[14px] text-grey9 hover:bg-grey1"
                  >
                    <span className="truncate">{univ.name}</span>
                    <span className="shrink-0 whitespace-nowrap text-grey5">{univ.domain}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
