import type { Metadata } from "next";
import { QuotePageView } from "@/components/quote/quote-page-view";

export const metadata: Metadata = {
  title: "Your Quote List | ABE Agro Hub",
  description: "Review your machines and send a quote request to our sales team on WhatsApp.",
  robots: { index: false, follow: true },
};

export default function QuotePage() {
  return (
    <div className="page-top">
      <div className="page-container py-8 pb-16 md:py-12">
        <QuotePageView />
      </div>
    </div>
  );
}
