import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface MyPageTitleProps {
  children: string;
  className?: string;
  backTo?: string;
}

export function MyPageTitle({ children, className = "", backTo = "/mypage" }: MyPageTitleProps) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-grey9 transition-colors hover:bg-grey2 lg:hidden"
        aria-label="마이페이지로 돌아가기"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </button>
      <h1 className="font-bold text-[22px] text-grey9 md:text-[26px] lg:text-[28px]">{children}</h1>
    </div>
  );
}
