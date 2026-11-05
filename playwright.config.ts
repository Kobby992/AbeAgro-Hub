import { defineConfig, devices } from "@playwright/test";

const port = process.env.E2E_PORT ?? "3100";
const baseURL = `http://localhost:${port}`;

// Runs against the production build, so run `npm run build` first (`npm run ci` does).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    {
      name: "mobile-390",
      // A real touch phone: isMobile makes (hover: hover) false, as on the Android phones we target.
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    url: baseURL,
    env: {
      QUOTE_TEST_SINK: ".e2e/quote-sink.jsonl",
      // Kobby runs on a scripted model in browser tests: no API key and no cost.
      KOBBY_TEST_MODEL: "1",
      KOBBY_IP_LIMIT: "1000",
    },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
