import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";

export function FinalCta() {
  return (
    <section className="page-container pb-10 md:pb-16">
      <div className="gold-panel flex flex-col items-start gap-5 rounded-xl p-6 text-charcoal shadow-lg md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="max-w-xl text-3xl md:text-4xl">Get a quote on WhatsApp in 2 minutes.</h2>
          <p className="mt-2 text-lg">Our sales team replies with price and availability.</p>
        </div>
        <Button asChild size="lg">
          <a href={GENERAL_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden />
            Get a quote on WhatsApp
          </a>
        </Button>
      </div>
    </section>
  );
}
