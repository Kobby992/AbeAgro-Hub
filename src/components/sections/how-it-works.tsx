"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    title: "Find your machine",
    text: "Search the catalogue, or ask Kobby what fits your farm or business.",
  },
  {
    title: "Tap Get quote",
    text: "WhatsApp opens with the machine details filled in. Press send.",
  },
  {
    title: "Get your price and delivery",
    text: "Our sales team replies with price, availability, payment and warranty terms, then arranges delivery across Ghana.",
  },
];

/** Three steps joined by a conveyor line that fills with gold as you scroll (BUILD_SPEC §5.2-7). */
export function HowItWorks() {
  const track = useRef<HTMLOListElement>(null);
  const beltY = useRef<HTMLDivElement>(null);
  const beltX = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const setProgress = (progress: number) => {
      if (beltY.current) beltY.current.style.transform = `scaleY(${progress})`;
      if (beltX.current) beltX.current.style.transform = `scaleX(${progress})`;
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    // Starts when the list's top reaches 85% of the screen, ends when its bottom reaches 55%.
    const update = () => {
      frame = 0;
      if (!track.current) return;
      const { top, height } = track.current.getBoundingClientRect();
      const viewport = window.innerHeight;
      const raw = (viewport * 0.85 - top) / (viewport * 0.3 + height);
      setProgress(Math.min(Math.max(raw, 0), 1));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="border-y border-border bg-card py-12 md:py-20">
      <div className="page-container">
        <SectionHeading
          title="From discovery to delivery"
          intro="Three steps, and you are talking to a real person."
          action={
            <Button asChild variant="outline">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          }
        />
        <ol ref={track} className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Vertical belt on phones, horizontal on larger screens. */}
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-[22px] w-1.5 rounded-full bg-muted md:top-[19px] md:right-0 md:bottom-auto md:left-0 md:h-1.5 md:w-full"
          >
            <div
              ref={beltY}
              style={{ transform: "scaleY(0)" }}
              className="size-full origin-top rounded-full bg-gold md:hidden"
            />
            <div
              ref={beltX}
              style={{ transform: "scaleX(0)" }}
              className="hidden size-full origin-left rounded-full bg-gold md:block"
            />
          </div>
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-3">
              <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-forest-700 to-forest-900 text-lg font-bold text-white tabular-nums shadow-md">
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl">{step.title}</h3>
                <p className="mt-1 max-w-prose text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
