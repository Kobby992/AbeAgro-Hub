import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

const MAX_LINES = 50;
const MAX_QTY = 999;

export type QuoteItem = { slug: string; qty: number; note?: string };

type QuoteState = {
  items: QuoteItem[];
  updatedAt: number | null;
  /**
   * Adds a line, or raises the quantity if the product is already listed.
   * Returns the new quantity, or 0 if the list is full.
   */
  add: (slug: string, qty?: number) => number;
};

// Private windows and blocked site data make localStorage throw (BUILD_SPEC §2).
const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      // The list still works for this visit.
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch {
      // Nothing to remove.
    }
  },
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      items: [],
      updatedAt: null,
      add(slug, qty = 1) {
        const { items } = get();
        const existing = items.find((item) => item.slug === slug);
        const nextQty = Math.min((existing?.qty ?? 0) + qty, MAX_QTY);
        if (!existing && items.length >= MAX_LINES) return 0;
        set({
          updatedAt: Date.now(),
          items: existing
            ? items.map((item) => (item.slug === slug ? { ...item, qty: nextQty } : item))
            : [...items, { slug, qty: nextQty }],
        });
        return nextQty;
      },
    }),
    {
      name: "abe-quote-list",
      storage: createJSONStorage(() => safeStorage),
      // Rehydrated from StoreHydrator after mount, so server and first client render both match.
      skipHydration: true,
    },
  ),
);

/** Badge count: the number of distinct items (BUILD_SPEC §8.1). */
export const selectQuoteCount = (state: QuoteState) => state.items.length;
