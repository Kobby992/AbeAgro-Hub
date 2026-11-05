"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import type { QuoteCatalogue } from "@/hooks/use-quote-catalogue";
import { useQuoteStore } from "@/store/quote";

/** Line items, shared by the drawer and the /quote page (BUILD_SPEC §6.7). */
export function QuoteLines({
  catalogue,
  withNotes = false,
  onNavigate,
}: {
  catalogue: QuoteCatalogue;
  withNotes?: boolean;
  onNavigate?: () => void;
}) {
  const items = useQuoteStore((state) => state.items);
  const setQty = useQuoteStore((state) => state.setQty);
  const setNote = useQuoteStore((state) => state.setNote);
  const remove = useQuoteStore((state) => state.remove);

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const product = catalogue.get(item.slug);
        if (!product) return null;
        return (
          <li key={item.slug} className="flex gap-3 py-3">
            <div
              data-cat={product.categorySlug}
              className="machine-stage size-16 shrink-0 rounded-md"
            >
              <Image src={product.image} alt="" fill sizes="64px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/machinery/${item.slug}`}
                onClick={onNavigate}
                className="font-display leading-tight font-bold [font-stretch:87.5%] hover:underline"
              >
                {product.shortName}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <QuantityStepper
                  value={item.qty}
                  of={product.shortName}
                  onChange={(qty) => setQty(item.slug, qty)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${product.shortName}`}
                  onClick={() => remove(item.slug)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
              {withNotes && (
                <>
                  <label htmlFor={`note-${item.slug}`} className="mt-2 block text-sm font-semibold">
                    Note for this machine (optional)
                  </label>
                  <input
                    id={`note-${item.slug}`}
                    type="text"
                    maxLength={200}
                    value={item.note ?? ""}
                    placeholder="For example, need diesel option"
                    onChange={(event) => setNote(item.slug, event.target.value)}
                    className="mt-1 min-h-11 w-full rounded-md border border-input bg-card px-3 text-base placeholder:text-muted-foreground"
                  />
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function QuoteListEmpty({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-lg font-semibold">Your quote list is empty.</p>
      <p className="mt-1 text-muted-foreground">
        Add machines from the catalogue, then send them to our sales team together.
      </p>
      <Button asChild className="mt-4">
        <Link href="/machinery" onClick={onNavigate}>
          Browse machinery
        </Link>
      </Button>
    </div>
  );
}
