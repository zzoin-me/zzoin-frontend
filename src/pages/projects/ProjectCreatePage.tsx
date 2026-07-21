import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Camera } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[project/create] submit", { title, description });
    navigate("/projects");
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-grey9"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-10">
          <section className="flex flex-col gap-[17px]">
            <h2 className="font-bold text-[20px] text-grey9">1. 기본 정보 입력</h2>
            <div className="flex flex-col gap-[17px]">
              <Input
                label="프로젝트 제목"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="프로젝트 설명"
                placeholder="프로젝트를 소개해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input label="모집 기한" placeholder="예: 2024-12-31" />
            </div>
          </section>

          <section className="flex flex-col gap-[17px]">
            <h2 className="font-bold text-[20px] text-grey9">2. 협업 방식</h2>
            <div className="flex flex-col gap-[17px]">
              <Input label="온라인/오프라인" placeholder="예: 온라인 위주, 주 1회 오프라인" />
              <Input label="협업 툴" placeholder="예: Slack, Notion, Figma" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold text-[20px] text-grey9">3. 팀 구성 및 모집 역할</h2>
            <div className="flex flex-col gap-7">
              <Input label="모집 역할 1" placeholder="예: 프론트엔드 2명" />
              <Input label="모집 역할 2" placeholder="예: 디자이너 1명" />
            </div>
          </section>
        </div>

        <aside className="flex w-full flex-col gap-9 lg:w-[300px]">
          <div className="flex h-[286px] w-full flex-col items-center justify-center rounded-card bg-grey2 lg:w-[286px]">
            <Camera className="h-24 w-24 text-grey4" aria-hidden />
            <span className="mt-4 font-semibold text-[20px] text-grey5">사진 등록하기</span>
          </div>

          <div className="flex flex-col gap-7 border-b border-grey4 pb-9">
            <h3 className="font-bold text-[20px] text-grey9">상세 설정</h3>
            <div className="flex flex-col gap-7">
              <Input label="태그" placeholder="예: 사이드 프로젝트, IT" />
              <Input label="목적" placeholder="예: MVP 개발, 포트폴리오" />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            등록하기
          </Button>
        </aside>
      </form>
    </div>
  );
}
