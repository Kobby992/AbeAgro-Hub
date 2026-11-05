"use client";

import { useEffect } from "react";
import { useQuoteStore } from "@/store/quote";

/** Loads the saved quote list after mount, so the server and first client render match. */
export function StoreHydrator() {
  useEffect(() => {
    void useQuoteStore.persist.rehydrate();
  }, []);
  return null;
}
