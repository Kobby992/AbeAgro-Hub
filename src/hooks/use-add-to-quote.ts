"use client";

import { useCallback } from "react";
import { flyToQuote } from "@/components/motion/fly-to-quote";
import { track } from "@/lib/analytics";
import { notify } from "@/lib/notify";
import { useQuoteDrawer, useQuoteStore } from "@/store/quote";

/** The shared "add to quote list" action: animation, list update and confirmation (§5.2-5). */
export function useAddToQuote(source: "card" | "pdp" = "card") {
  return useCallback(
    (trigger: HTMLElement, slug: string, name: string, qty = 1) => {
      flyToQuote(trigger, () => {
        const { items, add } = useQuoteStore.getState();
        const wasListed = items.some((item) => item.slug === slug);
        const newQty = add(slug, qty);
        if (newQty > 0) track("quote_item_added", { slug, qty, source });
        const viewList = {
          label: "View list",
          onClick: () => useQuoteDrawer.getState().setOpen(true),
        };

        if (newQty === 0) {
          void notify(
            "Your quote list is full. Send this request, then start a new one.",
            viewList,
          );
        } else if (wasListed) {
          void notify(`${name} is already on your list. Quantity is now ${newQty}.`, viewList);
        } else {
          void notify("Added to your quote list", viewList);
        }
      });
    },
    [source],
  );
}
