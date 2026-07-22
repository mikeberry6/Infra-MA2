import { defineConfig, devices } from "@playwright/test";
import { assertIsolatedWriteTarget } from "./tests/e2e/isolation-guard";

const port = Number(process.env.E2E_PORT || 3100);
const configuredUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = configuredUrl ? new URL(configuredUrl).origin : `http://127.0.0.1:${port}`;
const basePath = process.env.E2E_BASE_PATH || "/Infra-MA2";
const authUrl = `${baseURL}${basePath}/api/auth`;
const isolatedDatabaseConfigured = Boolean(process.env.E2E_DATABASE_URL);

// Validate before Playwright starts the application. A rejected database host
// therefore cannot even become the runtime target of the local test server.
if (isolatedDatabaseConfigured) assertIsolatedWriteTarget();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
    },
  },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  webServer: configuredUrl
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        url: `${baseURL}${basePath}/tracker`,
        // Auth tests perform durable throttle/workflow writes whenever an
        // isolated database is configured. Never reuse a developer server
        // whose target cannot be proved from this process; fail on a busy port.
        reuseExistingServer: !process.env.CI && !isolatedDatabaseConfigured,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: process.env.E2E_DATABASE_URL || process.env.DATABASE_URL || "",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "e2e-only-secret-change-before-production",
          NEXTAUTH_URL: authUrl,
        },
      },
});
