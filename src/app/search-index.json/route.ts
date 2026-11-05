import { NextResponse } from "next/server";
import { categoryName, type CategorySlug } from "@/config/categories";
import { allProducts } from "@/lib/products";

export const dynamic = "force-static";

/** Small product list the search palette fetches the first time it opens. */
export function GET() {
  return NextResponse.json(
    allProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      shortName: product.shortName,
      image: product.image,
      categorySlug: product.category,
      category: categoryName(product.category as CategorySlug),
      summary: product.summary,
      uses: product.typicalUses,
      crops: product.crops,
    })),
  );
}
