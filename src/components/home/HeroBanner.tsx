import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section
      className="relative flex flex-col items-start justify-center gap-5 overflow-hidden rounded-card px-6 py-10 md:items-center md:px-12 md:text-center lg:items-start lg:text-left lg:py-[60px]"
      style={{ background: "linear-gradient(to right, #FF8B00, #FFB600)" }}
    >
      <img
        src="/hero-pattern.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 hidden h-[80%] -translate-y-1/2 opacity-30 lg:block"
      />
      <h1 className="relative font-bold text-[24px] leading-tight text-white md:text-[36px]">
        학교의 경계를 넘어,
        <br className="md:hidden" />
        함께 만드는 프로젝트
      </h1>
      <Link
        to="/projects"
        className="relative inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[16px] text-primary transition-opacity hover:opacity-90 md:text-[20px]"
      >
        프로젝트를 찾아보세요
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </section>
  );
}
