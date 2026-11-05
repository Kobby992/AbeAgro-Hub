"use client";

import type { ComponentProps, MouseEvent } from "react";
import { openWhatsApp, postQuote, reportWhatsAppOpened } from "@/lib/quote-client";
import { createReference } from "@/lib/reference";
import { addReferenceToLink } from "@/lib/whatsapp";

const QUICK_TIMEOUT_MS = 1_500;

/**
 * One-tap Get quote (BUILD_SPEC §8.2). Logs the lead and gets a reference, then opens WhatsApp.
 * If the API fails or is slow, the customer still gets through with a reference made here. Without
 * JavaScript, or with a modified click, it behaves as the plain WhatsApp link it is underneath.
 */
export function QuickQuoteLink({
  slug,
  qty = 1,
  href,
  onClick,
  ...props
}: ComponentProps<"a"> & { slug: string; qty?: number; href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    let serverReference: string | null = null;
    const link = postQuote(
      { source: "product-quick", items: [{ slug, qty }] },
      QUICK_TIMEOUT_MS,
    ).then(
      (response) => {
        serverReference = response.reference;
        return response.whatsappUrl;
      },
      () => addReferenceToLink(href, createReference()),
    );

    void openWhatsApp(link).then((opened) => {
      if (opened && serverReference) reportWhatsAppOpened(serverReference);
      // A popup blocker stopped the new tab, so go there in this one instead.
      if (!opened) void link.then((url) => (location.href = url));
    });
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props} />
  );
}
