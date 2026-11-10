import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { FieldStripes } from "@/components/motifs/field-stripes";
import { GearArc } from "@/components/motifs/gear-arc";
import { StripeDivider } from "@/components/motifs/stripe-divider";
import { CategoryTile } from "@/components/product/category-tile";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  CategoryBadge,
  ConfirmHint,
  CountBadge,
  FilterChip,
  SpecPlate,
} from "@/components/ui/tags";
import { categories, categoryName, type CategorySlug } from "@/config/categories";
import { whatsappUrl } from "@/config/site";
import { CONTRAST_PAIRS, contrastRatio, parseTokens, requiredRatio } from "@/lib/contrast";
import products from "../../../content/products.json";
import { CardDemo, ChipDemo, MotionDemo, type DemoProduct } from "./demos";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const tokens = parseTokens(readFileSync(path.join(process.cwd(), "src/styles/tokens.css"), "utf8"));
const palette = Object.entries(tokens).filter(([name]) => /^--abe-[a-z]+(-\d+)?$/.test(name));

const TYPE_SCALE = [
  ["text-7xl", "72px"],
  ["text-6xl", "60px"],
  ["text-5xl", "48px"],
  ["text-4xl", "36px"],
  ["text-3xl", "30px"],
  ["text-2xl", "24px"],
  ["text-xl", "21px"],
  ["text-lg", "18px"],
  ["text-base", "16px"],
  ["text-sm", "14px"],
  ["text-xs", "13px"],
] as const;

const CARD_SLUGS = ["sb10-rice-huller-mill", "petrol-water-pump-3-inch-wp30", "disk-mill"];

const demoProducts: DemoProduct[] = CARD_SLUGS.flatMap((slug) => {
  const product = products.find((item) => item.slug === slug);
  if (!product) return [];
  return [
    {
      name: product.name,
      summary: product.summary,
      image: product.image,
      category: product.category as CategorySlug,
      href: "#machine-cards",
      quoteHref: whatsappUrl,
      specs: product.specs.filter((spec) => spec.label !== "Model"),
    },
  ];
});

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section
      id={title.toLowerCase().replace(/[^a-z]+/g, "-")}
      className="scroll-mt-4 border-t border-border py-10 md:py-14"
    >
      <h2 className="text-3xl">{title}</h2>
      {note && <p className="mt-2 max-w-prose text-muted-foreground">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-lg">{label}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="pb-16">
      <div className="grain relative overflow-hidden bg-forest-900 text-white">
        <GearArc
          color="#0c7a58"
          spin
          className="absolute -top-16 -right-24 size-72 md:-top-24 md:-right-16 md:size-[30rem]"
        />
        <FieldStripes draw className="absolute inset-x-0 bottom-0 h-40 w-full md:h-64" />
        <div className="relative page-container pt-14 pb-48 md:pt-24 md:pb-72">
          <p className="font-semibold text-gold">ABE Agro Hub design system</p>
          <h1 className="mt-3 max-w-3xl text-hero">Styleguide</h1>
          <p className="mt-4 max-w-prose text-lg">
            Every token and component the site is built from, in each of its states.
          </p>
        </div>
      </div>

      <div className="page-container">
        <Section
          title="Colour"
          note="Accents are fills and rules. Text on a tint or the page uses the darker ink version of its accent."
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {palette.map(([name, hex]) => (
              <li key={name} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="h-16" style={{ background: hex }} />
                <p className="px-2 pt-1.5 text-sm font-semibold">{name.replace("--abe-", "")}</p>
                <p className="px-2 pb-1.5 text-xs text-muted-foreground">{hex}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Contrast"
          note="Text pairs need 4.5:1 and icons, borders and focus rings need 3:1. A unit test fails the checks if any pair drops below."
        >
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Contrast results">
            <table className="w-full min-w-md text-left text-sm">
              <thead>
                <tr className="border-b-2 border-charcoal">
                  <th className="py-2 pr-3">Pair</th>
                  <th className="py-2 pr-3">Sample</th>
                  <th className="py-2 pr-3">Ratio</th>
                  <th className="py-2">Needs</th>
                </tr>
              </thead>
              <tbody>
                {CONTRAST_PAIRS.map(({ label, fg, bg, kind }) => {
                  const ratio = contrastRatio(tokens[fg] ?? "", tokens[bg] ?? "");
                  const passes = ratio >= requiredRatio(kind);
                  return (
                    <tr key={label} className="border-b border-border">
                      <td className="py-1.5 pr-3">{label}</td>
                      <td className="py-1.5 pr-3">
                        {kind === "text" ? (
                          <span
                            className="rounded-sm px-2 py-0.5 font-semibold"
                            style={{ color: tokens[fg], background: tokens[bg] }}
                          >
                            Abc
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="inline-flex size-7 items-center justify-center rounded-sm"
                            style={{ background: tokens[bg] }}
                          >
                            <span
                              className="size-4 rounded-sm border-2"
                              style={{ borderColor: tokens[fg] }}
                            />
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {passes ? (
                            <Check aria-label="Passes" className="size-4 text-forest" />
                          ) : (
                            <X aria-label="Fails" className="size-4 text-destructive" />
                          )}
                          {ratio.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-1.5">{requiredRatio(kind)}:1</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Type"
          note="Montserrat for everything: 800 for the hero, 700 for headings, 600 for buttons, 450 for reading."
        >
          <div className="space-y-3">
            {TYPE_SCALE.map(([size, pixels]) => (
              <p key={size} className="flex items-baseline gap-3 overflow-hidden">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">{pixels}</span>
                <span className={`${size} truncate font-display font-extrabold`}>Rice mill</span>
              </p>
            ))}
          </div>
          <p className="mt-6 max-w-prose text-lg">
            Body text stays at 16px or larger with generous line height, so it reads comfortably on
            a phone in daylight. Line length stops at about 65 characters.
          </p>
        </Section>

        <Section
          title="Radius and elevation"
          note="Radius grows with the size of the thing. Shadows carry a forest tint."
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-sm border border-input bg-card p-4 text-sm">Plate, 3px</div>
            <div className="rounded-md border border-input bg-card p-4 text-sm">Control, 6px</div>
            <div className="rounded-lg border border-input bg-card p-4 text-sm">Card, 10px</div>
            <div className="rounded-xl border border-input bg-card p-4 text-sm">Panel, 18px</div>
            <div className="rounded-lg bg-card p-4 text-sm shadow-sm">Resting</div>
            <div className="rounded-lg bg-card p-4 text-sm shadow-md">Raised</div>
            <div className="rounded-lg bg-card p-4 text-sm shadow-lg">Lifted</div>
          </div>
        </Section>

        <Section
          title="Buttons"
          note="Each state is pinned here so it can be checked without hovering. Every size is at least 44px tall."
        >
          <Row label="Variants">
            <Button>Get quote</Button>
            <Button variant="gold">Ask Kobby</Button>
            <Button variant="outline">View details</Button>
            <Button variant="ghost">Clear list</Button>
          </Row>
          <Row label="Primary states">
            <Button>Default</Button>
            <Button data-preview="hover">Hover</Button>
            <Button data-preview="focus">Focus</Button>
            <Button data-preview="active">Pressed</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Sending</Button>
          </Row>
          <Row label="Gold states">
            <Button variant="gold">Default</Button>
            <Button variant="gold" data-preview="hover">
              Hover
            </Button>
            <Button variant="gold" data-preview="focus">
              Focus
            </Button>
            <Button variant="gold" disabled>
              Disabled
            </Button>
          </Row>
          <Row label="Outline states">
            <Button variant="outline">Default</Button>
            <Button variant="outline" data-preview="hover">
              Hover
            </Button>
            <Button variant="outline" data-preview="focus">
              Focus
            </Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <div className="grain rounded-xl bg-forest-900 p-5">
            <h3 className="mb-2 text-lg text-white">On dark sections</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="gold">Get a quote</Button>
              <Button variant="gold" data-preview="focus">
                Focus
              </Button>
              <Button variant="outline-light">How it works</Button>
              <Button variant="outline-light" data-preview="hover">
                Hover
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Inputs" note="Errors show an icon and a message as well as colour.">
          <form className="grid max-w-3xl gap-5 md:grid-cols-2" action="#">
            <Field label="Full name">
              {(control) => <Input placeholder="Kwame Mensah" {...control} />}
            </Field>
            <Field label="Phone or WhatsApp" hint="We use this to send your quote.">
              {(control) => <Input type="tel" defaultValue="024 123 4567" {...control} />}
            </Field>
            <Field label="Town" error="Enter your town so we can plan delivery.">
              {(control) => <Input {...control} />}
            </Field>
            <Field label="Location (disabled)">
              {(control) => <Input disabled defaultValue="Kasoa" {...control} />}
            </Field>
            <Field label="Input with focus shown">
              {(control) => <Input data-preview="focus" defaultValue="Tamale" {...control} />}
            </Field>
            <Field label="I am a">
              {(control) => (
                <Select {...control} defaultValue="farmer">
                  <option value="farmer">Farmer</option>
                  <option value="processor">Agro-processor</option>
                  <option value="food">Food business or chop bar</option>
                </Select>
              )}
            </Field>
            <div className="md:col-span-2">
              <Field label="Message">
                {(control) => <Textarea placeholder="Tell us about your farm" {...control} />}
              </Field>
            </div>
            <div className="flex flex-wrap gap-x-6 md:col-span-2">
              <Checkbox label="ABE may contact me about this request" defaultChecked />
              <Checkbox label="Disabled option" disabled />
            </div>
          </form>
        </Section>

        <Section title="Chips, badges and plates">
          <h3 className="mb-2 text-lg">Filter chips (press to toggle)</h3>
          <ChipDemo />
          <Row label="Chip states">
            <FilterChip>Default</FilterChip>
            <FilterChip selected>Selected</FilterChip>
            <FilterChip data-preview="focus">Focus</FilterChip>
            <FilterChip disabled>Disabled</FilterChip>
          </Row>
          <Row label="Category badges">
            {categories.map((category) => (
              <CategoryBadge key={category.slug} category={category.slug}>
                {categoryName(category.slug)}
              </CategoryBadge>
            ))}
          </Row>
          <Row label="Count and confirmation">
            <CountBadge count={3} />
            <ConfirmHint />
          </Row>
          <Row label="Spec plates">
            <SpecPlate label="Capacity" value="600 kg/h" />
            <SpecPlate label="Power" value="Diesel or electric" />
          </Row>
        </Section>

        <Section
          title="Category tiles"
          note="The first tile pins its hover state. On a desktop the others tilt and animate their icon under the pointer."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => (
              <CategoryTile
                key={category.slug}
                category={category.slug}
                href="#category-tiles"
                preview={index === 0 ? "hover" : undefined}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Machine cards"
          note="Real catalogue products. The first card pins its hover state. Press + to fly the photo to the quote list button."
        >
          <CardDemo products={demoProducts} />
        </Section>

        <Section title="Motifs" note="Field rows and the gear come straight from the logo.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grain relative h-56 overflow-hidden rounded-xl bg-forest-900">
              <FieldStripes className="absolute inset-0 size-full" />
            </div>
            <div className="relative h-56 overflow-hidden rounded-xl bg-accent">
              <FieldStripes tone="light" className="absolute inset-0 size-full" />
            </div>
            <div className="flex h-56 items-center justify-center rounded-xl bg-card">
              <GearArc className="size-48" />
            </div>
            <div className="overflow-hidden rounded-xl">
              <div className="h-24 bg-background" />
              <StripeDivider className="-mb-px" />
              <div className="h-20 bg-forest-900" />
            </div>
          </div>
        </Section>

        <Section
          title="Motion"
          note="Scroll and pointer moments for review. With reduced motion switched on, everything appears in place without moving."
        >
          <MotionDemo />
        </Section>
      </div>
    </main>
  );
}
