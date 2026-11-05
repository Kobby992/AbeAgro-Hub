import { categories, type CategorySlug } from "@/config/categories";

// Browser-safe catalogue filter logic. Filters live in the URL so results can be shared (§6.3).

export const POWER_OPTIONS = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "manual", label: "Manual" },
  { value: "tractor-pto", label: "Tractor" },
] as const;

export const SCALE_OPTIONS = [
  { value: "household", label: "Home or household" },
  { value: "small-business", label: "Small business" },
  { value: "commercial", label: "Commercial" },
] as const;

export const CROP_OPTIONS = [
  { value: "beans", label: "Beans" },
  { value: "cassava", label: "Cassava" },
  { value: "cocoa", label: "Cocoa" },
  { value: "groundnut", label: "Groundnut" },
  { value: "livestock-feed", label: "Livestock feed" },
  { value: "maize", label: "Maize" },
  { value: "millet", label: "Millet" },
  { value: "pepper", label: "Pepper" },
  { value: "rice", label: "Rice" },
  { value: "sorghum", label: "Sorghum" },
  { value: "soybean", label: "Soybean" },
  { value: "vegetables", label: "Vegetables" },
] as const;

export type SortOrder = "featured" | "a-z";

export type Filters = {
  q: string;
  categories: CategorySlug[];
  power: string;
  scale: string;
  crop: string;
  sort: SortOrder;
};

export const NO_FILTERS: Filters = {
  q: "",
  categories: [],
  power: "",
  scale: "",
  crop: "",
  sort: "featured",
};

export type Filterable = {
  name: string;
  category: CategorySlug;
  powerSource: string[];
  scale: string;
  crops: string[];
  featured: boolean;
  order: number;
};

const oneOf = (value: string | null, options: readonly { value: string }[]) =>
  options.some((option) => option.value === value) ? (value as string) : "";

/** Reads filters from a query string, ignoring anything unknown so old links keep working. */
export function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  const known = new Set<string>(categories.map((category) => category.slug));
  return {
    q: params.get("q")?.trim() ?? "",
    categories: (params.get("cat") ?? "")
      .split(",")
      .filter((slug): slug is CategorySlug => known.has(slug)),
    power: oneOf(params.get("power"), POWER_OPTIONS),
    scale: oneOf(params.get("scale"), SCALE_OPTIONS),
    crop: oneOf(params.get("crop"), CROP_OPTIONS),
    sort: params.get("sort") === "a-z" ? "a-z" : "featured",
  };
}

/** Writes filters to a query string, leaving out defaults to keep links short. */
export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categories.length > 0) params.set("cat", filters.categories.join(","));
  if (filters.power) params.set("power", filters.power);
  if (filters.scale) params.set("scale", filters.scale);
  if (filters.crop) params.set("crop", filters.crop);
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(filters: Filters): boolean {
  return serializeFilters({ ...filters, sort: "featured" }) !== "";
}

/**
 * Applies filters and sorting. `searched` holds search results in relevance order, or null when
 * there is no search. A search keeps its relevance order unless A–Z is chosen.
 */
export function applyFilters<T extends Filterable>(
  items: T[],
  filters: Filters,
  searched: T[] | null,
): T[] {
  const matching = (searched ?? items).filter(
    (item) =>
      (filters.categories.length === 0 || filters.categories.includes(item.category)) &&
      (!filters.power || item.powerSource.includes(filters.power)) &&
      (!filters.scale || item.scale === filters.scale) &&
      (!filters.crop || item.crops.includes(filters.crop)),
  );

  if (filters.sort === "a-z") {
    return [...matching].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (searched) return matching;
  return [...matching].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}
