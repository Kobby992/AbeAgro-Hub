import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTRAST_PAIRS, contrastRatio, parseTokens, requiredRatio } from "@/lib/contrast";

const tokens = parseTokens(readFileSync("src/styles/tokens.css", "utf8"));

describe("contrastRatio", () => {
  it("matches the known WCAG extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });
});

describe("design tokens", () => {
  it("keeps the brand palette from the spec", () => {
    expect(tokens["--abe-forest"]).toBe("#005a40");
    expect(tokens["--abe-gold"]).toBe("#f8c424");
    expect(tokens["--abe-mist"]).toBe("#f2f6f3");
  });

  it.each(CONTRAST_PAIRS)("$label passes AA", ({ fg, bg, kind }) => {
    const foreground = tokens[fg];
    const background = tokens[bg];
    expect(foreground, fg).toMatch(/^#[0-9a-f]{6}$/);
    expect(background, bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrastRatio(foreground!, background!)).toBeGreaterThanOrEqual(requiredRatio(kind));
  });
});
