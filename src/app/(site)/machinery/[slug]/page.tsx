import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ImageZoom } from "@/components/product/image-zoom";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryBadge, ConfirmHint } from "@/components/ui/tags";
import { categoryName, type CategorySlug } from "@/config/categories";
import { branchTowns } from "@/config/site";
import {
  allProducts,
  getProduct,
  needsConfirmingValue,
  relatedProducts,
  toCardProduct,
} from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";
import { TrackOnMount } from "@/components/analytics/track-on-mount";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMeta, productJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return pageMeta(`/machinery/${product.slug}`, {
    title: `${product.name} in Ghana | ABE Agro Hub`,
    description: product.summary,
    image: product.image,
  });
}

const SECTIONS = [
  ["overview", "Overview"],
  ["features", "Key features"],
  ["specifications", "Specifications"],
  ["uses", "Typical uses"],
  ["also-need", "You might also need"],
  ["delivery", "Delivery and support"],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-6">
      <h2 className="mb-3 text-3xl">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = product.category as CategorySlug;
  const categoryLabel = categoryName(category);
  const related = relatedProducts(product).map(toCardProduct);

  return (
    <div className="page-top">
      <div className="page-container pt-2 pb-16">
        <TrackOnMount name="product_viewed" props={{ slug: product.slug, category }} />
        <JsonLd data={productJsonLd(product)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { label: "Machinery", href: "/machinery" },
            { label: categoryLabel, href: `/machinery/c/${category}` },
            { label: product.shortName, href: `/machinery/${product.slug}` },
          ])}
        />
        <Breadcrumbs
          trail={[
            { label: "Machinery", href: "/machinery" },
            { label: categoryLabel, href: `/machinery/c/${category}` },
            { label: product.shortName },
          ]}
        />

        <div data-fly-root className="mt-2 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <ImageZoom
            slug={product.slug}
            category={category}
            image={product.image}
            alt={`${product.name} — ${categoryLabel}`}
          />
          <div>
            <CategoryBadge category={category}>{categoryLabel}</CategoryBadge>
            <h1 className="mt-2 text-4xl">{product.name}</h1>
            <p className="mt-3 max-w-prose text-lg">{product.summary}</p>
            <ProductActions
              slug={product.slug}
              name={product.name}
              shortName={product.shortName}
              category={categoryLabel}
            />
          </div>
        </div>

        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-4">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-8">
          <Section id="overview" title="Overview">
            <p className="max-w-prose">{product.description}</p>
          </Section>

          <Section id="features" title="Key features">
            <ul className="max-w-prose space-y-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check aria-hidden className="mt-1 size-5 shrink-0 text-forest" />
                  {feature}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="specifications" title="Specifications">
            <table className="w-full max-w-3xl text-left">
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-border align-top">
                    <th scope="row" className="w-2/5 py-2.5 pr-4 font-semibold">
                      {spec.label}
                    </th>
                    <td className="py-2.5">
                      {spec.value}
                      {needsConfirmingValue(spec.value) && <ConfirmHint className="ml-2" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="uses" title="Typical uses">
            <p className="max-w-prose">{product.typicalUses}</p>
          </Section>

          <Section id="also-need" title="What you might also need">
            <ProductGrid products={related} compare={false} label="Related machines" />
          </Section>

          <Section id="delivery" title="Delivery and support">
            <div className="max-w-prose space-y-3">
              <p>We deliver nationwide across Ghana from our branches in {branchTowns}.</p>
              <p>
                Payment methods and warranty terms are discussed and agreed with you when your quote
                is prepared.
              </p>
              <p>
                Have a question about installation or parts for this machine?{" "}
                <a
                  href={whatsappLink(
                    `Hello ABE Agro Hub 👋\nI have a question about installation or parts for the ${product.name}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-forest underline underline-offset-4"
                >
                  Ask our sales team on WhatsApp
                </a>
                .
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
