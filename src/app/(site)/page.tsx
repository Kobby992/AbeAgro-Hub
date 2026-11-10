import { FaqTeaser } from "@/components/sections/faq-teaser";
import { FeaturedMachinery } from "@/components/sections/featured-machinery";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { KobbyBand } from "@/components/sections/kobby-band";
import { ShopByTask } from "@/components/sections/shop-by-task";
import { SolutionsCards } from "@/components/sections/solutions-cards";
import { TrustStrip } from "@/components/sections/trust-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMeta, websiteJsonLd } from "@/lib/seo";

export const metadata = pageMeta("/", {
  title: "Agricultural Machinery & Food-Processing Equipment in Ghana | ABE Agro Hub",
  description:
    "Water pumps, rice mills, corn mills, sprayers and food-processing machines, supplied since 1978 and delivered across Ghana. Get a quote on WhatsApp.",
});

// Section order from BUILD_SPEC §6.2.
export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <Hero />
      <TrustStrip />
      <ShopByTask />
      <FeaturedMachinery />
      <SolutionsCards />
      <HowItWorks />
      <KobbyBand />
      <FaqTeaser />
      <FinalCta />
    </>
  );
}
