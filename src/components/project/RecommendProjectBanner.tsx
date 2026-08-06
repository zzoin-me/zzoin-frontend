import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import type { ProjectPreview } from "@/types";

const MAX_ITEMS = 10;
const CARD_WIDTH = 280;
const GAP = 24;
const CARD_STRIDE = CARD_WIDTH + GAP;

interface RecommendProjectBannerProps {
  projects: ProjectPreview[];
  nickname?: string;
  onDismiss?: () => void;
}

export function RecommendProjectBanner({ projects, nickname, onDismiss }: RecommendProjectBannerProps) {
  const display = projects.slice(0, MAX_ITEMS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rafRef = useRef<number>(0);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const visible = Math.floor((el.clientWidth + GAP) / CARD_STRIDE);
    setVisibleCount(Math.max(1, visible));
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const idx = Math.round(el.scrollLeft / CARD_STRIDE);
    setActiveIndex(Math.max(0, Math.min(idx, Math.max(0, display.length - visible))));
  }, [display.length]);

  useLayoutEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const dotCount = Math.max(1, display.length - (visibleCount - 1));

  const scrollByDir = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -CARD_STRIDE : CARD_STRIDE,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(idx, dotCount - 1));
    el.scrollTo({ left: target * CARD_STRIDE, behavior: "smooth" });
  };

  if (display.length === 0) return null;

  return (
    <section className="relative rounded-card bg-[#F6F1EB] p-6 md:p-8">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="추천 배너 닫기"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-grey5 transition-colors hover:bg-grey3 hover:text-grey9"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}
      <h2 className="font-bold text-[20px] text-grey9">
        {nickname ? `${nickname}님을 위한` : "회원님을 위한"} 추천 모집글
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => scrollByDir("left")}
          disabled={!canScrollLeft}
          aria-label="이전 추천 프로젝트"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-grey3 bg-white shadow-sm hover:bg-grey1 disabled:cursor-not-allowed disabled:opacity-30 lg:flex"
        >
          <ChevronLeft className="h-5 w-5 text-grey9" aria-hidden />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 snap-x snap-mandatory gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {display.map((p) => (
            <div key={p.id} className="w-full shrink-0 snap-start md:w-[280px]">
              <ProjectCard project={p} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollByDir("right")}
          disabled={!canScrollRight}
          aria-label="다음 추천 프로젝트"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-grey3 bg-white shadow-sm hover:bg-grey1 disabled:cursor-not-allowed disabled:opacity-30 lg:flex"
        >
          <ChevronRight className="h-5 w-5 text-grey9" aria-hidden />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`추천 프로젝트 ${i + 1}번으로 이동`}
            className={`h-2 rounded-full transition-all ${
              activeIndex === i ? "w-6 bg-grey9" : "w-2 bg-grey5"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
