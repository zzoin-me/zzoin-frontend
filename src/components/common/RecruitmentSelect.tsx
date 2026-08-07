import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { RECRUITMENT_CATEGORIES, getSubRolesByCategory } from "@/constants/recruitment";
import type { RecruitmentCategory } from "@/types";

interface RecruitmentSelectProps {
  category: RecruitmentCategory | "";
  name: string;
  onChange: (category: RecruitmentCategory, name: string) => void;
}

export function RecruitmentSelect({ category, name, onChange }: RecruitmentSelectProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  const handleCategoryClick = (c: RecruitmentCategory) => {
    onChange(c, "");
  };

  const handleSubRoleClick = (subName: string) => {
    if (category) {
      onChange(category, subName);
    }
    setDropdownOpen(false);
  };

  const subRoles = category ? getSubRolesByCategory(category) : [];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-2 block font-medium text-[14px] text-grey8">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {RECRUITMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryClick(cat.value)}
              className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                category === cat.value
                  ? "border-primary bg-primary text-white"
                  : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {category && (
        <div ref={dropdownRef} className="relative">
          <label className="mb-2 block font-medium text-[14px] text-grey8">세부 직군</label>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-tag border border-grey3 bg-bg px-4 py-3 text-left font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
          >
            <span className={name ? "text-grey9" : "text-grey6"}>
              {name || "세부 직군을 선택하세요"}
            </span>
            <ChevronDown className="h-4 w-4 text-grey6" aria-hidden />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-tag border border-grey3 bg-bg shadow-lg">
              {subRoles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleSubRoleClick(role.value)}
                  className={`block w-full px-4 py-2 text-left font-regular text-[16px] transition-colors hover:bg-grey1 ${
                    name === role.value ? "bg-grey1 text-grey9" : "text-grey7"
                  }`}
                >
                  {role.value}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
