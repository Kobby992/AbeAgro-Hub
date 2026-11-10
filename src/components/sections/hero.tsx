import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { Furrows } from "@/components/motion/furrows";
import { getProduct } from "@/lib/products";
import { HeroSearch } from "./hero-search";

const HEADLINE = ["The right machine.", "The right support."];

const POPULAR = [
  { label: "Water pumps", query: "water pump" },
  { label: "Rice mills", query: "rice mill" },
  { label: "Mist blower", query: "mist blower" },
  { label: "Groundnut sheller", query: "groundnut sheller" },
  { label: "Disk mill", query: "disk mill" },
];

const SHOWCASE = getProduct("sb10-rice-huller-mill");

export function Hero() {
  return (
    <section className="canopy-panel relative isolate overflow-hidden text-white">
      <Furrows tone="dark" className="absolute inset-0 -z-10 size-full" />

      <div className="page-container grid items-center gap-12 pt-28 pb-24 lg:grid-cols-[1.2fr_0.8fr] lg:pt-36 lg:pb-32">
        <div>
          <h1 className="text-hero font-extrabold">
            {HEADLINE.map((sentence, line) => (
              <span key={sentence} className="block">
                {sentence.split(" ").map((word, index) => (
                  <span key={index}>
                    <span
                      className="rise-word"
                      style={{ "--rise-delay": `${(line * 3 + index) * 45}ms` } as CSSProperties}
                    >
                      {word}
                    </span>{" "}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-white/85">
            Water pumps, rice mills, sprayers and food-processing machines, from a trusted supplier
            since 1978, with branches in Accra, Kumasi, Ashaiman and Kasoa.
          </p>

          <HeroSearch />

          <div className="mt-4">
            <p className="sr-only">Popular searches</p>
            <ul className="-ml-3 flex flex-wrap gap-1">
              {POPULAR.map((item) => (
                <li key={item.query}>
                  <Link
                    href={`/machinery?q=${encodeURIComponent(item.query)}`}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <KobbyPromptButton className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-gold underline-offset-4 hover:underline">
            Ask Kobby what you need
            <ArrowRight aria-hidden className="size-5" />
          </KobbyPromptButton>
        </div>

        {/* Below lg this is display:none, so its lazy photo never downloads on phones. */}
        {SHOWCASE && (
          <Link
            href={`/machinery/${SHOWCASE.slug}`}
            prefetch={false}
            className="glass-card group hidden rounded-xl p-3 transition-transform duration-250 ease-out hover:-translate-y-1.5 lg:block"
          >
            <div className="machine-stage rounded-[calc(var(--radius-panel)-0.75rem)]">
              <Image
                src={SHOWCASE.image}
                alt=""
                fill
                sizes="480px"
                className="object-contain p-8 group-hover:scale-[1.04]"
              />
            </div>
            <span className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 font-semibold">
              {SHOWCASE.shortName}
              <ArrowRight
                aria-hidden
                className="size-5 text-gold transition-transform duration-250 ease-out group-hover:translate-x-1"
              />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
