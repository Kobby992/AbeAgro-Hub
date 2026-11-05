"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { QuoteLines, QuoteListEmpty } from "@/components/quote/quote-lines";
import { Button } from "@/components/ui/button";
import { useQuoteCatalogue } from "@/hooks/use-quote-catalogue";
import { selectQuoteCount, useQuoteDrawer, useQuoteStore } from "@/store/quote";

/** Quick view of the quote list (BUILD_SPEC §6.7). The form itself is on /quote. */
export default function QuoteDrawer() {
  const open = useQuoteDrawer((state) => state.open);
  const setOpen = useQuoteDrawer((state) => state.setOpen);
  const count = useQuoteStore(selectQuoteCount);
  const { catalogue, failed } = useQuoteCatalogue();
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-900/60" />
        <Dialog.Content
          data-lenis-prevent
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background text-charcoal shadow-lg duration-250 data-[state=open]:animate-in data-[state=open]:slide-in-from-right-8"
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <Dialog.Title className="text-2xl">Your quote list</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close quote list">
                <X aria-hidden />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {count === 0 ? (
              <QuoteListEmpty onNavigate={close} />
            ) : failed ? (
              <p role="alert">Your list could not load. Check your connection, then try again.</p>
            ) : catalogue ? (
              <QuoteLines catalogue={catalogue} onNavigate={close} />
            ) : (
              <p role="status">Loading your list</p>
            )}
          </div>

          {count > 0 && (
            <div className="flex flex-col gap-2 border-t border-border p-4">
              <Button asChild size="lg">
                <Link href="/quote" onClick={close}>
                  Review and send request
                </Link>
              </Button>
              <Button variant="ghost" onClick={close}>
                Continue browsing
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
