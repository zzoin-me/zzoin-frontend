import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { App } from "@capacitor/app";

function getAppPath(urlValue: string): string | null {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "com.zzoin.app:" || url.hostname !== "open") return null;
    const path = url.searchParams.get("path");
    if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
    return path;
  } catch {
    return null;
  }
}

function openAppPath(urlValue: string) {
  const path = getAppPath(urlValue);
  if (!path) return;
  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export async function setupNative() {
  if (!Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add("native-app");

  try {
    if (Capacitor.getPlatform() === "ios") {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark });
    }
  } catch {
    // 웹이나 플러그인 미지원 시 무시
  }

  try {
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    // no-op
  }

  try {
    await App.addListener("appUrlOpen", ({ url }) => openAppPath(url));
    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) openAppPath(launchUrl.url);
  } catch {
    // no-op
  }

  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {
    // iOS only, no-op on Android
  }

  const stored = localStorage.getItem("zzoin-theme") || "system";
  const isDark =
    stored === "dark" ||
    (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  await updateNativeStatusBar(isDark);
}

export async function updateNativeStatusBar(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: isDark ? "#0F1419" : "#FFFDFA" });
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } else {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({ color: isDark ? "#0F1419" : "#FFFDFA" });
    }
  } catch {
    // no-op
  }
}
