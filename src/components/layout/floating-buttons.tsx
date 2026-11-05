"use client";

import { ClipboardList, MessageSquareText } from "lucide-react";
import dynamic from "next/dynamic";
import { QuoteCount, QuoteListLink } from "@/components/quote/quote-list-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKobbyStore } from "@/store/kobby";
import { selectQuoteCount, useQuoteDrawer, useQuoteStore } from "@/store/quote";

// Only the launcher ships with the page; the panel loads on first open (BUILD_SPEC §7.6).
const KobbyPanel = dynamic(() => import("@/components/kobby/kobby-panel"), { ssr: false });

const QuoteDrawer = dynamic(() => import("@/components/quote/quote-drawer"), { ssr: false });

const SAFE_BOTTOM = "bottom-(--floating-bottom)";

export function FloatingButtons() {
  const count = useQuoteStore(selectQuoteCount);
  const drawerMounted = useQuoteDrawer((state) => state.mounted);
  const hasOpened = useKobbyStore((state) => state.hasOpened);
  const openKobby = useKobbyStore((state) => state.openKobby);

  return (
    <>
      <Button
        variant="gold"
        onClick={() => openKobby()}
        className={cn(
          "fixed left-4 z-30 rounded-full shadow-lg",
          SAFE_BOTTOM,
          !hasOpened && "kobby-breathe",
        )}
      >
        <MessageSquareText aria-hidden />
        Ask Kobby
      </Button>

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
