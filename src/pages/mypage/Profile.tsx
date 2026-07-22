import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getMySchoolProfile, type SchoolProfile } from "@/api/user";

export default function MyPageProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    if (user?.verified) {
      getMySchoolProfile()
        .then(setSchoolProfile)
        .catch(() => {});
    } else {
      setSchoolProfile(null);
    }
  }, [user?.verified]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card border border-grey5 p-10">
        <div className="flex items-center gap-10">
          <div className="h-20 w-20 rounded-full bg-grey4" />
          <div className="flex flex-col gap-2">
            <span className="font-bold text-[16px] text-grey9">
              {isLoggedIn && user ? user.nickname : "닉네임"}
            </span>
            <span className="font-medium text-[16px] text-grey9">
              {isLoggedIn && user ? user.email : "이메일@.com"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-grey5 p-10">
        <h2 className="font-bold text-[16px] text-grey9">기본 프로필 정보</h2>
        <p className="mt-4 font-regular text-[14px] text-grey6">
          학교/전공, 기술 스택, 포트폴리오 섹션이 들어올 자리.
        </p>
      </section>

      {user?.verified ? (
        <section className="flex items-center gap-3 rounded-card border border-green-200 bg-green-50 p-6">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-hidden />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[16px] text-grey9">대학 인증 완료</span>
            {schoolProfile?.schoolName && (
              <span className="font-regular text-[14px] text-grey6">
                {schoolProfile.schoolName}
              </span>
            )}
            {user.verifiedEmail && (
              <span className="font-regular text-[14px] text-grey6">{user.verifiedEmail}</span>
            )}
          </div>
        </section>
      ) : (
        <Link
          to="/mypage/verify-univ"
          className="flex items-center justify-between rounded-card border border-grey5 p-6 transition-colors hover:bg-grey1"
        >
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[16px] text-grey9">2차 인증 필요</span>
            <span className="font-regular text-[14px] text-grey6">
              대학생 인증 후 사용 가능한 기능이 확장돼요.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="font-medium text-[14px] text-grey9">대학교 인증하기</span>
            <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
          </div>
        </Link>
      )}
    </div>
  );
}
