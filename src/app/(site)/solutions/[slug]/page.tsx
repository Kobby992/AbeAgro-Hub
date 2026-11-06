import { ChevronDown, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AddAllToQuote } from "@/components/product/add-all-to-quote";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { solutions } from "@/config/solutions";
import { guides } from "@/lib/guides";
import { getProduct, toCardProduct } from "@/lib/products";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) return {};
  return pageMeta(`/solutions/${solution.slug}`, {
    title: `${solution.title} in Ghana | ABE Agro Hub`,
    description: solution.blurb,
    image: solution.image,
  });
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  const guide = guides[slug];
  if (!solution || !guide) notFound();

  const { Body, data } = guide;
  const machines = data.machines.flatMap((machine) => getProduct(machine) ?? []);

  return (
    <div className="page-top">
      <JsonLd
        data={breadcrumbJsonLd([
          { label: "Solutions", href: "/solutions" },
          { label: solution.title, href: `/solutions/${solution.slug}` },
        ])}
      />
      <header data-cat={solution.category} className="border-t-4 border-cat bg-cat-tint">
        <div className="page-container pt-2 pb-8">
          <Breadcrumbs
            trail={[{ label: "Solutions", href: "/solutions" }, { label: solution.title }]}
          />
          <h1 className="mt-2 text-4xl md:text-5xl">{solution.title}</h1>
          <p className="mt-3 max-w-prose text-lg">{solution.blurb}</p>
        </div>
      </header>

      <div className="page-container space-y-10 py-10 pb-16">
        <section aria-labelledby="process">
          <h2 id="process" className="mb-3 text-3xl">
            How it fits together
          </h2>
          <ol className="flex flex-col flex-wrap items-start gap-2 md:flex-row md:items-center">
            {data.steps.map((step, index) => (
              <Fragment key={step}>
                {index > 0 && (
                  <li aria-hidden className="text-forest">
                    <ChevronDown className="size-5 md:hidden" />
                    <ChevronRight className="hidden size-5 md:block" />
                  </li>
                )}
                <li className="rounded-md border border-input bg-card px-3 py-2 font-semibold">
                  {step}
                </li>
              </Fragment>
            ))}
          </ol>
        </section>

        <div className="prose-abe">
          <Body />
        </div>

        <section aria-labelledby="machines">
          <h2 id="machines" className="mb-3 text-3xl">
            Recommended machines
          </h2>
          <ProductGrid products={machines.map(toCardProduct)} compare={false} label="Machines" />
          <AddAllToQuote
            label="Add the whole set to quote"
            items={machines.map((machine) => ({ slug: machine.slug, name: machine.shortName }))}
          />
        </section>

        <section aria-labelledby="ask">
          <h2 id="ask" className="mb-3 text-3xl">
            Questions about your plans?
          </h2>
          <ul className="flex flex-col gap-2 lg:flex-row">
            {data.prompts.map((prompt) => (
              <li key={prompt} className="lg:flex-1">
                <KobbyPromptButton
                  prompt={prompt}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-full w-full py-2.5 text-left whitespace-normal",
                  )}
                >
                  {prompt}
                </KobbyPromptButton>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
