"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";

/**
 * Cross-fades pages; named elements inside morph between them (BUILD_SPEC §5.1).
 *
 * Only a change of page may animate. React ignores input events from the start of a view transition
 * until the browser has captured the page, and the router commits again after a new page is showing.
 * Animating those updates silently lost whatever a customer entered during that moment, such as a
 * dropdown choice or an autofilled field, even though the field still looked filled in.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} update="none">
      {children}
    </ViewTransition>
  );
}
