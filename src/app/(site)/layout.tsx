import { ViewTransition, type ReactNode } from "react";
import { FloatingButtons } from "@/components/layout/floating-buttons";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RouteProgress } from "@/components/layout/route-progress";
import { SiteToaster } from "@/components/layout/site-toaster";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { StoreHydrator } from "@/components/layout/store-hydrator";
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
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Cross-fades pages; named elements inside morph between them (BUILD_SPEC §5.1). */}
        <ViewTransition>{children}</ViewTransition>
      </main>
      <Footer />
      <FloatingButtons />
      <StoreHydrator />
      <SmoothScroll />
      <SiteToaster />
    </>
  );
}
