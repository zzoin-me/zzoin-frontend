import { create } from "zustand";
import { updateNativeStatusBar } from "@/native-setup";

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "zzoin-theme";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // no-op
  }
  return "system";
}

function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;
  if (effective === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  updateNativeStatusBar(effective === "dark");
}

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  initTheme: () => () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getStoredTheme(),

  setTheme: (t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // no-op
    }
    applyTheme(t);
    set({ theme: t });
  },

  initTheme: () => {
    const theme = get().theme;
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    return () => {};
  },
}));
