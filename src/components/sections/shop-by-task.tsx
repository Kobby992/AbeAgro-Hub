import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CategoryTile } from "@/components/product/category-tile";
import { Button } from "@/components/ui/button";
import type { CategorySlug } from "@/config/categories";
import { SectionHeading } from "./section-heading";

const PRIMARY: CategorySlug[] = [
  "irrigation",
  "rice-processing",
  "grain-milling",
  "food-processing",
  "crop-protection",
  "land-preparation",
  "groundnut-processing",
  "engines-power",
];

export function ShopByTask() {
  return (
    <section className="page-container py-12 md:py-20">
      <SectionHeading
        title="Shop by task"
        intro="Find machinery by the job you need to get done."
        action={
          <Button asChild variant="outline">
            <Link href="/machinery">View all machinery</Link>
          </Button>
        }
      />
      <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {PRIMARY.map((category) => (
          <StaggerItem key={category} className="h-full">
            <CategoryTile category={category} href={`/machinery/c/${category}`} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
