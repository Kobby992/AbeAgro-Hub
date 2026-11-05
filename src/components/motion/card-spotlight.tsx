"use client";

import { useEffect } from "react";

/**
 * Tells the card under the cursor where the cursor is, for the light that follows it in CSS. One
 * listener serves every card on the page.
 */
export function CardSpotlight() {
  useEffect(() => {
    let frame = 0;

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || frame) return;
      const { clientX, clientY, target } = event;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = target instanceof Element ? target.closest<HTMLElement>(".lift-card") : null;
        if (!card) return;
        const box = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${clientX - box.left}px`);
        card.style.setProperty("--spot-y", `${clientY - box.top}px`);
      });
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
