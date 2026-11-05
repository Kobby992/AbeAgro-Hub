"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { CategoryBadge, SpecPlate } from "@/components/ui/tags";
import { categoryName, type CategorySlug } from "@/config/categories";
import { cn } from "@/lib/utils";

export type MachineCardProps = {
  name: string;
  summary: string;
  image: string;
  category: CategorySlug;
  href: string;
  quoteHref: string;
  specs: { label: string; value: string }[];
  /** Receives the pressed button, so the caller can run FlyToQuote from it. */
  onAdd?: (trigger: HTMLButtonElement) => void;
  compared?: boolean;
  onCompareChange?: (compared: boolean) => void;
  compareDisabled?: boolean;
  preview?: "hover";
};

/**
 * Catalogue card (BUILD_SPEC §5.2-4, §6.3). All actions stay visible and usable without hover.
 * Hover only adds the lift, the image zoom, the Get quote slide and the spec plates fading in;
 * on touch screens the plates are simply always shown.
 */
export function MachineCard({
  name,
  summary,
  image,
  category,
  href,
  quoteHref,
  specs,
  onAdd,
  compared = false,
  onCompareChange,
  compareDisabled = false,
  preview,
}: MachineCardProps) {
  const previewing = preview === "hover";

  return (
    <article
      data-cat={category}
      data-preview={preview}
      data-fly-root
      className="group lift-card flex h-full flex-col rounded-lg border-t-[3px] border-cat bg-card shadow-sm"
    >
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <div className="machine-stage">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
            className={cn(
              "object-contain p-4 group-focus-within:scale-[1.04] group-hover:scale-[1.04]",
              previewing && "scale-[1.04]",
            )}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <CategoryBadge category={category} className="self-start">
          {categoryName(category)}
        </CategoryBadge>
        <h3 className="text-lg leading-tight">
          <Link href={href} className="hover:underline">
            {name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{summary}</p>

        <div
          className={cn(
            "flex flex-wrap gap-1.5 pt-1 transition-opacity duration-250",
            "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
            previewing && "[@media(hover:hover)]:opacity-100",
          )}
        >
          {specs.slice(0, 2).map((spec) => (
            <SpecPlate key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button
            asChild
            className={cn(
              "w-full transition-transform duration-250 ease-out",
              "[@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-hover:translate-y-0",
              previewing && "[@media(hover:hover)]:translate-y-0",
            )}
          >
            <a
              href={quoteHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get quote for ${name} on WhatsApp`}
            >
              Get quote
            </a>
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={href} aria-label={`Details for ${name}`}>
                Details
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Add ${name} to quote list`}
              onClick={(event) => onAdd?.(event.currentTarget)}
            >
              <Plus aria-hidden />
            </Button>
          </div>
          {onCompareChange && (
            <Checkbox
              label="Compare"
              aria-label={`Compare ${name}`}
              className="text-sm"
              checked={compared}
              disabled={compareDisabled && !compared}
              onChange={(event) => onCompareChange(event.target.checked)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
