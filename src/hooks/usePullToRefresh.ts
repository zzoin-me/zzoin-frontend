import { useEffect, useRef, useState, useCallback } from "react";

const THRESHOLD = 70;
const MAX_PULL = 100;

export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const updatePullDistance = useCallback((distance: number) => {
    pullDistanceRef.current = distance;
    setPullDistance(distance);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    if (
      window.scrollY > 0 ||
      isRefreshingRef.current ||
      target?.closest(
        '[role="dialog"], [data-pull-to-refresh-ignore], input, textarea, select, button, a, [contenteditable="true"]',
      )
    ) {
      isPulling.current = false;
      return;
    }
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
    isPulling.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling.current || isRefreshingRef.current) return;
      const diffY = e.touches[0].clientY - startY.current;
      const diffX = e.touches[0].clientX - startX.current;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        isPulling.current = false;
        updatePullDistance(0);
        return;
      }

      if (diffY > 0 && window.scrollY <= 0) {
        e.preventDefault();
        updatePullDistance(Math.min(diffY * 0.5, MAX_PULL));
      }
    },
    [updatePullDistance],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistanceRef.current >= THRESHOLD) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      updatePullDistance(THRESHOLD);
      try {
        await onRefreshRef.current();
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        updatePullDistance(0);
      }
    } else {
      updatePullDistance(0);
    }
  }, [updatePullDistance]);

  const handleTouchCancel = useCallback(() => {
    isPulling.current = false;
    if (!isRefreshingRef.current) {
      updatePullDistance(0);
    }
  }, [updatePullDistance]);

  useEffect(() => {
    const el = containerRef.current ?? document.body;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return { pullDistance, isRefreshing, containerRef };
}
