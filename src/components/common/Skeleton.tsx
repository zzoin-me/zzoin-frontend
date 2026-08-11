import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded bg-grey3 ${className}`}
      aria-hidden
      {...props}
    />
  );
}
