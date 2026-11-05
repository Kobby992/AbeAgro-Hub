import { existsSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SINK = ".e2e/quote-sink.jsonl";

type SinkRecord = { type: string; data: Record<string, unknown> };

const sink = (): SinkRecord[] =>
  existsSync(SINK)
    ? readFileSync(SINK, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as SinkRecord)
    : [];

const records = (type: string, reference: string) =>
  sink().filter(
    (record) => record.type === type && JSON.stringify(record.data).includes(reference),
  );

/** Catches WhatsApp opening, in a new tab or this one, without leaving for the real site. */
async function watchWhatsApp(page: Page) {
  const opened: string[] = [];
  await page.context().route("https://wa.me/**", (route) => {
    opened.push(route.request().url());
    return route.fulfill({ contentType: "text/html", body: "<title>WhatsApp</title>" });
  });
  return opened;
}

const messageIn = (url: string) => new URL(url).searchParams.get("text") ?? "";
const referenceIn = (text: string) => /ABE-Q-\d{6}-[0-9A-Z]{4}/.exec(text)?.[0] ?? "";

async function addThreeMachines(page: Page) {
  await page.goto("/machinery?cat=rice-processing");
  const names = ["SB10 Rice Mill", "JLX Rice Destoner", "CHP150 Rice Mill"];
  for (const [index, name] of names.entries()) {
    await page.getByRole("button", { name: `Add ${name} to quote list` }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("abe-quote-list") ?? "{}").state?.items.length,
        ),
      )
      .toBe(index + 1);
  }
}

async function fillForm(page: Page) {
  await page.getByLabel("Full name").fill("Kwame Mensah");
  await page.getByLabel("Phone or WhatsApp number").fill("024 123 4567");
  await page.getByLabel("Town").fill("Tamale");
  await page.getByLabel("Region").selectOption("Northern");
  await page.getByLabel("I am a (optional)").selectOption("Farmer");
  await page.getByLabel("Message (optional)").fill("Please include delivery to Tamale.");
  await page.getByLabel("ABE may contact me about this request").check();
  await page.waitForTimeout(2100); // Faster than this looks like a bot.
}

test("add 3 items, submit: correct WhatsApp link, lead saved, email sent", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await addThreeMachines(page);

  await page.getByRole("banner").locator("[data-quote-target]").click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByRole("heading", { name: "Your quote list" })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "SB10 Rice Mill" })).toBeVisible();
  await drawer.getByRole("button", { name: "Increase quantity of SB10 Rice Mill" }).click();
  await drawer.getByRole("link", { name: "Review and send request" }).click();
  await expect(page).toHaveURL(/\/quote$/);

  await page.getByLabel("Note for this machine").first().fill("need diesel option");
  await fillForm(page);

  const preview = page.getByLabel("Preview of your WhatsApp message");
  await expect(preview).toContainText("*Name:* Kwame Mensah");
  await expect(preview).toContainText("+233 24 123 4567");
  await expect(preview).toContainText("Tamale, Northern Region");

  await page.getByRole("button", { name: "Send quote request on WhatsApp" }).click();
  await expect.poll(() => opened.length).toBeGreaterThan(0);

  const url = opened[0] ?? "";
  expect(url.startsWith("https://wa.me/233557042005?text=")).toBe(true);
  const text = messageIn(url);
  const reference = referenceIn(text);
  expect(reference).toMatch(/^ABE-Q-\d{6}-[0-9A-HJKMNP-TV-Z]{4}$/);
  for (const part of [
    "*Name:* Kwame Mensah",
    "*Phone:* +233 24 123 4567",
    "*Location:* Tamale, Northern Region",
    "*I am a:* Farmer",
    "1. SB10 Rice Huller / Mill × 2",
    "   Note: need diesel option",
    "2. JLX Rice Destoner × 1",
    "3. CHP150 Rice Milling Machine × 1",
    "*Message:* Please include delivery to Tamale.",
    "Sent from www.abeagrohub.com",
  ]) {
    expect(text).toContain(part);
  }

  await expect.poll(() => records("lead", reference).length).toBe(1);
  const lead = records("lead", reference)[0]?.data;
  expect(lead?.source).toBe("site");
  expect(lead?.name).toBe("Kwame Mensah");
  expect(lead?.phoneE164).toBe("+233241234567");
  expect(lead?.location).toBe("Tamale, Northern Region");
  expect(lead?.items).toEqual([
    {
      slug: "sb10-rice-huller-mill",
      name: "SB10 Rice Huller / Mill",
      qty: 2,
      note: "need diesel option",
    },
    { slug: "jlx-rice-destoner", name: "JLX Rice Destoner", qty: 1 },
    { slug: "chp150-rice-milling-machine", name: "CHP150 Rice Milling Machine", qty: 1 },
  ]);

  await expect.poll(() => records("email", reference).length).toBe(1);
  expect(records("email", reference)[0]?.data.text).toContain("SB10 Rice Huller / Mill × 2");
  await expect.poll(() => records("opened", reference).length).toBe(1);
});

test("the success screen shows the reference, and the list empties", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-390", "Phones leave for WhatsApp in the same tab");
  const opened = await watchWhatsApp(page);
  await addThreeMachines(page);
  await page.goto("/quote");
  await fillForm(page);
  await page.getByRole("button", { name: "Send quote request on WhatsApp" }).click();

  await expect(page.getByRole("heading", { name: "Your request is ready to send" })).toBeFocused();
  await expect.poll(() => opened.length).toBeGreaterThan(0);
  await expect(page.getByText(referenceIn(messageIn(opened[0] ?? "")))).toBeVisible();
  const again = await page.getByRole("link", { name: "Open WhatsApp again" }).getAttribute("href");
  expect(messageIn(again ?? "")).toBe(messageIn(opened[0] ?? ""));
  await expect(page.getByRole("banner").locator("[data-quote-target]")).toHaveAccessibleName(
    "Quote list 0 items",
  );
  await page.screenshot({ path: "test-results/screenshots/quote-sent.png" });
});

test("if the API is down, the customer still reaches ABE with a reference", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await page.route("**/api/quote", (route) => route.abort());
  await addThreeMachines(page);
  await page.goto("/quote");
  await fillForm(page);
  await page.getByRole("button", { name: "Send quote request on WhatsApp" }).click();

  await expect.poll(() => opened.length).toBeGreaterThan(0);
  const text = messageIn(opened[0] ?? "");
  expect(referenceIn(text)).not.toBe("");
  expect(text).toContain("*Name:* Kwame Mensah");
  expect(text).toContain("1. SB10 Rice Huller / Mill × 1");
});

test("the form explains what is missing and does not send", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await addThreeMachines(page);
  await page.goto("/quote");
  await page.getByLabel("Phone or WhatsApp number").fill("123");
  await page.getByRole("button", { name: "Send quote request on WhatsApp" }).click();

  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter a valid phone number")).toBeVisible();
  await expect(page.getByText("Enter your town")).toBeVisible();
  await expect(page.getByText("Choose your region.")).toBeVisible();
  await expect(page.getByText("Tick this box")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  expect(opened).toEqual([]);

  await page.getByLabel("Region").selectOption("Outside Ghana");
  await expect(page.getByLabel("Country")).toBeVisible();
});

test("one-tap Get quote logs a lead and opens WhatsApp with a reference", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await page.goto("/machinery?cat=grain-milling");
  await page.getByRole("link", { name: "Get quote for Corn Mill on WhatsApp" }).click();

  await expect.poll(() => opened.length).toBeGreaterThan(0);
  const text = messageIn(opened[0] ?? "");
  expect(text).toContain("*Corn Mill* × 1");
  expect(text).toContain("Product link: https://www.abeagrohub.com/machinery/corn-mill");
  const reference = referenceIn(text);
  expect(reference).not.toBe("");

  await expect.poll(() => records("lead", reference).length).toBe(1);
  const lead = records("lead", reference)[0]?.data;
  expect(lead?.source).toBe("product-quick");
  expect(lead?.name).toBeUndefined();
  await expect.poll(() => records("email", reference).length).toBe(1);
});

test("one-tap on a product page carries the quantity", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await page.goto("/machinery/hammer-mill");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("link", { name: "Get quote on WhatsApp" }).click();
  await expect.poll(() => opened.length).toBeGreaterThan(0);
  expect(messageIn(opened[0] ?? "")).toContain("*Hammer Mill* × 2");
});

test("one-tap still works, with a reference, if the API is down", async ({ page }) => {
  const opened = await watchWhatsApp(page);
  await page.route("**/api/quote", (route) => route.abort());
  await page.goto("/machinery/corn-mill");
  await page.getByRole("link", { name: "Get quote on WhatsApp" }).click();
  await expect.poll(() => opened.length).toBeGreaterThan(0);
  const text = messageIn(opened[0] ?? "");
  expect(text).toContain("*Corn Mill* × 1");
  expect(referenceIn(text)).not.toBe("");
});

test("the API rejects bad input and quietly ignores spam", async ({ request }) => {
  const send = (data: object) => request.post("/api/quote", { data });
  const items = [{ slug: "corn-mill", qty: 1 }];
  const customer = {
    name: "Bot",
    phone: "0241234567",
    town: "Kasoa",
    region: "Central",
    consent: true,
  };

  expect((await send({ source: "nope" })).status()).toBe(400);
  expect((await send({ source: "site", items })).status()).toBe(400);
  expect(
    (await send({ source: "product-quick", items: [{ slug: "fake", qty: 1 }] })).status(),
  ).toBe(400);

  for (const spam of [{ website: "http://spam.example" }, { elapsedMs: 100 }]) {
    const response = await send({ source: "site", items, customer, ...spam });
    expect(response.status()).toBe(200);
    const { reference } = (await response.json()) as { reference: string };
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(records("lead", reference)).toEqual([]);
    expect(records("email", reference)).toEqual([]);
  }
});

test("clearing the list can be undone, and an empty list says what to do", async ({ page }) => {
  await addThreeMachines(page);
  await page.goto("/quote");
  await page.getByRole("button", { name: "Clear list" }).click();
  await expect(page.getByText("Your quote list is empty.")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("link", { name: "SB10 Rice Mill" })).toBeVisible();
});

test("quote page and drawer pass checks", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await addThreeMachines(page);

  await page.getByRole("banner").locator("[data-quote-target]").click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "SB10 Rice Mill" }),
  ).toBeVisible();
  const axeIssues = async () =>
    (await new AxeBuilder({ page }).analyze()).violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((node) => node.target) }));
  expect(await axeIssues()).toEqual([]);
  await page.waitForTimeout(350);
  await page.screenshot({ path: `test-results/screenshots/drawer-${testInfo.project.name}.png` });

  await page.goto("/quote");
  await expect(page.getByRole("link", { name: "SB10 Rice Mill" })).toBeVisible();
  await page.getByRole("button", { name: "Send quote request on WhatsApp" }).click();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  expect(await axeIssues()).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
  expect(consoleErrors).toEqual([]);
  await page.screenshot({
    path: `test-results/screenshots/quote-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
