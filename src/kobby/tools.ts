import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";
import { categoryName, type CategorySlug } from "@/config/categories";
import { sendQuoteEmail } from "@/lib/email";
import { saveLead, type Lead } from "@/lib/leads";
import { normalizePhone } from "@/lib/phone";
import {
  allProducts,
  getProduct,
  needsConfirmingValue,
  powerSourceLabel,
  toCardProduct,
  type Product,
} from "@/lib/products";
import { createReference } from "@/lib/reference";
import { createProductSearch } from "@/lib/search";
import { quoteRequestMessage, whatsappLink } from "@/lib/whatsapp";

export type ToolContext = {
  /** Everything the customer has typed, to check a phone number really came from them. */
  customerText: string;
  pageUrl?: string;
  userAgent?: string;
  onQuote?: (reference: string) => void;
};

const search = createProductSearch(
  allProducts.map((product) => ({
    slug: product.slug,
    name: product.shortName,
    fullName: product.name,
    category: categoryName(product.category as CategorySlug),
    summary: product.summary,
    uses: product.typicalUses,
    crops: product.crops,
  })),
);

function summarise(product: Product) {
  return {
    slug: product.slug,
    name: product.name,
    summary: product.summary,
    power: powerSourceLabel(product),
    keySpecs: product.specs.slice(0, 4).map(({ label, value }) => ({
      label,
      value: needsConfirmingValue(value) ? `${value} (TO BE CONFIRMED)` : value,
    })),
    needsConfirmation: product.needsConfirmation,
  };
}

type Filters = { category?: string; powerSource?: string; crop?: string; scale?: string };

function matchesFilters(product: Product, { category, powerSource, crop, scale }: Filters) {
  return (
    (!category || product.category === category) &&
    (!powerSource || product.powerSource.includes(powerSource)) &&
    (!crop || product.crops.includes(crop)) &&
    (!scale || product.scale === scale)
  );
}

function searchedProducts(query: string | undefined): Product[] {
  if (!query?.trim()) return allProducts;
  return (search(query) ?? []).flatMap((hit) => getProduct(hit.item.slug) ?? []);
}

const MAX_SEARCH_RESULTS = 8;
const MAX_RECOMMENDATIONS = 3;

/** Best matches first: a machine that fits the crop, scale and power beats one that only mentions the goal. */
export function recommend({
  goal,
  crop,
  scale,
  powerAvailable,
}: {
  goal: string;
  crop?: string;
  scale?: string;
  powerAvailable?: string;
}) {
  const matches = searchedProducts(`${goal} ${crop ?? ""}`);
  const score = (product: Product) =>
    (crop && product.crops.includes(crop) ? 2 : 0) +
    (scale && product.scale === scale ? 1 : 0) +
    (powerAvailable && product.powerSource.includes(powerAvailable) ? 2 : 0);

  return [...matches]
    .map((product, position) => ({ product, position }))
    .sort((a, b) => score(b.product) - score(a.product) || a.position - b.position)
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ product }) => {
      const fits = [
        crop && product.crops.includes(crop) ? `handles ${crop}` : "",
        scale && product.scale === scale ? `suits ${scale} scale` : "",
        powerAvailable && product.powerSource.includes(powerAvailable)
          ? `runs on ${powerAvailable}`
          : "",
      ].filter(Boolean);
      return {
        ...summarise(product),
        reason: fits.length ? `It ${fits.join(", ")}.` : product.typicalUses,
      };
    });
}

const lineItem = z.object({
  slug: z.string().max(120),
  qty: z.number().int().min(1).max(999),
  note: z.string().trim().max(200).optional(),
});

/** Machine names always come from the catalogue, never from what the model wrote. */
function knownItems(items: z.infer<typeof lineItem>[]) {
  return items.flatMap(({ slug, qty, note }) => {
    const product = getProduct(slug);
    return product ? [{ slug, name: product.name, qty, ...(note ? { note } : {}) }] : [];
  });
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function phoneCameFromCustomer(phone: string, customerText: string): boolean {
  return digits(customerText).includes(digits(phone));
}

/**
 * Every tool runs on the server. The ones the spec calls client tools only need their result drawn
 * in the chat, so resolving them here avoids a second paid model call per card, and means the model
 * cannot put a machine that does not exist, or a link of its own, in front of the customer.
 *
 * The quote summary card is drawn straight from prepareQuoteRequest. A long WhatsApp link would not
 * survive the model repeating it within its 600-token limit.
 */
export function createKobbyTools(context: ToolContext) {
  return {
    searchProducts: tool({
      description:
        "Search the catalogue. Returns matching machines with their slug, name, summary and key specs.",
      inputSchema: z.object({
        query: z.string().max(200).optional(),
        category: z.string().max(60).optional().describe("A category slug"),
        powerSource: z.enum(["petrol", "diesel", "electric", "manual", "tractor-pto"]).optional(),
        crop: z.string().max(40).optional().describe("Such as rice, maize or cassava"),
        scale: z.enum(["household", "small-business", "commercial"]).optional(),
      }),
      execute: async ({ query, ...filters }) => {
        const results = searchedProducts(query)
          .filter((product) => matchesFilters(product, filters))
          .slice(0, MAX_SEARCH_RESULTS);
        return { results: results.map(summarise) };
      },
    }),

    getProduct: tool({
      description: "Get the full record of one machine by its slug.",
      inputSchema: z.object({ slug: z.string().max(120) }),
      execute: async ({ slug }) => {
        const product = getProduct(slug);
        if (!product) return { found: false as const };
        const { name, category, description, features, specs, typicalUses } = product;
        return {
          found: true as const,
          product: {
            name,
            category,
            description,
            features,
            specs,
            typicalUses,
            power: powerSourceLabel(product),
            scale: product.scale,
            crops: product.crops,
            needsConfirmation: product.needsConfirmation,
          },
        };
      },
    }),

    recommendMachines: tool({
      description:
        "Get up to 3 suitable machines for a customer's goal, each with a reason. Explain the trade-offs. An empty list means nothing in the catalogue fits.",
      inputSchema: z.object({
        goal: z.string().max(300).describe("What the customer wants to do, in a few words"),
        crop: z.string().max(40).optional(),
        scale: z.enum(["household", "small-business", "commercial"]).optional(),
        powerAvailable: z
          .enum(["petrol", "diesel", "electric", "manual", "tractor-pto"])
          .optional(),
        budgetNote: z
          .string()
          .max(200)
          .optional()
          .describe("Anything said about budget. Prices are never discussed."),
      }),
      execute: async ({ budgetNote, ...need }) => ({
        recommendations: recommend(need),
        ...(budgetNote ? { budget: "The sales team advises on budget with the quote." } : {}),
      }),
    }),

    showProducts: tool({
      description:
        "Show machines as cards in the chat, each with Details, Get quote and Add to list buttons.",
      inputSchema: z.object({ slugs: z.array(z.string().max(120)).min(1).max(4) }),
      execute: async ({ slugs }) => ({
        cards: slugs.flatMap((slug) => {
          const product = getProduct(slug);
          return product ? [toCardProduct(product)] : [];
        }),
      }),
      toModelOutput: ({ output }) => ({
        type: "text",
        value: output.cards.length
          ? `Cards shown: ${output.cards.map((card) => card.slug).join(", ")}`
          : "No cards shown: none of those slugs are in the catalogue.",
      }),
    }),

    addToQuoteList: tool({
      description: "Add machines to the customer's quote list on this website.",
      inputSchema: z.object({ items: z.array(lineItem).min(1).max(20) }),
      execute: async ({ items }) => ({ added: knownItems(items) }),
    }),

    prepareQuoteRequest: tool({
      description:
        "Save the customer's quote request and prepare their WhatsApp message. A card with the Send button appears by itself. Use only details the customer gave.",
      inputSchema: z.object({
        name: z.string().trim().min(2).max(80),
        phone: z.string().trim().max(30),
        location: z.string().trim().min(2).max(160).describe("Town and region"),
        customerType: z.string().trim().max(40).optional(),
        items: z.array(lineItem).min(1).max(50),
        message: z.string().trim().max(500).optional(),
      }),
      execute: async ({ name, phone, location, customerType, items, message }) => {
        const normalized = normalizePhone(phone);
        if (!normalized) {
          return {
            ok: false as const,
            error: "That phone number is not valid. Ask for a number like 024 123 4567.",
          };
        }
        if (!phoneCameFromCustomer(phone, context.customerText)) {
          return { ok: false as const, error: "Ask the customer for their phone number." };
        }
        const known = knownItems(items);
        if (known.length === 0) {
          return { ok: false as const, error: "None of those machines are in the catalogue." };
        }

        const reference = createReference();
        const lead: Lead = {
          reference,
          source: "kobby",
          items: known,
          name,
          phoneE164: normalized.e164,
          location,
          customerType: customerType || null,
          message: message || null,
          pageUrl: context.pageUrl ?? null,
          userAgent: context.userAgent ?? null,
        };
        // Neither of these ever throws, so a problem here cannot stop the customer reaching ABE.
        await saveLead(lead);
        void sendQuoteEmail(lead);
        context.onQuote?.(reference);

        // wa.me only opens WhatsApp with this text filled in. The customer still presses Send, so
        // every request is also saved and emailed above (BUILD_SPEC §7.4).
        const previewText = quoteRequestMessage({
          reference,
          name,
          phone: normalized.display,
          location,
          customerType,
          items: known,
          message,
        });
        return {
          ok: true as const,
          reference,
          previewText,
          whatsappUrl: whatsappLink(previewText),
        };
      },
      toModelOutput: ({ output }) => ({
        type: "text",
        value: output.ok
          ? `Saved. Reference ${output.reference}. The Send card is showing.`
          : `Not saved. ${output.error}`,
      }),
    }),

    handoffToHuman: tool({
      description:
        "Show a button that opens WhatsApp to ABE's sales team, with a summary of the conversation.",
      inputSchema: z.object({
        reason: z.string().max(200).describe("Why the customer needs a person"),
        summary: z.string().max(500).describe("What the customer needs, in their terms"),
      }),
      execute: async ({ reason, summary }) => ({
        reason,
        whatsappUrl: whatsappLink(`Hello ABE Agro Hub 👋\n${summary}`),
      }),
      toModelOutput: () => ({ type: "text", value: "The WhatsApp button is showing." }),
    }),
  };
}

export type KobbyTools = ReturnType<typeof createKobbyTools>;
export type KobbyMessage = UIMessage<unknown, never, InferUITools<KobbyTools>>;
