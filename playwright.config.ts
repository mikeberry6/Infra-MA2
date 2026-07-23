import { defineConfig, devices } from "@playwright/test";
import { assertIsolatedBrowserTarget } from "./tests/e2e/isolation-guard";

const port = Number(process.env.E2E_PORT || 3100);
const configuredUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = configuredUrl ? new URL(configuredUrl).origin : `http://127.0.0.1:${port}`;
const basePath = process.env.E2E_BASE_PATH || "/Infra-MA2";
const isolatedDatabaseConfigured = Boolean(process.env.E2E_DATABASE_URL);
const releaseSha = process.env.RELEASE_SHA ?? "";

// Fail before the application server starts if a database-backed browser run
// cannot prove that its target is the allow-listed validation branch.
if (isolatedDatabaseConfigured) assertIsolatedBrowserTarget();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  outputDir: "test-results",
  webServer: configuredUrl
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        url: `${baseURL}${basePath}/tracker`,
        reuseExistingServer: !process.env.CI && !isolatedDatabaseConfigured,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
        env: {
          ...process.env,
          DATABASE_URL: process.env.E2E_DATABASE_URL || "",
          RELEASE_SHA: releaseSha,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "e2e-only-secret-not-for-production",
          NEXTAUTH_URL: `${baseURL}${basePath}/api/auth`,
        },
      },
});
