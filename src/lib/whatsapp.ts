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

/** Puts a reference into a ready-made product link, for when the quote API cannot be reached. */
export function addReferenceToLink(link: string, reference: string): string {
  const text = new URL(link).searchParams.get("text") ?? "";
  return whatsappLink(
    text.replace("\n\nPlease send", `\n*Quote ref:* ${reference}\n\nPlease send`),
  );
}

export type QuoteMessage = {
  reference?: string;
  name: string;
  phone: string;
  location: string;
  customerType?: string;
  items: { name: string; qty: number; note?: string }[];
  message?: string;
};

// WhatsApp links stop working reliably when very long (BUILD_SPEC §8.2).
const MAX_MESSAGE_LENGTH = 1800;
const MAX_LISTED_ITEMS = 15;

function formatQuoteMessage(quote: QuoteMessage, listed: number, withNotes: boolean) {
  const items = quote.items
    .slice(0, listed)
    .flatMap((item, index) => [
      `${index + 1}. ${item.name} × ${item.qty}`,
      ...(withNotes && item.note ? [`   Note: ${item.note}`] : []),
    ]);
  const hidden = quote.items.length - listed;
  return [
    "Hello ABE Agro Hub 👋",
    "I'd like a quote please.",
    "",
    `*Quote ref:* ${quote.reference ?? "Added when you send"}`,
    `*Name:* ${quote.name}`,
    `*Phone:* ${quote.phone}`,
    `*Location:* ${quote.location}`,
    ...(quote.customerType ? [`*I am a:* ${quote.customerType}`] : []),
    "",
    "*Items:*",
    ...items,
    ...(hidden > 0 ? [`+${hidden} more items — see email/reference`] : []),
    ...(quote.message ? ["", `*Message:* ${quote.message}`] : []),
    "",
    "Sent from www.abeagrohub.com",
  ].join("\n");
}

/**
 * The full quote request (BUILD_SPEC §8.2). Past 15 items, or if it would run too long, it drops
 * notes and then lists fewer items. The full list is always in the email and database.
 */
export function quoteRequestMessage(quote: QuoteMessage): string {
  let listed = Math.min(quote.items.length, MAX_LISTED_ITEMS);
  let text = formatQuoteMessage(quote, listed, true);
  if (text.length > MAX_MESSAGE_LENGTH) text = formatQuoteMessage(quote, listed, false);
  while (text.length > MAX_MESSAGE_LENGTH && listed > 1) {
    listed -= 1;
    text = formatQuoteMessage(quote, listed, false);
  }
  return text;
}

export const GENERAL_QUOTE_LINK = whatsappLink(
  "Hello ABE Agro Hub 👋\nI'd like a quote please. Here is what I need:",
);
