import { expect, test } from "@playwright/test";
import {
  appPath,
  expectNoAutomaticWcagAaViolations,
  waitForApplication,
} from "./helpers";

const PROVIDER_FAILURE_FIXTURE = "E2E_PROVIDER_FAILURE_FIXTURE";

function assertLoopbackProviderFixture(): void {
  const configured = process.env.PLAYWRIGHT_BASE_URL;
  if (!configured) {
    throw new Error(`${PROVIDER_FAILURE_FIXTURE}=1 requires PLAYWRIGHT_BASE_URL.`);
  }
  const url = new URL(configured);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname)) {
    throw new Error("Provider-failure E2E is restricted to a loopback-only HTTP application server.");
  }
}

test("isolated news and dashboard journeys expose failed external-provider states", async ({ page }) => {
  test.skip(
    process.env[PROVIDER_FAILURE_FIXTURE] !== "1",
    `Set ${PROVIDER_FAILURE_FIXTURE}=1 against the dedicated seeded validation fixture`,
  );
  assertLoopbackProviderFixture();

  await page.goto(appPath("/news"));
  await waitForApplication(page, "Daily Intelligence Feed");
  const newsStatus = page.getByLabel("News pipeline status");
  await expect(newsStatus).toContainText("Latest scan failed");
  await expect(newsStatus).toContainText("last successful results remain visible");
  await expect(newsStatus).toContainText("3/4 attempts");
  await expectNoAutomaticWcagAaViolations(page, {
    context: "failed news-provider state",
  });

  await page.goto(appPath("/dashboard"));
  await waitForApplication(page, "M&A Conditions Dashboard");
  const providerAlert = page.getByRole("alert").filter({ hasText: "Data provider update failed" });
  await expect(providerAlert).toContainText("did not update successfully");
  const sourceHealth = page
    .locator("article")
    .filter({ hasText: "Data Source Health / Last Updated" })
    .getByRole("table");
  const fredRow = sourceHealth.getByRole("row").filter({ hasText: "FRED" });
  await expect(fredRow).toContainText("failed");
  await expect(fredRow).toContainText("Missing required: VIX");
  await expect(
    page.getByRole("alert").filter({ hasText: "Dashboard synchronization failed" }),
  ).toBeVisible();
  await expectNoAutomaticWcagAaViolations(page, {
    context: "failed dashboard-provider state",
  });
});
