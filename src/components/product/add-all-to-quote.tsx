"use client";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { useQuoteDrawer, useQuoteStore } from "@/store/quote";

export function AddAllToQuote({ items }: { items: { slug: string; name: string }[] }) {
  return (
    <Button
      size="lg"
      className="mt-6"
      onClick={() => {
        const { add } = useQuoteStore.getState();
        items.forEach((item) => add(item.slug));
        void notify(
          `Added ${items.length} ${items.length === 1 ? "machine" : "machines"} to your quote list`,
          {
            label: "View list",
            onClick: () => useQuoteDrawer.getState().setOpen(true),
          },
        );
      }}
    >
      Add all to quote
    </Button>
  );
}
