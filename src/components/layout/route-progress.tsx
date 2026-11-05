"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Thin gold bar during navigation (BUILD_SPEC §5.1). Only transform and opacity animate. */
export function RouteProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element).closest?.("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname && bar.current) {
        bar.current.dataset.state = "loading";
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (bar.current?.dataset.state === "loading") bar.current.dataset.state = "done";
  }, [pathname]);

  return (
    <div
      ref={bar}
      aria-hidden
      className="route-progress pointer-events-none fixed inset-x-0 top-0 z-60 h-[3px] bg-gold"
    />
  );
}
