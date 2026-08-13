import { NavLink, useLocation } from "react-router";
import { Home, FolderGit2, MessageCircle, User } from "lucide-react";
import { useKeyboardState } from "@/hooks/useKeyboardState";

const tabs = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/projects", label: "프로젝트", icon: FolderGit2, end: false },
  { to: "/community", label: "커뮤니티", icon: MessageCircle, end: false },
  { to: "/mypage", label: "마이페이지", icon: User, end: false },
];

export function TabBar() {
  const location = useLocation();
  const { keyboardVisible } = useKeyboardState();

  if (keyboardVisible || /^\/projects\/\d+\/chat$/.test(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-grey3 bg-bg pb-[max(env(safe-area-inset-bottom),16px)] native:block">
      <ul className="mx-auto flex h-16 max-w-[768px] items-stretch justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-grey9" : "text-grey5"
                  }`
                }
              >
                <Icon className="h-6 w-6" aria-hidden />
                <span className="font-medium text-[11px]">{tab.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
