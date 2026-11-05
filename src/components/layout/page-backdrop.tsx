"use client";

import { usePathname } from "next/navigation";
import { Furrows } from "@/components/motion/furrows";

/** The furrow field behind the top of every page. The home page has its own, in the hero. */
export function PageBackdrop() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div aria-hidden className="page-backdrop absolute inset-x-0 top-0 -z-10 h-[32rem]">
      <Furrows tone="light" className="size-full" />
    </div>
  );
}
