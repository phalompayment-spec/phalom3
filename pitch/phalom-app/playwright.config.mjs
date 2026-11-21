import { defineConfig, devices } from "@playwright/test";

const useExternal = process.env.E2E_EXTERNAL_SERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.MERCHANT_URL || "http://127.0.0.1:8787",
    timezoneId: "Asia/Vientiane",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : undefined,
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: useExternal
    ? undefined
    : {
        command: "node scripts/e2e-server.mjs",
        url: "http://127.0.0.1:8787/api/health",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
