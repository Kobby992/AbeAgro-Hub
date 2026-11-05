"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MachineCard } from "@/components/product/machine-card";
import { Button } from "@/components/ui/button";
import { useAddToQuote } from "@/hooks/use-add-to-quote";
import type { CardProduct } from "@/lib/products";

/** Swipes natively on touch and shows arrows on desktop (BUILD_SPEC §6.2). */
export function FeaturedCarousel({ products }: { products: CardProduct[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const addToQuote = useAddToQuote();

  const updateEnds = useCallback(() => {
    const element = rail.current;
    if (!element) return;
    setAtStart(element.scrollLeft <= 4);
    setAtEnd(element.scrollLeft + element.clientWidth >= element.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(updateEnds);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateEnds]);

  function move(direction: -1 | 1) {
    const element = rail.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div className="mb-3 hidden justify-end gap-2 lg:flex">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous machines"
          disabled={atStart}
          onClick={() => move(-1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next machines"
          disabled={atEnd}
          onClick={() => move(1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <ul
        ref={rail}
        onScroll={updateEnds}
        tabIndex={0}
        aria-label="Featured machines"
        className="no-scrollbar -mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-3 overflow-x-auto px-(--gutter) py-2 md:gap-4"
      >
        {products.map((product) => (
          <li
            key={product.slug}
            className="w-[72%] max-w-72 shrink-0 snap-start sm:w-64 lg:w-[calc((100%-3rem)/4)] lg:max-w-none"
          >
            <MachineCard
              {...product}
              onAdd={(trigger) => addToQuote(trigger, product.slug, product.name)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
