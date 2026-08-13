import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import { Input } from "@/components/common/Input";
import { FieldSelect } from "@/components/common/FieldSelect";
import { StackSelector } from "@/components/common/StackSelector";
import { ApiError } from "@/api/client";
import {
  deleteProfileImage,
  getStacks,
  updateProfile,
  updateSchoolProfile,
  uploadProfileImage,
} from "@/api/user";
import type { MyProfile, SchoolProfile, StackInfo } from "@/types";
import { useModal } from "@/hooks/useModal";
import {
  containsReservedNicknameTerm,
  RESERVED_NICKNAME_MESSAGE,
} from "@/utils/nickname";

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
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const profileImagePreviewRef = useRef<string | null>(null);
  const modalRef = useModal(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) {
      if (profileImagePreviewRef.current) {
        URL.revokeObjectURL(profileImagePreviewRef.current);
        profileImagePreviewRef.current = null;
      }
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setRemoveProfileImage(false);
      return;
    }
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

  useEffect(
    () => () => {
      if (profileImagePreviewRef.current) {
        URL.revokeObjectURL(profileImagePreviewRef.current);
      }
    },
    [],
  );

  if (!isOpen) return null;

  const handleProfileImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(image.type)) {
      setError("JPG, PNG, WebP, GIF 이미지만 사용할 수 있습니다.");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      setError("프로필 이미지는 5MB 이하로 선택해주세요.");
      return;
    }
    if (profileImagePreviewRef.current) {
      URL.revokeObjectURL(profileImagePreviewRef.current);
    }
    const previewUrl = URL.createObjectURL(image);
    profileImagePreviewRef.current = previewUrl;
    setProfileImageFile(image);
    setProfileImagePreview(previewUrl);
    setRemoveProfileImage(false);
    setError("");
  };

  const handleRemoveProfileImage = () => {
    if (profileImageFile) {
      if (profileImagePreviewRef.current) {
        URL.revokeObjectURL(profileImagePreviewRef.current);
        profileImagePreviewRef.current = null;
      }
      setProfileImageFile(null);
      setProfileImagePreview(null);
      return;
    }
    setRemoveProfileImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickName.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (!/^[가-힣a-zA-Z0-9.]{2,20}$/.test(nickName.trim())) {
      setError("영문, 한글, 숫자, 점으로 구성된 2~20자 닉네임을 입력해주세요.");
      return;
    }
    if (
      nickName.trim() !== profile?.name &&
      containsReservedNicknameTerm(nickName.trim())
    ) {
      setError(RESERVED_NICKNAME_MESSAGE);
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

      if (profileImageFile) {
        await uploadProfileImage(profileImageFile);
      } else if (removeProfileImage && profile?.customProfileImage) {
        await deleteProfileImage();
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
          <div className="flex flex-col items-center gap-3 rounded-tag border border-grey3 bg-grey1 px-4 py-5">
            <Avatar
              nickname={nickName || profile?.name}
              profileUrl={
                profileImagePreview ??
                (removeProfileImage ? profile?.socialProfileUrl : profile?.profileUrl)
              }
              size="xl"
              className="h-20 w-20 text-[28px]"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleProfileImageSelection}
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex min-h-10 items-center gap-2 rounded-tag border border-grey4 bg-bg px-4 font-medium text-[13px] text-grey8 hover:border-grey6"
              >
                <Camera className="h-4 w-4" aria-hidden />
                {profile?.profileUrl || profileImageFile ? "사진 변경" : "사진 추가"}
              </button>
              {(profileImageFile || (!removeProfileImage && profile?.customProfileImage)) && (
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  className="inline-flex min-h-10 items-center gap-2 rounded-tag border border-grey4 bg-bg px-4 font-medium text-[13px] text-grey7 hover:border-grey6"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {profileImageFile ? "선택 취소" : "사진 삭제"}
                </button>
              )}
              {removeProfileImage && (
                <button
                  type="button"
                  onClick={() => setRemoveProfileImage(false)}
                  className="min-h-10 rounded-tag border border-grey4 bg-bg px-4 font-medium text-[13px] text-grey7 hover:border-grey6"
                >
                  삭제 취소
                </button>
              )}
            </div>
            <p className="text-center font-regular text-[12px] text-grey6">
              JPG, PNG, WebP, GIF · 최대 5MB
            </p>
          </div>

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
