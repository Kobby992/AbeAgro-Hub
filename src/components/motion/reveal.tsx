"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Plain IntersectionObserver and CSS rather than Motion: these run on every page, and the home
// page has a 200 KB JavaScript budget (BUILD_SPEC §5.3). The styles live in globals.css.
const VISIBLE_AMOUNT = 0.15;

function useShowOnce<T extends HTMLElement>() {
  const element = useRef<T>(null);

  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        target.dataset.shown = "";
        observer.disconnect();
      },
      { threshold: VISIBLE_AMOUNT },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return element;
}

/** Fades one block up the first time 15% of it is on screen (BUILD_SPEC §5.1). */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
}) {
  const element = useShowOnce<HTMLDivElement>();
  return (
    <div
      ref={element}
      className={cn("reveal", className)}
      style={delay ? ({ transitionDelay: `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** Reveals its direct children one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const element = useShowOnce<HTMLDivElement>();
  return (
    <div ref={element} className={cn("stagger", className)}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
