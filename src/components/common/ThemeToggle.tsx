import { Monitor, Sun, Moon } from "lucide-react";
import { useThemeStore, type Theme } from "@/stores/themeStore";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템", icon: Monitor },
];

export function ThemeToggle({ variant = "segmented" }: { variant?: "segmented" | "icon" }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  if (variant === "icon") {
    const isDark = (() => {
      if (theme === "dark") return true;
      if (theme === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    })();
    const Icon = isDark ? Moon : Sun;
    const next: Theme = isDark ? "light" : "dark";

    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={`테마: ${isDark ? "다크" : "라이트"}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-grey7 transition-colors hover:bg-grey2 hover:text-grey9"
      >
        <Icon className="h-5 w-5" aria-hidden />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-[10px] border border-grey3 bg-bg p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[8px] px-2 py-1.5 font-medium text-[13px] transition-colors ${
              isActive ? "bg-primary-light text-primary" : "text-grey6 hover:text-grey9"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
