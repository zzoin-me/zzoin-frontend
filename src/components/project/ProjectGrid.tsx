import type { ReactNode } from "react";

interface ProjectGridProps {
  children: ReactNode;
}

export function ProjectGrid({ children }: ProjectGridProps) {
  return (
    <div
      className="grid gap-8"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
      }}
    >
      {children}
    </div>
  );
}
