import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export function useKeyboardState() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    let showListener: { remove: () => void } | undefined;
    let hideListener: { remove: () => void } | undefined;
    let disposed = false;
    const viewport = window.visualViewport;

    const updateViewportInset = () => {
      if (!viewport || Capacitor.isNativePlatform()) return;
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardInset(inset);
      setKeyboardVisible(inset > 80);
    };

    if (Capacitor.isNativePlatform()) {
      void (async () => {
        try {
          const nextShowListener = await Keyboard.addListener("keyboardWillShow", () => {
            setKeyboardVisible(true);
            setKeyboardInset(0);
          });
          if (disposed) {
            nextShowListener.remove();
            return;
          }
          showListener = nextShowListener;

          const nextHideListener = await Keyboard.addListener("keyboardWillHide", () => {
            setKeyboardVisible(false);
            setKeyboardInset(0);
          });
          if (disposed) {
            nextHideListener.remove();
            return;
          }
          hideListener = nextHideListener;
        } catch {
          // 플러그인이 지원되지 않는 환경에서는 기본 위치를 사용합니다.
        }
      })();
    } else {
      viewport?.addEventListener("resize", updateViewportInset);
      viewport?.addEventListener("scroll", updateViewportInset);
      updateViewportInset();
    }

    return () => {
      disposed = true;
      showListener?.remove();
      hideListener?.remove();
      viewport?.removeEventListener("resize", updateViewportInset);
      viewport?.removeEventListener("scroll", updateViewportInset);
    };
  }, []);

  return { keyboardVisible, keyboardInset };
}
