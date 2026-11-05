"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_QTY = 999;

/** `of` names the item in button labels, so screen readers can tell steppers apart in a list. */
export function QuantityStepper({
  id,
  value,
  onChange,
  of,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  of?: string;
}) {
  const suffix = of ? ` of ${of}` : "";
  const clamp = (next: number) =>
    onChange(Math.min(Math.max(Number.isFinite(next) ? Math.round(next) : 1, 1), MAX_QTY));

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label={`Reduce quantity${suffix}`}
        disabled={value <= 1}
        onClick={() => clamp(value - 1)}
      >
        <Minus aria-hidden />
      </Button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-label={of ? `Quantity${suffix}` : undefined}
        min={1}
        max={MAX_QTY}
        value={value}
        onChange={(event) => clamp(event.target.valueAsNumber)}
        className="h-11 w-16 rounded-md border border-input bg-card text-center text-base"
      />
      <Button
        variant="outline"
        size="icon"
        aria-label={`Increase quantity${suffix}`}
        disabled={value >= MAX_QTY}
        onClick={() => clamp(value + 1)}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
