"use client";

import { useState } from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { QuickQuoteLink } from "@/components/quote/quick-quote-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useAddToQuote } from "@/hooks/use-add-to-quote";
import { cn } from "@/lib/utils";
import { productQuoteLink } from "@/lib/whatsapp";

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
  const addToQuote = useAddToQuote("pdp");
  const quoteHref = productQuoteLink({ name, category, slug, qty });

  return (
    <div className="mt-5 flex max-w-lg flex-col gap-3">
      <Button asChild size="lg" className="w-full text-xl">
        <QuickQuoteLink slug={slug} qty={qty} href={quoteHref}>
          Get quote on WhatsApp
        </QuickQuoteLink>
      </Button>
      <p className="text-sm text-muted-foreground">
        Our sales team replies on WhatsApp with pricing, availability and delivery.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="product-qty" className="mb-1 block font-semibold">
            Quantity
          </label>
          <QuantityStepper id="product-qty" value={qty} onChange={setQty} />
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
        Ask Kamal about this machine
      </KobbyPromptButton>

      {/* Thumb-reachable actions on phones (BUILD_SPEC §4.5). */}
      <div
        data-sticky-bar
        className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg lg:hidden"
      >
        <Button
          variant="outline"
          className="flex-1 px-2"
          onClick={(event) => addToQuote(event.currentTarget, slug, shortName, qty)}
        >
          Add to quote
        </Button>
        <Button asChild className="flex-1 px-2">
          <QuickQuoteLink slug={slug} qty={qty} href={quoteHref}>
            WhatsApp
          </QuickQuoteLink>
        </Button>
      </div>
    </div>
  );
}
