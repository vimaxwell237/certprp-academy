import { defineConfig, devices } from "@playwright/test";

const playwrightHost = "127.0.0.1";
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "3000";
const playwrightBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://${playwrightHost}:${playwrightPort}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: playwrightBaseUrl,
    trace: "on-first-retry"
  },
  webServer: {
    command: `node_modules\\.bin\\next.cmd dev --hostname ${playwrightHost} --port ${playwrightPort}`,
    url: playwrightBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
