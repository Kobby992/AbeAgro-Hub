import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { FieldStripes } from "@/components/motifs/field-stripes";
import { GearArc } from "@/components/motifs/gear-arc";
import { site } from "@/config/site";
import { HeroFloaters } from "./hero-floaters";
import { HeroSearch } from "./hero-search";

const HEADLINE = "The right machine. The right support.";

const POPULAR = [
  { label: "Water pumps", query: "water pump" },
  { label: "Rice mills", query: "rice mill" },
  { label: "Mist blower", query: "mist blower" },
  { label: "Groundnut sheller", query: "groundnut sheller" },
  { label: "Cassava grater", query: "cassava grater" },
];

export function Hero() {
  return (
    <section className="grain relative overflow-hidden bg-forest-900 text-white">
      <GearArc
        // Dark enough that the gold tagline and white headline stay AA where they cross the gear.
        color="#0a5c43"
        spin
        arcClassName="hidden lg:block"
        className="absolute -top-10 -right-28 size-72 md:size-96 lg:top-16 lg:-right-20 lg:size-[34rem]"
      />
      <FieldStripes draw className="absolute inset-x-0 bottom-0 h-36 w-full md:h-52 lg:h-64" />
      <HeroFloaters />

      <div className="relative page-container pt-28 pb-44 md:pb-60 lg:pt-36 lg:pb-72">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="font-semibold text-gold">{site.tagline}</p>
          <h1 className="mt-3 max-w-[14ch] text-hero">
            {HEADLINE.split(" ").map((word, index) => (
              <span key={index}>
                <span
                  className="rise-word"
                  style={{ "--rise-delay": `${index * 45}ms` } as CSSProperties}
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-prose text-lg">
            Water pumps, rice mills, sprayers and food-processing machines, delivered across Ghana
            from our base in Kasoa.
          </p>

          <HeroSearch />

          <div className="mt-3">
            <p className="sr-only">Popular searches</p>
            <ul className="flex flex-wrap gap-2">
              {POPULAR.map((item) => (
                <li key={item.query}>
                  <Link
                    href={`/machinery?q=${encodeURIComponent(item.query)}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/50 bg-forest-900 px-3.5 text-sm font-semibold hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <KobbyPromptButton className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-gold underline-offset-4 hover:underline">
            Ask Kobby what you need
            <ArrowRight aria-hidden className="size-5" />
          </KobbyPromptButton>
        </div>
      </div>
    </section>
  );
}
