"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { FlyToQuote } from "@/components/motion/fly-to-quote";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { MachineCard, type MachineCardProps } from "@/components/product/machine-card";
import { Button } from "@/components/ui/button";
import { CountBadge, FilterChip } from "@/components/ui/tags";
import type { CategorySlug } from "@/config/categories";

export type DemoProduct = Pick<
  MachineCardProps,
  "name" | "summary" | "image" | "category" | "href" | "quoteHref" | "specs"
>;

const CHIPS: { label: string; category: CategorySlug }[] = [
  { label: "Irrigation", category: "irrigation" },
  { label: "Rice processing", category: "rice-processing" },
  { label: "Food processing", category: "food-processing" },
  { label: "Crop protection", category: "crop-protection" },
  { label: "Grain milling", category: "grain-milling" },
  { label: "Engines", category: "engines-power" },
];

export function ChipDemo() {
  const [selected, setSelected] = useState<CategorySlug[]>(["irrigation", "grain-milling"]);

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {CHIPS.map(({ label, category }) => (
        <FilterChip
          key={category}
          category={category}
          selected={selected.includes(category)}
          onClick={() =>
            setSelected((current) =>
              current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category],
            )
          }
        >
          {label}
        </FilterChip>
      ))}
    </div>
  );
}

export function CardDemo({ products }: { products: DemoProduct[] }) {
  const [count, setCount] = useState(0);
  const [compared, setCompared] = useState<string[]>([]);

  return (
    <>
      <FlyToQuote>
        {(fly) => (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
            {products.map((product, index) => (
              <MachineCard
                key={product.name}
                {...product}
                preview={index === 0 ? "hover" : undefined}
                onAdd={(trigger) => fly(trigger, () => setCount((current) => current + 1))}
                compared={compared.includes(product.name)}
                compareDisabled={compared.length >= 3}
                onCompareChange={(checked) =>
                  setCompared((current) =>
                    checked
                      ? [...current, product.name]
                      : current.filter((name) => name !== product.name),
                  )
                }
              />
            ))}
          </div>
        )}
      </FlyToQuote>
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button data-quote-target variant="gold" aria-live="polite">
          <ClipboardList aria-hidden />
          Quote list
          <CountBadge count={count} className="bg-forest-900 text-white" />
        </Button>
      </div>
    </>
  );
}

export function MotionDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Reveal className="rounded-lg bg-card p-5 shadow-sm">
        <h3 className="text-lg">Reveal</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fades up 16px over 450ms the first time it scrolls into view.
        </p>
      </Reveal>
      <Stagger className="flex flex-col gap-2">
        {["Paddy", "Destoner", "Rice mill", "Bagging"].map((step) => (
          <StaggerItem key={step} className="rounded-sm bg-card px-3 py-1.5 text-sm shadow-sm">
            {step}
          </StaggerItem>
        ))}
      </Stagger>
      <TiltCard className="rounded-lg bg-card p-5 shadow-sm">
        <h3 className="text-lg">Tilt card</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Leans up to 4 degrees toward a mouse pointer. Touch screens keep it flat.
        </p>
      </TiltCard>
    </div>
  );
}
