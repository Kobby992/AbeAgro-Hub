import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";

// Pages later build phases will add. A real route at any of these paths takes priority over this
// catch-all automatically, so each phase just adds its page. Delete this file after Phase 5.
const COMING_SOON = new Set([
  "machinery",
  "compare",
  "quote",
  "solutions",
  "how-it-works",
  "about",
  "partners",
  "faq",
  "contact",
  "privacy",
  "terms",
]);

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ placeholder: string[] }>;
}) {
  const { placeholder } = await params;
  if (!COMING_SOON.has(placeholder[0] ?? "")) notFound();

  return (
    <div className="page-top">
      <div className="page-container flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-4 py-16">
        <h1 className="text-4xl">This page is on its way</h1>
        <p className="text-lg">
          We are still building this part of the site. Our sales team can help you right now on
          WhatsApp.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={GENERAL_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
              Get a quote on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
