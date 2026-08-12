import type { To } from "react-router";
import { PageHeader } from "@/components/common/PageHeader";

interface MyPageTitleProps {
  children: string;
  className?: string;
  backTo?: To;
}

export function MyPageTitle({ children, className = "", backTo = "/mypage" }: MyPageTitleProps) {
  return (
    <PageHeader
      title={children}
      backTo={backTo}
      className={className}
      backLabel="이전 화면으로 돌아가기"
      backButtonClassName="lg:hidden native:flex"
    />
  );
}
