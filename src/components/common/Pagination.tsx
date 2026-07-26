import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageList } from "@/utils/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageList = getPageList(currentPage, totalPages);

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-white text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-white disabled:hover:shadow-none"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      {pageList.map((entry, i) =>
        entry === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-10 w-10 items-center justify-center font-regular text-[14px] text-grey5"
          >
            ...
          </span>
        ) : (
          <button
            key={entry}
            onClick={() => onPageChange(entry)}
            aria-current={currentPage === entry ? "page" : undefined}
            className={`h-10 w-10 rounded-tag border font-medium text-[14px] transition-all ${
              currentPage === entry
                ? "cursor-default border-grey9 bg-grey9 text-white shadow-sm"
                : "border-grey3 bg-white text-grey7 hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm"
            }`}
          >
            {entry}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className="flex h-10 w-10 items-center justify-center rounded-tag border border-grey3 bg-white text-grey9 transition-all hover:-translate-y-0.5 hover:border-grey5 hover:bg-grey1 hover:text-grey9 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-grey3 disabled:hover:bg-white disabled:hover:shadow-none"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
