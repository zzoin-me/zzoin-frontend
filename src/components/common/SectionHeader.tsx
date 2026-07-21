import type { ReactNode } from "react";
import { Link } from "react-router";

interface SectionHeaderProps {
  title: string;
  moreLink?: string;
  moreLabel?: string;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  moreLink,
  moreLabel = "더보기",
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-medium text-[20px] text-grey9">{title}</h2>
      {children ? (
        children
      ) : moreLink ? (
        <Link to={moreLink} className="font-regular text-[14px] text-grey6 hover:text-grey9">
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}
