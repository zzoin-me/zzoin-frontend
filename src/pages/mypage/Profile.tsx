import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, CheckCircle2, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getMyProfile, getMySchoolProfile } from "@/api/user";
import { EditProfileModal } from "@/components/mypage/EditProfileModal";
import type { MyProfile, SchoolProfile } from "@/types";

export default function MyPageProfilePage() {
  const user = useAuthStore((s) => s.user);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    Promise.all([getMyProfile(), getMySchoolProfile().catch(() => null)])
      .then(([p, s]) => {
        setProfile(p);
        setSchoolProfile(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayName = profile?.name ?? user?.nickname ?? "닉네임";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const displayField = profile?.field;
  const displayBio = profile?.bio;
  const stackNames = profile?.stackInfoList?.map((s) => s.name).join(", ");
  const isVerified = profile?.verified ?? user?.verified ?? false;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[20px] border border-grey5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex items-center gap-4 md:gap-6 lg:gap-[43px]">
          {profile?.profileUrl ? (
            <img
              src={profile.profileUrl}
              alt={displayName}
              className="h-[56px] w-[56px] rounded-full object-cover md:h-[64px] md:w-[64px] lg:h-[76px] lg:w-[76px]"
            />
          ) : (
            <div className="h-[56px] w-[56px] rounded-full bg-grey4 md:h-[64px] md:w-[64px] lg:h-[76px] lg:w-[76px]" />
          )}
          <div className="flex min-w-0 flex-col gap-2 md:gap-3 lg:gap-[18px]">
            <span className="font-bold text-[16px] text-grey9 md:text-[18px]">{displayName}</span>
            <span className="truncate font-medium text-[14px] text-grey7 md:text-[16px]">
              {displayEmail}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex shrink-0 items-center gap-2 self-start rounded-tag border border-grey3 bg-white px-4 py-2 font-medium text-[13px] text-grey7 transition-colors hover:border-grey5 hover:text-grey9 md:px-5 md:py-2.5 md:text-[14px] sm:self-auto"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          프로필 수정
        </button>
      </section>

      <section className="rounded-[20px] border border-grey5 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <h2 className="font-bold text-[16px] text-grey9 md:text-[18px]">기본 프로필 정보</h2>
        {loading ? (
          <p className="mt-6 font-regular text-[14px] text-grey6">불러오는 중...</p>
        ) : (
          <div className="mt-5 flex flex-col gap-4 md:mt-6 md:flex-row md:gap-8 lg:gap-10">
            <div className="flex flex-row gap-4 md:flex-col md:gap-3">
              <span className="font-medium text-[14px] text-grey6 md:text-[16px]">직군</span>
              <span className="font-medium text-[14px] text-grey6 md:text-[16px]">기술 스택</span>
              <span className="font-medium text-[14px] text-grey6 md:text-[16px]">한줄 소개</span>
            </div>
            <div className="flex flex-row gap-4 md:flex-col md:gap-3">
              <span className="font-medium text-[14px] text-grey9 md:text-[16px]">
                {displayField || "미입력"}
              </span>
              <span className="font-medium text-[14px] text-grey9 md:text-[16px]">
                {stackNames || "미입력"}
              </span>
              <span className="font-medium text-[14px] text-grey9 md:text-[16px]">
                {displayBio || "미입력"}
              </span>
            </div>
          </div>
        )}
      </section>

      {isVerified ? (
        <section className="flex items-center gap-3 rounded-[20px] border border-grey5 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-hidden />
          <div className="flex min-w-0 flex-col gap-2 md:gap-3 lg:gap-[18px]">
            <span className="font-bold text-[16px] text-grey9 md:text-[18px]">대학 인증 완료</span>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {schoolProfile?.schoolName && (
                <span className="font-medium text-[14px] text-grey7 md:text-[16px]">
                  {schoolProfile.schoolName}
                  {schoolProfile.major ? ` · ${schoolProfile.major}` : ""}
                  {schoolProfile.grade ? ` · ${schoolProfile.grade}학년` : ""}
                </span>
              )}
              {user?.verifiedEmail && (
                <span className="truncate font-medium text-[14px] text-grey7 md:text-[16px]">
                  {user.verifiedEmail}
                </span>
              )}
            </div>
          </div>
        </section>
      ) : (
        <Link
          to="/mypage/verify-univ"
          className="flex items-center justify-between gap-3 rounded-[20px] border border-grey5 px-5 py-6 transition-colors hover:bg-grey1 md:px-8 md:py-8 lg:px-10 lg:py-10"
        >
          <div className="flex min-w-0 flex-col gap-2 md:gap-3 lg:gap-[18px]">
            <span className="font-bold text-[16px] text-grey9 md:text-[18px]">2차 인증 필요</span>
            <span className="font-medium text-[14px] text-grey7 md:text-[16px]">
              대학생 인증 후 사용 가능한 기능이 확장돼요
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="font-medium text-[14px] text-grey9 md:text-[16px]">
              대학교 인증하기
            </span>
            <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
          </div>
        </Link>
      )}

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        schoolProfile={schoolProfile}
        onSaved={() => {
          loadProfile();
          restoreSession();
        }}
      />
    </div>
  );
}
