import { useEffect, useState } from 'react';

const MARKETING_TOUCH_VIEWPORT_QUERY = '(max-width: 1024px)';

export function useMarketingTouchViewport() {
  const [isTouchViewport, setIsTouchViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MARKETING_TOUCH_VIEWPORT_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MARKETING_TOUCH_VIEWPORT_QUERY);
    const update = () => setIsTouchViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isTouchViewport;
}

export function useAutoCycleIndex(count: number, intervalMs: number, enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || count <= 1) {
      setIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [count, intervalMs, enabled]);

  return index;
}
