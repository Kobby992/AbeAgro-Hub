import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Disclosure, DisclosureGroup } from "@/components/ui/disclosure";
import faqs from "../../../content/faq.json";
import { SectionHeading } from "./section-heading";

export function FaqTeaser() {
  return (
    <section className="page-container pb-12 md:pb-20">
      <SectionHeading
        title="Questions buyers ask"
        action={
          <Button asChild variant="outline">
            <Link href="/faq">See all questions</Link>
          </Button>
        }
      />
      <DisclosureGroup>
        {faqs.slice(0, 4).map((faq) => (
          <Disclosure key={faq.question} summary={faq.question}>
            <p>{faq.answer}</p>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </section>
  );
}
