import { Globe2, History, MessageCircle, Tractor } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { BranchList } from "@/components/sections/branch-list";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { allProducts } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/about", {
  title: "About ABE Agro Hub | Agricultural Machinery Since 1978",
  description:
    "Established in 1978 as Abdul Baai Enterprise, ABE Agro Hub supplies agricultural machinery to farmers and agribusinesses across Ghana, Togo, Burkina Faso and Côte d'Ivoire.",
});

// The story and vision are the owner's own words (November 2026). Team details are on the owner checklist.
const REASONS = [
  {
    Icon: History,
    title: "Nearly five decades of experience",
    text: `Established in ${site.founded} as ${site.formerName}.`,
  },
  {
    Icon: Globe2,
    title: "Serving four countries",
    text: "Farmers and agribusinesses in Ghana, Togo, Burkina Faso and Côte d'Ivoire, with delivery across Ghana.",
  },
  {
    Icon: Tractor,
    title: "A range built around the work",
    text: `${allProducts.length} machines across ${categories.length} categories, from land clearing and irrigation to milling, food processing and construction.`,
  },
  {
    Icon: MessageCircle,
    title: "Real people on WhatsApp",
    text: "Ask questions and get your quote from our sales team on the app you already use.",
  },
];

export default function AboutPage() {
  return (
    <ContentPage title="About ABE Agro Hub" intro={site.tagline}>
      <div className="prose-abe">
        <p>
          ABE Agro Hub, established in 1978 as Abdul Baai Enterprise, is a trusted agricultural
          machinery supplier serving farmers and agribusinesses across Ghana, Togo, Burkina Faso and
          Côte d&apos;Ivoire. Building on nearly five decades of experience, we are evolving into a
          technology-driven agricultural marketplace, combining quality machinery, AI-powered
          solutions and reliable after-sales support to make mechanization more accessible and
          affordable.
        </p>
        <h2>Our vision</h2>
        <p>{site.vision.replace(/^To/, "Our vision is to")}</p>
        <p className="font-semibold">ABE Agro Hub — Mechanizing Agriculture. Empowering Nations.</p>
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

      <h2 className="mt-10 mb-4 text-3xl">Our branches</h2>
      <p className="mb-4 max-w-prose text-muted-foreground">
        Visit or call any of our branches. We are open {site.hours}.
      </p>
      <BranchList />

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
