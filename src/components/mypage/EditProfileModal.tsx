import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ApiError } from "@/api/client";
import { updateProfile, updateSchoolProfile, getStacks } from "@/api/user";
import type { MyProfile, SchoolProfile, StackInfo } from "@/types";

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
  const [field, setField] = useState("");
  const [bio, setBio] = useState("");
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState("");
  const [stacks, setStacks] = useState<StackInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setNickName(profile?.name ?? "");
    setField(profile?.field ?? "");
    setBio(profile?.bio ?? "");
    setSelectedStackIds(profile?.stackInfoList?.map((s) => s.id) ?? []);
    setMajor(schoolProfile?.major ?? "");
    setGrade(schoolProfile?.grade?.toString() ?? "");
    setError("");
    getStacks()
      .then(setStacks)
      .catch(() => {});
  }, [isOpen, profile, schoolProfile]);

  if (!isOpen) return null;

  const toggleStack = (id: number) => {
    setSelectedStackIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

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
        field: field.trim() || undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-card bg-white p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-[20px] text-grey9">프로필 수정</h2>
          <button onClick={onClose} className="text-grey5 hover:text-grey9" aria-label="닫기">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="edit-nickname"
            label="닉네임"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            maxLength={20}
          />

          <Input
            id="edit-field"
            label="직군"
            placeholder="예: 프론트엔드"
            value={field}
            onChange={(e) => setField(e.target.value)}
            maxLength={50}
          />

          <div className="flex flex-col gap-2">
            <label className="font-medium text-[14px] text-grey8">기술 스택</label>
            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => {
                const selected = selectedStackIds.includes(stack.id);
                return (
                  <button
                    key={stack.id}
                    type="button"
                    onClick={() => toggleStack(stack.id)}
                    className={`rounded-tag border px-4 py-2 font-medium text-[14px] transition-colors ${
                      selected
                        ? "border-grey9 bg-grey9 text-white"
                        : "border-grey3 bg-white text-grey7 hover:border-grey5"
                    }`}
                  >
                    {stack.name}
                  </button>
                );
              })}
            </div>
          </div>

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
              className="w-full resize-none rounded-tag border border-grey3 bg-white px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
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
