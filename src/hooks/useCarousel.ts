import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Auto-advancing index with the behaviour people expect from a hero:
 * it pauses while the pointer is over it or a child has keyboard focus, it
 * pauses when the tab is hidden, and it does not run at all for visitors who
 * asked for reduced motion.
 */
export function useCarousel(length: number, intervalMs = 6000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number>();

  const go = useCallback(
    (next: number) => {
      if (length === 0) return;
      setIndex(((next % length) + length) % length);
    },
    [length],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (length <= 1 || paused) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const tick = () => setIndex((i) => (i + 1) % length);
    timer.current = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (document.hidden) window.clearInterval(timer.current);
      else timer.current = window.setInterval(tick, intervalMs);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [length, intervalMs, paused]);

  /** Spread onto the carousel root to wire up pause-on-interaction. */
  const containerProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  };

  return { index, go, next, prev, containerProps };
}
