"use client";

import { useEffect, useRef } from "react";

const LINE_GAP = 30;
const STEP = 14;
const WAVE_LENGTH = 420;
const WAVE_HEIGHT = 26;
const REACH = 240;
const PUSH = 34;
const EASING = 0.1;
const DRAW_IN_MS = 1400;

const TONES = {
  dark: { line: "rgba(255,255,255,0.1)", glow: "rgba(248,196,36,0.85)" },
  light: { line: "rgba(0,90,64,0.1)", glow: "rgba(0,112,79,0.55)" },
};

/**
 * Ploughed-field lines that part around the cursor, the site's signature background. Lines draw in
 * once on load, then the canvas only repaints while the pointer is moving over it, so an idle page
 * costs nothing. Touch screens and reduced motion get the same lines, standing still.
 */
export function Furrows({
  tone = "dark",
  className,
}: {
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const colours = TONES[tone];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0, strength: 0 };
    const pointer = { x: 0, y: 0, strength: 0 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let startedAt = 0;

    function paint(progress: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;

      if (pointer.strength > 0.01) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          REACH,
        );
        glow.addColorStop(0, colours.glow);
        glow.addColorStop(1, colours.line);
        context.strokeStyle = glow;
      } else {
        context.strokeStyle = colours.line;
      }

      const lastX = width * progress;
      // The lines tilt across the canvas, so they read as a field rather than a page of stripes.
      for (let baseY = -height * 0.3; baseY < height * 1.2; baseY += LINE_GAP) {
        context.beginPath();
        for (let x = 0; x <= lastX + STEP; x += STEP) {
          const wave = Math.sin(x / WAVE_LENGTH + baseY / 180) * WAVE_HEIGHT;
          let y = baseY + wave + x * 0.14;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < REACH && pointer.strength > 0.01) {
            const force = (1 - distance / REACH) ** 2 * PUSH * pointer.strength;
            y += (dy >= 0 ? 1 : -1) * force;
          }
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
    }

    function tick(now: number) {
      frame = 0;
      pointer.x += (target.x - pointer.x) * EASING;
      pointer.y += (target.y - pointer.y) * EASING;
      pointer.strength += (target.strength - pointer.strength) * EASING;

      const progress = Math.min((now - startedAt) / DRAW_IN_MS, 1);
      paint(1 - (1 - progress) ** 3);

      const settled =
        Math.abs(target.x - pointer.x) +
          Math.abs(target.y - pointer.y) +
          Math.abs(target.strength - pointer.strength) <
        0.01;
      if (visible && (progress < 1 || !settled)) frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !context) return;
      const box = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      paint(startedAt || reducedMotion ? 1 : 0);
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas || event.pointerType !== "mouse") return;
      const box = canvas.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const inside = x >= 0 && y >= 0 && x <= box.width && y <= box.height;
      if (inside && target.strength === 0) {
        // Start from the cursor, so the lines part where it is instead of sweeping across.
        pointer.x = x;
        pointer.y = y;
      }
      target.x = x;
      target.y = y;
      target.strength = inside ? 1 : 0;
      wake();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    });
    visibility.observe(canvas);
    resize();

    if (reducedMotion) {
      paint(1);
      return () => {
        resizeObserver.disconnect();
        visibility.disconnect();
      };
    }

    startedAt = performance.now();
    wake();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [tone]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
