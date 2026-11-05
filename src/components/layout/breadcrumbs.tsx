import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm">
        {trail.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRight aria-hidden className="size-4 text-muted-foreground" />}
            {crumb.href ? (
              <Link href={crumb.href} className="inline-flex min-h-11 items-center hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
