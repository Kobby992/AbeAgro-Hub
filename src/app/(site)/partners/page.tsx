import { BadgeCheck, Inbox, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { ContentPage } from "@/components/layout/content-page";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Partner with ABE Agro Hub | Manufacturers and Distributors",
  description:
    "Equipment manufacturers and distributors: talk to us about reaching agricultural buyers in Ghana through ABE Agro Hub.",
};

const WHATSAPP_INTRO = "Hello ABE Agro Hub 👋\nI'd like to discuss a partnership.";

const OFFERS = [
  {
    Icon: BadgeCheck,
    title: "Verified listings",
    text: "Present your equipment to relevant buyers in Ghana.",
  },
  {
    Icon: Inbox,
    title: "Qualified enquiries",
    text: "Receive requests from buyers about specific products.",
  },
  {
    Icon: Wrench,
    title: "Local support",
    text: "Explore delivery and after-sales arrangements with us.",
  },
];

export default function PartnersPage() {
  return (
    <ContentPage
      title="Reach agricultural buyers through ABE"
      intro="For equipment manufacturers and distributors. Partnerships are handled directly by our team, so tell us about your products."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {OFFERS.map(({ Icon, title, text }) => (
          <li key={title} className="rounded-lg bg-card p-5 shadow-sm">
            <Icon aria-hidden className="size-6 text-forest" />
            <h2 className="mt-2 text-xl">{title}</h2>
            <p className="mt-1 text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <Button asChild size="lg" className="mt-6">
        <a href={whatsappLink(WHATSAPP_INTRO)} target="_blank" rel="noopener noreferrer">
          Discuss a partnership on WhatsApp
        </a>
      </Button>

      <h2 className="mt-12 mb-4 text-3xl">Or send us your details</h2>
      <EnquiryForm kind="partner" whatsappIntro={WHATSAPP_INTRO} />
    </ContentPage>
  );
}
