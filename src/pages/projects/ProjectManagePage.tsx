import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardPenLine, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { RecruitmentSelect } from "@/components/common/RecruitmentSelect";
import type { RecruitmentSelectValue } from "@/components/common/RecruitmentSelect";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingState } from "@/components/common/LoadingState";
import { ApplicantListSkeleton } from "@/components/mypage/MyPageSkeletons";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { ApplicantDetailModal } from "@/components/project/ApplicantDetailModal";
import { deleteProject, getProjectById, updateProject, updateProjectStatus } from "@/api/projects";
import { getApplicants, updateApplicantStatus } from "@/api/application";
import { ApiError } from "@/api/client";
import type {
  CollaborationType,
  CreateQuestion,
  GoalType,
  ProjectApplicant,
  ProjectStatus,
  RecruitmentCategory,
  UpdateProjectRequest,
  UpdateRecruitment,
} from "@/types";
import { MAX_RECRUITMENTS } from "@/constants/recruitment";
import { showSnackbar } from "@/stores/snackbarStore";

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

const statusActions: Partial<Record<ProjectStatus, { value: ProjectStatus; label: string }>> = {
  RECRUITING: { value: "RECRUITMENT_CLOSED", label: "모집 마감하기" },
  RECRUITMENT_CLOSED: { value: "IN_PROGRESS", label: "프로젝트 시작하기" },
  IN_PROGRESS: { value: "COMPLETED", label: "프로젝트 완료하기" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}`;
}

interface RecruitmentForm {
  recruitmentId?: number;
  category: RecruitmentCategory | "";
  jobRoleId: number | null;
  count: number;
  qualification: string;
  preferred: string;
}

interface QuestionForm extends CreateQuestion {
  isMulti: boolean;
  optionsText: string[];
}

export default function ProjectManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const scrollTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collaborationType, setCollaborationType] = useState<CollaborationType>("ONLINE");
  const [communicationTool, setCommunicationTool] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [period, setPeriod] = useState("");
  const [recruitmentDeadline, setRecruitmentDeadline] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("PORTFOLIO");
  const [imageUrl, setImageUrl] = useState("https://via.placeholder.com/300x200");
  const [status, setStatus] = useState<ProjectStatus>("RECRUITING");
  const [recruitments, setRecruitments] = useState<RecruitmentForm[]>([]);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  const [applicants, setApplicants] = useState<ProjectApplicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ProjectApplicant | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const questionsEditable = applicants.length === 0;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProjectById(Number(id)), getApplicants(Number(id))])
      .then(([detail, applicantsData]) => {
        setTitle(detail.title);
        setDescription(detail.description);
        setCollaborationType(detail.collaborationType);
        setCommunicationTool(detail.communicationTool);
        setMeetingSchedule(detail.meetingSchedule);
        setPeriod(detail.period);
        setRecruitmentDeadline(detail.recruitmentDeadline);
        setGoalType(detail.goalType);
        setImageUrl(detail.imageUrl || "https://via.placeholder.com/300x200");
        setStatus(detail.projectStatus);
        setRecruitments(
          detail.recruitments.map((r) => ({
            recruitmentId: r.id,
            category: r.category,
            jobRoleId: r.jobRoleId,
            count: r.recruitmentCount,
            qualification: r.qualification,
            preferred: r.preferred,
          })),
        );
        setQuestions(
          (detail.questions ?? []).map((question) => ({
            type: question.type,
            label: question.label,
            options: question.options ?? [],
            required: question.required,
            isMulti: question.type === "MULTI_CHOICE",
            optionsText: question.options ?? [],
          })),
        );
        setApplicants(applicantsData.applicants);
      })
      .catch(() => setError("프로젝트 정보를 불러오지 못했습니다."))
      .finally(() => {
        setLoading(false);
        setApplicantsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (scrollTarget === "applicants" && !loading) {
      const scrollToApplicants = () => {
        const el = document.getElementById("applicants");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          setTimeout(scrollToApplicants, 200);
        }
      };
      const timer = setTimeout(scrollToApplicants, 300);
      return () => clearTimeout(timer);
    }
  }, [scrollTarget, loading]);

  const addRecruitment = () => {
    if (recruitments.length >= MAX_RECRUITMENTS) return;
    setRecruitments((prev) => [
      ...prev,
      {
        category: "",
        jobRoleId: null,
        count: 1,
        qualification: "",
        preferred: "",
      },
    ]);
  };

  const removeRecruitment = (idx: number) => {
    setRecruitments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRecruitmentField = (
    idx: number,
    field: keyof RecruitmentForm,
    value: string | number,
  ) => {
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

  const addQuestion = () => {
    if (!questionsEditable || questions.length >= 10) return;
    setQuestions((prev) => [
      ...prev,
      { type: "TEXT", label: "", required: false, isMulti: false, optionsText: [] },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (!questionsEditable) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionType = (idx: number, isChoice: boolean) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === idx
          ? {
              ...question,
              type: isChoice ? (question.isMulti ? "MULTI_CHOICE" : "SINGLE_CHOICE") : "TEXT",
              options: isChoice ? question.options : undefined,
              optionsText: isChoice ? question.optionsText : [],
            }
          : question,
      ),
    );
  };

  const updateQuestionLabel = (idx: number, label: string) => {
    setQuestions((prev) =>
      prev.map((question, i) => (i === idx ? { ...question, label } : question)),
    );
  };

  const updateQuestionRequired = (idx: number, required: boolean) => {
    setQuestions((prev) =>
      prev.map((question, i) => (i === idx ? { ...question, required } : question)),
    );
  };

  const updateQuestionMulti = (idx: number, isMulti: boolean) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === idx
          ? { ...question, isMulti, type: isMulti ? "MULTI_CHOICE" : "SINGLE_CHOICE" }
          : question,
      ),
    );
  };

  const addOption = (idx: number) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === idx
          ? {
              ...question,
              optionsText: [...question.optionsText, ""],
            }
          : question,
      ),
    );
  };

  const removeOption = (questionIdx: number, optionIdx: number) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === questionIdx
          ? {
              ...question,
              optionsText: question.optionsText.filter((_, oi) => oi !== optionIdx),
            }
          : question,
      ),
    );
  };

  const updateOptionText = (questionIdx: number, optionIdx: number, text: string) => {
    if (text.length > 100) {
      showSnackbar({
        type: "error",
        message: "질문 선택지는 각각 100자 이하로 입력해주세요.",
        dedupeKey: "project-question-option-too-long",
      });
      return;
    }
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIdx) return question;
        const optionsText = [...question.optionsText];
        optionsText[optionIdx] = text;
        return { ...question, optionsText };
      }),
    );
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!id || newStatus === status) return;
    try {
      await updateProjectStatus(Number(id), newStatus);
      setStatus(newStatus);
      void queryClient.invalidateQueries({ queryKey: ["project-detail", Number(id)] });
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["project-chats"] });
    } catch (err) {
      showSnackbar({
        type: "error",
        message: err instanceof ApiError ? err.message : "상태 변경에 실패했습니다.",
      });
    }
  };

  const loadApplicants = () => {
    if (!id) return;
    setApplicantsLoading(true);
    setApplicantsError(false);
    getApplicants(Number(id))
      .then((data) => setApplicants(data.applicants))
      .catch(() => setApplicantsError(true))
      .finally(() => setApplicantsLoading(false));
  };

  const handleApplicantStatus = async (
    applicationId: number,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setProcessingId(applicationId);
    try {
      await updateApplicantStatus(applicationId, { status: newStatus });
      loadApplicants();
    } catch (err) {
      showSnackbar({
        type: "error",
        message: err instanceof ApiError ? err.message : "처리에 실패했습니다.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");

    if (status !== "RECRUITING") {
      setError("모집이 마감되어 프로젝트 설정을 수정할 수 없습니다.");
      return;
    }

    if (!title || !description || !communicationTool || !recruitmentDeadline) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    const hasEmptyRecruitment = recruitments.some(
      (r) => !r.category || r.jobRoleId == null || !r.qualification || !r.preferred,
    );
    if (hasEmptyRecruitment) {
      setError("모집 역할의 필수 항목을 모두 입력해주세요.");
      return;
    }
    if (recruitments.length > MAX_RECRUITMENTS) {
      setError(`모집 역할은 최대 ${MAX_RECRUITMENTS}개까지 추가할 수 있습니다.`);
      return;
    }

    if (questionsEditable) {
      const hasInvalidQuestion = questions.some(
        (question) =>
          !question.label.trim() ||
          ((question.type === "SINGLE_CHOICE" || question.type === "MULTI_CHOICE") &&
            question.optionsText.filter((option) => option.trim()).length < 2),
      );
      if (hasInvalidQuestion) {
        setError("질문 내용을 입력해주세요. 선택형 질문은 옵션을 2개 이상 추가해야 합니다.");
        return;
      }
      if (
        questions.some((question) =>
          question.optionsText.some((option) => option.trim().length > 100),
        )
      ) {
        setError("질문 선택지는 각각 100자 이하로 입력해주세요.");
        return;
      }
    }

    setSaving(true);
    try {
      const data: UpdateProjectRequest = {
        title,
        description,
        collaborationType,
        communicationTool,
        meetingSchedule: meetingSchedule || undefined,
        period: period || undefined,
        recruitmentDeadline,
        goalType,
        imageUrl,
        recruitments: recruitments.map<UpdateRecruitment>((r) => ({
          recruitmentId: r.recruitmentId,
          jobRoleId: r.jobRoleId!,
          recruitmentCount: r.count,
          qualification: r.qualification,
          preferred: r.preferred,
        })),
        questions: questionsEditable
          ? questions.map((question) => ({
              type: question.type,
              label: question.label.trim(),
              options:
                question.type === "TEXT"
                  ? undefined
                  : question.optionsText
                      .filter((option) => option.trim())
                      .map((option) => option.trim()),
              required: question.required,
            }))
          : undefined,
      };
      await updateProject(Number(id), data);
      navigate(`/projects/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProject(Number(id));
      navigate("/projects", { replace: true });
    } catch (err) {
      showSnackbar({
        type: "error",
        message: err instanceof ApiError ? err.message : "삭제에 실패했습니다.",
      });
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const statusAction = statusActions[status];
  const chatAvailable = status === "IN_PROGRESS" || status === "COMPLETED";
  const canEdit = status === "RECRUITING";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px] native:px-8">
      <PageHeader
        title="프로젝트 관리"
        backTo={`/projects/${id}`}
        className="mb-8"
        actions={
          <div className="flex items-center gap-2">
            <span className="font-medium text-[14px] text-grey6 md:text-[16px]">현재 상태</span>
            <StatusBadge status={status} />
          </div>
        }
      />

      <section className="mb-10 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8">
        <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">상태 변경</h2>
        <p className="mt-1 font-regular text-[13px] text-grey6 md:text-[14px]">
          현재 단계에서 다음 단계로만 변경할 수 있어요.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {statusAction ? (
            <button
              type="button"
              onClick={() => handleStatusChange(statusAction.value)}
              className="rounded-tag bg-primary px-4 py-2 font-medium text-[14px] text-white transition-opacity hover:opacity-90"
            >
              {statusAction.label}
            </button>
          ) : (
            <span className="font-medium text-[14px] text-grey6">완료된 프로젝트입니다.</span>
          )}
          {chatAvailable && (
            <Link
              to={`/projects/${id}/chat`}
              className="inline-flex items-center gap-2 rounded-tag border border-grey5 px-4 py-2 font-medium text-[14px] text-grey8 hover:border-grey7"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              대화방 열기
            </Link>
          )}
          {status === "COMPLETED" && (
            <Link
              to={`/mypage/reviews/${id}`}
              className="inline-flex items-center gap-2 rounded-tag border border-grey5 px-4 py-2 font-medium text-[14px] text-grey8 hover:border-grey7"
            >
              <ClipboardPenLine className="h-4 w-4" aria-hidden />
              팀원 후기 작성
            </Link>
          )}
        </div>
      </section>

      {!canEdit && (
        <div className="mb-6 rounded-[14px] border border-grey4 bg-grey1 px-4 py-3 font-medium text-[14px] text-grey7">
          모집이 마감되어 프로젝트 상세 설정을 수정할 수 없습니다.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 lg:flex-row lg:items-start native:flex-col"
      >
        <div className="flex flex-1 flex-col gap-10">
          <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-10 border-0 p-0">
            <section className="flex flex-col gap-[17px]">
              <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">1. 기본 정보</h2>
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
                    className="w-full rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                  />
                </div>
                <DateTimePicker
                  label="모집 마감일"
                  value={recruitmentDeadline}
                  onChange={setRecruitmentDeadline}
                  placeholder="날짜와 시간을 선택하세요"
                />
              </div>
            </section>

            <section className="flex flex-col gap-[17px]">
              <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">2. 협업 방식</h2>
              <div className="flex flex-col gap-[17px]">
                <div>
                  <label className="mb-2 block font-medium text-[14px] text-grey8">진행 방식</label>
                  <div className="flex flex-wrap gap-2">
                    {collabOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCollaborationType(opt.value)}
                        className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
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
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-bold text-[20px] text-grey9">3. 팀 구성 및 모집 역할</h2>
                <span className="shrink-0 font-regular text-[14px] text-grey6">
                  최대 {MAX_RECRUITMENTS}개
                </span>
              </div>
              <div className="flex flex-col gap-7">
                {recruitments.map((r, idx) => (
                  <div
                    key={r.recruitmentId ?? `new-${idx}`}
                    className="flex flex-col gap-[17px] rounded-[20px] border border-grey3 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[18px] text-grey9">
                        모집 역할 {idx + 1}
                      </span>
                      {recruitments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecruitment(idx)}
                          className="flex h-11 w-11 items-center justify-center rounded-full text-grey5 hover:bg-grey1 hover:text-red-500"
                          aria-label={`모집 역할 ${idx + 1} 삭제`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[16px] text-grey9">모집 직군</span>
                        <RecruitmentSelect
                          value={{
                            category: r.category,
                            jobRoleId: r.jobRoleId,
                          }}
                          onChange={(value) => updateRecruitmentRole(idx, value)}
                        />
                      </div>
                      <div className="flex w-full flex-col gap-1 md:w-[160px]">
                        <span className="font-medium text-[16px] text-grey9">인원 수</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={r.count}
                          onChange={(event) =>
                            updateRecruitmentField(idx, "count", Number(event.target.value))
                          }
                          placeholder="인원 수 입력"
                          className="w-full rounded-[20px] border border-grey6 px-4 py-[10px] font-regular text-[16px] text-grey9 placeholder:text-[16px] placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[16px] text-grey9">지원자격</span>
                      <input
                        placeholder="지원자격을 입력하세요 (2~200자)"
                        value={r.qualification}
                        onChange={(event) =>
                          updateRecruitmentField(idx, "qualification", event.target.value)
                        }
                        maxLength={200}
                        className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[16px] text-grey9 placeholder:text-[16px] placeholder:text-grey6 focus:border-grey9 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[16px] text-grey9">우대사항</span>
                      <input
                        placeholder="우대사항을 입력하세요 (2~200자)"
                        value={r.preferred}
                        onChange={(event) =>
                          updateRecruitmentField(idx, "preferred", event.target.value)
                        }
                        maxLength={200}
                        className="w-full rounded-[20px] border border-grey6 px-5 py-[10px] font-regular text-[16px] text-grey9 placeholder:text-[16px] placeholder:text-grey6 focus:border-grey9 focus:outline-none"
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
          </fieldset>

          <fieldset disabled={!canEdit || !questionsEditable} className="min-w-0 border-0 p-0">
            <section className="flex flex-col gap-4">
              <h2 className="font-bold text-[20px] text-grey9">4. 추가 질문 (선택)</h2>
              <p className="font-regular text-[14px] text-grey6">
                지원자에게 추가로 받을 질문을 설정할 수 있어요. (최대 10개)
              </p>
              {!questionsEditable && (
                <div className="rounded-[14px] border border-primary/30 bg-primary-light px-4 py-3 font-medium text-[13px] text-grey8 md:text-[14px]">
                  기존 지원서의 답변을 보호하기 위해 지원자가 생긴 뒤에는 추가 질문을 수정할 수
                  없습니다.
                </div>
              )}

              {questions.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <p className="rounded-[20px] border border-dashed border-grey3 px-5 py-8 text-center font-regular text-[14px] text-grey6">
                    추가 질문이 없습니다. 아래 버튼을 눌러 지원자에게 받을 질문을 만들어보세요.
                  </p>
                  {questionsEditable && questions.length < 10 && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-3 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      질문 추가
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {questions.map((question, questionIdx) => (
                    <div
                      key={questionIdx}
                      className="flex flex-col gap-3 rounded-[20px] border border-grey3 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[18px] text-grey9">
                          질문 {questionIdx + 1}
                        </span>
                        {questionsEditable && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIdx)}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-grey5 hover:bg-grey1 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`질문 ${questionIdx + 1} 삭제`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[16px] text-grey8">답변 형식</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestionType(questionIdx, false)}
                            className={`rounded-tag border px-3 py-1.5 font-medium text-[14px] transition-colors disabled:cursor-not-allowed ${
                              question.type === "TEXT"
                                ? "border-primary bg-primary text-white"
                                : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                            }`}
                          >
                            장문
                          </button>
                          <button
                            type="button"
                            onClick={() => updateQuestionType(questionIdx, true)}
                            className={`rounded-tag border px-3 py-1.5 font-medium text-[14px] transition-colors disabled:cursor-not-allowed ${
                              question.type === "SINGLE_CHOICE" || question.type === "MULTI_CHOICE"
                                ? "border-primary bg-primary text-white"
                                : "border-grey3 bg-bg text-grey7 hover:border-primary hover:text-primary"
                            }`}
                          >
                            선택
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[16px] text-grey8">질문 내용</span>
                        <input
                          placeholder={
                            question.type === "SINGLE_CHOICE" || question.type === "MULTI_CHOICE"
                              ? "예: 협업 프로젝트를 진행한 횟수가 얼마나 되나요?"
                              : "예: 포트폴리오 링크를 남겨주세요."
                          }
                          value={question.label}
                          onChange={(event) => updateQuestionLabel(questionIdx, event.target.value)}
                          maxLength={100}
                          className="w-full rounded-tag border border-grey3 bg-bg px-4 py-2.5 font-regular text-[16px] text-grey9 placeholder:text-[16px] placeholder:text-grey6 focus:border-grey9 focus:outline-none disabled:bg-grey1 disabled:text-grey7"
                        />
                      </div>

                      {(question.type === "SINGLE_CHOICE" || question.type === "MULTI_CHOICE") && (
                        <div className="flex flex-col gap-2">
                          <span className="font-medium text-[16px] text-grey8">옵션</span>
                          <div className="flex flex-col gap-2">
                            {question.optionsText.map((option, optionIdx) => (
                              <div key={optionIdx} className="flex items-center gap-2">
                                <input
                                  placeholder={`옵션 ${optionIdx + 1}`}
                                  value={option}
                                  onChange={(event) =>
                                    updateOptionText(questionIdx, optionIdx, event.target.value)
                                  }
                                  className="min-w-0 flex-1 rounded-tag border border-grey3 bg-bg px-4 py-2 font-regular text-[16px] text-grey9 placeholder:text-[16px] placeholder:text-grey6 focus:border-grey9 focus:outline-none disabled:bg-grey1 disabled:text-grey7"
                                />
                                {questionsEditable && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(questionIdx, optionIdx)}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-grey5 hover:bg-grey1 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`질문 ${questionIdx + 1} 옵션 ${optionIdx + 1} 삭제`}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </button>
                                )}
                              </div>
                            ))}
                            {questionsEditable && (
                              <button
                                type="button"
                                onClick={() => addOption(questionIdx)}
                                className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-2 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus className="h-4 w-4" aria-hidden /> 옵션 추가
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-5 pt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(event) =>
                              updateQuestionRequired(questionIdx, event.target.checked)
                            }
                            className="h-4 w-4 accent-grey9"
                          />
                          <span className="font-medium text-[14px] text-grey7">필수 질문</span>
                        </label>
                        {(question.type === "SINGLE_CHOICE" ||
                          question.type === "MULTI_CHOICE") && (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.isMulti}
                              onChange={(event) =>
                                updateQuestionMulti(questionIdx, event.target.checked)
                              }
                              className="h-4 w-4 accent-grey9"
                            />
                            <span className="font-medium text-[14px] text-grey7">
                              복수선택 가능
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}

                  {questionsEditable && questions.length < 10 && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center justify-center gap-1 rounded-tag border border-dashed border-grey4 py-3 font-medium text-[14px] text-grey6 transition-colors hover:border-grey5 hover:text-grey7 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      질문 추가
                    </button>
                  )}
                </div>
              )}
            </section>
          </fieldset>

          <section
            id="applicants"
            className="scroll-mt-20 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">
                지원자 관리 ({applicants.length}명)
              </h2>
            </div>
            {applicantsLoading ? (
              <ApplicantListSkeleton className="mt-5" />
            ) : applicantsError ? (
              <QueryErrorState
                compact
                className="mt-5"
                message="지원자 목록을 불러오지 못했습니다."
                onRetry={loadApplicants}
              />
            ) : applicants.length === 0 ? (
              <p className="mt-6 font-regular text-[14px] text-grey6">아직 지원자가 없어요.</p>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                {applicants.map((a) => (
                  <div
                    key={a.applicationId}
                    className="flex flex-col gap-3 rounded-[16px] border border-grey3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {a.profileUrl ? (
                        <img
                          src={a.profileUrl}
                          alt={a.nickName}
                          loading="lazy"
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-full bg-grey4" />
                      )}
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-[15px] text-grey9">
                            {a.nickName}
                          </span>
                          <StatusBadge status={a.status} />
                        </div>
                        <span className="truncate font-regular text-[13px] text-grey6">
                          {a.recruitmentName} · 지원일 {formatDate(a.applicationDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedApplicant(a)}
                        className="inline-flex h-9 w-14 items-center justify-center rounded-tag border border-primary bg-bg font-medium text-[13px] text-primary transition-colors hover:bg-primary-light"
                        aria-label="지원자 정보"
                      >
                        정보
                      </button>
                      {a.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApplicantStatus(a.applicationId, "APPROVED")}
                            disabled={processingId === a.applicationId}
                            className="inline-flex h-9 w-14 items-center justify-center rounded-tag bg-green-600 font-medium text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            승인
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplicantStatus(a.applicationId, "REJECTED")}
                            disabled={processingId === a.applicationId}
                            className="inline-flex h-9 w-14 items-center justify-center rounded-tag border border-red-200 bg-bg font-medium text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            거절
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full flex-col gap-5 lg:w-[300px] native:w-full">
          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={saving || !canEdit}>
            {saving ? "저장 중" : canEdit ? "저장하기" : "모집 마감 후 수정 불가"}
          </Button>

          {chatAvailable && (
            <Link
              to={`/projects/${id}/chat`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-tag border border-grey5 bg-bg px-6 py-4 font-medium text-[18px] text-grey8 transition-colors hover:border-grey7"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              프로젝트 대화
            </Link>
          )}

          {confirmDelete ? (
            <div className="rounded-tag border border-red-200 bg-red-50 p-5">
              <p className="font-medium text-[16px] text-red-600">정말 삭제할까요?</p>
              <p className="mt-1 font-regular text-[13px] text-grey6">
                삭제된 프로젝트는 복구할 수 없어요.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-tag bg-red-600 px-6 py-4 font-medium text-[18px] text-white transition-opacity hover:opacity-90"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-tag border border-grey3 bg-bg px-6 py-4 font-medium text-[18px] text-grey7 transition-colors hover:bg-grey1"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex w-full items-center justify-center rounded-tag border border-red-200 bg-bg px-6 py-4 font-medium text-[18px] text-red-600 transition-colors hover:bg-red-50"
            >
              프로젝트 삭제
            </button>
          )}
        </aside>
      </form>

      <ApplicantDetailModal
        applicant={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
      />
    </div>
  );
}
