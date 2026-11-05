"use client";

import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Leans gently toward a mouse pointer (BUILD_SPEC §5.2-3). Touch and reduced motion stay flat. */
export function TiltCard({
  children,
  className,
  maxTilt = 4,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 2 * maxTilt;
    const rotateX = -((event.clientY - box.top) / box.height - 0.5) * 2 * maxTilt;
    event.currentTarget.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.transform = "";
  }

  return (
    <div
      className={cn("transition-transform duration-150 ease-out", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
