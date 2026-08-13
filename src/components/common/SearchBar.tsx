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
      className={`flex h-[46px] min-w-0 items-center gap-2 rounded-tag border border-grey3 bg-bg px-4 focus-within:border-grey9 ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:outline-none"
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
          className="-mr-3 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-grey1"
          aria-label="검색"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      )}
      {!onSearch && <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
    </div>
  );
}
