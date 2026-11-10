"use client";

import { ClipboardList } from "lucide-react";
import dynamic from "next/dynamic";
import { QuoteCount, QuoteListLink } from "@/components/quote/quote-list-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKobbyStore } from "@/store/kobby";
import { selectQuoteCount, useQuoteDrawer, useQuoteStore } from "@/store/quote";

// The corner launcher is off at the owner's request, until they ask for it back. Kamal's buttons
// inside pages still open the panel, which loads on first open (BUILD_SPEC §7.6).
const KobbyPanel = dynamic(() => import("@/components/kobby/kobby-panel"), { ssr: false });

const QuoteDrawer = dynamic(() => import("@/components/quote/quote-drawer"), { ssr: false });

const SAFE_BOTTOM = "bottom-(--floating-bottom)";

export function FloatingButtons() {
  const count = useQuoteStore(selectQuoteCount);
  const drawerMounted = useQuoteDrawer((state) => state.mounted);
  const hasOpened = useKobbyStore((state) => state.hasOpened);

  return (
    <>
      {/* Hidden at zero on mobile, always shown on desktop (BUILD_SPEC §6.1). */}
      <Button
        asChild
        className={cn(
          "fixed right-4 z-30 rounded-full shadow-lg",
          SAFE_BOTTOM,
          count === 0 && "hidden lg:inline-flex",
        )}
      >
        <QuoteListLink>
          <ClipboardList aria-hidden />
          <span>Quote list</span>
          <QuoteCount count={count} />
        </QuoteListLink>
      </Button>

      {hasOpened && <KobbyPanel />}
      {drawerMounted && <QuoteDrawer />}
    </>
  );
}
