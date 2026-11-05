import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders with a working WhatsApp link and no layout or a11y problems", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "The right machine. The right support." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /whatsapp/i }).first()).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/233557042005/,
  );

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);

  expect(consoleErrors).toEqual([]);

  await page.screenshot({
    path: `test-results/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
