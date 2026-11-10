// Categories from BUILD_SPEC §3.1. Accent colours live in src/styles/tokens.css under [data-cat].
export const categories = [
  { slug: "land-preparation", name: "Land Preparation & Clearing" },
  { slug: "planting", name: "Planting" },
  { slug: "crop-protection", name: "Crop Protection" },
  { slug: "irrigation", name: "Irrigation & Water" },
  { slug: "post-harvest", name: "Threshing & Post-Harvest" },
  { slug: "rice-processing", name: "Rice Processing" },
  { slug: "grain-milling", name: "Grain Milling" },
  { slug: "food-processing", name: "Food Processing" },
  { slug: "groundnut-processing", name: "Groundnut Processing" },
  { slug: "animal-feed", name: "Animal Feed" },
  { slug: "engines-power", name: "Engines & Power" },
  { slug: "construction", name: "Construction Equipment" },
  { slug: "spare-parts", name: "Spare Parts" },
  { slug: "utility", name: "Utility Equipment" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function categoryName(slug: CategorySlug): string {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}
