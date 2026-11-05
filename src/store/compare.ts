import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@/store/safe-storage";

export const MAX_COMPARE = 3;

type CompareState = {
  slugs: string[];
  /** Adds or removes a product. Adding does nothing once the list holds three. */
  setCompared: (slug: string, compared: boolean) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      setCompared(slug, compared) {
        const { slugs } = get();
        if (!compared) {
          set({ slugs: slugs.filter((item) => item !== slug) });
        } else if (!slugs.includes(slug) && slugs.length < MAX_COMPARE) {
          set({ slugs: [...slugs, slug] });
        }
      },
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "abe-compare-list",
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
    },
  ),
);
