"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 900;

/** Counts up once when scrolled into view. The real value is in the HTML from the start. */
export function CountUp({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = element.current;
    if (!target || value < 2) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - (1 - progress) ** 3;
          target.textContent = String(Math.round(eased * value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      target.textContent = String(value);
    };
  }, [value]);

  return <span ref={element}>{value}</span>;
}
