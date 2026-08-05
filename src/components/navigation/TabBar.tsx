import { NavLink } from "react-router";
import { Home, FolderGit2, MessageCircle } from "lucide-react";

const tabs = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/projects", label: "프로젝트", icon: FolderGit2, end: false },
  { to: "/community", label: "커뮤니티", icon: MessageCircle, end: false },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-grey3 bg-white pb-[max(env(safe-area-inset-bottom),16px)] lg:hidden">
      <ul className="mx-auto flex max-w-[768px] items-stretch justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive ? "text-grey9" : "text-grey5"
                  }`
                }
              >
                <Icon className="h-6 w-6" aria-hidden />
                <span className="font-medium text-[12px]">{tab.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
