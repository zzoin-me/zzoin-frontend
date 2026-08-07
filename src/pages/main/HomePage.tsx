import { useQuery } from "@tanstack/react-query";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PopularProjectRow } from "@/components/home/PopularProjectRow";
import { LatestProjectList } from "@/components/home/LatestProjectList";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ProjectCardSkeleton } from "@/components/project/ProjectCardSkeleton";
import { getPopularProjects, getProjects } from "@/api/projects";

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
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["projects", "popular-home"],
    queryFn: () => getPopularProjects(0, 8),
    staleTime: 5 * 60_000,
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["projects", "latest-home"],
    queryFn: () => getProjects({ sort: "LATEST", size: 6 }),
    staleTime: 5 * 60_000,
  });

  const popular = popularData?.content ?? [];
  const latest = latestData?.content ?? [];
  const isLoading = popularLoading || latestLoading;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] lg:py-6">
      <HeroBanner />

      <div className="mt-8 flex flex-col gap-10 lg:mt-8">
        {isLoading ? (
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
