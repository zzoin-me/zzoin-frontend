import type { ReactNode } from "react";
import type { To } from "react-router";
import { PageBackButton } from "@/components/common/PageBackButton";

interface PageHeaderProps {
  title: ReactNode;
  backTo: To;
  description?: ReactNode;
  actions?: ReactNode;
  backLabel?: string;
  className?: string;
  titleClassName?: string;
  backButtonClassName?: string;
  titleSize?: "default" | "compact";
}

export function PageHeader({
  title,
  backTo,
  description,
  actions,
  backLabel,
  className = "",
  titleClassName = "",
  backButtonClassName = "",
  titleSize = "default",
}: PageHeaderProps) {
  const titleSizeClassName =
    titleSize === "compact"
      ? "text-[22px] md:text-[24px]"
      : "text-[22px] md:text-[26px] lg:text-[28px]";

  return (
    <div className={`flex min-w-0 items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-2">
        <PageBackButton
          fallbackTo={backTo}
          label={backLabel}
          className={`-ml-2 ${backButtonClassName}`}
        />
        <div className="flex min-h-11 min-w-0 flex-col justify-center">
          <h1
            className={`font-bold leading-tight text-grey9 ${titleSizeClassName} ${titleClassName}`}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1 font-regular text-[13px] text-grey6 md:text-[14px]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex min-h-11 shrink-0 items-center">{actions}</div>}
    </div>
  );
}
