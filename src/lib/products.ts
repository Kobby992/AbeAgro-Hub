import type { MachineCardProps } from "@/components/product/machine-card";
import { categoryName, type CategorySlug } from "@/config/categories";
import { POWER_OPTIONS, type Filterable } from "@/lib/catalogue";
import type { SearchEntry } from "@/lib/search";
import { productQuoteLink } from "@/lib/whatsapp";
import categoryContent from "../../content/categories.json";
import products from "../../content/products.json";

// Server side only: the full catalogue is too heavy to send to the browser whole.
export type Product = (typeof products)[number];

export const allProducts = products;

export type CardProduct = Omit<
  MachineCardProps,
  "onAdd" | "compared" | "onCompareChange" | "compareDisabled" | "preview" | "nameContent"
> & { slug: string };

export type CatalogueItem = CardProduct & Filterable & SearchEntry & { categoryLabel: string };

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function productQuoteHref(product: Product, qty = 1): string {
  return productQuoteLink({
    name: product.name,
    category: categoryName(product.category as CategorySlug),
    slug: product.slug,
    qty,
  });
}

export function toCardProduct(product: Product): CardProduct {
  return {
    slug: product.slug,
    name: product.shortName,
    summary: product.summary,
    image: product.image,
    category: product.category as CategorySlug,
    href: `/machinery/${product.slug}`,
    quoteHref: productQuoteHref(product),
    specs: product.specs.filter((spec) => !["Model", "Type"].includes(spec.label)).slice(0, 2),
    needsConfirmation: product.needsConfirmation,
  };
}

export function toCatalogueItem(product: Product): CatalogueItem {
  const label = categoryName(product.category as CategorySlug);
  return {
    ...toCardProduct(product),
    fullName: product.name,
    categoryLabel: label,
    uses: product.typicalUses,
    powerSource: product.powerSource,
    scale: product.scale,
    crops: product.crops,
    featured: product.featured,
    order: listingOrder(product),
  };
}

/** Catalogue order, keeping any product whose photo needs replacing out of the first impression. */
function listingOrder(product: Product): number {
  return product.id + ("imageNeedsReplacement" in product ? products.length : 0);
}

export function featuredProducts(): Product[] {
  return products
    .filter((product) => product.featured)
    .sort((a, b) => listingOrder(a) - listingOrder(b));
}

export function productsInCategory(category: CategorySlug): Product[] {
  return products.filter((product) => product.category === category);
}

export function relatedProducts(product: Product): Product[] {
  return product.relatedSlugs.flatMap((slug) => getProduct(slug) ?? []);
}

export type CategoryContent = {
  intro: string;
  tips: string[];
  faqs: { question: string; answer: string }[];
  solutions: string[];
};

export function getCategoryContent(category: CategorySlug): CategoryContent {
  return categoryContent[category];
}

export function powerSourceLabel(product: Product): string {
  const labels = product.powerSource.map(
    (power) => POWER_OPTIONS.find((option) => option.value === power)?.label ?? power,
  );
  return labels.join(", ") || "Not applicable";
}

/** Catalogue values marked as unconfirmed, which get a hint beside them (BUILD_SPEC §3.2). */
export function needsConfirmingValue(value: string): boolean {
  return /\bconfirm\b/i.test(value);
}

const CAPACITY_LABEL = /capacity/i;
const POWER_LABEL = /^(power|motor power|engine power|engine|power required|power source)$/i;

export type CompareRow = { label: string; values: string[] };

/** Lines up specs across products, grouping differently named capacity and power rows (§6.6). */
export function compareRows(items: Product[]): CompareRow[] {
  const grouped = (test: RegExp) =>
    items.map((item) =>
      item.specs
        .filter((spec) => test.test(spec.label))
        .map((spec) => spec.value)
        .join("; "),
    );
  const others = [
    ...new Set(
      items.flatMap((item) =>
        item.specs
          .map((spec) => spec.label)
          .filter((label) => !CAPACITY_LABEL.test(label) && !POWER_LABEL.test(label)),
      ),
    ),
  ];
  return [
    { label: "Category", values: items.map((i) => categoryName(i.category as CategorySlug)) },
    { label: "Power source", values: items.map(powerSourceLabel) },
    { label: "Capacity", values: grouped(CAPACITY_LABEL) },
    { label: "Power", values: grouped(POWER_LABEL) },
    ...others.map((label) => ({
      label,
      values: items.map((item) => item.specs.find((s) => s.label === label)?.value ?? ""),
    })),
  ];
}
