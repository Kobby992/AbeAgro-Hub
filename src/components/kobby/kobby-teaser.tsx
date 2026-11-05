"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useKobbyStore } from "@/store/kobby";

const TEASE_AFTER_MS = 20_000;
const SHOWN_KEY = "abe-kobby-teased";

function alreadyShown(): boolean {
  try {
    return sessionStorage.getItem(SHOWN_KEY) !== null;
  } catch {
    return false;
  }
}

function markShown() {
  try {
    sessionStorage.setItem(SHOWN_KEY, "1");
  } catch {
    // At worst the bubble shows once more on another page.
  }
}

/** A speech bubble after 20 seconds on a product page, once per session (BUILD_SPEC §5.2-6). */
export function KobbyTeaser() {
  const product = useKobbyStore((state) => state.product);
  const hasOpened = useKobbyStore((state) => state.hasOpened);
  const openKobby = useKobbyStore((state) => state.openKobby);
  const [teasing, setTeasing] = useState("");

  const productName = product?.name;
  useEffect(() => {
    if (!productName || hasOpened || alreadyShown()) return;
    const timer = setTimeout(() => {
      markShown();
      setTeasing(productName);
    }, TEASE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [productName, hasOpened]);

  if (!teasing || hasOpened || productName !== teasing) return null;

  return (
    <div className="fixed bottom-[calc(var(--floating-bottom)+3.75rem)] left-4 z-30 flex max-w-68 items-start gap-1 rounded-lg border border-border bg-card p-1 text-charcoal shadow-lg">
      <button
        type="button"
        onClick={() => openKobby()}
        className="min-h-11 flex-1 rounded-md px-2 py-1 text-left text-sm font-semibold"
      >
        Need help choosing a {teasing}?
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setTeasing("")}
        className="flex size-11 shrink-0 items-center justify-center rounded-md"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
