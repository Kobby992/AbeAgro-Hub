"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { noteSearchOrigin } from "@/lib/analytics";

const PHRASES = ["rice mill…", "water pump for 2 acres…", "corn mill…"];
const TYPE_MS = 70;
const HOLD_MS = 1600;

/** Works as a plain GET form without JavaScript; the typewriter placeholder is an extra. */
export function HeroSearch() {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let phrase = 0;
    let letter = 0;
    let timer: ReturnType<typeof setTimeout>;

    function step() {
      const element = input.current;
      if (!element) return;
      // Leave the placeholder alone while someone is using the field.
      if (document.activeElement === element || element.value) {
        timer = setTimeout(step, HOLD_MS);
        return;
      }
      const text = PHRASES[phrase] ?? "";
      letter += 1;
      element.placeholder = text.slice(0, letter);
      if (letter >= text.length) {
        letter = 0;
        phrase = (phrase + 1) % PHRASES.length;
        timer = setTimeout(step, HOLD_MS);
      } else {
        timer = setTimeout(step, TYPE_MS);
      }
    }

    timer = setTimeout(step, HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Form
      action="/machinery"
      role="search"
      onSubmit={() => noteSearchOrigin("hero")}
      className="mt-6 flex max-w-xl gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor="hero-search" className="sr-only">
          Search machinery
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={input}
          id="hero-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search machinery"
          className="min-h-14 w-full rounded-md bg-card pr-3 pl-10 text-base text-charcoal shadow-lg placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" variant="gold" className="min-h-14">
        Search
      </Button>
    </Form>
  );
}
