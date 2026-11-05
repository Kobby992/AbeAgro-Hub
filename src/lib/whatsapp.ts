import { site, whatsappUrl } from "@/config/site";

/**
 * A website cannot send a WhatsApp message from the customer silently. The wa.me link opens the
 * customer's WhatsApp with the message pre-filled, and the customer presses Send (BUILD_SPEC §7.4).
 */
export function whatsappLink(text: string): string {
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}

export type ProductQuote = {
  name: string;
  category: string;
  slug: string;
  qty?: number;
  /** Added once the quote API exists in Phase 4 (BUILD_SPEC §8.2). */
  reference?: string;
};

/** One-tap message for a single product (BUILD_SPEC §8.2). */
export function productQuoteMessage({ name, category, slug, qty = 1, reference }: ProductQuote) {
  return [
    "Hello ABE Agro Hub 👋",
    "I'd like a quote for:",
    "",
    `*${name}* × ${qty}`,
    `Category: ${category}`,
    `Product link: ${site.url}/machinery/${slug}`,
    ...(reference ? [`*Quote ref:* ${reference}`] : []),
    "",
    "Please send me the price, availability and delivery details.",
  ].join("\n");
}

export function productQuoteLink(quote: ProductQuote): string {
  return whatsappLink(productQuoteMessage(quote));
}

export const GENERAL_QUOTE_LINK = whatsappLink(
  "Hello ABE Agro Hub 👋\nI'd like a quote please. Here is what I need:",
);
