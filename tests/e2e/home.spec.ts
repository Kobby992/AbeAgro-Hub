import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (name: string) => name === "mobile-390";

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(1500);
}

test("home has every section, no overflow, no a11y or console problems", async ({
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
  for (const title of [
    "Shop by task",
    "Featured machinery",
    "Start or grow your agri-business",
    "From discovery to delivery",
    "Not sure which machine fits your farm?",
    "Questions buyers ask",
    "Get a quote on WhatsApp in 2 minutes.",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: title })).toBeAttached();
  }
  await expect(page.getByText("Nationwide delivery").first()).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText(
    "Payment and warranty terms are agreed with each quote.",
  );

  await scrollThrough(page);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((node) => node.target) })),
  ).toEqual([]);
  expect(consoleErrors).toEqual([]);

  await page.screenshot({
    path: `test-results/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("no price appears anywhere on the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/GH₵|GHS|cedis?\b|\$\s?\d/i);
});

test("Get quote on a card opens WhatsApp with that product filled in", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Get quote for Disk Mill on WhatsApp" });
  const href = await link.getAttribute("href");
  const url = new URL(href ?? "");
  expect(url.origin + url.pathname).toBe("https://wa.me/233235801203");
  expect(url.searchParams.get("text")).toContain("*Disk Mill* × 1");
  expect(url.searchParams.get("text")).toContain("https://www.abeagrohub.com/machinery/disk-mill");
});

test("adding a machine raises the header count, confirms it and survives a reload", async ({
  page,
}) => {
  await page.goto("/");
  const add = page.getByRole("button", { name: "Add Disk Mill to quote list" });
  const headerList = page.getByRole("banner").locator("[data-quote-target]");
  await add.click();
  await expect(headerList).toHaveAccessibleName("Quote list 1 item");
  await expect(page.getByText("Added to your quote list")).toBeVisible();

  await add.click();
  await expect(page.getByText("Quantity is now 2")).toBeVisible();
  await expect(headerList).toHaveAccessibleName("Quote list 1 item");

  await page.reload();
  await expect(headerList).toHaveAccessibleName("Quote list 1 item");
});

test("search palette tolerates typos and goes to the product", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search machinery" }).click();
  const input = page.getByRole("searchbox", { name: "Machine, crop or job" });
  await input.fill("hamer mil");
  await expect(page.getByRole("link", { name: /Hammer Mill/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
});

test("hero search goes to the catalogue with the query", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search machinery" }).fill("water pump");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/machinery\?q=water(\+|%20)pump/);
});

test("a Kamal prompt opens the panel with the question filled in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Which engine should drive my corn mill?" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox")).toHaveValue("Which engine should drive my corn mill?");
  const href = await dialog.getByRole("link", { name: "Send on WhatsApp" }).getAttribute("href");
  expect(new URL(href ?? "").searchParams.get("text")).toBe(
    "Which engine should drive my corn mill?",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("desktop mega-menu opens, lists categories and closes on Escape", async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "Desktop navigation");
  await page.goto("/");
  await page.getByRole("button", { name: "Machinery", exact: true }).click();
  const menu = page.locator("#mega-menu");
  await expect(menu.getByRole("link", { name: "Rice Processing" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "View all machinery" })).toBeVisible();
  await page.screenshot({ path: "test-results/screenshots/mega-menu.png" });
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("mobile menu opens full screen and closes on Escape", async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo.project.name), "Mobile navigation");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: "Solutions" })).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/screenshots/mobile-menu.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the how-it-works conveyor fills with gold as you scroll", async ({ page }, testInfo) => {
  await page.goto("/");
  const vertical = isMobile(testInfo.project.name);
  // Read by display, because Playwright treats an element at scale 0 as not visible.
  const progress = () =>
    page.evaluate((useY) => {
      const belts = [...document.querySelectorAll("ol .bg-gold")];
      const belt = belts.find((element) => getComputedStyle(element).display !== "none");
      const matrix = new DOMMatrixReadOnly(getComputedStyle(belt as Element).transform);
      return useY ? matrix.d : matrix.a;
    }, vertical);

  await expect.poll(progress).toBeLessThan(0.05);

  const steps = page.getByRole("heading", { name: "From discovery to delivery" });
  await steps.evaluate((element) =>
    element.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await expect.poll(progress).toBeGreaterThan(0.05);
});

test("with reduced motion, the headline shows at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const firstWord = page.locator(".rise-word").first();
  await expect(firstWord).toHaveCSS("opacity", "1");
});
