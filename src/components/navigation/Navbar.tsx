import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Logo } from "@/components/common/Logo";

const navItems = [
  { to: "/", label: "홈", end: true },
  { to: "/projects", label: "프로젝트", end: false },
  { to: "/community", label: "커뮤니티", end: false },
];

export function Navbar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="relative z-50 hidden border-b border-grey5 bg-grey1 lg:flex">
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

        <div className="flex items-center justify-end gap-10">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 font-extralight text-[16px] text-grey9 hover:text-grey7"
              >
                <div className="h-8 w-8 rounded-full bg-grey4" aria-label="profile image" />
                <span className="whitespace-nowrap">{user?.nickname ?? "프로필"}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-tag border border-grey3 bg-white py-2 shadow-sm">
                  <Link
                    to="/mypage"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 font-regular text-[14px] text-grey9 hover:bg-grey1"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left font-regular text-[14px] text-grey9 hover:bg-grey1"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
