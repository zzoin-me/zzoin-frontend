import { Link } from "react-router";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { Project } from "@/types";

interface LatestProjectListProps {
  projects: Project[];
}

export function LatestProjectList({ projects }: LatestProjectListProps) {
  if (projects.length === 0) return null;
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="최신 프로젝트" moreLink="/projects" />
      <ul className="flex flex-col divide-y divide-grey3">
        {projects.map((p) => {
          const isClosed = p.status === "closed";
          return (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="flex items-center gap-5 py-5 transition-colors hover:bg-grey1"
              >
                {/* 썸네일 placeholder 80x80 */}
                <div className="h-[80px] w-[80px] shrink-0 rounded-tag bg-grey4">
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="h-full w-full rounded-tag object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-[18px] text-grey9">{p.title}</h3>
                    <span
                      className={`shrink-0 rounded-tag px-2 py-0.5 font-medium text-[12px] ${
                        isClosed ? "bg-grey2 text-grey6" : "bg-grey9 text-white"
                      }`}
                    >
                      {p.dday}
                    </span>
                  </div>
                  <p className="line-clamp-1 font-regular text-[14px] text-grey6">
                    {p.description}
                  </p>
                  <div className="flex gap-1.5">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-tag bg-grey2 px-2 py-0.5 font-regular text-[12px] text-grey7"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
