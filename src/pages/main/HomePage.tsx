import { useEffect, useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PopularProjectRow } from "@/components/home/PopularProjectRow";
import { LatestProjectList } from "@/components/home/LatestProjectList";
import { getProjects } from "@/api/projects";
import type { ProjectPreview } from "@/types";

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  useEffect(() => {
    let active = true;
    getProjects({ size: 8 })
      .then((data) => {
        if (active) setProjects(data.content);
      })
      .catch(() => {});
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
        <PopularProjectRow projects={popular} />
        <LatestProjectList projects={latest} />
      </div>
    </div>
  );
}
