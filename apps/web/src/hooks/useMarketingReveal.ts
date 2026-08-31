import { useEffect, useRef, useState } from 'react';

export function useMarketingInView<T extends HTMLElement>(threshold = 0.15, once = false) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const markVisible = () => {
      setInView(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markVisible();
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: [0, threshold], rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      markVisible();
      if (once) observer.disconnect();
    }

    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

export function useStaggeredReveal(
  active: boolean,
  count: number,
  intervalMs = 1000,
  pauseMs = 1800,
) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active || count <= 0) return undefined;

    let cancelled = false;
    let timeoutId = 0;
    let step = 0;
    let filling = true;

    const schedule = (delay: number) => {
      timeoutId = window.setTimeout(tick, delay);
    };

    const tick = () => {
      if (cancelled) return;

      if (filling) {
        setRevealed(step + 1);
        step += 1;

        if (step >= count) {
          filling = false;
          step = 0;
          schedule(pauseMs);
        } else {
          schedule(intervalMs);
        }
        return;
      }

      setRevealed(0);
      filling = true;
      schedule(0);
    };

    setRevealed(0);
    schedule(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, count, intervalMs, pauseMs]);

  return revealed;
}
