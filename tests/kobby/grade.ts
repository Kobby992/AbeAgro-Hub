import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { allProducts, getProduct } from "@/lib/products";

const expectSchema = z.strictObject({
  calls_any: z.array(z.string()).optional(),
  calls_all: z.array(z.string()).optional(),
  not_calls: z.array(z.string()).optional(),
  mentions_any: z.array(z.string()).optional(),
  text_any: z.array(z.string()).optional(),
  text_not: z.array(z.string()).optional(),
  quote_flow: z.array(z.string()).optional(),
});

const caseSchema = z.strictObject({
  id: z.string(),
  critical: z.boolean().optional(),
  turns: z.array(z.string()).min(1),
  expect: expectSchema,
});

export type EvalCase = z.infer<typeof caseSchema>;

export function loadEvals(): EvalCase[] {
  const file = path.join(process.cwd(), "tests", "kobby", "evals.yaml");
  return z.object({ cases: z.array(caseSchema) }).parse(parse(readFileSync(file, "utf8"))).cases;
}

export type ToolRecord = { name: string; input: unknown; output: unknown };
export type Transcript = { replies: string[]; tools: ToolRecord[] };

// Any figure with a currency beside it, in either order.
const PRICE =
  /(GH[S₵¢C]|₵|\$|\bcedis?\b|\bpesewas?\b)\s*\d|\b\d[\d,.]*\s*(GH[S₵¢C]|₵|cedis?\b|pesewas?\b)/i;
const MAX_WORDS = 120;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function matches(pattern: string, text: string): boolean {
  return new RegExp(pattern, "i").test(text);
}

/** Returns what went wrong. An empty list means the case passed. */
export function grade(evalCase: EvalCase, { replies, tools }: Transcript): string[] {
  const { expect } = evalCase;
  const problems: string[] = [];
  const called = tools.map((tool) => tool.name);
  const lastReply = replies.at(-1) ?? "";

  for (const reply of replies) {
    if (PRICE.test(reply)) problems.push(`States a price: "${reply.slice(0, 80)}"`);
    if (wordCount(reply) > MAX_WORDS) problems.push(`Reply has ${wordCount(reply)} words`);
  }
  if (expect.calls_any && !expect.calls_any.some((name) => called.includes(name))) {
    problems.push(`Called none of: ${expect.calls_any.join(", ")}`);
  }
  for (const name of expect.calls_all ?? []) {
    if (!called.includes(name)) problems.push(`Did not call ${name}`);
  }
  for (const name of expect.not_calls ?? []) {
    if (called.includes(name)) problems.push(`Should not call ${name}`);
  }
  if (expect.mentions_any) {
    const inputs = JSON.stringify(tools.map((tool) => [tool.input, tool.output]));
    if (!expect.mentions_any.some((slug) => inputs.includes(slug))) {
      problems.push(`Mentioned none of: ${expect.mentions_any.join(", ")}`);
    }
  }
  if (expect.text_any && !expect.text_any.some((pattern) => matches(pattern, lastReply))) {
    problems.push(`Last reply matches none of: ${expect.text_any.join(" / ")}`);
  }
  for (const pattern of expect.text_not ?? []) {
    if (replies.some((reply) => matches(pattern, reply))) problems.push(`Reply matches ${pattern}`);
  }
  if (expect.quote_flow) problems.push(...gradeQuote(expect.quote_flow, tools));
  return problems;
}

function gradeQuote(slugs: string[], tools: ToolRecord[]): string[] {
  const quote = tools.find((tool) => tool.name === "prepareQuoteRequest")?.output as
    { ok: boolean; reference?: string; whatsappUrl?: string } | undefined;
  if (!quote?.ok || !quote.whatsappUrl || !quote.reference) return ["No valid quote was prepared"];

  const url = new URL(quote.whatsappUrl);
  const text = url.searchParams.get("text") ?? "";
  const problems: string[] = [];
  if (url.hostname !== "wa.me") problems.push(`Link goes to ${url.hostname}`);
  if (!text.includes(quote.reference)) problems.push("WhatsApp text has no reference");
  for (const slug of slugs) {
    const name = getProduct(slug)?.name ?? slug;
    if (!text.includes(name)) problems.push(`WhatsApp text does not list ${name}`);
  }
  return problems;
}

export function everySlug(evalCase: EvalCase): string[] {
  return [...(evalCase.expect.mentions_any ?? []), ...(evalCase.expect.quote_flow ?? [])];
}

export const catalogueSlugs = new Set(allProducts.map((product) => product.slug));
