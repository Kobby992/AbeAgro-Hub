import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/** Accordion row built on <details>, so it works without JavaScript. */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-forest transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="max-w-prose pb-4">{children}</div>
    </details>
  );
}

export function DisclosureGroup({ children }: { children: ReactNode }) {
  return <div className="max-w-3xl divide-y divide-border border-y border-border">{children}</div>;
}
