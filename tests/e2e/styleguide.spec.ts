import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const FIRST_CARD_ADD = { name: /^Add .* to quote list$/ };

test("styleguide renders every section with no overflow, a11y or console problems", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/styleguide");
  await expect(page.getByRole("heading", { level: 1, name: "Styleguide" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  for (const title of [
    "Colour",
    "Contrast",
    "Type",
    "Buttons",
    "Inputs",
    "Chips, badges and plates",
    "Category tiles",
    "Machine cards",
    "Motifs",
    "Motion",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
  }
  await expect(page.getByLabel("Fails")).toHaveCount(0);

  // Scroll through once so every Reveal has played before the checks and the screenshot.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1800);

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((node) => node.target) })),
  ).toEqual([]);

  expect(consoleErrors).toEqual([]);

  await page.screenshot({
    path: `test-results/screenshots/styleguide-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("adding to the quote list flies the photo, then raises the count", async ({ page }) => {
  await page.goto("/styleguide");
  const addButton = page.getByRole("button", FIRST_CARD_ADD).first();
  const quoteList = page.locator("[data-quote-target]");
  await addButton.scrollIntoViewIfNeeded();
  await expect(quoteList).toContainText("0");

  await addButton.click();
  await expect(page.locator('body > img[aria-hidden="true"]')).toHaveCount(1);
  await expect(quoteList).toContainText("1");
  await expect(page.locator('body > img[aria-hidden="true"]')).toHaveCount(0);
});

test("with reduced motion, adding updates the count with no flying photo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/styleguide");
  const addButton = page.getByRole("button", FIRST_CARD_ADD).first();
  await addButton.scrollIntoViewIfNeeded();

  await addButton.click();
  await expect(page.locator("[data-quote-target]")).toContainText("1");
  await expect(page.locator('body > img[aria-hidden="true"]')).toHaveCount(0);
});

test("filter chips expose their state to assistive technology", async ({ page }) => {
  await page.goto("/styleguide");
  const chip = page.getByRole("button", { name: "Rice processing" });
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
});

test("spec plates are readable without hovering", async ({ page }) => {
  await page.goto("/styleguide");
  const plates = page.locator("article").nth(1).locator("div.flex-wrap");
  await plates.scrollIntoViewIfNeeded();
  await expect(plates).toBeVisible();
  await expect(plates).toHaveCSS("opacity", "1");
});
