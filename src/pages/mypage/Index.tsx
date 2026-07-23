import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronRight, LogOut, UserX } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { WithdrawModal } from "@/components/auth/WithdrawModal";
import MyPageProfilePage from "@/pages/mypage/Profile";

const mobileMenus = [
  { to: "/mypage/profile", label: "내 프로필" },
  { to: "/mypage/applications", label: "프로젝트 지원 현황" },
  { to: "/mypage/projects", label: "내 프로젝트 관리" },
  { to: "/mypage/reviews", label: "프로젝트 후기" },
];

export default function MyPageIndexPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <h1 className="font-bold text-[24px] text-grey9">마이페이지</h1>
        <nav className="mt-6 flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3 bg-white">
          {mobileMenus.map((menu) => (
            <Link
              key={menu.to}
              to={menu.to}
              className="flex items-center justify-between px-5 py-4 font-medium text-[16px] text-grey9 transition-colors hover:bg-grey1"
            >
              <span>{menu.label}</span>
              <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-card border border-grey3 bg-white px-5 py-4 font-medium text-[16px] text-grey7 hover:text-grey9"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          로그아웃
        </button>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-card border border-grey3 bg-white px-5 py-4 font-medium text-[16px] text-red-600 transition-colors hover:text-red-700"
        >
          <UserX className="h-5 w-5" aria-hidden />
          회원 탈퇴
        </button>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <MyPageProfilePage />
      </div>

      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </>
  );
}
