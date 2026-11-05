"use client";

import { useEffect } from "react";

type NetworkNavigator = Navigator & { connection?: { saveData?: boolean } };

/**
 * Lenis smooth scrolling, skipped for reduced motion and low-end devices (BUILD_SPEC §5.1).
 * The library loads only on devices that will use it.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEnd =
      navigator.hardwareConcurrency <= 4 ||
      Boolean((navigator as NetworkNavigator).connection?.saveData);
    // Lenis does not smooth touch scrolling by default, so phones never need to download it.
    const touchOnly = matchMedia("(pointer: coarse)").matches;
    if (reduced || lowEnd || touchOnly) return;

    let frame = 0;
    let destroy: (() => void) | undefined;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis();
      const tick = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      destroy = () => lenis.destroy();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      destroy?.();
    };
  }, []);

  return null;
}
