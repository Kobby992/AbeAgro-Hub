import { MapPin, MessageCircle, Tractor, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { allProducts } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/about", {
  title: "About ABE Agro Hub | Agricultural Machinery, Kasoa, Ghana",
  description:
    "ABE Agro Hub supplies agricultural machinery and food-processing equipment from Kasoa, delivering across Ghana.",
});

// Only confirmed facts appear here. Founding year, team and services are on the owner checklist.
const REASONS = [
  {
    Icon: Tractor,
    title: "A range built around the work",
    text: `${allProducts.length} machines across ${categories.length} categories, from land clearing and irrigation to milling and food processing.`,
  },
  {
    Icon: MessageCircle,
    title: "Real people on WhatsApp",
    text: "Ask questions and get your quote from our sales team on the app you already use.",
  },
  {
    Icon: Truck,
    title: "Delivery across Ghana",
    text: "Wherever your farm or business is, we deliver nationwide from our base.",
  },
  {
    Icon: MapPin,
    title: "Based in Kasoa",
    text: `We are in the Central Region and open ${site.hours}.`,
  },
];

export default function AboutPage() {
  return (
    <ContentPage title="About ABE Agro Hub" intro={site.tagline}>
      <div className="prose-abe">
        <p>
          ABE Agro Hub supplies agricultural machinery and food-processing equipment to farmers,
          millers, agro-processors, food businesses, cooperatives and institutions across Ghana.
        </p>
        <h2>What we are here to do</h2>
        <p>
          The right machine can change what a farm or small business is able to do. It can turn a
          harvest into clean rice, flour or gari, keep vegetables watered through the dry season,
          and take the hardest work off people&apos;s hands. We want farmers and processors to find
          the right machine, and to feel sure about it before they buy.
        </p>
        <h2>How we work</h2>
        <p>
          We do not publish prices or take payment online. Tell us what you need, and our sales team
          confirms the current price and availability with you directly. Payment and warranty terms
          are agreed with each quote, so you know where you stand before you commit.
        </p>
      </div>

      <h2 className="mt-10 mb-4 text-3xl">Why buy from ABE</h2>
      <ul className="grid max-w-4xl gap-4 sm:grid-cols-2">
        {REASONS.map(({ Icon, title, text }) => (
          <li key={title} className="gradient-card rounded-lg p-5">
            <Icon aria-hidden className="size-6 text-forest" />
            <h3 className="mt-2 text-xl">{title}</h3>
            <p className="mt-1 text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/machinery">Browse machinery</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </ContentPage>
  );
}
