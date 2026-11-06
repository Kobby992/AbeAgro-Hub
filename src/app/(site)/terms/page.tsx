import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("/terms", {
  title: "Terms of Use | ABE Agro Hub",
  description: "The terms for using the ABE Agro Hub website and requesting a quote.",
});

export default function TermsPage() {
  return (
    <ContentPage title="Terms of use">
      <div className="prose-abe">
        <p>By using this website, you agree to these terms.</p>
        <h2>Quotes and orders</h2>
        <p>
          This website does not sell machines directly and takes no payment. Sending a quote request
          does not create an order. Price, availability, payment, warranty and delivery are
          confirmed by our sales team and agreed with you for each quote.
        </p>
        <h2>Product information</h2>
        <p>
          We work to keep product information accurate, but specifications are often typical values
          and can vary by model or supply. Details marked &quot;To be confirmed by sales&quot; have
          not been confirmed yet. Please confirm anything important to you with our sales team
          before you buy.
        </p>
        <h2>Using machines safely</h2>
        <p>
          Guides on this website are general information. Always follow the manufacturer&apos;s
          instructions and product labels, and use the right safety equipment.
        </p>
        <h2>Product names</h2>
        <p>
          Product and brand names are used only to identify products. Their use does not mean the
          brand owner endorses or partners with {site.name}.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </ContentPage>
  );
}
