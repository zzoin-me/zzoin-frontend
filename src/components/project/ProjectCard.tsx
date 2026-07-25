import { Link } from "react-router";
import { Calendar, ChevronRight, Users } from "lucide-react";
import type { ProjectPreview } from "@/types";
import { calculateDday } from "@/utils/dday";

interface ProjectCardProps {
  project: ProjectPreview;
  showThumbnail?: boolean;
}

export function ProjectCard({ project, showThumbnail = true }: ProjectCardProps) {
  const dday = calculateDday(project.recruitmentDeadline);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-grey4 bg-white transition-shadow hover:shadow-sm"
    >
      {showThumbnail && (
        <div className="h-[113px] w-full rounded-t-card bg-grey4">
          {project.imageUrl && (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full rounded-t-card object-cover"
            />
          )}
        </div>
      )}

      <div
        className={`flex flex-1 flex-col gap-[19px] px-4 pb-4 ${showThumbnail ? "pt-1" : "pt-4"}`}
      >
        <div className="flex flex-col gap-2">
          <h3 className="truncate font-bold text-[20px] text-grey9">{project.title}</h3>
          <p className="line-clamp-2 font-regular text-[16px] text-grey9">{project.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            {project.recruitments.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="rounded-[16px] bg-primary-light px-[7px] py-[2px] font-regular text-[12px] text-primary"
              >
                {tag}
              </span>
            ))}
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
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-card border border-grey6 bg-white">
              <ChevronRight className="h-4 w-4 text-grey9" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
