import { expect, test } from "@playwright/test";

const EMBED = "**/agent/embedjs/01a1ad995a9870008e58eaf7e2e8f461e4ce/embed.js";

// The widget is skipped for automated browsers, so these tests pose as a person. Jotform's script
// is replaced with an empty one, so they check the site's part without depending on Jotform.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
});

for (const path of ["/", "/machinery", "/machinery/corn-mill", "/about", "/quote", "/not-a-page"]) {
  test(`the chatbot loads once on ${path}`, async ({ page }) => {
    let requests = 0;
    await page.route(EMBED, (route) => {
      requests += 1;
      return route.fulfill({ contentType: "text/javascript", body: "" });
    });
    await page.goto(path);
    await expect.poll(() => requests).toBe(1);
  });
}

test("the chatbot does not reload when moving between pages", async ({ page }) => {
  let requests = 0;
  await page.route(EMBED, (route) => {
    requests += 1;
    return route.fulfill({ contentType: "text/javascript", body: "" });
  });
  await page.goto("/about");
  await expect.poll(() => requests).toBe(1);
  await page.getByRole("contentinfo").getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.waitForTimeout(500);
  expect(requests).toBe(1);
});

test("a page still works if Jotform cannot be reached", async ({ page }) => {
  await page.route(EMBED, (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search machinery" }).fill("water pump");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/machinery\?q=water/);
});
