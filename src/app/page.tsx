import Image from "next/image";
import { Button } from "@/components/ui/button";
import { site, whatsappUrl } from "@/config/site";

// Holding page for Phase 0. The real home page (BUILD_SPEC §6.2) replaces it in Phase 2.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-6 px-4 py-12">
      <Image
        src="/brand/logo-full.png"
        alt={site.name}
        width={1536}
        height={659}
        priority
        className="h-auto w-56"
      />
      <p className="font-semibold text-primary">{site.tagline}</p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        The right machine. The right support.
      </h1>
      <p className="text-lg">
        Agricultural machinery and food-processing equipment, with nationwide delivery across Ghana.
        Our new website is on the way. In the meantime, message our sales team for a quote.
      </p>
      <Button asChild size="lg" className="min-h-11">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Get a quote on WhatsApp
        </a>
      </Button>
      <p className="text-muted-foreground">
        {site.location} · Open {site.hours} ·{" "}
        <a className="underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </p>
    </main>
  );
}
