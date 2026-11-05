/**
 * Compiles the website into src/kobby/knowledge.md, which goes into Kobby's system prompt
 * (BUILD_SPEC §7.2). Runs before every build, so Kobby always matches what the site says.
 *
 * Pages are rendered with React rather than copied, so their wording has one source.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AboutPage from "../src/app/(site)/about/page";
import ContactPage from "../src/app/(site)/contact/page";
import HowItWorksPage from "../src/app/(site)/how-it-works/page";
import PartnersPage from "../src/app/(site)/partners/page";
import PrivacyPage from "../src/app/(site)/privacy/page";
import TermsPage from "../src/app/(site)/terms/page";
import { categories } from "../src/config/categories";
import { solutions } from "../src/config/solutions";
import categoryContent from "../content/categories.json";
import faq from "../content/faq.json";
import { allProducts, needsConfirmingValue, powerSourceLabel } from "../src/lib/products";

// tsx compiles the JSX in these pages to React.createElement.
(globalThis as { React?: unknown }).React = React;

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "src", "kobby", "knowledge.md");

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Turns rendered HTML into plain text, keeping headings and list items readable. */
function htmlToText(html: string): string {
  return html
    .replace(/<(svg|script|style|form)\b[\s\S]*?<\/\1>/g, "")
    .replace(/<h[1-6][^>]*>/g, "\n\n#### ")
    .replace(/<\/h[1-6]>/g, "\n")
    .replace(/<li[^>]*>/g, "\n- ")
    .replace(/<\/(p|div|section|ul|ol)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&[#\w]+;/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/[ \t]+/g, " ")
    .replace(/\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pageSection(title: string, Page: () => React.ReactElement): string {
  return `## ${title}\n\n${htmlToText(renderToStaticMarkup(React.createElement(Page)))}`;
}

function productsSection(): string {
  const entries = allProducts.map((product) => {
    const specs = product.specs.map(({ label, value }) => {
      const flag = needsConfirmingValue(value) ? " [TO BE CONFIRMED]" : "";
      return `- ${label}: ${value}${flag}`;
    });
    const details = [
      `### ${product.name}`,
      `Slug: ${product.slug}`,
      `Category: ${product.category}`,
      `Power: ${powerSourceLabel(product)}`,
      `Scale: ${product.scale}`,
      ...(product.crops.length ? [`Crops: ${product.crops.join(", ")}`] : []),
      ...(product.needsConfirmation
        ? ["Note: some details of this machine are TO BE CONFIRMED by the sales team."]
        : []),
      "",
      product.description,
      "",
      `Typical uses: ${product.typicalUses}`,
      "Features:",
      ...product.features.map((feature) => `- ${feature}`),
      "Specs:",
      ...specs,
    ];
    return details.join("\n");
  });
  return `## Catalogue (${allProducts.length} machines, the complete list)\n\n${entries.join("\n\n")}`;
}

function categoriesSection(): string {
  const entries = categories.map(({ slug, name }) => {
    const content = categoryContent[slug];
    return [
      `### ${name} (${slug})`,
      content.intro,
      ...content.tips.map((tip) => `- ${tip}`),
      ...content.faqs.map(({ question, answer }) => `Q: ${question}\nA: ${answer}`),
    ].join("\n");
  });
  return `## Categories\n\n${entries.join("\n\n")}`;
}

/** The prose and machine list of each solutions guide, without the MDX code around them. */
function solutionsSection(): string {
  const directory = path.join(ROOT, "content", "solutions");
  const files = new Map(
    readdirSync(directory).map((file) => [
      file.replace(/\.mdx$/, ""),
      readFileSync(path.join(directory, file), "utf8").replace(/\r\n/g, "\n"),
    ]),
  );
  const entries = solutions.map(({ slug, title }) => {
    const source = files.get(slug);
    if (!source) throw new Error(`No guide file for the solution "${slug}"`);
    const [, machines = ""] = /machines:\s*\[([\s\S]*?)\]/.exec(source) ?? [];
    const slugs = [...machines.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    const prose = source
      .replace(/export const guide = \{[\s\S]*?\n\};\n/, "")
      .replace(/^## /gm, "#### ")
      .trim();
    return `### ${title}\nMachines in this guide: ${slugs.join(", ")}\n\n${prose}`;
  });
  return `## Solutions guides\n\n${entries.join("\n\n")}`;
}

function faqSection(): string {
  const entries = faq
    .filter((entry) => entry.answer && !("needsOwner" in entry))
    .map(({ question, answer }) => `Q: ${question}\nA: ${answer}`);
  return `## Frequently asked questions\n\n${entries.join("\n\n")}`;
}

const knowledge = [
  "# ABE Agro Hub website knowledge",
  "Generated by scripts/build-kobby-knowledge.ts. Do not edit by hand.",
  productsSection(),
  categoriesSection(),
  solutionsSection(),
  faqSection(),
  pageSection("How it works", HowItWorksPage),
  pageSection("About", AboutPage),
  pageSection("Partners", PartnersPage),
  pageSection("Contact", ContactPage),
  pageSection("Privacy policy", PrivacyPage),
  pageSection("Terms", TermsPage),
].join("\n\n");

// Formatted so the generated file passes the same format check as everything else in the repo.
void format(knowledge, { parser: "markdown" }).then((formatted) => {
  writeFileSync(OUTPUT, formatted);
  console.log(`Kobby knowledge: ${Math.round(formatted.length / 1024)} KB written to src/kobby/`);
});
