import { useEffect, useRef, useState } from "react";

interface Options {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
  /** Shrinks the viewport so elements trigger slightly before the edge. */
  rootMargin?: string;
  /** Keep the revealed state once it has fired (default). */
  once?: boolean;
}

/**
 * Minimal IntersectionObserver hook that drives every scroll reveal on the
 * site without pulling in an animation library. Falls back to "already
 * visible" when the API is missing or the visitor prefers reduced motion —
 * so nothing is ever hidden from someone who turned animation off.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Reveal immediately when there is nothing to animate for: reduced
    // motion, no observer, or a page that is not actually on screen. That
    // last case matters more than it looks — a hidden tab, a headless
    // screenshotter or a pre-renderer never fires the observer, and content
    // that waits for it would stay at `opacity: 0` forever.
    if (
      prefersReduced ||
      typeof IntersectionObserver === "undefined" ||
      document.visibilityState === "hidden"
    ) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
