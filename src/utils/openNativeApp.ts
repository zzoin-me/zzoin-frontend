const APP_SCHEME = "com.zzoin.app";
const APP_RELEASE_URL = "https://github.com/zzoin-me/zzoin-frontend/releases/latest";
const APP_OPEN_TIMEOUT_MS = 1800;

export function openNativeApp(path: string) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  const appUrl = `${APP_SCHEME}://open?path=${encodeURIComponent(safePath)}`;
  let leftPage = false;

  const markPageLeft = () => {
    leftPage = true;
    cleanup();
  };
  const handleVisibilityChange = () => {
    if (document.hidden) markPageLeft();
  };
  const cleanup = () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", markPageLeft);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", markPageLeft);

  window.setTimeout(() => {
    cleanup();
    if (!leftPage && !document.hidden) {
      window.location.assign(APP_RELEASE_URL);
    }
  }, APP_OPEN_TIMEOUT_MS);

  window.location.href = appUrl;
}
