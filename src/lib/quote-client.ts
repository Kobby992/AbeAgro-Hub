"use client";

import type { QuoteRequest, QuoteResponse } from "@/lib/quote-schema";
import { REFERENCE_PATTERN } from "@/lib/reference";

const UTM_KEY = "abe-utm";

/** Remembers campaign tags from the landing page for the visit (BUILD_SPEC §8.4). */
export function captureUtm() {
  try {
    const entries = [...new URLSearchParams(location.search)].filter(([key]) =>
      key.startsWith("utm_"),
    );
    if (entries.length > 0) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(Object.fromEntries(entries)));
    }
  } catch {
    // Campaign tags are a nice-to-have.
  }
}

function storedUtm(): Record<string, string> | undefined {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "null") ?? undefined;
  } catch {
    return undefined;
  }
}

type QuoteBody =
  | Omit<Extract<QuoteRequest, { source: "product-quick" }>, "pageUrl" | "utm">
  | Omit<Extract<QuoteRequest, { source: "site" }>, "pageUrl" | "utm">;

/** Sends a request to the API. Rejects on any failure, including taking longer than `timeoutMs`. */
export async function postQuote(body: QuoteBody, timeoutMs: number): Promise<QuoteResponse> {
  const response = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, pageUrl: location.href.slice(0, 500), utm: storedUtm() }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Quote API returned ${response.status}`);
  return (await response.json()) as QuoteResponse;
}

/**
 * Opens WhatsApp once the link is ready: a new tab on desktop, the same tab on phones (§8.2).
 * Browsers only allow new tabs straight after a press, so the tab opens first and gets its address
 * when the link arrives. Returns false if a popup blocker stopped it.
 */
export async function openWhatsApp(link: Promise<string>): Promise<boolean> {
  const sameTab = matchMedia("(pointer: coarse)").matches;
  const tab = sameTab ? null : window.open("", "_blank");
  const url = await link;
  if (sameTab) {
    location.href = url;
    return true;
  }
  if (!tab) return false;
  tab.opener = null;
  tab.location.href = url;
  return true;
}

export function reportWhatsAppOpened(reference: string) {
  if (REFERENCE_PATTERN.test(reference)) navigator.sendBeacon("/api/quote/opened", reference);
}
