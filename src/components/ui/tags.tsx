import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { CategorySlug } from "@/config/categories";
import { cn } from "@/lib/utils";

/** Category label in the category's tint and ink colours. */
export function CategoryBadge({
  category,
  className,
  children,
}: {
  category: CategorySlug;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      data-cat={category}
      className={cn(
        "inline-block rounded-sm bg-cat-tint px-2 py-0.5 text-xs font-semibold text-cat-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks a spec value the catalogue has not confirmed (BUILD_SPEC §3.2). */
export function ConfirmHint({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm border border-dashed border-input px-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      To be confirmed by sales
    </span>
  );
}

/** Number of items, for the quote list and compare buttons. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-charcoal",
        className,
      )}
    >
      {count}
    </span>
  );
}

/** A spec shown like a stamped machine nameplate. */
export function SpecPlate({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-col rounded-sm border border-input bg-card px-2 py-1 leading-tight",
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="line-clamp-2 text-sm font-semibold tracking-tight">{value}</span>
    </span>
  );
}

type FilterChipProps = ComponentProps<"button"> & {
  selected?: boolean;
  category?: CategorySlug;
};

/** Toggle for catalogue filters. Selection shows with a tick as well as colour. */
export function FilterChip({
  selected = false,
  category,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      data-cat={category}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-cat-ink px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "bg-cat-ink text-white" : "bg-card text-cat-ink",
        className,
      )}
      {...props}
    >
      {selected && <Check aria-hidden className="size-4" />}
      {children}
    </button>
  );
}
