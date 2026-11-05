"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const DEGREES_PER_PIXEL = 120 / 2000;

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
  arcClassName,
  className,
}: {
  color?: string;
  spin?: boolean;
  /** Lets a page hide the gold arc where it would run behind text or icons. */
  arcClassName?: string;
  className?: string;
}) {
  const turning = useRef<SVGGElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (turning.current) {
        turning.current.style.transform = `rotate(${window.scrollY * DEGREES_PER_PIXEL}deg)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
      <g ref={turning} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <g
          className={cn(spin && "gear-spin")}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path d={GEAR_PATH} fill={color} fillRule="evenodd" />
        </g>
      </g>
      <path
        d="M 76 200 A 124 124 0 0 1 280 106"
        stroke="var(--abe-gold)"
        strokeWidth="13"
        strokeLinecap="round"
        className={arcClassName}
      />
    </svg>
  );
}
