"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { CountBadge } from "@/components/ui/tags";
import { useQuoteDrawer } from "@/store/quote";

/** Badge plus hidden words, so the link's spoken name always contains what is on screen. */
export function QuoteCount({ count }: { count: number }) {
  return (
    <>
      {count > 0 ? <CountBadge count={count} /> : <span className="sr-only">0</span>}
      <span className="sr-only">{count === 1 ? "item" : "items"}</span>
    </>
  );
}

/**
 * Opens the quick-view drawer, and is a real link to /quote underneath. Prefetching is off because
 * this sits on every page, and the form's code is not needed until someone goes to it.
 */
export function QuoteListLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();
  const setOpen = useQuoteDrawer((state) => state.setOpen);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (pathname === "/quote") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(true);
  }

  return <Link href="/quote" prefetch={false} onClick={handleClick} {...props} />;
}
