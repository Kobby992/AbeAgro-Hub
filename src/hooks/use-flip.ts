"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 250;
const EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/**
 * Glides list items to their new positions when the list changes (BUILD_SPEC §5.2-8), and fades in
 * new ones. Uses the browser's animation API, because Motion's layout feature would add about
 * 50 KB that also gets prefetched by pages linking here. Only transform and opacity animate.
 *
 * Each direct child of the list needs a data-flip-id. `version` changes when the items change.
 */
export function useFlip<T extends HTMLElement>(version: string) {
  const list = useRef<T>(null);
  const previous = useRef<{ width: number; positions: Map<string, { x: number; y: number }> }>(
    null,
  );

  useLayoutEffect(() => {
    const element = list.current;
    if (!element) {
      previous.current = null;
      return;
    }

    const positions = new Map<string, { x: number; y: number }>();
    const children = [...element.children] as HTMLElement[];
    for (const child of children) {
      const box = child.getBoundingClientRect();
      positions.set(child.dataset.flipId ?? "", {
        x: box.left + window.scrollX,
        y: box.top + window.scrollY,
      });
    }

    const before = previous.current;
    const width = element.clientWidth;
    previous.current = { width, positions };

    // After a resize the old positions mean nothing, so there is nothing to animate from.
    if (!before || before.width !== width) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const child of children) {
      const id = child.dataset.flipId ?? "";
      const from = before.positions.get(id);
      const to = positions.get(id);
      if (!to) continue;
      if (!from) {
        child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION_MS, easing: EASING });
      } else if (from.x !== to.x || from.y !== to.y) {
        child.animate(
          [
            { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)` },
            { transform: "none" },
          ],
          { duration: DURATION_MS, easing: EASING },
        );
      }
    }
  }, [version]);

  return list;
}
