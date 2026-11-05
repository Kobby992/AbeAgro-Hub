import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <div className="max-w-3xl divide-y divide-border border-y border-border">
        {faqs.slice(0, 4).map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown
                aria-hidden
                className="size-5 shrink-0 text-forest transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="max-w-prose pb-4">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
