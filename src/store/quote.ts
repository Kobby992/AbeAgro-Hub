import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@/store/safe-storage";

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
  setQty: (slug: string, qty: number) => void;
  setNote: (slug: string, note: string) => void;
  remove: (slug: string) => void;
  /** Replaces the whole list. Used to clear it, and to undo clearing it. */
  replaceAll: (items: QuoteItem[]) => void;
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
      setQty(slug, qty) {
        const clamped = Math.min(Math.max(Math.round(qty) || 1, 1), MAX_QTY);
        set(({ items }) => ({
          updatedAt: Date.now(),
          items: items.map((item) => (item.slug === slug ? { ...item, qty: clamped } : item)),
        }));
      },
      setNote(slug, note) {
        set(({ items }) => ({
          updatedAt: Date.now(),
          items: items.map((item) => (item.slug === slug ? { ...item, note } : item)),
        }));
      },
      remove(slug) {
        set(({ items }) => ({
          updatedAt: Date.now(),
          items: items.filter((item) => item.slug !== slug),
        }));
      },
      replaceAll(items) {
        set({ items, updatedAt: Date.now() });
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

/** The quick-view drawer. `mounted` loads its code only once someone first opens it. */
export const useQuoteDrawer = create<{
  open: boolean;
  mounted: boolean;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  mounted: false,
  setOpen: (open) => set({ open, mounted: true }),
}));

/** Badge count: the number of distinct items (BUILD_SPEC §8.1). */
export const selectQuoteCount = (state: QuoteState) => state.items.length;
