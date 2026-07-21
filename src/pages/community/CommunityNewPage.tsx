import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function CommunityNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[community/new] submit", { title, content });
    navigate("/community");
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

      <form onSubmit={handleSubmit} className="rounded-card border border-grey5 p-9">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-grey5 pb-4 font-bold text-[20px] placeholder:text-grey6 focus:outline-none"
          required
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="mt-6 w-full font-medium text-[18px] placeholder:text-grey6 focus:outline-none"
          required
        />
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 rounded-card border border-grey5 bg-grey3 px-5 py-3 font-medium text-[16px] text-grey7"
        >
          <ImageIcon className="h-5 w-5" aria-hidden />
          사진 불러오기
        </button>
        <div className="flex gap-4">
          <Button variant="outline" type="button">
            임시저장
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
