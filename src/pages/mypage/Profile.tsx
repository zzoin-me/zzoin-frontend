import { useAuthStore } from "@/stores/authStore";

export default function MyPageProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

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

      <section className="rounded-card border border-grey5 p-10">
        <h2 className="font-bold text-[16px] text-grey9">2차 인증 필요</h2>
        <p className="mt-2 font-regular text-[14px] text-grey6">
          대학생 인증 후 사용 가능한 기능이 확장돼요.
        </p>
      </section>
    </div>
  );
}
