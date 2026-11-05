"use client";

import { Scale, X } from "lucide-react";
import Link from "next/link";
import { MachineCard } from "@/components/product/machine-card";
import { Button } from "@/components/ui/button";
import { useAddToQuote } from "@/hooks/use-add-to-quote";
import type { CardProduct } from "@/lib/products";
import { MAX_COMPARE, useCompareStore } from "@/store/compare";

export const GRID_CLASSES = "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4";

/** Card props shared by every product grid: add to list and the compare tick box. */
export function useCardActions() {
  const addToQuote = useAddToQuote();
  const slugs = useCompareStore((state) => state.slugs);
  const setCompared = useCompareStore((state) => state.setCompared);

  return (product: Pick<CardProduct, "slug" | "name">, { compare = true } = {}) => ({
    onAdd: (trigger: HTMLButtonElement) => addToQuote(trigger, product.slug, product.name),
    ...(compare && {
      compared: slugs.includes(product.slug),
      compareDisabled: slugs.length >= MAX_COMPARE,
      onCompareChange: (compared: boolean) => setCompared(product.slug, compared),
    }),
  });
}

export function ProductGrid({
  products,
  compare = true,
  label,
}: {
  products: CardProduct[];
  compare?: boolean;
  label?: string;
}) {
  const cardActions = useCardActions();

  return (
    <ul className={GRID_CLASSES} aria-label={label}>
      {products.map((product) => (
        <li key={product.slug}>
          <MachineCard {...product} {...cardActions(product, { compare })} />
        </li>
      ))}
    </ul>
  );
}

/** "Compare (2)" bar, shown once anything is ticked (BUILD_SPEC §6.3). Sits above the corner buttons. */
export function CompareBar() {
  const slugs = useCompareStore((state) => state.slugs);
  const clear = useCompareStore((state) => state.clear);

  if (slugs.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--floating-bottom)+3.75rem)] z-30 flex justify-center px-4 lg:bottom-(--floating-bottom)">
      <div className="flex items-center gap-1 rounded-full bg-forest-900 p-1 shadow-lg">
        <Button asChild variant="gold" size="sm" className="rounded-full">
          <Link href={`/compare?ids=${slugs.join(",")}`}>
            <Scale aria-hidden />
            Compare ({slugs.length})
          </Link>
        </Button>
        <Button
          variant="ghost-light"
          size="icon"
          aria-label="Clear compare list"
          className="rounded-full"
          onClick={clear}
        >
          <X aria-hidden />
        </Button>
      </div>
    </div>
  );
}
