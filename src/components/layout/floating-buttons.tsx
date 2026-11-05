"use client";

import { ClipboardList, MessageSquareText } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/tags";
import { cn } from "@/lib/utils";
import { useKobbyStore } from "@/store/kobby";
import { selectQuoteCount, useQuoteStore } from "@/store/quote";

// Only the launcher ships with the page; the panel loads on first open (BUILD_SPEC §7.6).
const KobbyPanel = dynamic(() => import("@/components/kobby/kobby-panel"), { ssr: false });

const SAFE_BOTTOM = "bottom-[max(1rem,env(safe-area-inset-bottom))]";

export function FloatingButtons() {
  const count = useQuoteStore(selectQuoteCount);
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
        <Link href="/quote" aria-label={`Quote list, ${count} ${count === 1 ? "item" : "items"}`}>
          <ClipboardList aria-hidden />
          Quote list
          {count > 0 && <CountBadge count={count} />}
        </Link>
      </Button>

      {hasOpened && <KobbyPanel />}
    </>
  );
}
