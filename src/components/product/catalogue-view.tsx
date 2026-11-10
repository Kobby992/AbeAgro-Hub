"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { MachineCard } from "@/components/product/machine-card";
import { CompareBar, GRID_CLASSES, useCardActions } from "@/components/product/product-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { FilterChip } from "@/components/ui/tags";
import { categories, type CategorySlug } from "@/config/categories";
import {
  applyFilters,
  CROP_OPTIONS,
  hasActiveFilters,
  NO_FILTERS,
  parseFilters,
  POWER_OPTIONS,
  SCALE_OPTIONS,
  serializeFilters,
  type Filters,
  type SortOrder,
} from "@/lib/catalogue";
import { useFlip } from "@/hooks/use-flip";
import type { CatalogueItem } from "@/lib/products";
import type { SearchEntry, SearchHit } from "@/lib/search";
import { cn } from "@/lib/utils";
import { takeSearchOrigin, track } from "@/lib/analytics";

type RunSearch = (query: string) => SearchHit<SearchEntry>[] | null;

const URL_CHANGED = "abe:catalogue-url";
const SEARCH_DELAY_MS = 150;

function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_CHANGED, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGED, onChange);
  };
}

function updateUrl(patch: Partial<Filters>) {
  for (const [filter, value] of Object.entries(patch)) {
    const text = Array.isArray(value) ? value.join(",") : String(value);
    if (filter !== "q" && filter !== "sort" && text) {
      track("filter_applied", { filter, value: text });
    }
  }
  const next = { ...parseFilters(location.search), ...patch };
  history.replaceState(null, "", `${location.pathname}${serializeFilters(next)}`);
  window.dispatchEvent(new Event(URL_CHANGED));
}

/** Tells the catalogue when a link elsewhere on the page, such as header search, changes the URL. */
function UrlWatcher() {
  const params = useSearchParams();
  useEffect(() => {
    window.dispatchEvent(new Event(URL_CHANGED));
  }, [params]);
  return null;
}

function highlight(text: string, ranges: [number, number][]): ReactNode {
  if (ranges.length === 0) return text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  [...ranges]
    .sort((a, b) => a[0] - b[0])
    .forEach(([start, end]) => {
      if (start < cursor) return;
      if (start > cursor) parts.push(text.slice(cursor, start));
      parts.push(
        <mark key={start} className="rounded-sm bg-gold/70 text-inherit">
          {text.slice(start, end + 1)}
        </mark>,
      );
      cursor = end + 1;
    });
  parts.push(text.slice(cursor));
  return parts;
}

export function CatalogueView({ items }: { items: CatalogueItem[] }) {
  // The server renders every machine. Filters from the URL apply as soon as the page hydrates.
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => location.search,
    () => "",
  );
  const filters = useMemo(() => parseFilters(search), [search]);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardActions = useCardActions();
  const [runSearch, setRunSearch] = useState<RunSearch | null>(null);
  const bySlug = useMemo(() => new Map(items.map((item) => [item.slug, item])), [items]);
  const wantsSearch = filters.q !== "";

  // The search library downloads the first time it is needed, which also keeps it out of what
  // other pages prefetch for their links to this one. Until then, all machines stay listed.
  useEffect(() => {
    if (!wantsSearch || runSearch) return;
    let cancelled = false;
    void import("@/lib/search").then(({ createProductSearch }) => {
      if (cancelled) return;
      const entries = items.map((item) => ({ ...item, category: item.categoryLabel }));
      setRunSearch(() => createProductSearch<SearchEntry>(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [wantsSearch, runSearch, items]);

  const hits = useMemo(() => runSearch?.(filters.q) ?? null, [runSearch, filters.q]);
  useEffect(() => {
    if (!filters.q || !hits) return;
    track("search_performed", {
      query: filters.q,
      results_count: hits.length,
      location: takeSearchOrigin(),
    });
  }, [hits, filters.q]);
  const searched = useMemo(
    () => hits?.flatMap((hit) => bySlug.get(hit.item.slug) ?? []) ?? null,
    [hits, bySlug],
  );
  const results = useMemo(() => applyFilters(items, filters, searched), [items, filters, searched]);
  const ranges = useMemo(
    () => new Map(hits?.map((hit) => [hit.item.slug, hit.nameRanges])),
    [hits],
  );
  const grid = useFlip<HTMLUListElement>(results.map((item) => item.slug).join());

  // Keep the box in step with links that set the query, without fighting someone who is typing.
  useEffect(() => {
    if (input.current && document.activeElement !== input.current) {
      input.current.value = filters.q;
    }
  }, [filters.q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function toggleCategory(slug: CategorySlug) {
    updateUrl({
      categories: filters.categories.includes(slug)
        ? filters.categories.filter((item) => item !== slug)
        : [...filters.categories, slug],
    });
  }

  function clearAll() {
    if (input.current) input.current.value = "";
    updateUrl(NO_FILTERS);
  }

  return (
    <div>
      <Suspense fallback={null}>
        <UrlWatcher />
      </Suspense>

      <div role="search" className="relative max-w-2xl">
        <label htmlFor="catalogue-search" className="sr-only">
          Search machinery
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={input}
          id="catalogue-search"
          type="search"
          autoComplete="off"
          placeholder="Try rice mill, water pump or corn mill"
          onChange={(event) => {
            const value = event.target.value.trim();
            clearTimeout(timer.current);
            timer.current = setTimeout(() => updateUrl({ q: value }), SEARCH_DELAY_MS);
          }}
          className="min-h-12 w-full rounded-md border border-input bg-card pr-3 pl-10 text-base"
        />
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="no-scrollbar -mx-(--gutter) mt-4 flex gap-2 overflow-x-auto px-(--gutter) py-1 lg:flex-wrap"
      >
        {categories.map((category) => (
          <FilterChip
            key={category.slug}
            category={category.slug}
            selected={filters.categories.includes(category.slug)}
            onClick={() => toggleCategory(category.slug)}
            className="shrink-0 whitespace-nowrap"
          >
            {category.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Power source">
          {(control) => (
            <Select
              {...control}
              value={filters.power}
              onChange={(event) => updateUrl({ power: event.target.value })}
            >
              <option value="">Any</option>
              {POWER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Scale">
          {(control) => (
            <Select
              {...control}
              value={filters.scale}
              onChange={(event) => updateUrl({ scale: event.target.value })}
            >
              <option value="">Any</option>
              {SCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Crop">
          {(control) => (
            <Select
              {...control}
              value={filters.crop}
              onChange={(event) => updateUrl({ crop: event.target.value })}
            >
              <option value="">Any</option>
              {CROP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Sort by">
          {(control) => (
            <Select
              {...control}
              value={filters.sort}
              onChange={(event) => updateUrl({ sort: event.target.value as SortOrder })}
            >
              <option value="featured">Featured</option>
              <option value="a-z">A–Z</option>
            </Select>
          )}
        </Field>
      </div>

      <div className="mt-5 mb-4 flex min-h-11 flex-wrap items-center justify-between gap-2">
        <p role="status" className="font-semibold">
          {results.length} {results.length === 1 ? "machine" : "machines"}
        </p>
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-lg font-semibold">No machines match that.</p>
          <p className="mt-1 text-muted-foreground">
            Try a word such as pump, or ask Kobby what would suit you.
          </p>
          <KobbyPromptButton
            prompt={filters.q ? `I am looking for: ${filters.q}` : undefined}
            className={cn(buttonVariants({ variant: "primary" }), "mt-4")}
          >
            Ask Kobby
          </KobbyPromptButton>
        </div>
      ) : (
        <>
          <h2 className="sr-only">Machines</h2>
          <ul ref={grid} className={GRID_CLASSES} aria-label="Machines">
            {results.map((item, index) => (
              <li key={item.slug} data-flip-id={item.slug}>
                <MachineCard
                  slug={item.slug}
                  name={item.name}
                  nameContent={highlight(item.name, ranges.get(item.slug) ?? [])}
                  priority={index < 2}
                  summary={item.summary}
                  image={item.image}
                  category={item.category}
                  href={item.href}
                  quoteHref={item.quoteHref}
                  specs={item.specs}
                  needsConfirmation={item.needsConfirmation}
                  {...cardActions(item)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <CompareBar />
    </div>
  );
}
