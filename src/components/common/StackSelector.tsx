import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { StackInfo } from "@/types";

interface StackSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  stacks: StackInfo[];
  label?: string;
  placeholder?: string;
}

export function StackSelector({
  selectedIds,
  onChange,
  stacks,
  label = "기술 스택",
  placeholder = "스택 검색...",
}: StackSelectorProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredStacks = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stacks
      .filter((s) => !selectedIds.includes(s.id))
      .filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [stacks, search, selectedIds]);

  const addStack = (id: number) => {
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
    setSearch("");
    setShowResults(false);
  };

  const removeStack = (id: number) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-[14px] text-grey8">{label}</label>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-tag border border-grey3 bg-grey1 px-3 py-3">
          {selectedIds.map((id) => {
            const stack = stacks.find((s) => s.id === id);
            if (!stack) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 rounded-tag border border-primary bg-primary px-3 py-1.5 font-medium text-[13px] text-white"
              >
                {stack.name}
                <button
                  type="button"
                  onClick={() => removeStack(id)}
                  className="hover:opacity-70"
                  aria-label={`${stack.name} 제거`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div ref={searchRef} className="relative">
        <div className="flex items-center rounded-tag border border-grey3 bg-white px-4 py-3 focus-within:border-grey9">
          <Search className="h-4 w-4 shrink-0 text-grey5" aria-hidden />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="ml-2 w-full bg-transparent font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:outline-none"
          />
        </div>
        {showResults && (
          <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-tag border border-grey3 bg-white shadow-lg">
            {filteredStacks.length === 0 ? (
              <p className="px-4 py-3 font-regular text-[14px] text-grey6">
                {search.trim() ? "일치하는 스택이 없습니다." : "모든 스택을 선택했습니다."}
              </p>
            ) : (
              filteredStacks.map((stack) => (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => addStack(stack.id)}
                  className="block w-full px-4 py-2.5 text-left font-regular text-[15px] text-grey9 hover:bg-grey1"
                >
                  {stack.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
