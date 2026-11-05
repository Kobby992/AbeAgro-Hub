// WCAG contrast checks for the design tokens. Used by the unit test and shown on /styleguide.

export type ContrastPair = {
  label: string;
  fg: string;
  bg: string;
  /** "text" needs 4.5:1. "ui" is an icon, control border or focus ring and needs 3:1. */
  kind: "text" | "ui";
};

export const CONTRAST_PAIRS: ContrastPair[] = [
  { label: "Body text on page", fg: "--foreground", bg: "--background", kind: "text" },
  { label: "Body text on card", fg: "--card-foreground", bg: "--card", kind: "text" },
  { label: "Muted text on page", fg: "--muted-foreground", bg: "--background", kind: "text" },
  { label: "Muted text on card", fg: "--muted-foreground", bg: "--card", kind: "text" },
  { label: "Muted text on muted", fg: "--muted-foreground", bg: "--muted", kind: "text" },
  { label: "Primary button", fg: "--abe-white", bg: "--abe-forest", kind: "text" },
  { label: "Primary button, hover", fg: "--abe-white", bg: "--abe-forest-900", kind: "text" },
  { label: "Gold button", fg: "--abe-charcoal", bg: "--abe-gold", kind: "text" },
  { label: "Gold button, hover", fg: "--abe-charcoal", bg: "--abe-gold-600", kind: "text" },
  { label: "Outline button", fg: "--abe-forest", bg: "--background", kind: "text" },
  { label: "Outline button, hover", fg: "--abe-forest", bg: "--accent", kind: "text" },
  { label: "White on dark section", fg: "--abe-white", bg: "--abe-forest-900", kind: "text" },
  { label: "Gold on dark section", fg: "--abe-gold", bg: "--abe-forest-900", kind: "text" },
  { label: "Error text on page", fg: "--destructive", bg: "--background", kind: "text" },
  { label: "Error text on card", fg: "--destructive", bg: "--card", kind: "text" },
  { label: "Leaf tag", fg: "--abe-leaf-ink", bg: "--abe-leaf-tint", kind: "text" },
  { label: "Teal tag", fg: "--abe-teal-ink", bg: "--abe-teal-tint", kind: "text" },
  { label: "Water tag", fg: "--abe-water-ink", bg: "--abe-water-tint", kind: "text" },
  { label: "Gold tag", fg: "--abe-gold-ink", bg: "--abe-gold-tint", kind: "text" },
  { label: "Soil tag", fg: "--abe-soil-ink", bg: "--abe-soil-tint", kind: "text" },
  { label: "Pepper tag", fg: "--abe-pepper-ink", bg: "--abe-pepper-tint", kind: "text" },
  { label: "Charcoal tag", fg: "--abe-charcoal", bg: "--abe-charcoal-tint", kind: "text" },
  { label: "Selected chip, leaf", fg: "--abe-white", bg: "--abe-leaf-ink", kind: "text" },
  { label: "Selected chip, teal", fg: "--abe-white", bg: "--abe-teal-ink", kind: "text" },
  { label: "Selected chip, water", fg: "--abe-white", bg: "--abe-water-ink", kind: "text" },
  { label: "Selected chip, gold", fg: "--abe-white", bg: "--abe-gold-ink", kind: "text" },
  { label: "Selected chip, soil", fg: "--abe-white", bg: "--abe-soil-ink", kind: "text" },
  { label: "Selected chip, pepper", fg: "--abe-white", bg: "--abe-pepper-ink", kind: "text" },
  { label: "Selected chip, charcoal", fg: "--abe-white", bg: "--abe-charcoal", kind: "text" },
  { label: "Unselected chip, leaf", fg: "--abe-leaf-ink", bg: "--card", kind: "text" },
  { label: "Unselected chip, teal", fg: "--abe-teal-ink", bg: "--card", kind: "text" },
  { label: "Unselected chip, water", fg: "--abe-water-ink", bg: "--card", kind: "text" },
  { label: "Unselected chip, gold", fg: "--abe-gold-ink", bg: "--card", kind: "text" },
  { label: "Unselected chip, soil", fg: "--abe-soil-ink", bg: "--card", kind: "text" },
  { label: "Unselected chip, pepper", fg: "--abe-pepper-ink", bg: "--card", kind: "text" },
  { label: "Input border on card", fg: "--input", bg: "--card", kind: "ui" },
  { label: "Input border on page", fg: "--input", bg: "--background", kind: "ui" },
  { label: "Focus ring on page", fg: "--abe-forest", bg: "--background", kind: "ui" },
  { label: "Focus ring on dark section", fg: "--abe-gold", bg: "--abe-forest-900", kind: "ui" },
  { label: "White icon on leaf", fg: "--abe-white", bg: "--abe-leaf", kind: "ui" },
  { label: "White icon on teal", fg: "--abe-white", bg: "--abe-teal", kind: "ui" },
  { label: "White icon on water", fg: "--abe-white", bg: "--abe-water", kind: "ui" },
  { label: "White icon on pepper", fg: "--abe-white", bg: "--abe-pepper", kind: "ui" },
  { label: "White icon on soil", fg: "--abe-white", bg: "--abe-soil", kind: "ui" },
  { label: "Charcoal icon on gold", fg: "--abe-charcoal", bg: "--abe-gold", kind: "ui" },
  { label: "Gold icon on charcoal", fg: "--abe-gold", bg: "--abe-charcoal", kind: "ui" },
];

/** Reads every custom property from the first :root block, following var() references. */
export function parseTokens(css: string): Record<string, string> {
  const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const raw: Record<string, string> = {};
  for (const [, name, value] of rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    if (name && value) raw[name] = value.trim();
  }
  const resolve = (value: string): string => {
    const reference = value.match(/^var\((--[\w-]+)\)$/)?.[1];
    return reference && raw[reference] ? resolve(raw[reference]) : value;
  };
  return Object.fromEntries(Object.entries(raw).map(([name, value]) => [name, resolve(value)]));
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const requiredRatio = (kind: ContrastPair["kind"]) => (kind === "text" ? 4.5 : 3);
