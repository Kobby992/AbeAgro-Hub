"use client";

import { useEffect } from "react";
import { useCompareStore } from "@/store/compare";
import { useQuoteStore } from "@/store/quote";

/** Loads the saved lists after mount, so the server and first client render match. */
export function StoreHydrator() {
  useEffect(() => {
    void useQuoteStore.persist.rehydrate();
    void useCompareStore.persist.rehydrate();
  }, []);
  return null;
}
