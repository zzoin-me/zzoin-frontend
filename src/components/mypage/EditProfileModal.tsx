import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { FieldSelect } from "@/components/common/FieldSelect";
import { StackSelector } from "@/components/common/StackSelector";
import { ApiError } from "@/api/client";
import { updateProfile, updateSchoolProfile, getStacks } from "@/api/user";
import type { MyProfile, SchoolProfile, StackInfo } from "@/types";
import { useModal } from "@/hooks/useModal";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MyProfile | null;
  schoolProfile: SchoolProfile | null;
  onSaved: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  schoolProfile,
  onSaved,
}: EditProfileModalProps) {
  const [nickName, setNickName] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState("");
  const [stacks, setStacks] = useState<StackInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useModal(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setNickName(profile?.name ?? "");
    setFields(profile?.fields ?? []);
    setBio(profile?.bio ?? "");
    setSelectedStackIds(profile?.stackInfoList?.map((s) => s.id) ?? []);
    setMajor(schoolProfile?.major ?? "");
    setGrade(schoolProfile?.grade?.toString() ?? "");
    setError("");
    getStacks()
      .then((data) => setStacks(data))
      .catch((err) => console.error("[EditProfileModal] stacks load failed:", err));
  }, [isOpen, profile, schoolProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickName.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        nickName: nickName.trim(),
        fields: fields.length > 0 ? fields : undefined,
        bio: bio.trim() || undefined,
        stackIds: selectedStackIds,
      });

      if (schoolProfile && major.trim()) {
        await updateSchoolProfile({
          major: major.trim(),
          grade: grade ? Number(grade) : undefined,
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "프로필 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overscroll-none bg-black/50 px-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="프로필 수정"
        className="max-h-[90dvh] w-full max-w-[500px] touch-pan-y overflow-y-auto overscroll-contain rounded-card bg-bg p-6 [-webkit-overflow-scrolling:touch] md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-[20px] text-grey9">프로필 수정</h2>
          <button onClick={onClose} className="text-grey5 hover:text-grey9" aria-label="닫기">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {(() => {
            const changeableAt = profile?.nicknameChangeableAt
              ? new Date(profile.nicknameChangeableAt)
              : null;
            const isLocked = changeableAt !== null && changeableAt > new Date();
            const daysLeft = changeableAt
              ? Math.ceil((changeableAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div className="flex flex-col gap-1.5">
                <Input
                  id="edit-nickname"
                  label="닉네임"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  maxLength={20}
                  disabled={isLocked}
                />
                {isLocked && (
                  <p className="font-regular text-[12px] text-grey5">
                    닉네임은 {daysLeft}일 후 변경 가능합니다 (
                    {changeableAt!.toLocaleDateString("ko-KR")})
                  </p>
                )}
              </div>
            );
          })()}

          <FieldSelect value={fields} onChange={setFields} />

          <StackSelector
            selectedIds={selectedStackIds}
            onChange={setSelectedStackIds}
            stacks={stacks}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-bio" className="font-medium text-[14px] text-grey8">
              한줄 소개
            </label>
            <textarea
              id="edit-bio"
              placeholder="본인을 한줄로 소개해주세요"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
            />
          </div>

          {schoolProfile && (
            <div className="rounded-tag border border-grey3 bg-grey1 px-4 py-4">
              <p className="mb-3 font-medium text-[14px] text-grey8">학교 정보</p>
              <div className="flex flex-col gap-3">
                <Input
                  id="edit-major"
                  label="전공"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  maxLength={20}
                />
                <Input
                  id="edit-grade"
                  label="학년"
                  type="number"
                  min={1}
                  max={5}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && <p className="font-regular text-[13px] text-red-500">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "저장 중..." : "저장하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
