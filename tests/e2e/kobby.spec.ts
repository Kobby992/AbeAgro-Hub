import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Kobby runs on a scripted model here (src/kobby/test-model.ts). These tests prove the route, tools
// and chat work together. Kobby's judgement is tested against the real model by tests/kobby/evals.yaml.

async function openKobby(page: Page, url = "/") {
  await page.goto(url);
  await page.getByRole("button", { name: "Ask Kobby", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Kobby" })).toBeVisible();
  return dialog;
}

async function say(page: Page, text: string) {
  await page.getByRole("textbox", { name: "Your message to Kobby" }).fill(text);
  await page.getByRole("button", { name: "Send message" }).click();
}

test("opens with the greeting and chips, and answers with streamed text", async ({ page }) => {
  const dialog = await openKobby(page);
  await expect(dialog.getByText("Akwaaba! I'm Kobby from ABE Agro Hub.")).toBeVisible();
  for (const chip of ["Find a water pump", "Start a rice mill", "Grinding & milling"]) {
    await expect(dialog.getByRole("button", { name: chip })).toBeVisible();
  }
  await expect(dialog.getByRole("link", { name: "Talk to a person on WhatsApp" })).toBeVisible();
  await expect(dialog.getByText("Chats are saved to improve service.")).toBeVisible();

  await say(page, "Hello");
  await expect(dialog.getByText("Tell me what you grow or process, and I will")).toBeVisible();
});

test("a chip shows product cards with their three actions", async ({ page }) => {
  const dialog = await openKobby(page);
  await dialog.getByRole("button", { name: "Find a water pump" }).click();

  const card = dialog.locator('[data-kobby-card="petrol-water-pump-3-inch-wp30"]');
  await expect(card).toBeVisible();
  await expect(dialog.locator('[data-kobby-card="pvc-lay-flat-irrigation-hose"]')).toBeVisible();
  await expect(card.getByRole("link", { name: "Details" })).toHaveAttribute(
    "href",
    "/machinery/petrol-water-pump-3-inch-wp30",
  );
  await expect(card.getByRole("link", { name: "Get quote" })).toHaveAttribute("href", /wa\.me/);

  await card.getByRole("button", { name: "+ Add to list" }).click();
  await expect(card.getByRole("button", { name: "Added" })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("abe-quote-list"));
  expect(stored).toContain("petrol-water-pump-3-inch-wp30");
});

test("Kobby adds to the same quote list the site uses", async ({ page }) => {
  const dialog = await openKobby(page);
  await say(page, "Add two pumps to my list");
  await expect(dialog.getByText("Added to your quote list:")).toBeVisible();

  await dialog.getByRole("link", { name: "View list" }).click();
  await expect(page).toHaveURL(/\/quote$/);
  await expect(dialog).toBeHidden();
  const stored = await page.evaluate(() => localStorage.getItem("abe-quote-list"));
  expect(stored).toContain('"qty":2');
});

test("the full quote flow ends in a valid WhatsApp link and a saved lead", async ({ page }) => {
  const dialog = await openKobby(page);
  await say(page, "My details are Ama Mensah, 0241234567, Kasoa");

  const send = dialog.getByRole("link", { name: "Send to ABE on WhatsApp" });
  await expect(send).toBeVisible();
  const url = new URL((await send.getAttribute("href")) ?? "");
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe("/233557042005");

  const text = url.searchParams.get("text") ?? "";
  const reference = /ABE-Q-[\w-]+/.exec(text)?.[0] ?? "";
  expect(reference).not.toBe("");
  expect(text).toContain("Ama Mensah");
  expect(text).toContain("× 2");
  await expect(dialog.getByRole("heading", { name: `Quote request ${reference}` })).toBeVisible();

  const lead = readFileSync(".e2e/quote-sink.jsonl", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { type: string; data: { reference?: string } })
    .find((entry) => entry.type === "lead" && entry.data.reference === reference);
  expect(lead?.data).toMatchObject({ source: "kobby", phoneE164: "+233241234567" });
});

test("hands off to a person with a WhatsApp button", async ({ page }) => {
  const dialog = await openKobby(page);
  await say(page, "Do you sell tractors?");
  const link = dialog.getByRole("link", { name: "Continue with our team on WhatsApp" });
  await expect(link).toHaveAttribute("href", /wa\.me.*tractor/);
});

test("a failed reply offers WhatsApp and a retry", async ({ page }) => {
  const dialog = await openKobby(page);
  await say(page, "server error please");
  const alert = dialog.getByRole("alert");
  await expect(alert.getByText("Kobby can't reply right now.")).toBeVisible();
  await expect(alert.getByRole("link", { name: "Message us on WhatsApp" })).toHaveAttribute(
    "href",
    /wa\.me/,
  );
  await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("a limit from the server shows the WhatsApp fallback", async ({ page }) => {
  await page.route("/api/kobby", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"daily_cap"}' }),
  );
  const dialog = await openKobby(page);
  await say(page, "Hello");
  await expect(dialog.getByRole("alert").getByRole("link")).toHaveAttribute("href", /wa\.me/);
});

test("on a product page Kobby opens about that machine and sends the page", async ({ page }) => {
  const dialog = await openKobby(page, "/machinery/corn-mill");
  await expect(dialog.getByText("Ask me anything about the")).toContainText("Corn Mill");
  await expect(dialog.getByRole("button", { name: "Is this right for me?" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "What power does it need?" })).toBeVisible();

  const request = page.waitForRequest("/api/kobby");
  await dialog.getByRole("button", { name: "Add to quote" }).click();
  const payload = (await request).postDataJSON() as { path: string };
  expect(payload.path).toBe("/machinery/corn-mill");
});

test("the chat survives moving to another page, and reset clears it", async ({ page }) => {
  const dialog = await openKobby(page);
  await say(page, "Hello");
  const reply = dialog.getByText("Tell me what you grow or process, and I will");
  await expect(reply).toBeVisible();

  await page.keyboard.press("Escape");
  await page.goto("/about");
  await page.getByRole("button", { name: "Ask Kobby", exact: true }).click();
  await expect(reply).toBeVisible();

  await dialog.getByRole("button", { name: "Start a new chat" }).click();
  await expect(reply).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Find a water pump" })).toBeVisible();
});

test("Escape closes the panel and returns focus; Tab stays inside", async ({ page }) => {
  const dialog = await openKobby(page);
  for (let press = 0; press < 12; press += 1) await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Ask Kobby", exact: true })).toBeFocused();
});

test("the teaser shows once after 20 seconds on a product page", async ({ page }) => {
  await page.clock.install();
  await page.goto("/machinery/corn-mill");
  const teaser = page.getByRole("button", { name: /Need help choosing a Corn Mill/ });
  await expect(teaser).toHaveCount(0);
  // The timer starts once the page has hydrated, so keep moving the clock until it fires.
  await expect(async () => {
    await page.clock.fastForward(21_000);
    await expect(teaser).toBeVisible({ timeout: 500 });
  }).toPass();
  await teaser.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.clock.fastForward(21_000);
  await expect(teaser).toHaveCount(0);
});

test("the open panel has no accessibility violations", async ({ page }) => {
  const dialog = await openKobby(page);
  await dialog.getByRole("button", { name: "Find a water pump" }).click();
  await expect(dialog.locator("[data-kobby-card]").first()).toBeVisible();
  await expect(dialog.getByText("Would you like a quote")).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(results.violations).toEqual([]);
});
