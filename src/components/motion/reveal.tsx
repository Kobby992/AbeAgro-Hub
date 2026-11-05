"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT } from "@/lib/motion";

const VIEWPORT = { once: true, amount: 0.15 } as const;

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0 },
};

/** Fades one block up the first time 15% of it is on screen (BUILD_SPEC §5.1). */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={FADE_UP}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      transition={{ duration: reduced ? 0 : DURATION.reveal, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Reveals its StaggerItem children one after another. */
export function Stagger({
  children,
  className,
  gap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: reduced ? 0 : gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={FADE_UP}
      transition={{ duration: reduced ? 0 : DURATION.reveal, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
