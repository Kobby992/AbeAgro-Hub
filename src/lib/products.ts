import type { MachineCardProps } from "@/components/product/machine-card";
import { categoryName, type CategorySlug } from "@/config/categories";
import { productQuoteLink } from "@/lib/whatsapp";
import products from "../../content/products.json";

// Server side only: the full catalogue is too heavy to send to the browser.
export type Product = (typeof products)[number];

export const allProducts = products;

// BUILD_SPEC §3.2. Phase 3 moves this into a `featured` field on each product.
const FEATURED_SLUGS = [
  "sb10-rice-huller-mill",
  "petrol-water-pump-3-inch-wp30",
  "corn-mill",
  "groundnut-sheller",
  "solo-port-423-motorized-mist-blower",
  "cassava-grater",
  "hammer-mill",
  "commercial-fufu-machine",
];

export type CardProduct = Omit<
  MachineCardProps,
  "onAdd" | "compared" | "onCompareChange" | "compareDisabled" | "preview"
> & { slug: string };

export function toCardProduct(product: Product): CardProduct {
  const category = product.category as CategorySlug;
  return {
    slug: product.slug,
    name: product.name,
    summary: product.summary,
    image: product.image,
    category,
    href: `/machinery/${product.slug}`,
    quoteHref: productQuoteLink({
      name: product.name,
      category: categoryName(category),
      slug: product.slug,
    }),
    specs: product.specs.filter((spec) => !["Model", "Type"].includes(spec.label)),
    needsConfirmation: product.needsConfirmation,
  };
}

export function featuredProducts(): Product[] {
  return FEATURED_SLUGS.flatMap((slug) => products.filter((product) => product.slug === slug));
}
