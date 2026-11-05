"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const SPRING = { stiffness: 220, damping: 22 };

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
  const reduced = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const fromCentreX = (event.clientX - box.left) / box.width - 0.5;
    const fromCentreY = (event.clientY - box.top) / box.height - 0.5;
    rotateY.set(fromCentreX * 2 * maxTilt);
    rotateX.set(-fromCentreY * 2 * maxTilt);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
