"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import type { CategorySlug } from "@/config/categories";

const FLOATERS: {
  image: string;
  category: CategorySlug;
  className: string;
  depth: number;
}[] = [
  {
    image: "/products/sb10-rice-huller-mill.jpg",
    category: "rice-processing",
    className: "top-[6%] left-[8%] w-[48%]",
    depth: 18,
  },
  {
    image: "/products/petrol-water-pump-3-inch-wp30.jpg",
    category: "irrigation",
    className: "top-[26%] right-0 w-[42%]",
    depth: 30,
  },
  {
    image: "/products/corn-mill.jpg",
    category: "grain-milling",
    className: "top-[62%] left-[22%] w-[38%]",
    depth: 12,
  },
];

const EASING = 0.08;
const SCROLL_RANGE = 800;

/**
 * Product photos drifting with the pointer and scroll (BUILD_SPEC §5.2-1). Desktop only: below lg
 * they are display:none, so their lazy images never download on phones.
 */
export function HeroFloaters() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element || !matchMedia("(min-width: 1024px)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0, scroll: 0 };
    const current = { x: 0, y: 0, scroll: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * EASING;
      current.y += (target.y - current.y) * EASING;
      current.scroll += (target.scroll - current.scroll) * EASING;
      element.style.setProperty("--float-x", current.x.toFixed(4));
      element.style.setProperty("--float-y", (current.y - current.scroll * 4).toFixed(4));
      const settled =
        Math.abs(target.x - current.x) +
          Math.abs(target.y - current.y) +
          Math.abs(target.scroll - current.scroll) <
        0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX / window.innerWidth - 0.5;
      target.y = event.clientY / window.innerHeight - 0.5;
      wake();
    };
    const onScroll = () => {
      target.scroll = Math.min(window.scrollY / SCROLL_RANGE, 1);
      wake();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={container}
      aria-hidden
      className="absolute top-24 right-[max(1.5rem,calc((100vw-var(--content-max))/2))] hidden h-[30rem] w-[38%] max-w-lg lg:block"
    >
      {FLOATERS.map(({ image, category, className, depth }) => (
        <div
          key={image}
          data-cat={category}
          style={
            {
              transform: `translate3d(calc(var(--float-x, 0) * ${depth}px), calc(var(--float-y, 0) * ${depth}px), 0)`,
            } as CSSProperties
          }
          className={`machine-stage absolute rounded-lg shadow-lg ${className}`}
        >
          <Image src={image} alt="" fill sizes="240px" className="object-contain p-3" />
        </div>
      ))}
    </div>
  );
}
