import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="flex flex-col items-center justify-center gap-5 rounded-card bg-grey3 px-6 py-10 text-center md:py-12 lg:py-[60px]">
      <h1 className="font-bold text-[28px] text-grey9 md:text-[36px] lg:text-[44px]">
        대학생 프로젝트 매칭 플랫폼
      </h1>
      <p className="max-w-[640px] font-regular text-[16px] text-grey7 md:text-[18px]">
        함께 만들고, 함께 성장하는 사이드 프로젝트의 시작. 지금 팀원을 찾아보세요.
      </p>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 rounded-tag bg-grey9 px-6 py-3 font-medium text-[16px] text-white hover:bg-grey8"
      >
        프로젝트 둘러보기
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </section>
  );
}
