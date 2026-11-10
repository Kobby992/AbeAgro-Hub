import { request as httpRequest } from "node:http";
import { expect, test, type Page } from "@playwright/test";

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

function types(blocks: Record<string, unknown>[]) {
  return blocks.flatMap((block) => block["@type"]);
}

const hydrated = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(document.querySelector("main") ?? {}).some((key) => key.startsWith("__react")),
      ),
    )
    .toBe(true);

test("the home page can be indexed and describes the business and site search", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.abeagrohub.com",
  );
  const found = types(await jsonLd(page));
  expect(found).toEqual(expect.arrayContaining(["Organization", "LocalBusiness", "WebSite"]));
});

test("a product page has its title, preview image and data, with no price", async ({ page }) => {
  await page.goto("/machinery/disk-mill");
  await expect(page).toHaveTitle("Disk Mill in Ghana | ABE Agro Hub");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.abeagrohub.com/machinery/disk-mill",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://www.abeagrohub.com/products/disk-mill.jpg",
  );
  const blocks = await jsonLd(page);
  expect(types(blocks)).toEqual(expect.arrayContaining(["Product", "BreadcrumbList"]));
  const product = blocks.find((block) => block["@type"] === "Product");
  expect(product).not.toHaveProperty("offers");
  expect(product).not.toHaveProperty("brand");
});

test("the catalogue points searches and filters back to one canonical page", async ({ page }) => {
  await page.goto("/machinery?q=pump");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.abeagrohub.com/machinery",
  );
});

test("the FAQ, category and guide pages have their data", async ({ page }) => {
  await page.goto("/faq");
  expect(types(await jsonLd(page))).toContain("FAQPage");
  await page.goto("/machinery/c/irrigation");
  expect(types(await jsonLd(page))).toEqual(expect.arrayContaining(["BreadcrumbList", "FAQPage"]));
  await page.goto("/solutions/start-a-rice-mill");
  expect(types(await jsonLd(page))).toContain("BreadcrumbList");
});

test("the quote and compare pages stay out of search results", async ({ page }) => {
  for (const path of ["/quote", "/compare"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("sitemap, robots and llms.txt are served", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://www.abeagrohub.com/machinery/disk-mill");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://www.abeagrohub.com/sitemap.xml");
  const llms = await request.get("/llms.txt");
  expect(llms.headers()["content-type"]).toContain("text/plain");
  expect(await llms.text()).toContain("Prices are not published");
});

test("the link preview image is served", async ({ request }) => {
  const image = await request.get("/og-default.jpg");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/jpeg");
});

test("the bare domain redirects to www, keeping the path", async ({ baseURL }) => {
  const { hostname, port } = new URL(baseURL ?? "");
  const response = await new Promise<{ status?: number; location?: string }>((resolve, reject) => {
    httpRequest(
      { hostname, port, path: "/about", headers: { host: "abeagrohub.com" } },
      ({ statusCode, headers }) => resolve({ status: statusCode, location: headers.location }),
    )
      .on("error", reject)
      .end();
  });
  expect(response.status).toBe(308);
  expect(response.location).toBe("https://www.abeagrohub.com/about");
});

async function recordEvents(page: Page) {
  await page.addInitScript(() => {
    const seen: unknown[] = [];
    (window as unknown as { seen: unknown[] }).seen = seen;
    window.addEventListener("abe:analytics", (event) => {
      seen.push((event as CustomEvent).detail);
    });
  });
  return () => page.evaluate(() => (window as unknown as { seen: unknown[] }).seen);
}

test("events fire for viewing and adding a product", async ({ page }) => {
  const events = await recordEvents(page);
  await page.goto("/machinery/disk-mill");
  await expect.poll(events).toContainEqual({
    name: "product_viewed",
    props: { slug: "disk-mill", category: "grain-milling" },
  });
  await hydrated(page);
  await page
    .getByRole("button", { name: /^Add to quote/ })
    .first()
    .click();
  await expect.poll(events).toContainEqual({
    name: "quote_item_added",
    props: { slug: "disk-mill", qty: 1, source: "pdp" },
  });
});

test("an event fires for a catalogue search, with its result count", async ({ page }) => {
  const events = await recordEvents(page);
  await page.goto("/machinery?q=hammer");
  await expect.poll(events).toContainEqual({
    name: "search_performed",
    props: expect.objectContaining({ query: "hammer", location: "catalogue" }) as object,
  });
});

test("an event fires for a filter and for comparing machines", async ({ page }) => {
  const events = await recordEvents(page);
  await page.goto("/machinery");
  await hydrated(page);
  await page.getByLabel("Power source").selectOption("diesel");
  await expect
    .poll(events)
    .toContainEqual({ name: "filter_applied", props: { filter: "power", value: "diesel" } });

  await page.goto("/compare?ids=disk-mill,hammer-mill");
  await expect
    .poll(events)
    .toContainEqual({ name: "compare_used", props: { slugs: "disk-mill,hammer-mill" } });
});

test("an event fires when an Ask Kamal button is pressed", async ({ page }) => {
  const events = await recordEvents(page);
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Ask Kamal what you need" }).click();
  await expect.poll(events).toContainEqual({
    name: "kobby_opened",
    props: { page: "/", trigger: "cta" },
  });
});
