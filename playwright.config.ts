import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3100);
const basePath = (process.env.E2E_BASE_PATH || "/Infra-MA2").replace(/\/$/, "");
const configuredUrl = process.env.PLAYWRIGHT_BASE_URL;
const origin = configuredUrl ? new URL(configuredUrl).origin : `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: origin,
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "test-results",
  webServer: configuredUrl
    ? undefined
    : {
        command: `npm run start -- -H 127.0.0.1 -p ${port}`,
        url: `${origin}${basePath}/funds`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: process.env.E2E_DATABASE_URL || process.env.DATABASE_URL || "",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "isolated-e2e-secret",
          NEXTAUTH_URL: `${origin}${basePath}/api/auth`,
        },
      },
});
