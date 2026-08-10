import { Link, NavLink } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Logo } from "@/components/common/Logo";
import { Avatar } from "@/components/common/Avatar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBadge } from "@/components/common/NotificationBadge";

const navItems = [
  { to: "/", label: "홈", end: true },
  { to: "/projects", label: "프로젝트", end: false },
  { to: "/community", label: "커뮤니티", end: false },
];

export function Navbar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="relative z-50 hidden border-b border-grey5 bg-grey1 lg:flex native:hidden">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-[120px] py-5">
        <div className="flex items-center gap-9">
          <Logo size={46} />
          <ul className="flex items-center gap-16">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive
                      ? "font-bold text-[20px] text-primary"
                      : "font-medium text-[16px] text-grey9 hover:text-grey7"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-4">
          <ThemeToggle variant="icon" />
          <NotificationBadge />
          {isLoggedIn ? (
            <Link
              to="/mypage"
              className="flex items-center gap-2 font-extralight text-[16px] text-grey9 hover:text-grey7"
            >
              <Avatar nickname={user?.nickname} profileUrl={user?.profileImage} size="sm" />
              <span className="whitespace-nowrap">{user?.nickname ?? "프로필"}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-extralight text-[16px] text-grey9 hover:text-grey7">
                로그인
              </Link>
              <Link
                to="/signup"
                className="font-extralight text-[16px] text-grey9 hover:text-grey7"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
