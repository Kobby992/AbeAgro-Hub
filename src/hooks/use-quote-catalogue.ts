"use client";

import { useEffect, useState } from "react";
import type { CategorySlug } from "@/config/categories";

export type QuoteProduct = {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  categorySlug: CategorySlug;
};

export type QuoteCatalogue = Map<string, QuoteProduct>;

let request: Promise<QuoteCatalogue> | null = null;

function loadCatalogue(): Promise<QuoteCatalogue> {
  request ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<QuoteProduct[]>;
    })
    .then((products) => new Map(products.map((product) => [product.slug, product])))
    .catch((error: unknown) => {
      // Let the next attempt try again rather than remembering the failure.
      request = null;
      throw error;
    });
  return request;
}

/** Product names and photos for the quote list, which stores only slugs. */
export function useQuoteCatalogue() {
  const [catalogue, setCatalogue] = useState<QuoteCatalogue | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCatalogue().then(
      (loaded) => {
        if (!cancelled) setCatalogue(loaded);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogue, failed };
}
