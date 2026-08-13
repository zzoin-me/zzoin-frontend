import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  ChevronRight,
  FolderKanban,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  UserPlus,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useAuthStore } from "@/stores/authStore";
import { openNativeApp } from "@/utils/openNativeApp";

export function CompactWebHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const menuItems: Array<{
    to: string;
    label: string;
    description: string;
    icon: LucideIcon;
  }> = [
    { to: "/", label: "홈", description: "새로운 소식과 추천", icon: Home },
    {
      to: "/projects",
      label: "프로젝트",
      description: "함께할 프로젝트 찾기",
      icon: FolderKanban,
    },
    ...(isLoggedIn
      ? [
          {
            to: "/community",
            label: "커뮤니티",
            description: "게시글과 이야기 보기",
            icon: MessageCircle,
          },
          {
            to: "/mypage",
            label: "마이페이지",
            description: "내 활동과 계정 관리",
            icon: UserRound,
          },
        ]
      : [
          {
            to: "/login",
            label: "로그인",
            description: "계정으로 계속하기",
            icon: LogIn,
          },
          {
            to: "/signup",
            label: "회원가입",
            description: "새 계정 만들기",
            icon: UserPlus,
          },
        ]),
  ];

  return (
    <header
      ref={headerRef}
      className="sticky top-[env(safe-area-inset-top)] z-50 h-16 border-b border-grey3 bg-bg lg:hidden native:hidden"
    >
      <div className="mx-auto flex h-full w-full max-w-[1024px] items-center gap-2 px-4 md:px-8">
        <Logo size={32} className="mr-auto gap-2" />
        <button
          type="button"
          onClick={() => openNativeApp(currentPath)}
          className="flex h-11 shrink-0 items-center justify-center rounded-tag bg-primary px-3 font-bold text-[13px] text-white transition-opacity hover:opacity-90 md:px-4 md:text-[14px]"
        >
          앱에서 열기
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="compact-web-menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-grey9 transition-colors hover:bg-grey2"
        >
          {menuOpen ? (
            <X className="h-6 w-6" aria-hidden />
          ) : (
            <Menu className="h-6 w-6" aria-hidden />
          )}
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="메뉴 바깥 영역 닫기"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+4rem)] bg-grey9/25 backdrop-blur-[1px]"
          />
          <nav
            id="compact-web-menu"
            aria-label="웹 메뉴"
            className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-10 mx-auto max-w-[480px] overflow-hidden rounded-card border border-grey3 bg-bg p-2 shadow-xl md:left-auto md:right-8 md:w-[380px]"
          >
            <div className="px-3 pt-2 pb-3">
              <p className="font-bold text-[16px] text-grey9">바로가기</p>
              <p className="mt-0.5 font-regular text-[12px] text-grey6">
                원하는 메뉴를 선택해주세요
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `group flex min-h-16 items-center gap-3 rounded-tag px-3 py-2 transition-colors ${
                        isActive ? "bg-primary-light" : "hover:bg-grey1"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-tag transition-colors ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-grey1 text-grey7 group-hover:bg-grey2 group-hover:text-grey9"
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block font-semibold text-[15px] ${
                              isActive ? "text-primary" : "text-grey9"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 block font-regular text-[12px] text-grey6">
                            {item.description}
                          </span>
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-grey5"}`}
                          aria-hidden
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {isLoggedIn && (
              <div className="mt-2 border-t border-grey3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-tag px-3 text-left font-medium text-[14px] text-grey7 transition-colors hover:bg-grey1 hover:text-grey9"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-tag bg-grey1">
                    <LogOut className="h-4 w-4" aria-hidden />
                  </span>
                  로그아웃
                </button>
              </div>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
