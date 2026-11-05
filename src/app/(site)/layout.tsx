import type { ReactNode } from "react";
import { FloatingButtons } from "@/components/layout/floating-buttons";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { RouteProgress } from "@/components/layout/route-progress";
import { SiteToaster } from "@/components/layout/site-toaster";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import { CardSpotlight } from "@/components/motion/card-spotlight";
import { allProducts } from "@/lib/products";

const megaFeature = allProducts.find((product) => product.slug === "sb10-rice-huller-mill");

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-60 -translate-y-20 rounded-md bg-gold px-4 py-3 font-semibold text-charcoal focus:translate-y-0"
      >
        Skip to main content
      </a>
      <RouteProgress />
      <Header
        feature={
          megaFeature && {
            name: megaFeature.name,
            summary: megaFeature.summary,
            image: megaFeature.image,
            href: `/machinery/${megaFeature.slug}`,
          }
        }
      />
      <main id="main" tabIndex={-1} className="relative isolate outline-none">
        <PageBackdrop />
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FloatingButtons />
      <StoreHydrator />
      <CardSpotlight />
      <SmoothScroll />
      <SiteToaster />
    </>
  );
}
