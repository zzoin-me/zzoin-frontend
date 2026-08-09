import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getJobCategories, getJobRoles } from "@/api/jobRole";
import type { JobCategory, JobRole, RecruitmentCategory } from "@/types";

export interface RecruitmentSelectValue {
  category: RecruitmentCategory | "";
  jobRoleId: number | null;
}

interface RecruitmentSelectProps {
  value: RecruitmentSelectValue;
  onChange: (value: RecruitmentSelectValue) => void;
}

export function RecruitmentSelect({ value, onChange }: RecruitmentSelectProps) {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [rolesByCategory, setRolesByCategory] = useState<Record<string, JobRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await getJobCategories();
        if (cancelled) return;
        setCategories(cats);
        const entries = await Promise.all(
          cats.map(async (c) => [c.categoryCode, await getJobRoles(c.categoryCode)] as const),
        );
        if (cancelled) return;
        setRolesByCategory(Object.fromEntries(entries));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    onChange({ category: c, jobRoleId: null });
  };

  const handleRoleClick = (role: JobRole) => {
    onChange({ ...value, jobRoleId: role.id });
    setDropdownOpen(false);
  };

  const selectedRoleName = (() => {
    const roles = value.category ? rolesByCategory[value.category] ?? [] : [];
    return roles.find((r) => r.id === value.jobRoleId)?.name ?? "";
  })();

  const subRoles = value.category ? rolesByCategory[value.category] ?? [] : [];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-2 block font-medium text-[14px] text-grey8">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <span className="font-regular text-[14px] text-grey6">불러오는 중...</span>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.categoryCode as RecruitmentCategory)}
                className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                  value.category === cat.categoryCode
                    ? "border-primary bg-primary text-white"
                    : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {value.category && (
        <div ref={dropdownRef} className="relative">
          <label className="mb-2 block font-medium text-[14px] text-grey8">세부 직군</label>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-tag border border-grey3 bg-bg px-4 py-3 text-left font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
          >
            <span className={selectedRoleName ? "text-grey9" : "text-grey6"}>
              {selectedRoleName || "세부 직군을 선택하세요"}
            </span>
            <ChevronDown className="h-4 w-4 text-grey6" aria-hidden />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-tag border border-grey3 bg-bg shadow-lg">
              {subRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleClick(role)}
                  className={`block w-full px-4 py-2 text-left font-regular text-[16px] transition-colors hover:bg-grey1 ${
                    value.jobRoleId === role.id ? "bg-grey1 text-grey9" : "text-grey7"
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
