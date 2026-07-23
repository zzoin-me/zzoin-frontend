import { useEffect, useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PopularProjectRow } from "@/components/home/PopularProjectRow";
import { LatestProjectList } from "@/components/home/LatestProjectList";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { getProjects } from "@/api/projects";
import type { ProjectPreview } from "@/types";

function PopularSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="인기 프로젝트" moreLink="/projects" />
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full shrink-0 md:w-[280px]">
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="최신 프로젝트" moreLink="/projects" />
      <ul className="flex flex-col divide-y divide-grey3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-5 py-5">
            <div className="h-[80px] w-[80px] shrink-0 animate-pulse rounded-tag bg-grey3" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-1/2 animate-pulse rounded bg-grey3" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-grey3" />
              <div className="flex gap-1.5">
                <div className="h-5 w-10 animate-pulse rounded-[16px] bg-grey3" />
                <div className="h-5 w-14 animate-pulse rounded-[16px] bg-grey3" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProjects({ size: 8 })
      .then((data) => {
        if (active) setProjects(data.content);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const popular = projects.slice(0, 8);
  const latest = projects.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-6">
      <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
        <span className="font-bold text-[20px] text-grey9">HICC</span>
        <SearchBar className="max-w-[360px] flex-1" />
      </div>

      <HeroBanner />

      <div className="mt-8 flex flex-col gap-10 lg:mt-8">
        {loading ? (
          <>
            <PopularSkeleton />
            <LatestSkeleton />
          </>
        ) : (
          <>
            <PopularProjectRow projects={popular} />
            <LatestProjectList projects={latest} />
          </>
        )}
      </div>
    </div>
  );
}
