import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { ChevronLeft, LogOut, UserX } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { WithdrawModal } from "@/components/auth/WithdrawModal";

const desktopMenus = [
  {
    group: "마이페이지",
    items: [{ to: "/mypage", label: "대시보드", end: true }],
  },
  {
    group: "계정",
    items: [
      { to: "/mypage/profile", label: "내 프로필", end: false },
      { to: "/mypage/verify-univ", label: "대학 인증", end: false },
    ],
  },
  {
    group: "활동",
    items: [
      { to: "/mypage/applications", label: "프로젝트 지원 현황", end: false },
      { to: "/mypage/projects", label: "내 프로젝트 관리", end: false },
      { to: "/mypage/reviews", label: "프로젝트 후기", end: false },
    ],
  },
];

export function MyPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const isIndex = location.pathname === "/mypage";
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8 lg:px-[120px]">
      <div className="flex gap-10">
        <aside className="hidden w-[200px] shrink-0 py-10 lg:block">
          <nav className="sticky top-10 flex flex-col gap-8">
            {desktopMenus.map((group) => (
              <div key={group.group} className="flex flex-col gap-2">
                <span className="px-3 font-bold text-[13px] tracking-wide text-grey5 uppercase">
                  {group.group}
                </span>
                <div className="flex flex-col gap-1">
                  {group.items.map((menu) => (
                    <NavLink
                      key={menu.to}
                      to={menu.to}
                      end={menu.end}
                      className={({ isActive }) =>
                        `rounded-[10px] px-3 py-2.5 font-medium text-[15px] transition-all ${
                          isActive
                            ? "bg-primary-light font-bold text-primary"
                            : "text-grey7 hover:bg-grey1 hover:text-grey9"
                        }`
                      }
                    >
                      {menu.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-1 border-t border-grey3 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-left font-medium text-[15px] text-grey7 transition-colors hover:bg-grey1 hover:text-grey9"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                로그아웃
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-left font-medium text-[15px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <UserX className="h-4 w-4" aria-hidden />
                회원 탈퇴
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-6 lg:py-10">
          {!isIndex && (
            <button
              onClick={() => navigate("/mypage")}
              className="mb-4 flex items-center text-grey9 lg:hidden"
              aria-label="메뉴로 돌아가기"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="ml-1 font-medium text-[14px]">메뉴</span>
            </button>
          )}
          <Outlet />
        </main>
      </div>
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}
