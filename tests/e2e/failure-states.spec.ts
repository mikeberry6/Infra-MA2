import { expect, test } from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

const TOP_LEVEL_FAILURE_FIXTURE = "E2E_TOP_LEVEL_FAILURE_FIXTURE";

test.describe("public failure and retry journeys", () => {
  const databases = [
    {
      path: "/tracker",
      heading: "Infrastructure Deal Tape",
      apiPattern: "**/api/deals/*",
      row: "tbody [data-deal-row-trigger]",
    },
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      apiPattern: "**/api/funds/*",
      row: "tbody [data-fund-row-trigger]",
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      apiPattern: "**/api/portfolio/*",
      row: "tbody [data-company-row-trigger]",
    },
  ] as const;

  for (const database of databases) {
    test(`${database.path} keeps list data visible and retries a failed detail request`, async ({ page }) => {
      let detailRequests = 0;
      await page.route(database.apiPattern, async (route) => {
        detailRequests += 1;
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Detail temporarily unavailable" }),
        });
      });

      await page.goto(appPath(database.path));
      await waitForApplication(page, database.heading);
      await page.locator(database.row).first().click();

      const dialog = page.getByRole("dialog");
      const failure = dialog.getByRole("alert");
      await expect(failure).toContainText("Latest detail could not be loaded");
      await expect(dialog).toContainText("Showing the list record");
      if (database.path === "/funds") {
        await expect(dialog.getByText("Unavailable while verified detail is offline")).toBeVisible();
        await expect(dialog.getByText("Pending Research review")).toHaveCount(0);
      }
      await expect.poll(() => detailRequests).toBe(1);

      const retry = failure.getByRole("button", { name: "Retry" });
      await retry.focus();
      await retry.click();
      await expect.poll(() => detailRequests).toBe(2);
      await expect(failure).toBeVisible();
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    });
  }
});

test.describe("top-level database failure and retry journeys", () => {
  const routes = [
    { path: "/tracker", title: "Deal data could not be loaded." },
    { path: "/funds", title: "Fund data could not be loaded." },
    { path: "/portfolio", title: "Portfolio company data could not be loaded." },
    { path: "/news", title: "News feed data could not be loaded." },
    { path: "/dashboard", title: "Dashboard data could not be loaded." },
    {
      path: "/search",
      requestPath: "/search?q=fiber",
      title: "Search data could not be loaded.",
    },
  ] as const;

  for (const route of routes) {
    test(`${route.path} distinguishes a database failure and retries the top-level query`, async ({ page }) => {
      test.skip(
        process.env[TOP_LEVEL_FAILURE_FIXTURE] !== "1",
        `Set ${TOP_LEVEL_FAILURE_FIXTURE}=1 with PLAYWRIGHT_BASE_URL pointing to a loopback-only local server whose test DATABASE_URL is deliberately unreachable`,
      );
      assertLoopbackFailureFixture();

      let routeRequests = 0;
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (request.method() === "GET" && url.pathname === appPath(route.path)) routeRequests += 1;
      });

      const requestPath = "requestPath" in route ? route.requestPath : route.path;
      await page.goto(appPath(requestPath));
      // Next.js also renders a route-announcer div with role="alert". Scope
      // assertions to the application's semantic failure-state section.
      const alert = page.locator('section[role="alert"]');
      await expect(alert.getByRole("heading", { name: route.title })).toBeVisible();
      await expect(alert).toContainText("not showing an empty result set");
      const retry = alert.getByRole("link", { name: "Try again" });
      await expect(retry).toHaveAttribute("href", appPath(requestPath));
      await expect(alert.getByRole("link", { name: "Contact research" })).toHaveAttribute(
        "href",
        "mailto:research@infrasight.com",
      );

      const requestsBeforeRetry = routeRequests;
      await retry.click();
      await expect.poll(() => routeRequests).toBeGreaterThan(requestsBeforeRetry);
      await expect(page.getByRole("alert").getByRole("heading", { name: route.title })).toBeVisible();
    });
  }
});

/**
 * Server Components execute top-level Prisma/provider-state queries before
 * browser routing can intercept them. This fixture therefore uses the
 * existing PLAYWRIGHT_BASE_URL mechanism and a separate local failure server,
 * never a production failure toggle. Persisted aggregate provider failures
 * still require an isolated seeded database; drawer provider retries above
 * remain fully deterministic through Playwright's browser API interception.
 */
function assertLoopbackFailureFixture(): void {
  const configured = process.env.PLAYWRIGHT_BASE_URL;
  if (!configured) {
    throw new Error(`${TOP_LEVEL_FAILURE_FIXTURE}=1 requires PLAYWRIGHT_BASE_URL.`);
  }
  const url = new URL(configured);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname)) {
    throw new Error("Top-level failure E2E is restricted to a loopback-only HTTP application server.");
  }
}
