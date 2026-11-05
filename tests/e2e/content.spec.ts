import { existsSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { solutions } from "../../src/config/solutions";

const PAGES: [string, string][] = [
  ["/solutions", "Start or grow your agri-business"],
  ...solutions.map((s): [string, string] => [`/solutions/${s.slug}`, s.title]),
  ["/how-it-works", "How it works"],
  ["/about", "About ABE Agro Hub"],
  ["/partners", "Reach agricultural buyers through ABE"],
  ["/contact", "Contact us"],
  ["/faq", "Frequently asked questions"],
  ["/privacy", "Privacy policy"],
  ["/terms", "Terms of use"],
];

const sinkHas = (type: string, text: string) =>
  existsSync(".e2e/quote-sink.jsonl") &&
  readFileSync(".e2e/quote-sink.jsonl", "utf8")
    .split("\n")
    .some((line) => line.includes(`"type":"${type}"`) && line.includes(text));

const stubMap = (page: Page) =>
  page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>Map</title>" }),
  );

test("every content page renders, with no TODO text and no prices", async ({ request }) => {
  for (const [path, title] of PAGES) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html, path).toContain(title.replace(/&/g, "&amp;"));
    expect(html, path).not.toMatch(/TODO|Lorem ipsum|on its way/i);
    expect(html, path).not.toMatch(/GH₵|GHS\s?\d|\bcedis?\b/i);
  }
});

for (const [path] of PAGES) {
  test(`${path} passes layout and accessibility checks`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await stubMap(page);
    await page.goto(path);
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
    expect(errors).toEqual([]);
  });
}

test("no internal link is broken", async ({ page, request }) => {
  test.setTimeout(120_000);
  const start = ["/", "/machinery", "/machinery/corn-mill", "/compare", "/quote"];
  const seen = new Set<string>();
  for (const path of [...start, ...PAGES.map(([p]) => p)]) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    for (const href of hrefs) seen.add(href.split("#")[0] ?? "");
  }
  const broken: string[] = [];
  for (const href of seen) {
    const response = await request.get(href);
    if (response.status() !== 200) broken.push(`${href} (${response.status()})`);
  }
  expect(broken).toEqual([]);
  expect(seen.size).toBeGreaterThan(50);
});

test("a guide shows its process, machines and prompts, and adds the whole set", async ({
  page,
}) => {
  await page.goto("/solutions/start-a-rice-mill");
  await expect(page.getByText("Destoner", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Power options" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Machines" }).getByRole("article")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Should I choose the SB10 or the SB30?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add the whole set to quote" }).click();
  await expect(page.getByRole("banner").locator("[data-quote-target]")).toHaveAccessibleName(
    "Quote list 4 items",
  );
});

test("FAQ shows confirmed answers and hides ones still waiting", async ({ page }) => {
  await page.goto("/faq");
  await page.getByText("How do I get a price?").click();
  await expect(page.getByText("Tap Get quote on any product.")).toBeVisible();
  await expect(page.getByText("Do you help with installation")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Using Kobby" })).toBeVisible();
});

test("unknown pages get the branded 404 with search and Kobby", async ({ page }) => {
  for (const path of ["/not-a-real-page", "/solutions/not-a-guide"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { name: "We could not find that page" })).toBeVisible();
  }
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask Kobby what you need" })).toBeVisible();
  await page.getByRole("main").getByRole("searchbox").fill("corn mill");
  await page.getByRole("main").getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/machinery\?q=corn/);
});

test("contact page has every way to reach ABE", async ({ page }) => {
  await stubMap(page);
  await page.goto("/contact");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Chat on WhatsApp" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/233557042005/,
  );
  await expect(main.getByRole("link", { name: /Call \+233 55 704 2005/ })).toHaveAttribute(
    "href",
    "tel:+233557042005",
  );
  await expect(main.getByRole("link", { name: "sales@abeagrohub.com" })).toBeVisible();
  await expect(main.getByTitle("Map of Kasoa, Ghana")).toHaveAttribute("loading", "lazy");
});

for (const [path, kind, submitter] of [
  ["/contact", "contact", "Ama Contact"],
  ["/partners", "partner", "Kofi Partner"],
] as const) {
  test(`${kind} form validates, saves, emails and offers WhatsApp`, async ({ page }, testInfo) => {
    const name = `${submitter} ${testInfo.project.name}`;
    await stubMap(page);
    await page.goto(path);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Enter your name.")).toBeVisible();
    await expect(page.getByText("Enter a phone number or an email")).toBeVisible();
    await expect(page.getByText("Tell us how we can help.")).toBeVisible();

    await page.getByLabel("Your name").fill(name);
    await page.getByLabel("Phone or WhatsApp").fill("024 123 4567");
    await page.getByLabel("Message").fill("Please call me about your machines.");
    await page.waitForTimeout(2100); // Faster than this looks like a bot.
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message sent. Our team will reply.")).toBeVisible();
    const link = await page.getByRole("link", { name: "Send on WhatsApp" }).getAttribute("href");
    expect(new URL(link ?? "").searchParams.get("text")).toContain("Please call me");
    await expect.poll(() => sinkHas(kind, name)).toBe(true);
    await expect.poll(() => sinkHas("email", name)).toBe(true);
  });
}

test("if a form cannot send, the customer is pointed to WhatsApp", async ({ page }) => {
  await stubMap(page);
  await page.route("**/api/contact", (route) => route.abort());
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Ama Mensah");
  await page.getByLabel("Email").fill("ama@example.com");
  await page.getByLabel("Message").fill("Do you sell seed planters?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Your message did not send.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Send on WhatsApp" })).toBeVisible();
});

test("spam is ignored quietly", async ({ request }) => {
  const enquiry = { name: "Spam Bot Unique", email: "spam@example.com", message: "Buy my stuff" };
  const response = await request.post("/api/contact", { data: { enquiry, elapsedMs: 50 } });
  expect(response.status()).toBe(200);
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(sinkHas("contact", "Spam Bot Unique")).toBe(false);
});
