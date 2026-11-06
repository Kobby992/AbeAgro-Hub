import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { solutions } from "@/config/solutions";
import { allProducts } from "@/lib/products";

export const dynamic = "force-static";

/** A plain summary for AI assistants, so they describe ABE accurately and link to the right page. */
export function GET() {
  const text = [
    `# ${site.name}`,
    "",
    `> Agricultural machinery and food-processing equipment, based in ${site.location}, with nationwide delivery across Ghana.`,
    "",
    "Prices are not published. Customers request a quote and the sales team replies on WhatsApp with price, availability and delivery. Payment and warranty terms are agreed with each quote.",
    "",
    `Contact: WhatsApp or phone ${site.phoneDisplay}, email ${site.email}, open ${site.hours}.`,
    "",
    "## Categories",
    ...categories.map(({ slug, name }) => `- [${name}](${site.url}/machinery/c/${slug})`),
    "",
    "## Guides",
    ...solutions.map(
      ({ slug, title, blurb }) => `- [${title}](${site.url}/solutions/${slug}): ${blurb}`,
    ),
    "",
    "## Machines",
    ...allProducts.map(
      ({ slug, name, summary }) => `- [${name}](${site.url}/machinery/${slug}): ${summary}`,
    ),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
