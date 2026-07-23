import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onSearch?: () => void;
}

export function SearchBar({
  placeholder = "검색어를 입력해주세요",
  className = "",
  onSearch,
  ...rest
}: SearchBarProps) {
  return (
    <div
      className={`flex h-[46px] items-center gap-2 rounded-tag border border-grey3 bg-white px-4 focus-within:border-grey9 ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            e.preventDefault();
            onSearch();
          }
        }}
        {...rest}
      />
      {onSearch && (
        <button
          type="button"
          onClick={onSearch}
          className="shrink-0 cursor-pointer text-grey6 hover:text-grey9"
          aria-label="검색"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      )}
      {!onSearch && <Search className="h-5 w-5 shrink-0 text-grey6" aria-hidden />}
    </div>
  );
}
