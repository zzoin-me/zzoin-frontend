import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-5 rounded-card px-6 py-10 text-center md:px-12 md:py-12 lg:py-[60px]"
      style={{ background: "linear-gradient(to right, var(--color-primary), var(--color-primary-end))" }}
    >
      <h1 className="font-bold text-[24px] leading-tight text-white md:text-[36px]">
        학교의 경계를 넘어,
        <br className="md:hidden" />
        함께 만드는 프로젝트
      </h1>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[16px] text-primary transition-opacity hover:opacity-90 md:text-[20px]"
      >
        프로젝트를 찾아보세요
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </section>
  );
}
