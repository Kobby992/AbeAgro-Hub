import { Bird, CookingPot, Nut, ShowerHead, SprayCan, Wheat, Wrench } from "lucide-react";
import Link from "next/link";
import { ViewTransition, type ComponentType, type SVGProps } from "react";
import {
  DropIcon,
  GearIcon,
  LeafIcon,
  MillIcon,
  RiceGrainIcon,
  TractorIcon,
} from "@/components/icons";
import { TiltCard } from "@/components/motion/tilt-card";
import { categoryName, type CategorySlug } from "@/config/categories";

const icons: Record<
  CategorySlug,
  {
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    motion: "icon-bounce" | "icon-sway" | "icon-spin";
  }
> = {
  "land-preparation": { Icon: TractorIcon, motion: "icon-bounce" },
  planting: { Icon: LeafIcon, motion: "icon-sway" },
  "crop-protection": { Icon: SprayCan, motion: "icon-sway" },
  irrigation: { Icon: DropIcon, motion: "icon-bounce" },
  "post-harvest": { Icon: Wheat, motion: "icon-sway" },
  "rice-processing": { Icon: RiceGrainIcon, motion: "icon-sway" },
  "grain-milling": { Icon: MillIcon, motion: "icon-bounce" },
  "food-processing": { Icon: CookingPot, motion: "icon-bounce" },
  "groundnut-processing": { Icon: Nut, motion: "icon-bounce" },
  "animal-feed": { Icon: Bird, motion: "icon-bounce" },
  "engines-power": { Icon: GearIcon, motion: "icon-spin" },
  "spare-parts": { Icon: Wrench, motion: "icon-sway" },
  utility: { Icon: ShowerHead, motion: "icon-sway" },
};

export function CategoryIconTile({
  category,
  morph = false,
}: {
  category: CategorySlug;
  /** Morphs between the home tile and the category page header (BUILD_SPEC §5.1). */
  morph?: boolean;
}) {
  const { Icon, motion } = icons[category];
  const tile = (
    <span
      data-cat={category}
      className="icon-tile flex size-12 items-center justify-center rounded-md bg-cat text-cat-on"
    >
      <Icon aria-hidden className={`size-6 ${motion}`} />
    </span>
  );
  return morph ? (
    <ViewTransition name={`category-${category}`} share="morph" default="none">
      {tile}
    </ViewTransition>
  ) : (
    tile
  );
}

/** "Shop by task" tile (BUILD_SPEC §5.2-3). */
export function CategoryTile({
  category,
  href,
  preview,
}: {
  category: CategorySlug;
  href: string;
  preview?: "hover";
}) {
  return (
    <TiltCard className="h-full">
      <Link
        href={href}
        data-cat={category}
        data-preview={preview}
        className="group lift-card task-tile flex h-full min-h-40 flex-col justify-between gap-6 rounded-lg p-5"
      >
        <CategoryIconTile category={category} morph />
        <span className="text-lg leading-snug font-bold tracking-tight">
          {categoryName(category)}
        </span>
      </Link>
    </TiltCard>
  );
}
