// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET as llms } from "@/app/llms.txt/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { allProducts } from "@/lib/products";
import {
  breadcrumbJsonLd,
  businessJsonLd,
  clipDescription,
  faqJsonLd,
  pageMeta,
  productJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const PRICE = new RegExp("GH[S₵¢]|₵|cedis?\\b", "i");

describe("structured data", () => {
  it("never states a price, offer, brand or rating for any machine", () => {
    for (const product of allProducts) {
      const data = productJsonLd(product);
      expect(Object.keys(data).sort()).toEqual(
        ["@context", "@type", "category", "description", "image", "name", "url"].sort(),
      );
      expect(data.image.startsWith("https://www.abeagrohub.com/")).toBe(true);
      expect(JSON.stringify(data)).not.toMatch(PRICE);
    }
  });

  it("gives the confirmed business details and no unconfirmed opening hours", () => {
    expect(businessJsonLd()).toMatchObject({
      name: "ABE Agro Hub",
      url: "https://www.abeagrohub.com",
      telephone: "+233235801203",
      email: "sales@abeagrohub.com",
      alternateName: "Abdul Baai Enterprise",
      foundingDate: "1978",
      areaServed: ["GH", "TG", "BF", "CI"],
      address: {
        streetAddress: "Accra New Town",
        addressLocality: "Accra",
        addressRegion: "Greater Accra Region",
        addressCountry: "GH",
      },
    });
    expect(businessJsonLd().department.map((branch) => branch.telephone)).toEqual([
      "+233243055163",
      "+233249271638",
      "+233241323336",
      "+233242849245",
    ]);
    expect(businessJsonLd()).not.toHaveProperty("openingHoursSpecification");
  });

  it("describes site search, breadcrumbs and FAQs", () => {
    expect(websiteJsonLd().potentialAction.target.urlTemplate).toContain("/machinery?q=");
    expect(
      breadcrumbJsonLd([{ label: "Machinery", href: "/machinery" }]).itemListElement[0],
    ).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Machinery",
      item: "https://www.abeagrohub.com/machinery",
    });
    expect(faqJsonLd([{ question: "Q", answer: "A" }]).mainEntity[0]?.acceptedAnswer.text).toBe(
      "A",
    );
  });
});

describe("page metadata", () => {
  it("sets a canonical URL and a link preview image", () => {
    const meta = pageMeta("/about", { title: "T", description: "D" });
    expect(meta.alternates?.canonical).toBe("/about");
    expect(meta.openGraph?.images).toEqual(["/og-default.jpg"]);
    expect(meta.robots).toBeUndefined();
  });

  it("trims long descriptions at a word boundary", () => {
    const clipped = clipDescription("word ".repeat(60));
    expect(clipped.length).toBeLessThanOrEqual(156);
    expect(clipped.endsWith("word…")).toBe(true);
    expect(clipDescription("short")).toBe("short");
  });

  it("gives every machine a unique title", () => {
    expect(new Set(allProducts.map((product) => product.name)).size).toBe(allProducts.length);
  });
});

describe("crawling", () => {
  it("lists every page that should be found, and none that should not", () => {
    const urls = sitemap().map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://www.abeagrohub.com");
    for (const { slug } of allProducts) {
      expect(urls).toContain(`https://www.abeagrohub.com/machinery/${slug}`);
    }
    expect(urls.filter((url) => url.includes("/machinery/c/"))).toHaveLength(14);
    expect(urls.filter((url) => url.includes("/solutions/"))).toHaveLength(5);
    for (const hidden of ["/quote", "/compare", "/styleguide", "/api"]) {
      expect(urls.some((url) => url.includes(hidden))).toBe(false);
    }
  });

  it("points crawlers at the sitemap and keeps private routes out", () => {
    const rules = robots();
    expect(rules.sitemap).toBe("https://www.abeagrohub.com/sitemap.xml");
    expect(JSON.stringify(rules.rules)).toContain("/api/");
  });

  it("summarises the site for AI assistants, with no prices", async () => {
    const text = await llms().text();
    expect(text).toContain("# ABE Agro Hub");
    expect(text).toContain("Prices are not published");
    for (const { slug } of allProducts) expect(text).toContain(`/machinery/${slug}`);
    expect(text).not.toMatch(PRICE);
  });
});
