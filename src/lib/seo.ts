import type { Metadata } from "next";
import { categoryName, type CategorySlug } from "@/config/categories";
import { branches, site, WHATSAPP_NUMBER } from "@/config/site";
import type { Product } from "@/lib/products";

const DEFAULT_IMAGE = "/og-default.jpg";
const MAX_DESCRIPTION = 155;

function absolute(pathOrUrl: string): string {
  return new URL(pathOrUrl, site.url).toString();
}

/** Trims at a word boundary, so a search result never ends mid-word. */
export function clipDescription(text: string): string {
  if (text.length <= MAX_DESCRIPTION) return text;
  const clipped = text.slice(0, MAX_DESCRIPTION);
  return `${clipped.slice(0, clipped.lastIndexOf(" "))}…`;
}

/** Title, description, canonical URL and link previews for WhatsApp and social apps (§11). */
export function pageMeta(
  pathname: string,
  {
    title,
    description,
    image = DEFAULT_IMAGE,
    robots,
  }: { title: string; description: string; image?: string; robots?: Metadata["robots"] },
): Metadata {
  const clipped = clipDescription(description);
  return {
    title,
    description: clipped,
    alternates: { canonical: pathname },
    openGraph: {
      title,
      description: clipped,
      url: pathname,
      siteName: site.name,
      locale: "en_GH",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: clipped, images: [image] },
    ...(robots ? { robots } : {}),
  };
}

/**
 * Opening hours are left out until the owner confirms the days (§11): structured data must not
 * state what the business has not confirmed.
 */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#business`,
    name: site.name,
    url: site.url,
    logo: absolute("/brand/logo-full.png"),
    image: absolute("/brand/logo-full.png"),
    telephone: `+${WHATSAPP_NUMBER}`,
    email: site.email,
    alternateName: site.formerName,
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressRegion: "Greater Accra Region",
      addressCountry: "GH",
    },
    areaServed: ["GH", "TG", "BF", "CI"],
    department: branches
      .filter((branch) => branch.label === "Branch")
      .map((branch) => ({
        "@type": "LocalBusiness",
        name: `${site.name} ${branch.name}`,
        telephone: branch.tel,
        address: { "@type": "PostalAddress", addressLocality: branch.name, addressCountry: "GH" },
      })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/machinery?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** No brand and no offers: ABE claims no brand partnerships and never publishes prices (§11). */
export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: absolute(product.image),
    url: absolute(`/machinery/${product.slug}`),
    category: categoryName(product.category as CategorySlug),
  };
}

export function breadcrumbJsonLd(trail: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(({ label, href }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: label,
      item: absolute(href),
    })),
  };
}

export function faqJsonLd(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
