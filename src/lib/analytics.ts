// The events from BUILD_SPEC §10. Everything is sent through track(), so changing analytics provider
// means changing one line. Until a provider is switched on, nothing leaves the customer's browser.

type SearchLocation = "hero" | "catalogue" | "palette";

export type AnalyticsEvents = {
  search_performed: { query: string; results_count: number; location: SearchLocation };
  filter_applied: { filter: string; value: string };
  product_viewed: { slug: string; category: string };
  quote_item_added: { slug: string; qty: number; source: "card" | "pdp" | "solution" };
  quote_form_submitted: { items_count: number; source: "site"; reference: string };
  whatsapp_opened: { type: "quote" | "quick" | "contact" | "partner"; reference?: string };
  kobby_opened: { page: string; trigger: "cta" };
  compare_used: { slugs: string };
};

export const ANALYTICS_EVENT = "abe:analytics";

declare global {
  interface Window {
    plausible?: (name: string, options: { props: Record<string, unknown> }) => void;
  }
}

export function track<Name extends keyof AnalyticsEvents>(
  name: Name,
  props: AnalyticsEvents[Name],
) {
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: { name, props } }));
  window.plausible?.(name, { props });
  if (location.search.includes("debug_analytics")) console.info("[analytics]", name, props);
}

let searchOrigin: SearchLocation | null = null;

/** Search results appear on the catalogue, so this notes where the search was started. */
export function noteSearchOrigin(origin: SearchLocation) {
  searchOrigin = origin;
}

export function takeSearchOrigin(): SearchLocation {
  const origin = searchOrigin ?? "catalogue";
  searchOrigin = null;
  return origin;
}
