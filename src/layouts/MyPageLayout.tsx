import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { ChevronLeft, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const desktopMenus = [
  { to: "/mypage", label: "내 프로필", end: true },
  { to: "/mypage/applications", label: "프로젝트 지원 현황", end: false },
  { to: "/mypage/projects", label: "내 프로젝트 관리", end: false },
  { to: "/mypage/reviews", label: "프로젝트 후기", end: false },
];

export function MyPageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const isIndex = location.pathname === "/mypage";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8 lg:px-[120px]">
      <div className="flex gap-10">
        <aside className="hidden w-[280px] shrink-0 border-r border-grey3 py-10 lg:block">
          <nav className="flex flex-col gap-5">
            {desktopMenus.map((menu) => (
              <NavLink
                key={menu.to}
                to={menu.to}
                end={menu.end}
                className={({ isActive }) =>
                  `rounded-tag px-2 py-2 font-medium text-[16px] transition-colors ${
                    isActive ? "bg-grey3 text-grey9" : "text-grey7 hover:text-grey9"
                  }`
                }
              >
                {menu.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="mt-10 flex items-center gap-2 px-2 py-2 font-medium text-[16px] text-grey7 hover:text-grey9"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            로그아웃
          </button>
        </aside>

        <main className="flex-1 py-6 lg:py-10">
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
    </div>
  );
}
