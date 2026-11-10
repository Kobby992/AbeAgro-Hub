import { expect, test, type Page } from "@playwright/test";

const EMBED = "**/agent/embedjs/01a1ad995a9870008e58eaf7e2e8f461e4ce/embed.js";

const hydrated = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(document.querySelector("main") ?? {}).some((key) => key.startsWith("__react")),
      ),
    )
    .toBe(true);

// The widget waits for the customer's first action.
async function firstAction(page: Page) {
  await hydrated(page);
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollBy(0, 30));
}

// The widget is skipped for automated browsers, so these tests pose as a person. Jotform's script
// is replaced with an empty one, so they check the site's part without depending on Jotform.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
});

for (const path of ["/", "/machinery", "/machinery/disk-mill", "/about", "/quote", "/not-a-page"]) {
  test(`the chatbot loads once on ${path}`, async ({ page }) => {
    let requests = 0;
    await page.route(EMBED, (route) => {
      requests += 1;
      return route.fulfill({ contentType: "text/javascript", body: "" });
    });
    await page.goto(path);
    await firstAction(page);
    await expect.poll(() => requests).toBe(1);
  });
}

test("the chatbot waits for the customer's first action", async ({ page }) => {
  let requests = 0;
  await page.route(EMBED, (route) => {
    requests += 1;
    return route.fulfill({ contentType: "text/javascript", body: "" });
  });
  await page.goto("/");
  await page.waitForTimeout(1_500);
  expect(requests).toBe(0);
  await firstAction(page);
  await expect.poll(() => requests).toBe(1);
});

test("the chatbot does not reload when moving between pages", async ({ page }) => {
  let requests = 0;
  await page.route(EMBED, (route) => {
    requests += 1;
    return route.fulfill({ contentType: "text/javascript", body: "" });
  });
  await page.goto("/about");
  await firstAction(page);
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

// Stands in for Jotform's widget: a container holding the button our page presses.
const FAKE_WIDGET = `
  const box = document.createElement("div");
  box.className = "embedded-agent-container";
  const toggle = document.createElement("button");
  toggle.className = "ai-agent-chat-avatar";
  toggle.addEventListener("click", () => box.classList.add("opened"));
  box.append(toggle);
  document.body.append(box);
`;

test("an Ask Kobby button opens the chatbot, not the panel", async ({ page }) => {
  await page.route(EMBED, (route) =>
    route.fulfill({ contentType: "text/javascript", body: FAKE_WIDGET }),
  );
  await page.goto("/");
  await firstAction(page);
  await expect(page.locator(".ai-agent-chat-avatar")).toBeAttached();
  await page.getByRole("button", { name: "Ask Kobby what you need" }).click();
  await expect(page.locator(".embedded-agent-container.opened")).toBeAttached();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("an Ask Kobby button keeps trying until the chatbot responds", async ({ page }) => {
  await page.route(EMBED, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: FAKE_WIDGET.replace(
        'toggle.addEventListener("click", () => box.classList.add("opened"));',
        'let presses = 0; toggle.addEventListener("click", () => { presses += 1; if (presses > 1) box.classList.add("opened"); });',
      ),
    }),
  );
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Ask Kobby what you need" }).click();
  await expect(page.locator(".embedded-agent-container.opened")).toBeAttached();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("pressing a second Ask Kobby button does not close the open chatbot", async ({ page }) => {
  await page.route(EMBED, (route) =>
    route.fulfill({ contentType: "text/javascript", body: FAKE_WIDGET }),
  );
  await page.goto("/");
  await firstAction(page);
  await expect(page.locator(".ai-agent-chat-avatar")).toBeAttached();
  const clicks = page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let count = 0;
        document
          .querySelector(".ai-agent-chat-avatar")
          ?.addEventListener("click", () => (count += 1));
        setTimeout(() => resolve(count), 1_000);
      }),
  );
  const button = page.getByRole("button", { name: "Ask Kobby what you need" });
  await button.click();
  await button.click();
  expect(await clicks).toBe(1);
});

test("if Jotform cannot be reached, an Ask Kobby button opens the panel", async ({ page }) => {
  await page.route(EMBED, (route) => route.abort());
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Ask Kobby what you need" }).click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 6_000 });
});
