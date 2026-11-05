import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { QuickQuoteLink } from "@/components/quote/quick-quote-link";
import { AddAllToQuote } from "@/components/product/add-all-to-quote";
import { Button } from "@/components/ui/button";
import { ConfirmHint } from "@/components/ui/tags";
import { compareRows, getProduct, needsConfirmingValue, productQuoteHref } from "@/lib/products";
import { MAX_COMPARE } from "@/store/compare";

export const metadata: Metadata = {
  title: "Compare Machines | ABE Agro Hub",
  description: "Compare up to three agricultural machines side by side.",
  robots: { index: false, follow: true },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { ids } = await searchParams;
  const slugs = [...new Set(String(ids ?? "").split(","))].slice(0, MAX_COMPARE);
  const products = slugs.flatMap((slug) => getProduct(slug) ?? []);

  return (
    <div className="page-top">
      <div className="page-container py-8 pb-16 md:py-12">
        <h1 className="text-4xl md:text-5xl">Compare machines</h1>

        {products.length === 0 ? (
          <div className="mt-6 rounded-lg border border-border bg-card p-6">
            <p className="text-lg font-semibold">No machines to compare yet.</p>
            <p className="mt-1 text-muted-foreground">
              Tick Compare on up to three machines in the catalogue, and they will appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/machinery">Browse machinery</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-2 mb-6 max-w-prose text-lg text-muted-foreground">
              Our sales team replies on WhatsApp with pricing, availability and delivery.
            </p>

            <div
              role="region"
              aria-label="Comparison table"
              tabIndex={0}
              className="-mx-(--gutter) overflow-x-auto px-(--gutter)"
            >
              <table className="w-full min-w-xl table-fixed border-collapse text-left">
                <thead>
                  <tr className="align-top">
                    <td className="w-28 md:w-44" />
                    {products.map((product) => (
                      <th key={product.slug} scope="col" className="p-2 font-normal">
                        <div data-cat={product.category} className="machine-stage rounded-md">
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 320px, 40vw"
                            className="object-contain p-2"
                          />
                        </div>
                        <Link
                          href={`/machinery/${product.slug}`}
                          className="mt-2 block font-display text-lg leading-tight font-bold [font-stretch:87.5%] hover:underline"
                        >
                          {product.name}
                        </Link>
                        <Button asChild size="sm" className="mt-2 w-full">
                          <QuickQuoteLink
                            slug={product.slug}
                            href={productQuoteHref(product)}
                            aria-label={`Get quote for ${product.name} on WhatsApp`}
                          >
                            Get quote
                          </QuickQuoteLink>
                        </Button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows(products).map((row) => (
                    <tr key={row.label} className="border-b border-border align-top">
                      <th scope="row" className="py-2.5 pr-2 font-semibold">
                        {row.label}
                      </th>
                      {row.values.map((value, index) => (
                        <td key={index} className="p-2.5">
                          {value || "—"}
                          {needsConfirmingValue(value) && <ConfirmHint className="mt-1 block" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="align-top">
                    <th scope="row" className="py-2.5 pr-2 font-semibold">
                      Key features
                    </th>
                    {products.map((product) => (
                      <td key={product.slug} className="p-2.5">
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          {product.features.map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <AddAllToQuote
              items={products.map((product) => ({ slug: product.slug, name: product.shortName }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
