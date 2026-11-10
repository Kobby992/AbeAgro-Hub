import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { Button } from "@/components/ui/button";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/how-it-works", {
  title: "How It Works | ABE Agro Hub",
  description:
    "Find a machine, tap Get quote and talk to our sales team on WhatsApp. We confirm price, availability and terms, then arrange delivery across Ghana.",
});

const STEPS = [
  {
    title: "Find a machine or ask Kamal",
    body: [
      "Search the catalogue, browse by the job you need done, or read a guide to starting a business such as a rice mill or corn-mill kiosk.",
      "Not sure what fits? Tell Kamal what you grow or process.",
    ],
  },
  {
    title: "Tap Get quote",
    body: [
      "WhatsApp opens with the machine, the quantity and a quote reference filled in. Press Send, and it reaches our sales team.",
      "Want several machines? Add them to your quote list and send them together.",
    ],
  },
  {
    title: "Get your price and delivery",
    body: [
      "Our sales team replies with price and availability. Payment methods and warranty terms are discussed and agreed with you when your quote is prepared.",
      "We then arrange delivery to you, anywhere in Ghana, from our branches in Accra, Kumasi, Ashaiman and Kasoa.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <ContentPage
      title="How it works"
      intro="There is no online checkout. You talk to a real person, who confirms everything before you pay."
    >
      <ol className="max-w-3xl space-y-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-display text-xl font-extrabold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="text-2xl">{step.title}</h2>
              {step.body.map((text) => (
                <p key={text} className="mt-2 max-w-prose">
                  {text}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/machinery">Browse machinery</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={GENERAL_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
            Get a quote on WhatsApp
          </a>
        </Button>
      </div>
    </ContentPage>
  );
}
