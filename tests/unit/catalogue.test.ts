import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import categoryContent from "../../content/categories.json";
import { categories } from "@/config/categories";
import { solutions } from "@/config/solutions";
import {
  applyFilters,
  CROP_OPTIONS,
  NO_FILTERS,
  parseFilters,
  POWER_OPTIONS,
  SCALE_OPTIONS,
  serializeFilters,
} from "@/lib/catalogue";
import {
  allProducts,
  compareRows,
  getProduct,
  needsConfirmingValue,
  toCatalogueItem,
} from "@/lib/products";
import { createProductSearch } from "@/lib/search";

const items = allProducts.map(toCatalogueItem);
const search = createProductSearch(
  allProducts.map((product) => ({
    slug: product.slug,
    name: product.shortName,
    fullName: product.name,
    category: product.category,
    summary: product.summary,
    uses: product.typicalUses,
    crops: product.crops,
  })),
);
const slugsFor = (query: string) => (search(query) ?? []).map((hit) => hit.item.slug);

describe("product data", () => {
  it("has 42 products with unique slugs and existing photos", () => {
    expect(allProducts).toHaveLength(42);
    expect(new Set(allProducts.map((product) => product.slug)).size).toBe(42);
    for (const product of allProducts) {
      expect(existsSync(`public${product.image}`), product.image).toBe(true);
    }
  });

  it("has valid derived fields on every product", () => {
    const powers = POWER_OPTIONS.map((option) => option.value as string);
    const scales = SCALE_OPTIONS.map((option) => option.value as string);
    const crops = CROP_OPTIONS.map((option) => option.value as string);
    for (const product of allProducts) {
      expect(product.shortName, product.slug).toBeTruthy();
      expect(scales, product.slug).toContain(product.scale);
      product.powerSource.forEach((power) => expect(powers, product.slug).toContain(power));
      product.crops.forEach((crop) => expect(crops, product.slug).toContain(crop));
      expect(product.relatedSlugs.length, product.slug).toBeGreaterThanOrEqual(3);
      for (const related of product.relatedSlugs) {
        expect(getProduct(related), `${product.slug} -> ${related}`).toBeDefined();
        expect(related).not.toBe(product.slug);
      }
    }
  });

  it("features exactly the eight products the spec names", () => {
    expect(allProducts.filter((product) => product.featured)).toHaveLength(8);
  });

  it("never holds a price", () => {
    expect(JSON.stringify(allProducts)).not.toMatch(/"price"|GH₵|GHS|cedi/i);
    expect(JSON.stringify(categoryContent)).not.toMatch(/GH₵|GHS|cedi/i);
  });

  it("has full category content, and every category has a product", () => {
    for (const { slug } of categories) {
      const content = categoryContent[slug];
      expect(content.intro.split(/\s+/).length, slug).toBeGreaterThan(90);
      expect(content.tips.length, slug).toBeGreaterThanOrEqual(3);
      expect(content.faqs.length, slug).toBeGreaterThanOrEqual(2);
      content.solutions.forEach((guide) =>
        expect(solutions.map((solution) => solution.slug)).toContain(guide),
      );
      expect(
        allProducts.some((product) => product.category === slug),
        slug,
      ).toBe(true);
    }
  });
});

describe("search", () => {
  it("tolerates typos", () => {
    expect(slugsFor("hamer mil")[0]).toBe("hammer-mill");
    expect(slugsFor("rice huler")).toContain("sb10-rice-huller-mill");
  });

  it("ignores filler words", () => {
    expect(slugsFor("water pump for 2 acres")).toContain("petrol-water-pump-3-inch-wp30");
  });

  it("finds machines by what they are used for", () => {
    expect(slugsFor("paving blocks")).toContain("plate-compactor");
    expect(slugsFor("car wash")).toContain("diesel-car-wash-machine");
  });

  it("separates no search from no results", () => {
    expect(search("")).toBeNull();
    expect(search("zzzzqqqq")).toEqual([]);
  });
});

describe("filters", () => {
  it("round-trips through the URL", () => {
    const filters = {
      q: "water pump",
      categories: ["irrigation" as const, "planting" as const],
      power: "diesel",
      scale: "commercial",
      crop: "rice",
      sort: "a-z" as const,
    };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
    expect(serializeFilters(NO_FILTERS)).toBe("");
  });

  it("ignores unknown values in old or edited links", () => {
    expect(parseFilters("?cat=nope,irrigation&power=steam&sort=price")).toEqual({
      ...NO_FILTERS,
      categories: ["irrigation"],
    });
  });

  it("combines filters", () => {
    const results = applyFilters(
      items,
      { ...NO_FILTERS, categories: ["irrigation"], power: "petrol" },
      null,
    );
    expect(results.map((item) => item.slug)).toEqual(["petrol-water-pump-3-inch-wp30"]);
  });

  it("shows featured machines first, then A–Z when asked", () => {
    const featuredFirst = applyFilters(items, NO_FILTERS, null);
    expect(featuredFirst.slice(0, 8).every((item) => item.featured)).toBe(true);
    const names = applyFilters(items, { ...NO_FILTERS, sort: "a-z" }, null).map((i) => i.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe("product helpers", () => {
  it("flags only values the catalogue marks for confirmation", () => {
    expect(needsConfirmingValue("Electric motor – rating to confirm")).toBe(true);
    expect(needsConfirmingValue("Approx. 0.5–1 t/h (confirm)")).toBe(true);
    expect(needsConfirmingValue("11 kW")).toBe(false);
  });

  it("lines up differently named specs when comparing", () => {
    const rows = compareRows([getProduct("sb10-rice-huller-mill")!, getProduct("disk-mill")!]);
    const row = (label: string) => rows.find((item) => item.label === label)?.values;
    expect(row("Capacity")).toEqual(["900–1,200 kg/h", "Approx. 150–600 kg/h"]);
    expect(row("Power")).toEqual(["11 kW", "11–22.5 kW"]);
    expect(row("Weight")).toEqual(["Approx. 230 kg", ""]);
  });
});
