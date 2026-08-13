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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="flex flex-col gap-1 rounded-card border border-grey3 px-5 py-4 transition-colors hover:bg-grey1"
          >
            <h3 className="truncate font-bold text-[18px] text-grey9">{p.title}</h3>
            <p className="line-clamp-1 font-regular text-[14px] text-grey6">{p.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.recruitments.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="rounded-[16px] bg-primary-light px-[7px] py-[2px] font-regular text-[12px] text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
