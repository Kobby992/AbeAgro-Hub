import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CategoryIconTile } from "@/components/product/category-tile";
import { CompareBar, ProductGrid } from "@/components/product/product-grid";
import { SolutionCard } from "@/components/sections/solutions-cards";
import { Disclosure, DisclosureGroup } from "@/components/ui/disclosure";
import { categories, categoryName, type CategorySlug } from "@/config/categories";
import { solutions } from "@/config/solutions";
import { getCategoryContent, productsInCategory, toCardProduct } from "@/lib/products";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = category as CategorySlug;
  return pageMeta(`/machinery/c/${slug}`, {
    title: `${categoryName(slug)} Machinery in Ghana | ABE Agro Hub`,
    description: getCategoryContent(slug).intro,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!categories.some((item) => item.slug === category)) notFound();
  const slug = category as CategorySlug;
  const name = categoryName(slug);
  const content = getCategoryContent(slug);
  const related = solutions.filter((solution) => content.solutions.includes(solution.slug));

  return (
    <div className="page-top">
      <JsonLd
        data={breadcrumbJsonLd([
          { label: "Machinery", href: "/machinery" },
          { label: name, href: `/machinery/c/${slug}` },
        ])}
      />
      <JsonLd data={faqJsonLd(content.faqs)} />
      <header data-cat={slug} className="border-t-4 border-cat bg-cat-tint">
        <div className="page-container pt-2 pb-8 md:pb-10">
          <Breadcrumbs trail={[{ label: "Machinery", href: "/machinery" }, { label: name }]} />
          <div className="mt-2 flex items-center gap-4">
            <CategoryIconTile category={slug} morph />
            <h1 className="text-4xl md:text-5xl">{name}</h1>
          </div>
          <p className="mt-4 max-w-prose text-lg">{content.intro}</p>
        </div>
      </header>

      <div className="page-container space-y-12 py-10 pb-16">
        <section>
          <h2 className="sr-only">Machines</h2>
          <ProductGrid products={productsInCategory(slug).map(toCardProduct)} label="Machines" />
        </section>

        <section>
          <h2 className="mb-3 text-3xl">Buying tips</h2>
          <ul className="max-w-prose list-disc space-y-2 pl-5">
            {content.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="mb-3 text-3xl">Related guides</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((solution) => (
                <li key={solution.slug}>
                  <SolutionCard solution={solution} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-3xl">Common questions</h2>
          <DisclosureGroup>
            {content.faqs.map((faq) => (
              <Disclosure key={faq.question} summary={faq.question}>
                <p>{faq.answer}</p>
              </Disclosure>
            ))}
          </DisclosureGroup>
        </section>
      </div>

      <CompareBar />
    </div>
  );
}
