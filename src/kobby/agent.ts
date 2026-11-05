import { anthropic } from "@ai-sdk/anthropic";
import { isStepCount, type LanguageModel, type UIMessage } from "ai";
import { getProduct } from "@/lib/products";
import { kobbyInstructions } from "@/kobby/system-prompt";
import { createKobbyTools, type ToolContext } from "@/kobby/tools";

export const DEFAULT_MODEL = "claude-haiku-5-5";
export const MAX_HISTORY_MESSAGES = 12;

/** The real model, or null when Kobby has no API key and must offer WhatsApp instead. */
export async function kobbyModel(): Promise<LanguageModel | null> {
  // Browser tests run the whole chat without a key or any cost. Never set this in production.
  if (process.env.KOBBY_TEST_MODEL) {
    const { createTestModel } = await import("@/kobby/test-model");
    return createTestModel();
  }
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return anthropic(process.env.KOBBY_MODEL || DEFAULT_MODEL);
}

export function messageText(message: UIMessage): string {
  return message.parts.flatMap((part) => (part.type === "text" ? part.text : [])).join(" ");
}

function toolPart(message: UIMessage, type: string) {
  return message.parts.filter(
    (part): part is Extract<typeof part, { input: unknown }> =>
      part.type === type && "input" in part,
  );
}

/**
 * Sends the last 12 messages, starting on a customer message. Older ones become a short note, so a
 * long chat stays cheap but Kobby does not ask again for a name it was already given (§7.7).
 */
export function trimHistory<T extends UIMessage>(messages: T[]): { recent: T[]; earlier: string } {
  if (messages.length <= MAX_HISTORY_MESSAGES) return { recent: messages, earlier: "" };

  let start = messages.length - MAX_HISTORY_MESSAGES;
  while (start < messages.length - 1 && messages[start]?.role !== "user") start += 1;

  const older = messages.slice(0, start);
  const said = older
    .filter((message) => message.role === "user")
    .map(messageText)
    .filter(Boolean);
  const shown = older.flatMap((message) =>
    toolPart(message, "tool-showProducts").flatMap(
      (part) => (part.input as { slugs?: string[] }).slugs ?? [],
    ),
  );
  const earlier = [
    ...(said.length ? [`Earlier the customer said: ${said.join(" | ")}`] : []),
    ...(shown.length ? [`Machines shown earlier: ${[...new Set(shown)].join(", ")}`] : []),
  ].join("\n");

  return { recent: messages.slice(start), earlier };
}

export type PageContext = {
  /** The page the customer is on. */
  path?: string;
  quoteList?: { slug: string; qty: number; note?: string }[];
};

/** Only catalogue facts are added here, so nothing a browser sends can write its own instructions. */
export function pageDetails({ path, quoteList }: PageContext, earlier: string): string {
  const slug = /^\/machinery\/([\w-]+)$/.exec(path ?? "")?.[1];
  const viewing = slug ? getProduct(slug) : undefined;
  const listed = (quoteList ?? []).flatMap(({ slug: listedSlug, qty }) => {
    const product = getProduct(listedSlug);
    return product ? [`${product.name} (${listedSlug}) × ${qty}`] : [];
  });
  return [
    ...(viewing ? [`The customer is viewing: ${viewing.name} (${viewing.slug})`] : []),
    ...(listed.length ? [`Machines on the customer's quote list: ${listed.join("; ")}`] : []),
    ...(earlier ? [earlier] : []),
  ].join("\n");
}

/** One set of settings, shared by the API route and the evals, so evals test what customers get. */
export function kobbySettings(details: string, toolContext: ToolContext) {
  return {
    instructions: kobbyInstructions(details),
    tools: createKobbyTools(toolContext),
    stopWhen: isStepCount(5),
    // Thinking also counts toward this limit, so it stays off to leave the 600 tokens for the reply.
    maxOutputTokens: 600,
    providerOptions: {
      anthropic: { thinking: { type: "disabled" as const }, effort: "medium" as const },
    },
  };
}
