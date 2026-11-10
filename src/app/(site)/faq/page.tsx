import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { Button } from "@/components/ui/button";
import { Disclosure, DisclosureGroup } from "@/components/ui/disclosure";
import faqs from "../../../../content/faq.json";
import { faqJsonLd, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = pageMeta("/faq", {
  title: "Frequently Asked Questions | ABE Agro Hub",
  description:
    "How to get a price, delivery across Ghana, payment and warranty, and where to find ABE Agro Hub.",
});

// Answers waiting on the owner or on Kamal's launch stay out of the page (BUILD_SPEC §6.9).
const published = faqs.filter(
  (faq) => faq.answer && !("needsOwner" in faq) && !("hiddenUntilKobby" in faq),
);
const groups = [...new Set(published.map((faq) => faq.group))];

export default function FaqPage() {
  return (
    <ContentPage title="Frequently asked questions">
      <JsonLd data={faqJsonLd(published)} />
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="mb-2 text-2xl">{group}</h2>
            <DisclosureGroup>
              {published
                .filter((faq) => faq.group === group)
                .map((faq) => (
                  <Disclosure key={faq.question} summary={faq.question}>
                    <p>{faq.answer}</p>
                  </Disclosure>
                ))}
            </DisclosureGroup>
          </section>
        ))}
      </div>
      <p className="mt-8 text-lg">Still have a question?</p>
      <Button asChild className="mt-2">
        <Link href="/contact">Contact us</Link>
      </Button>
    </ContentPage>
  );
}
