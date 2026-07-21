import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export function SearchBar({
  placeholder = "검색어를 입력해주세요",
  className = "",
  ...rest
}: SearchBarProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-tag border border-grey3 bg-white px-4 py-3 focus-within:border-grey9 ${className}`}
    >
      <Search className="h-5 w-5 shrink-0 text-grey6" aria-hidden />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:outline-none"
        {...rest}
      />
    </div>
  );
}
