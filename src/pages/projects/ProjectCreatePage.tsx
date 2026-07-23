import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Camera, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { createProject } from "@/api/projects";
import { ApiError } from "@/api/client";
import type { CreateProjectRequest, CollaborationType, GoalType } from "@/types";

const collabOptions: { value: CollaborationType; label: string }[] = [
  { value: "ONLINE", label: "온라인" },
  { value: "OFFLINE", label: "오프라인" },
  { value: "BOTH", label: "온·오프라인" },
];

const goalOptions: { value: GoalType; label: string }[] = [
  { value: "PORTFOLIO", label: "포트폴리오" },
  { value: "PRODUCTION", label: "실 서비스" },
  { value: "COMPETITION", label: "공모전" },
];

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collaborationType, setCollaborationType] = useState<CollaborationType>("ONLINE");
  const [communicationTool, setCommunicationTool] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [period, setPeriod] = useState("");
  const [recruitmentDeadline, setRecruitmentDeadline] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("PORTFOLIO");
  const [imageUrl] = useState("https://via.placeholder.com/300x200");

  const [recruitments, setRecruitments] = useState([
    { name: "", count: 1, qualification: "", preferred: "" },
  ]);

  const addRecruitment = () => {
    setRecruitments((prev) => [...prev, { name: "", count: 1, qualification: "", preferred: "" }]);
  };

  const removeRecruitment = (idx: number) => {
    setRecruitments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRecruitment = (idx: number, field: string, value: string | number) => {
    setRecruitments((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !communicationTool || !recruitmentDeadline) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    const hasEmptyRecruitment = recruitments.some(
      (r) => !r.name || !r.qualification || !r.preferred,
    );
    if (hasEmptyRecruitment) {
      setError("모집 역열의 필수 항목을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const data: CreateProjectRequest = {
        title,
        description,
        collaborationType,
        communicationTool,
        meetingSchedule,
        period,
        recruitmentDeadline: new Date(recruitmentDeadline).toISOString(),
        goalType,
        imageUrl,
        recruitments,
      };
      await createProject(data);
      navigate("/projects", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "프로젝트 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
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
                placeholder="제목을 입력하세요 (2~30자)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={30}
              />
              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">
                  프로젝트 설명
                </label>
                <textarea
                  placeholder="프로젝트를 소개해주세요 (2~500자)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                />
              </div>
              <Input
                label="모집 마감일"
                type="datetime-local"
                value={recruitmentDeadline}
                onChange={(e) => setRecruitmentDeadline(e.target.value)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-[17px]">
            <h2 className="font-bold text-[20px] text-grey9">2. 협업 방식</h2>
            <div className="flex flex-col gap-[17px]">
              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">진행 방식</label>
                <div className="flex gap-2">
                  {collabOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCollaborationType(opt.value)}
                      className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                        collaborationType === opt.value
                          ? "border-grey9 bg-grey9 text-white"
                          : "border-grey3 bg-white text-grey7 hover:border-grey5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="커뮤니케이션 도구"
                placeholder="예: Discord, Slack"
                value={communicationTool}
                onChange={(e) => setCommunicationTool(e.target.value)}
              />
              <Input
                label="정기 모임 일정"
                placeholder="예: 매주 화, 목 20시"
                value={meetingSchedule}
                onChange={(e) => setMeetingSchedule(e.target.value)}
              />
              <Input
                label="예상 기간"
                placeholder="예: 3개월"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
              <div>
                <label className="mb-2 block font-medium text-[14px] text-grey8">목표</label>
                <div className="flex gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGoalType(opt.value)}
                      className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                        goalType === opt.value
                          ? "border-grey9 bg-grey9 text-white"
                          : "border-grey3 bg-white text-grey7 hover:border-grey5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[20px] text-grey9">3. 팀 구성 및 모집 역할</h2>
              <button
                type="button"
                onClick={addRecruitment}
                className="flex items-center gap-1 rounded-tag border border-grey3 px-3 py-2 font-medium text-[14px] text-grey7 hover:border-grey5 hover:text-grey9"
              >
                <Plus className="h-4 w-4" aria-hidden />
                추가
              </button>
            </div>
            <div className="flex flex-col gap-7">
              {recruitments.map((r, idx) => (
                <div key={idx} className="flex flex-col gap-3 rounded-card border border-grey3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[14px] text-grey8">모집 역할 {idx + 1}</span>
                    {recruitments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecruitment(idx)}
                        className="text-grey5 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="역할명 (예: 프론트엔드)"
                    value={r.name}
                    onChange={(e) => updateRecruitment(idx, "name", e.target.value)}
                  />
                  <div>
                    <label className="mb-2 block font-medium text-[14px] text-grey8">
                      모집 인원
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={r.count}
                      onChange={(e) => updateRecruitment(idx, "count", Number(e.target.value))}
                      className="w-24 rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 focus:border-grey9 focus:outline-none"
                    />
                  </div>
                  <Input
                    placeholder="지원 자격 (2~200자)"
                    value={r.qualification}
                    onChange={(e) => updateRecruitment(idx, "qualification", e.target.value)}
                  />
                  <Input
                    placeholder="우대 사항 (2~200자)"
                    value={r.preferred}
                    onChange={(e) => updateRecruitment(idx, "preferred", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex w-full flex-col gap-9 lg:w-[300px]">
          <div className="flex h-[286px] w-full flex-col items-center justify-center rounded-card bg-grey2 lg:w-[286px]">
            <Camera className="h-24 w-24 text-grey4" aria-hidden />
            <span className="mt-4 font-semibold text-[20px] text-grey5">사진 등록하기</span>
          </div>

          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "등록 중..." : "등록하기"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
