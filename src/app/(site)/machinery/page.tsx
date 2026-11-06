import type { Metadata } from "next";
import { CatalogueView } from "@/components/product/catalogue-view";
import { allProducts, toCatalogueItem } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/machinery", {
  title: "Agricultural Machinery in Ghana | ABE Agro Hub",
  description:
    "Browse water pumps, rice mills, corn mills, threshers, sprayers and food-processing machines. Get a quote on WhatsApp, with delivery across Ghana.",
});

export default function MachineryPage() {
  return (
    <div className="page-top">
      <div className="page-container py-8 pb-16 md:py-12">
        <h1 className="text-4xl md:text-5xl">All machinery</h1>
        <p className="mt-2 mb-6 max-w-prose text-lg text-muted-foreground">
          Search {allProducts.length} machines, or narrow them down by the job, power source, scale
          or crop.
        </p>
        <CatalogueView items={allProducts.map(toCatalogueItem)} />
      </div>
    </div>
  );
}
