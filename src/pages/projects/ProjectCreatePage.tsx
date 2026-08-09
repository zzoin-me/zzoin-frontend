import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { createProject } from "@/api/projects";
import { ApiError } from "@/api/client";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { RecruitmentSelect } from "@/components/common/RecruitmentSelect";
import type { RecruitmentSelectValue } from "@/components/common/RecruitmentSelect";
import type {
  CreateProjectRequest,
  CollaborationType,
  GoalType,
  RecruitmentCategory,
  CreateQuestion,
} from "@/types";
import { MAX_RECRUITMENTS } from "@/constants/recruitment";

const collabOptions: { value: CollaborationType; label: string }[] = [
  { value: "ONLINE", label: "온라인" },
  { value: "OFFLINE", label: "오프라인" },
  { value: "BOTH", label: "온·오프라인" },
];

const goalOptions: { value: GoalType; label: string }[] = [
  { value: "PORTFOLIO", label: "포트폴리오용" },
  { value: "PRODUCTION", label: "출시 목표" },
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

  const [recruitments, setRecruitments] = useState(
    Array.from({ length: 1 }, () => ({
      category: "" as RecruitmentCategory | "",
      jobRoleId: null as number | null,
      count: 1,
      qualification: "",
      preferred: "",
    })),
  );

  const addRecruitment = () => {
    if (recruitments.length >= MAX_RECRUITMENTS) return;
    setRecruitments((prev) => [
      ...prev,
      {
        category: "" as RecruitmentCategory | "",
        jobRoleId: null as number | null,
        count: 1,
        qualification: "",
        preferred: "",
      },
    ]);
  };

  const removeRecruitment = (idx: number) => {
    setRecruitments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRecruitment = (idx: number, field: string, value: string | number) => {
    setRecruitments((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const updateRecruitmentRole = (idx: number, roleValue: RecruitmentSelectValue) => {
    setRecruitments((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              category: roleValue.category,
              jobRoleId: roleValue.jobRoleId,
            }
          : r,
      ),
    );
  };

  const [questions, setQuestions] = useState<
    (CreateQuestion & { isMulti?: boolean; optionsText?: string[] })[]
  >([]);

  const addQuestion = () => {
    if (questions.length >= 10) return;
    setQuestions((prev) => [...prev, { type: "TEXT", label: "", required: false, isMulti: false }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionType = (idx: number, isChoice: boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              type: isChoice ? (q.isMulti ? "MULTI_CHOICE" : "SINGLE_CHOICE") : "TEXT",
              options: isChoice ? (q.options ?? []) : undefined,
              optionsText: isChoice ? (q.optionsText ?? []) : undefined,
            }
          : q,
      ),
    );
  };

  const updateQuestionLabel = (idx: number, label: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, label } : q)));
  };

  const updateQuestionRequired = (idx: number, required: boolean) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, required } : q)));
  };

  const updateQuestionMulti = (idx: number, isMulti: boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, isMulti, type: isMulti ? "MULTI_CHOICE" : "SINGLE_CHOICE" } : q,
      ),
    );
  };

  const addOption = (idx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              options: [...(q.options ?? []), ""],
              optionsText: [...(q.optionsText ?? []), ""],
            }
          : q,
      ),
    );
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: (q.options ?? []).filter((_, oi) => oi !== optIdx),
              optionsText: (q.optionsText ?? []).filter((_, oi) => oi !== optIdx),
            }
          : q,
      ),
    );
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const optionsText = [...(q.optionsText ?? [])];
        optionsText[optIdx] = text;
        return { ...q, options: optionsText.filter((t) => t.trim()), optionsText };
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (title.trim().length < 2 || title.trim().length > 30) {
      setError("제목은 2자 이상 30자 이하여야 합니다.");
      return;
    }
    if (!description.trim() || description.trim().length < 2 || description.trim().length > 500) {
      setError("내용은 2자 이상 500자 이하여야 합니다.");
      return;
    }
    if (
      !communicationTool.trim() ||
      communicationTool.trim().length < 2 ||
      communicationTool.trim().length > 50
    ) {
      setError("커뮤니케이션 도구는 2자 이상 50자 이하여야 합니다.");
      return;
    }
    if (!recruitmentDeadline) {
      setError("모집 마감일을 선택해주세요.");
      return;
    }
    if (recruitments.length > MAX_RECRUITMENTS) {
      setError(`모집 역할은 최대 ${MAX_RECRUITMENTS}개까지 추가할 수 있습니다.`);
      return;
    }

    const hasInvalidRecruitment = recruitments.some(
      (r) =>
        !r.category ||
        r.jobRoleId == null ||
        !r.qualification ||
        r.qualification.trim().length < 2 ||
        r.qualification.trim().length > 200 ||
        !r.preferred ||
        r.preferred.trim().length < 2 ||
        r.preferred.trim().length > 200,
    );
    if (hasInvalidRecruitment) {
      setError(
        "모집 역할의 각 항목은 2자 이상 입력해야 하며, 역할명은 30자, 자격/우대사항은 200자 이하여야 합니다.",
      );
      return;
    }

    const hasInvalidQuestion = questions.some(
      (q) =>
        !q.label.trim() ||
        ((q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") &&
          (q.optionsText ?? []).filter((o) => o.trim()).length < 2),
    );
    if (hasInvalidQuestion) {
      setError("질문 내용을 입력해주세요. 선택형 질문은 옵션을 2개 이상 추가해야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const data: CreateProjectRequest = {
        title,
        description,
        collaborationType,
        communicationTool,
        meetingSchedule: meetingSchedule || undefined,
        period: period || undefined,
        recruitmentDeadline,
        goalType,
        imageUrl,
        recruitments: recruitments.map((r) => ({
          jobRoleId: r.jobRoleId!,
          recruitmentCount: r.count,
          qualification: r.qualification,
          preferred: r.preferred,
        })),
        questions:
          questions.length > 0
            ? questions.map((q) => ({
                type: q.type,
                label: q.label.trim(),
                options:
                  q.type === "TEXT"
                    ? undefined
                    : (q.optionsText ?? []).filter((o) => o.trim()).map((o) => o.trim()),
                required: q.required,
              }))
            : undefined,
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
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[20px] text-grey9">제목</span>
                <input
                  placeholder="제목을 입력하세요 (2~30자)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={30}
                  className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[20px] text-grey9">정보</span>
                <textarea
                  placeholder="상세 정보를 입력하세요 (2~500자)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-[17px]">
            <h2 className="font-bold text-[20px] text-grey9">2. 협업 방식</h2>
            <div className="flex flex-col gap-[17px]">
              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium text-[20px] text-grey9">진행 방식</span>
                  <div className="flex flex-wrap gap-2">
                    {collabOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCollaborationType(opt.value)}
                        className={`rounded-[20px] border px-5 py-[10px] font-regular text-[16px] transition-colors ${
                          collaborationType === opt.value
                            ? "border-primary bg-primary text-white"
                            : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium text-[20px] text-grey9">커뮤니케이션 도구</span>
                  <input
                    placeholder="예: Discord, Slack"
                    value={communicationTool}
                    onChange={(e) => setCommunicationTool(e.target.value)}
                    className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium text-[20px] text-grey9">
                    정기 모임 <span className="font-regular text-[16px] text-grey6">(선택)</span>
                  </span>
                  <input
                    placeholder="예: 매주 화, 목 20시"
                    value={meetingSchedule}
                    onChange={(e) => setMeetingSchedule(e.target.value)}
                    className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-medium text-[20px] text-grey9">
                    예상 기간 <span className="font-regular text-[16px] text-grey6">(선택)</span>
                  </span>
                  <input
                    placeholder="예: 3개월"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-[20px] text-grey9">3. 팀 구성 및 모집 역할</h2>
              <span className="shrink-0 font-regular text-[13px] text-grey6">
                최대 {MAX_RECRUITMENTS}개
              </span>
            </div>
            <div className="flex flex-col gap-7">
              {recruitments.map((r, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-[17px] rounded-[20px] border border-grey3 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[20px] text-grey9">모집 역할 {idx + 1}</span>
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
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[20px] text-grey9">모집 직군</span>
                      <RecruitmentSelect
                        value={{
                          category: r.category,
                          jobRoleId: r.jobRoleId,
                        }}
                        onChange={(v) => updateRecruitmentRole(idx, v)}
                      />
                    </div>
                    <div className="flex w-full flex-col gap-1 md:w-[133px]">
                      <span className="font-medium text-[20px] text-grey9">인원 수</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={r.count}
                        onChange={(e) => updateRecruitment(idx, "count", Number(e.target.value))}
                        placeholder="인원 수 입력"
                        className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[20px] text-grey9">지원자격</span>
                    <input
                      placeholder="지원자격을 입력하세요 (2~200자)"
                      value={r.qualification}
                      onChange={(e) => updateRecruitment(idx, "qualification", e.target.value)}
                      className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[20px] text-grey9">우대사항</span>
                    <input
                      placeholder="우대사항을 입력하세요 (2~200자)"
                      value={r.preferred}
                      onChange={(e) => updateRecruitment(idx, "preferred", e.target.value)}
                      className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[20px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              {recruitments.length < MAX_RECRUITMENTS && (
                <button
                  type="button"
                  onClick={addRecruitment}
                  className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-3 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  모집 역할 추가
                </button>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-bold text-[20px] text-grey9">4. 추가 질문 (선택)</h2>
            <p className="font-regular text-[14px] text-grey6">
              지원자에게 추가로 받을 질문을 설정할 수 있어요. (최대 10개)
            </p>
            {questions.length === 0 ? (
              <div className="flex flex-col gap-4">
                <p className="rounded-[20px] border border-dashed border-grey3 px-5 py-8 text-center font-regular text-[14px] text-grey6">
                  추가 질문이 없습니다. 아래 버튼을 눌러 지원자에게 받을 질문을 만들어보세요.
                </p>
                {questions.length < 10 && (
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-3 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    질문 추가
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-[20px] border border-grey3 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[16px] text-grey9">질문 {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-grey5 hover:text-red-500"
                        aria-label="질문 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[14px] text-grey8">답변 형식</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestionType(idx, false)}
                          className={`rounded-tag border px-3 py-1.5 font-medium text-[13px] transition-colors ${
                            q.type === "TEXT"
                              ? "border-primary bg-primary text-white"
                              : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                          }`}
                        >
                          장문
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuestionType(idx, true)}
                          className={`rounded-tag border px-3 py-1.5 font-medium text-[13px] transition-colors ${
                            q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE"
                              ? "border-primary bg-primary text-white"
                              : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                          }`}
                        >
                          선택
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[14px] text-grey8">질문 내용</span>
                      <input
                        placeholder={
                          q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE"
                            ? "예: 협업 프로젝트를 진행한 횟수가 얼마나 되나요?"
                            : "예: 포트폴리오 링크를 남겨주세요."
                        }
                        value={q.label}
                        onChange={(e) => updateQuestionLabel(idx, e.target.value)}
                        maxLength={100}
                        className="w-full rounded-tag border border-grey3 px-4 py-2.5 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                      />
                    </div>
                    {(q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (
                      <div className="flex flex-col gap-2">
                        <span className="font-medium text-[14px] text-grey8">옵션</span>
                        <div className="flex flex-col gap-2">
                          {(q.optionsText ?? []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                placeholder={`옵션 ${optIdx + 1}`}
                                value={opt}
                                onChange={(e) => updateOptionText(idx, optIdx, e.target.value)}
                                maxLength={50}
                                className="flex-1 rounded-tag border border-grey3 px-4 py-2 font-regular text-[15px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(idx, optIdx)}
                                className="shrink-0 text-grey5 hover:text-red-500"
                                aria-label="옵션 삭제"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(idx)}
                            className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-2 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7"
                          >
                            <Plus className="h-4 w-4" /> 옵션 추가
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-5 pt-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestionRequired(idx, e.target.checked)}
                          className="h-4 w-4 accent-grey9"
                        />
                        <span className="font-medium text-[14px] text-grey7">필수 질문</span>
                      </label>
                      {(q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={q.isMulti ?? false}
                            onChange={(e) => updateQuestionMulti(idx, e.target.checked)}
                            className="h-4 w-4 accent-grey9"
                          />
                          <span className="font-medium text-[14px] text-grey7">복수선택 가능</span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                {questions.length < 10 && (
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-3 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    질문 추가
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4 lg:hidden">
            <h2 className="font-bold text-[20px] text-grey9">5. 상세 설정</h2>
            <div className="flex flex-col gap-[17px] rounded-[20px] border border-grey3 p-5">
              <div className="flex flex-col gap-3">
                <span className="font-medium text-[16px] text-grey6">모집 기한</span>
                <DateTimePicker
                  value={recruitmentDeadline}
                  onChange={setRecruitmentDeadline}
                  placeholder="날짜와 시간을 선택하세요"
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-medium text-[16px] text-grey6">프로젝트 목표</span>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGoalType(opt.value)}
                      className={`rounded-[20px] border px-4 py-[10px] font-medium text-[16px] transition-colors ${
                        goalType === opt.value
                          ? "border-primary bg-primary text-white"
                          : "border-grey4 bg-bg text-grey6 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[20px] bg-grey9 px-5 py-[14px] font-bold text-[24px] text-grey1 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </section>
        </div>

        <aside className="hidden w-[300px] shrink-0 lg:flex lg:flex-col lg:gap-9">
          <div className="flex flex-col gap-4 border-b border-grey4 pb-9">
            <h2 className="font-bold text-[20px] text-grey9">상세 설정</h2>
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-3">
                <span className="font-medium text-[16px] text-grey6">모집 기한</span>
                <DateTimePicker
                  value={recruitmentDeadline}
                  onChange={setRecruitmentDeadline}
                  placeholder="날짜와 시간을 선택하세요"
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-medium text-[16px] text-grey6">프로젝트 목표</span>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGoalType(opt.value)}
                      className={`rounded-[20px] border px-4 py-[10px] font-medium text-[16px] transition-colors ${
                        goalType === opt.value
                          ? "border-primary bg-primary text-white"
                          : "border-grey4 bg-bg text-grey6 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[20px] bg-grey9 px-5 py-[14px] font-bold text-[24px] text-grey1 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "등록하기"}
          </button>
        </aside>
      </form>
    </div>
  );
}
