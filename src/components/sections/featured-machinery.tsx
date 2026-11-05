import Link from "next/link";
import { Button } from "@/components/ui/button";
import { featuredProducts, toCardProduct } from "@/lib/products";
import { FeaturedCarousel } from "./featured-carousel";
import { SectionHeading } from "./section-heading";

export function FeaturedMachinery() {
  return (
    <section className="border-y border-border bg-muted/50 py-12 md:py-20">
      <div className="page-container">
        <SectionHeading
          title="Featured machinery"
          intro="Popular machines for farms, mills and food businesses."
          action={
            <Button asChild variant="outline">
              <Link href="/machinery">View all machinery</Link>
            </Button>
          }
        />
        <FeaturedCarousel products={featuredProducts().map(toCardProduct)} />
      </div>
    </section>
  );
}
