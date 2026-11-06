import { Clock, Mail, MapPin, MessageCircle, Phone, Truck } from "lucide-react";
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { ContentPage } from "@/components/layout/content-page";
import { Button } from "@/components/ui/button";
import { site, WHATSAPP_NUMBER } from "@/config/site";
import { whatsappLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/contact", {
  title: "Contact ABE Agro Hub | Kasoa, Ghana",
  description: `WhatsApp or call ${site.phoneDisplay}, or email ${site.email}. Based in Kasoa, open ${site.hours}, delivering nationwide.`,
});

const WHATSAPP_INTRO = "Hello ABE Agro Hub 👋";

export default function ContactPage() {
  const details = [
    { Icon: Phone, content: <a href={`tel:+${WHATSAPP_NUMBER}`}>Call {site.phoneDisplay}</a> },
    { Icon: Mail, content: <a href={`mailto:${site.email}`}>{site.email}</a> },
    { Icon: MapPin, content: site.location },
    { Icon: Clock, content: `Open ${site.hours}` },
    { Icon: Truck, content: "We deliver nationwide" },
  ];

  return (
    <ContentPage title="Contact us" intro="WhatsApp is the quickest way to reach our sales team.">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Button asChild size="lg">
            <a href={whatsappLink(WHATSAPP_INTRO)} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden />
              Chat on WhatsApp
            </a>
          </Button>
          <ul className="mt-6 space-y-1">
            {details.map(({ Icon, content }, index) => (
              <li
                key={index}
                className="flex min-h-11 items-center gap-3 font-semibold [&_a]:underline [&_a]:underline-offset-4"
              >
                <Icon aria-hidden className="size-5 shrink-0 text-forest" />
                {content}
              </li>
            ))}
          </ul>
          <iframe
            title="Map of Kasoa, Ghana"
            src="https://www.google.com/maps?q=Kasoa,+Ghana&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-6 h-72 w-full rounded-lg border border-border"
          />
        </div>
        <div>
          <h2 className="mb-4 text-3xl">Send us a message</h2>
          <EnquiryForm kind="contact" whatsappIntro={WHATSAPP_INTRO} />
        </div>
      </div>
    </ContentPage>
  );
}
