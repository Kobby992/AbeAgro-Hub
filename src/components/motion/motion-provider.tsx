"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Makes every Motion animation follow the visitor's prefers-reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
