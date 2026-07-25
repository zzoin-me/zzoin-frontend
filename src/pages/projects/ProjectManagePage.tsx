import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { RecruitmentSelect } from "@/components/common/RecruitmentSelect";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ApplicantDetailModal } from "@/components/project/ApplicantDetailModal";
import { deleteProject, getProjectById, updateProject, updateProjectStatus } from "@/api/projects";
import { getApplicants, updateApplicantStatus } from "@/api/application";
import { ApiError } from "@/api/client";
import type {
  CollaborationType,
  GoalType,
  ProjectApplicant,
  ProjectStatus,
  RecruitmentCategory,
  UpdateProjectRequest,
  UpdateRecruitment,
} from "@/types";

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

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "RECRUITING", label: "모집중" },
  { value: "RECRUITMENT_CLOSED", label: "모집마감" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
];

interface RecruitmentForm {
  recruitmentId?: number;
  category: RecruitmentCategory | "";
  name: string;
  count: number;
  qualification: string;
  preferred: string;
}

export default function ProjectManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const [applicants, setApplicants] = useState<ProjectApplicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ProjectApplicant | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

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
            name: r.name,
            count: r.recruitmentCount,
            qualification: r.qualification,
            preferred: r.preferred,
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

  const addRecruitment = () => {
    setRecruitments((prev) => [
      ...prev,
      { category: "", name: "", count: 1, qualification: "", preferred: "" },
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

  const updateRecruitmentRole = (idx: number, category: RecruitmentCategory, name: string) => {
    setRecruitments((prev) => prev.map((r, i) => (i === idx ? { ...r, category, name } : r)));
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!id || newStatus === status) return;
    try {
      await updateProjectStatus(Number(id), newStatus);
      setStatus(newStatus);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  const loadApplicants = () => {
    if (!id) return;
    setApplicantsLoading(true);
    getApplicants(Number(id))
      .then((data) => setApplicants(data.applicants))
      .catch(() => {})
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
      setError(err instanceof ApiError ? err.message : "처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");

    if (!title || !description || !communicationTool || !recruitmentDeadline) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    const hasEmptyRecruitment = recruitments.some(
      (r) => !r.category || !r.name || !r.qualification || !r.preferred,
    );
    if (hasEmptyRecruitment) {
      setError("모집 역할의 필수 항목을 모두 입력해주세요.");
      return;
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
          category: r.category as RecruitmentCategory,
          name: r.name,
          count: r.count,
          qualification: r.qualification,
          preferred: r.preferred,
        })),
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
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-grey9"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-bold text-[22px] text-grey9 md:text-[26px] lg:text-[28px]">
          프로젝트 관리
        </h1>
        <div className="flex items-center gap-2">
          <span className="font-medium text-[14px] text-grey6 md:text-[16px]">현재 상태</span>
          <StatusBadge status={status} />
        </div>
      </div>

      <section className="mb-10 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8">
        <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">상태 변경</h2>
        <p className="mt-1 font-regular text-[13px] text-grey6 md:text-[14px]">
          프로젝트 진행 단계를 변경할 수 있어요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                status === opt.value
                  ? "border-grey9 bg-grey9 text-white"
                  : "border-grey3 bg-white text-grey7 hover:border-grey5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-10">
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
                  className="w-full rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
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
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGoalType(opt.value)}
                      className={`rounded-[20px] border px-4 py-[10px] font-medium text-[16px] transition-colors ${
                        goalType === opt.value
                          ? "border-grey7 bg-grey7 text-grey1"
                          : "border-grey4 bg-white text-grey6 hover:border-grey5"
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
              <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">3. 모집 역할</h2>
              <button
                type="button"
                onClick={addRecruitment}
                className="flex items-center gap-1 rounded-tag border border-grey3 px-3 py-2 font-medium text-[14px] text-grey7 hover:border-grey5 hover:text-grey9"
              >
                <Plus className="h-4 w-4" aria-hidden />
                추가
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {recruitments.map((r, idx) => (
                <div
                  key={r.recruitmentId ?? `new-${idx}`}
                  className="flex flex-col gap-3 rounded-[16px] border border-grey3 p-4 md:rounded-card md:p-5"
                >
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
                  <RecruitmentSelect
                    category={r.category}
                    name={r.name}
                    onChange={(cat, n) => updateRecruitmentRole(idx, cat, n)}
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
                      onChange={(e) => updateRecruitmentField(idx, "count", Number(e.target.value))}
                      className="w-24 rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 focus:border-grey9 focus:outline-none"
                    />
                  </div>
                  <Input
                    placeholder="지원 자격 (2~200자)"
                    value={r.qualification}
                    onChange={(e) => updateRecruitmentField(idx, "qualification", e.target.value)}
                  />
                  <Input
                    placeholder="우대 사항 (2~200자)"
                    value={r.preferred}
                    onChange={(e) => updateRecruitmentField(idx, "preferred", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[18px] text-grey9 md:text-[20px]">
                지원자 관리 ({applicants.length}명)
              </h2>
            </div>
            {applicantsLoading ? (
              <p className="mt-6 font-regular text-[14px] text-grey6">불러오는 중...</p>
            ) : applicants.length === 0 ? (
              <p className="mt-6 font-regular text-[14px] text-grey6">아직 지원자가 없어요.</p>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                {applicants.map((a) => (
                  <div
                    key={a.applicationId}
                    className="flex flex-col gap-3 rounded-[16px] border border-grey3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedApplicant(a)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      {a.profileUrl ? (
                        <img
                          src={a.profileUrl}
                          alt={a.nickName}
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
                          {a.recruitmentName} · {a.schoolName || "학교 미입력"}
                        </span>
                      </div>
                    </button>
                    {a.status === "PENDING" && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplicantStatus(a.applicationId, "APPROVED")}
                          disabled={processingId === a.applicationId}
                          className="rounded-tag bg-green-600 px-4 py-2 font-medium text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplicantStatus(a.applicationId, "REJECTED")}
                          disabled={processingId === a.applicationId}
                          className="rounded-tag border border-red-200 bg-white px-4 py-2 font-medium text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full flex-col gap-5 lg:w-[300px]">
          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "저장 중" : "저장하기"}
          </Button>

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
                  className="flex-1 rounded-tag border border-grey3 bg-white px-6 py-4 font-medium text-[18px] text-grey7 transition-colors hover:bg-grey1"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex w-full items-center justify-center rounded-tag border border-red-200 bg-white px-6 py-4 font-medium text-[18px] text-red-600 transition-colors hover:bg-red-50"
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
