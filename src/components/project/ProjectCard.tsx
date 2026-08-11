import { Link } from "react-router";
import { Calendar, ChevronRight, Users } from "lucide-react";
import type { ProjectPreview } from "@/types";
import { calculateDday } from "@/utils/dday";

interface ProjectCardProps {
  project: ProjectPreview;
  showThumbnail?: boolean;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const dday = calculateDday(project.recruitmentDeadline);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-grey4 bg-bg transition-shadow hover:shadow-sm"
    >
      <div className="flex min-h-[184px] flex-1 flex-col gap-[19px] px-4 pt-4 pb-4">
        <div className="flex flex-col gap-2">
          <h3 className="truncate font-bold text-[20px] text-grey9">{project.title}</h3>
          <p className="line-clamp-2 font-regular text-[16px] text-grey9">{project.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex min-h-5 flex-row items-center gap-2 overflow-hidden">
            {project.recruitments.slice(0, 2).map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="max-w-[110px] truncate rounded-[16px] bg-primary-light px-[7px] py-[2px] font-regular text-[12px] text-primary"
              >
                {tag}
              </span>
            ))}
            {project.recruitments.length > 2 && (
              <span className="shrink-0 rounded-[16px] bg-grey2 px-[7px] py-[2px] font-regular text-[12px] text-grey7">
                외 {project.recruitments.length - 2}개
              </span>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1 font-regular text-[12px] text-grey6">
                <Users className="h-4 w-4" aria-hidden />
                {project.applicantCount}/{project.recruitmentCount}명
              </span>
              <span className="flex items-center gap-1 rounded-[16px] bg-primary px-2 py-[2px] font-bold text-[12px] text-white">
                <Calendar className="h-3 w-3" aria-hidden />
                {dday}
              </span>
            </div>
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-card border border-grey6 bg-bg">
              <ChevronRight className="h-4 w-4 text-grey9" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
