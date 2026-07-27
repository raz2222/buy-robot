import { useEffect, useState } from "react";

/**
 * Counts from zero to `target` once `active` turns true. Used for the
 * waitlist headline, where the number is the persuasion. Reduced-motion
 * visitors get the final figure with no animation.
 */
export function useCountUp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || target === 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Ease-out cubic: fast at first, settles gently on the final number.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);

  return value;
}
