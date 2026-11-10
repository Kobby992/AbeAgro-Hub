import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import products from "../../content/products.json";
import { categories } from "../../src/config/categories";

const isMobile = (name: string) => name === "mobile-390";
const cards = (page: Page) => page.getByRole("list", { name: "Machines" }).getByRole("article");
const status = (page: Page) => page.getByRole("status").filter({ hasText: /machine/ });

async function checkPage(page: Page, name: string, projectName: string) {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.reload();
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
    "no sideways scroll",
  ).toBe(false);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((node) => node.target) })),
  ).toEqual([]);
  expect(consoleErrors).toEqual([]);
  await page.screenshot({
    path: `test-results/screenshots/${name}-${projectName}.png`,
    fullPage: true,
  });
}

test("catalogue shows all 42 machines and passes checks", async ({ page }, testInfo) => {
  await page.goto("/machinery");
  await expect(cards(page)).toHaveCount(42);
  await expect(status(page)).toHaveText("42 machines");
  await checkPage(page, "catalogue", testInfo.project.name);
});

test("search tolerates typos, highlights matches and updates the URL", async ({ page }) => {
  await page.goto("/machinery");
  await page.locator("#catalogue-search").fill("hamer mil");
  await expect(page).toHaveURL(/q=hamer(\+|%20)mil/);
  await expect(cards(page).first()).toContainText("Hammer Mill");
  await expect(cards(page).first().locator("mark").first()).toBeVisible();
});

test("a shared link restores search and filters", async ({ page }) => {
  await page.goto("/machinery?cat=irrigation&power=petrol");
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toContainText("3-inch Petrol Pump");
  await expect(page.getByRole("button", { name: "Irrigation & Water" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByLabel("Power source")).toHaveValue("petrol");
});

test("filters narrow results, write to the URL and clear", async ({ page }) => {
  await page.goto("/machinery");
  await page.getByRole("button", { name: "Rice Processing" }).click();
  await expect(page).toHaveURL(/cat=rice-processing/);
  await expect(status(page)).toHaveText("7 machines");

  await page.getByLabel("Power source").selectOption("diesel");
  await expect(page).toHaveURL(/power=diesel/);
  await expect(status(page)).toHaveText("4 machines");

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/machinery$/);
  await expect(status(page)).toHaveText("42 machines");
});

test("a search with no results offers Kamal with the query", async ({ page }) => {
  await page.goto("/machinery?q=zzzzqqqq");
  await expect(page.getByText("No machines match that.")).toBeVisible();
  await page.getByRole("main").getByRole("button", { name: "Ask Kamal" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox")).toHaveValue(/zzzzqqqq/);
});

test("compare holds three machines, then shows them side by side", async ({ page }) => {
  await page.goto("/machinery?cat=rice-processing");
  const tick = (name: string) => page.getByRole("checkbox", { name: `Compare ${name}` });
  await tick("SB10 Rice Mill").check();
  await tick("SB30 Rice Mill").check();
  await tick("CHP150 Rice Mill").check();
  await expect(tick("JLX Rice Destoner")).toBeDisabled();

  await page.getByRole("link", { name: "Compare (3)" }).click();
  await expect(page).toHaveURL(/\/compare\?ids=/);
  await expect(page.getByRole("heading", { level: 1, name: "Compare machines" })).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(table.getByRole("row", { name: /^Capacity/ })).toContainText("900–1,200 kg/h");
  await expect(table).toContainText("—");
  await expect(table.getByText("To be confirmed by sales").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/GH₵|GHS|cedis?\b/i);

  await page.getByRole("button", { name: "Add all to quote" }).click();
  await expect(page.getByRole("banner").locator("[data-quote-target]")).toHaveAccessibleName(
    "Quote list 3 items",
  );
});

test("compare page passes checks, and explains itself when empty", async ({ page }, testInfo) => {
  await page.goto("/compare");
  await expect(page.getByText("No machines to compare yet.")).toBeVisible();
  await page.goto("/compare?ids=sb10-rice-huller-mill,disk-mill,commercial-fufu-machine");
  await checkPage(page, "compare", testInfo.project.name);
});

test("every category page lists its machines and has its content", async ({ page }) => {
  test.setTimeout(60_000);
  for (const { slug, name } of categories) {
    const response = await page.goto(`/machinery/c/${slug}`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name }), slug).toBeVisible();
    await expect(cards(page), slug).toHaveCount(
      products.filter((product) => product.category === slug).length,
    );
    await expect(page.getByRole("heading", { name: "Buying tips" }), slug).toBeVisible();
  }
});

test("category page passes checks", async ({ page }, testInfo) => {
  await page.goto("/machinery/c/rice-processing");
  await checkPage(page, "category", testInfo.project.name);
});

test("all 42 product pages render with accurate content and no price", async ({ request }) => {
  for (const product of products) {
    const response = await request.get(`/machinery/${product.slug}`);
    expect(response.status(), product.slug).toBe(200);
    const html = await response.text();
    expect(html, product.slug).toContain(encodeURIComponent(product.image));
    expect(html, product.slug).toContain("Get quote on WhatsApp");
    expect(html, product.slug).not.toMatch(/GH₵|GHS\s?\d|\bcedis?\b/i);
    expect(html, product.slug).toContain(`${product.name.replace(/&/g, "&amp;")} in Ghana`);
  }
  expect((await request.get("/machinery/not-a-real-machine")).status()).toBe(404);
  expect((await request.get("/machinery/c/not-a-real-category")).status()).toBe(404);
});

test("product page: quote link carries the quantity, and quantity adds to the list", async ({
  page,
}) => {
  await page.goto("/machinery/sb10-rice-huller-mill");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  const link = page.getByRole("link", { name: "Get quote on WhatsApp" });
  const text = new URL((await link.getAttribute("href")) ?? "").searchParams.get("text");
  expect(text).toContain("*SB10 Rice Huller / Mill* × 2");
  expect(text).toContain("https://www.abeagrohub.com/machinery/sb10-rice-huller-mill");

  await page.getByRole("button", { name: "Add to quote list" }).click();
  await expect(page.getByRole("banner").locator("[data-quote-target]")).toHaveAccessibleName(
    "Quote list 1 item",
  );
  const saved = await page.evaluate(() => localStorage.getItem("abe-quote-list"));
  expect(JSON.parse(saved ?? "{}").state.items).toEqual([
    { slug: "sb10-rice-huller-mill", qty: 2 },
  ]);
});

test("unconfirmed specs show a hint, and confirmed ones do not", async ({ page }) => {
  await page.goto("/machinery/chp150-rice-milling-machine");
  await expect(page.getByRole("table").getByText("To be confirmed by sales")).toHaveCount(2);
  await page.goto("/machinery/sb10-rice-huller-mill");
  await expect(page.getByRole("table").getByText("To be confirmed by sales")).toHaveCount(0);
});

test("the PLUS.HONDAY page keeps its not-a-Honda note", async ({ page }) => {
  await page.goto("/machinery/plus-honday-gx200-gasoline-engine");
  await expect(page.getByText("is not a Honda engine").first()).toBeVisible();
});

test("product photo opens full screen", async ({ page }) => {
  await page.goto("/machinery/disk-mill");
  await page.getByRole("button", { name: /Zoom in on photo/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("sticky phone bar shows only on phones, and buttons sit above it", async ({
  page,
}, testInfo) => {
  await page.goto("/machinery/disk-mill");
  const bar = page.locator("[data-sticky-bar]");
  if (!isMobile(testInfo.project.name)) {
    await expect(bar).toBeHidden();
    return;
  }
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: "WhatsApp" })).toBeVisible();
});

test("product page passes checks", async ({ page }, testInfo) => {
  await page.goto("/machinery/commercial-fufu-machine");
  await checkPage(page, "product", testInfo.project.name);
});

test("a product card's photo morphs into the product page", async ({ page }) => {
  // Records which elements are named for the browser at the moment each transition starts.
  await page.addInitScript(() => {
    const original = document.startViewTransition?.bind(document);
    const log: string[] = [];
    (window as unknown as { morphs: string[] }).morphs = log;
    if (!original) return;
    document.startViewTransition = ((update: never) => {
      for (const element of document.querySelectorAll("*")) {
        const name = getComputedStyle(element).viewTransitionName;
        if (name && name !== "none") log.push(name);
      }
      return original(update);
    }) as typeof document.startViewTransition;
  });

  await page.goto("/machinery");
  await page.getByRole("link", { name: "Details for Disk Mill" }).click();
  await expect(page).toHaveURL(/\/machinery\/disk-mill$/);
  await expect(page.getByRole("heading", { level: 1, name: "Disk Mill" })).toBeVisible();

  const morphs = await page.evaluate(() => (window as unknown as { morphs: string[] }).morphs);
  expect(morphs).toContain("product-disk-mill");
});

test("cards glide when filters change, unless motion is reduced", async ({ page }) => {
  const animatedCards = () =>
    page.evaluate(() => {
      const chip = [...document.querySelectorAll("button")].find(
        (button) => button.textContent === "Irrigation & Water",
      );
      chip?.click();
      return new Promise<number>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const cards = document.querySelectorAll("[data-flip-id]");
            resolve([...cards].filter((card) => card.getAnimations().length > 0).length);
          }),
        );
      });
    });

  await page.goto("/machinery");
  await expect(cards(page)).toHaveCount(42);
  expect(await animatedCards()).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/machinery");
  await expect(cards(page)).toHaveCount(42);
  expect(await animatedCards()).toBe(0);
});

test("header search on the catalogue page updates the results", async ({ page }) => {
  await page.goto("/machinery");
  await page.getByRole("banner").getByRole("button", { name: "Search machinery" }).click();
  await page.getByRole("searchbox", { name: "Machine, crop or job" }).fill("fufu");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=fufu/);
  await expect(page.locator("#catalogue-search")).toHaveValue("fufu");
  await expect(cards(page).first()).toContainText(/Fufu/);
});
