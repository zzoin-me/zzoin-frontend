import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { RECRUITMENT_CATEGORIES, getSubRolesByCategory } from "@/constants/recruitment";
import type { RecruitmentCategory } from "@/types";

interface FieldSelectProps {
  value: string[];
  onChange: (fields: string[]) => void;
  label?: string;
}

export function FieldSelect({ value, onChange, label = "직군" }: FieldSelectProps) {
  const [category, setCategory] = useState<RecruitmentCategory | "">("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleField = (field: string) => {
    if (value.includes(field)) {
      onChange(value.filter((f) => f !== field));
    } else {
      onChange([...value, field]);
    }
  };

  const handleCategoryClick = (cat: RecruitmentCategory) => {
    setCategory(cat);
    setOpen(true);
  };

  const handleRemoveField = (field: string) => {
    onChange(value.filter((f) => f !== field));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-[14px] text-grey8">{label}</label>

      <div className="flex flex-wrap gap-2">
        {RECRUITMENT_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryClick(cat.value)}
            className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
              category === cat.value
                ? "border-primary bg-primary text-white"
                : "border-grey3 bg-white text-grey7 hover:border-grey5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {category && (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="flex w-full items-center justify-between rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 focus:border-grey9 focus:outline-none"
          >
            <span className="text-grey6">세부 직군 선택 (여러 개 가능)</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-grey5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-tag border border-grey3 bg-white shadow-lg">
              {getSubRolesByCategory(category).map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleField(role.value)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left font-regular text-[15px] hover:bg-grey1 ${
                    value.includes(role.value) ? "text-primary" : "text-grey9"
                  }`}
                >
                  {role.value}
                  {value.includes(role.value) && <X className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-tag border border-grey3 bg-grey1 px-3 py-3">
          {value.map((field) => (
            <span
              key={field}
              className="flex items-center gap-1 rounded-tag border border-primary bg-primary px-3 py-1.5 font-medium text-[13px] text-white"
            >
              {field}
              <button
                type="button"
                onClick={() => handleRemoveField(field)}
                className="hover:opacity-70"
                aria-label={`${field} 제거`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
