"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const CENTRE = 200;
const HOLE = 150;
const ROOT = 176;
const TIP = 198;
const TEETH = 28;

function point(radius: number, angle: number) {
  const x = CENTRE + radius * Math.cos(angle);
  const y = CENTRE + radius * Math.sin(angle);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

// Worked out once at module load, so the server and client render the same path.
const GEAR_PATH = (() => {
  const pitch = (Math.PI * 2) / TEETH;
  const outline = Array.from({ length: TEETH }, (_, tooth) => {
    const start = tooth * pitch;
    return [
      point(ROOT, start),
      point(ROOT, start + pitch * 0.32),
      point(TIP, start + pitch * 0.42),
      point(TIP, start + pitch * 0.78),
      point(ROOT, start + pitch * 0.88),
    ].join(" L ");
  }).join(" L ");
  const hole = `M ${CENTRE - HOLE} ${CENTRE} a ${HOLE} ${HOLE} 0 1 0 ${HOLE * 2} 0 a ${HOLE} ${HOLE} 0 1 0 ${-HOLE * 2} 0 Z`;
  return `M ${outline} Z ${hole}`;
})();

/** The logo's gear. It turns with page scroll, and `spin` adds the hero's slow idle rotation. */
export function GearArc({
  color = "var(--abe-forest)",
  spin = false,
  className,
}: {
  color?: string;
  spin?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollRotation = useTransform(scrollY, [0, 2000], [0, 120]);

  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
      <motion.g
        style={{
          rotate: reduced ? 0 : scrollRotation,
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        <g
          className={cn(spin && "gear-spin")}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path d={GEAR_PATH} fill={color} fillRule="evenodd" />
        </g>
      </motion.g>
      <path
        d="M 76 200 A 124 124 0 0 1 280 106"
        stroke="var(--abe-gold)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}
