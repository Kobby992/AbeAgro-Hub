"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAddToQuote } from "@/hooks/use-add-to-quote";
import { cn } from "@/lib/utils";
import { productQuoteLink } from "@/lib/whatsapp";

const MAX_QTY = 999;

/** The buying controls and the sticky phone bar, which share one quantity (BUILD_SPEC §6.5). */
export function ProductActions({
  slug,
  name,
  shortName,
  category,
}: {
  slug: string;
  name: string;
  shortName: string;
  category: string;
}) {
  const [qty, setQty] = useState(1);
  const addToQuote = useAddToQuote();
  const quoteHref = productQuoteLink({ name, category, slug, qty });
  const setClamped = (value: number) =>
    setQty(Math.min(Math.max(Number.isFinite(value) ? Math.round(value) : 1, 1), MAX_QTY));

  return (
    <div className="mt-5 flex max-w-lg flex-col gap-3">
      <Button asChild size="lg" className="w-full text-xl">
        <a href={quoteHref} target="_blank" rel="noopener noreferrer">
          Get quote on WhatsApp
        </a>
      </Button>
      <p className="text-sm text-muted-foreground">
        Our sales team replies on WhatsApp with pricing, availability and delivery.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="product-qty" className="mb-1 block font-semibold">
            Quantity
          </label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Reduce quantity"
              disabled={qty <= 1}
              onClick={() => setClamped(qty - 1)}
            >
              <Minus aria-hidden />
            </Button>
            <input
              id="product-qty"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QTY}
              value={qty}
              onChange={(event) => setClamped(event.target.valueAsNumber)}
              className="h-11 w-16 rounded-md border border-input bg-card text-center text-base"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Increase quantity"
              disabled={qty >= MAX_QTY}
              onClick={() => setClamped(qty + 1)}
            >
              <Plus aria-hidden />
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          className="min-w-44 flex-1"
          onClick={(event) => addToQuote(event.currentTarget, slug, shortName, qty)}
        >
          Add to quote list
        </Button>
      </div>

      <KobbyPromptButton
        prompt={`I have a question about the ${name}.`}
        className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
      >
        Ask Kobby about this machine
      </KobbyPromptButton>

      {/* Thumb-reachable actions on phones (BUILD_SPEC §4.5). */}
      <div
        data-sticky-bar
        className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-cream p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg lg:hidden"
      >
        <Button
          variant="outline"
          className="flex-1 px-2"
          onClick={(event) => addToQuote(event.currentTarget, slug, shortName, qty)}
        >
          Add to quote
        </Button>
        <Button asChild className="flex-1 px-2">
          <a href={quoteHref} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
