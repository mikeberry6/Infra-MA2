import { expect, test } from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

test.describe("public failure and retry journeys", () => {
  const databases = [
    {
      path: "/tracker",
      heading: "Infrastructure Deal Tape",
      apiPattern: "**/api/deals/*",
      row: "tbody [data-row-trigger]",
    },
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      apiPattern: "**/api/funds/*",
      row: "tbody tr[role=button]",
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      apiPattern: "**/api/portfolio/*",
      row: "tbody tr[role=button]",
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
      await expect.poll(() => detailRequests).toBe(1);

      await failure.getByRole("button", { name: "Retry" }).click();
      await expect.poll(() => detailRequests).toBe(2);
      await expect(failure).toBeVisible();
    });
  }
});
