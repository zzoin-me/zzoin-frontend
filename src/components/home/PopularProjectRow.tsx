import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import type { ProjectPreview } from "@/types";

const MAX_ITEMS = 8;
const CARD_WIDTH = 280;
const GAP = 24;
const CARD_STRIDE = CARD_WIDTH + GAP;

interface PopularProjectRowProps {
  projects: ProjectPreview[];
}

export function PopularProjectRow({ projects }: PopularProjectRowProps) {
  const display = projects.slice(0, MAX_ITEMS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const rafRef = useRef<number>(0);

  useLayoutEffect(() => {
    const updateVisible = () => {
      const el = scrollRef.current;
      if (!el) return;
      const visible = Math.floor((el.clientWidth + GAP) / CARD_STRIDE);
      setVisibleCount(Math.max(1, visible));
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const dotCount = Math.max(1, display.length - (visibleCount - 1));

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / CARD_STRIDE);
      const maxIdx = dotCount - 1;
      setActiveIndex(Math.max(0, Math.min(idx, maxIdx)));
    });
  }, [dotCount]);

  useLayoutEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetIdx = Math.max(0, Math.min(idx, dotCount - 1));
    el.scrollTo({ left: targetIdx * CARD_STRIDE, behavior: "smooth" });
  };

  if (display.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="인기 프로젝트" moreLink="/projects" />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {display.map((p) => (
          <div key={p.id} className="w-full shrink-0 snap-start md:w-[280px]">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>

      <div className="hidden items-center justify-center gap-2 lg:flex">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`프로젝트 ${i + 1}번으로 이동`}
            className={`h-2 rounded-full transition-all ${
              activeIndex === i ? "w-6 bg-grey9" : "w-2 bg-grey3"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
