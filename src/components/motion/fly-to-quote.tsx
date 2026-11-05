"use client";

import { useCallback, type ReactNode } from "react";
import { DURATION, EASE_FLY_ARC } from "@/lib/motion";

export type Fly = (trigger: HTMLElement, onArrive?: () => void) => void;

/**
 * Add-to-quote animation (BUILD_SPEC §5.2-5): a copy of the product photo flies along a curve
 * into the element marked data-quote-target, which then bounces.
 *
 * The photo is the first image inside the trigger's closest data-fly-root. `onArrive` always
 * runs, straight away if motion is reduced or there is no photo or target, and if the animation
 * library cannot load, so adding to the list never depends on the animation. Motion itself
 * downloads on the first press, keeping it out of the page's initial JavaScript.
 */
export function FlyToQuote({ children }: { children: (fly: Fly) => ReactNode }) {
  const fly = useCallback<Fly>((trigger, onArrive) => {
    const target = document.querySelector<HTMLElement>("[data-quote-target]");
    const photo = trigger.closest("[data-fly-root]")?.querySelector("img");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !target || !photo || !target.getBoundingClientRect().width) {
      onArrive?.();
      return;
    }

    import("motion")
      .then(({ animate }) => {
        const box = photo.getBoundingClientRect();
        const targetBox = target.getBoundingClientRect();
        const copy = new Image();
        copy.src = photo.currentSrc || photo.src;
        copy.alt = "";
        copy.setAttribute("aria-hidden", "true");
        Object.assign(copy.style, {
          position: "fixed",
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: "9999",
        });
        document.body.append(copy);

        const dx = targetBox.left + targetBox.width / 2 - (box.left + box.width / 2);
        const dy = targetBox.top + targetBox.height / 2 - (box.top + box.height / 2);

        animate(
          copy,
          { x: [0, dx], y: [0, dy], scale: [1, 0.15], opacity: [1, 0.7] },
          {
            duration: DURATION.fly,
            x: { duration: DURATION.fly, ease: "linear" },
            y: { duration: DURATION.fly, ease: EASE_FLY_ARC },
          },
        ).then(() => {
          copy.remove();
          onArrive?.();
          animate(target, { scale: [1, 1.25, 1] }, { duration: 0.35 });
        });
      })
      .catch(() => onArrive?.());
  }, []);

  return <>{children(fly)}</>;
}
