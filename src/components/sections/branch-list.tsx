import { Building2, Phone } from "lucide-react";
import { branches } from "@/config/site";

/** The head office and branches with click-to-call numbers (owner's list, November 2026). */
export function BranchList({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {branches.map((branch) => (
        <li key={branch.name} className="gradient-card rounded-lg p-5">
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {branch.label}
          </p>
          <Heading className="mt-1 flex items-center gap-2 text-xl">
            <Building2 aria-hidden className="size-5 shrink-0 text-forest" />
            {branch.name}
          </Heading>
          <a
            href={`tel:${branch.tel}`}
            className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
          >
            <Phone aria-hidden className="size-4 shrink-0" />
            <span>
              <span className="sr-only">Call {branch.name} on </span>
              {branch.phoneDisplay}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
