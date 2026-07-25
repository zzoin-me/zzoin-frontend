import { Link } from "react-router";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { ProjectPreview } from "@/types";

interface LatestProjectListProps {
  projects: ProjectPreview[];
}

export function LatestProjectList({ projects }: LatestProjectListProps) {
  if (projects.length === 0) return null;
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="최신 프로젝트" moreLink="/projects" />
      <ul className="flex flex-col divide-y divide-grey3">
        {projects.map((p) => {
          return (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="flex items-center gap-5 py-5 transition-colors hover:bg-grey1"
              >
                <div className="h-[80px] w-[80px] shrink-0 rounded-tag bg-grey4">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full rounded-tag object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="truncate font-bold text-[18px] text-grey9">{p.title}</h3>
                  <p className="line-clamp-1 font-regular text-[14px] text-grey6">
                    {p.description}
                  </p>
                  <div className="flex gap-1.5">
                    {p.recruitments.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="rounded-[16px] bg-primary-light px-[7px] py-[2px] font-regular text-[12px] text-primary"
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
