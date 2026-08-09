import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Home, FolderGit2, MessageCircle, User } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

const tabs = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/projects", label: "프로젝트", icon: FolderGit2, end: false },
  { to: "/community", label: "커뮤니티", icon: MessageCircle, end: false },
  { to: "/mypage", label: "마이페이지", icon: User, end: false },
];

export function TabBar() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let showListener: { remove: () => void } | undefined;
    let hideListener: { remove: () => void } | undefined;

    (async () => {
      try {
        showListener = await Keyboard.addListener("keyboardWillShow", () => {
          setKeyboardVisible(true);
        });
        hideListener = await Keyboard.addListener("keyboardWillHide", () => {
          setKeyboardVisible(false);
        });
      } catch {
        // no-op
      }
    })();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-grey3 bg-bg pb-[max(env(safe-area-inset-bottom),16px)] lg:hidden">
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
                <span className="font-medium text-[11px]">{tab.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
