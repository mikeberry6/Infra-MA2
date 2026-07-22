import { expect, test } from "@playwright/test";
import { appPath, expectNoHorizontalOverflow, waitForApplication } from "./helpers";

test.describe("anonymous database journeys", () => {
  test("root permanently resolves to the canonical deal database", async ({ page }) => {
    const response = await page.goto(appPath("/"));
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${appPath("/tracker")}$`));
    await waitForApplication(page, "Infrastructure Deal Tape");
  });

  test("browse, sort, paginate, search, and restore URL state", async ({ page }) => {
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");
    await expect(page.getByText("1/15", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Target \/ Seller" }).click();
    await expect(page).toHaveURL(/sort=target/);
    await expect(page).toHaveURL(/direction=asc/);

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("2/15", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Deal results" })).toBeFocused();

    await page.getByRole("textbox", { name: "Search deals" }).fill("Brookfield");
    await expect(page).toHaveURL(/q=Brookfield/);
    await expect(page).not.toHaveURL(/page=2/);

    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await page.goForward();
    await expect(page).toHaveURL(/q=Brookfield/);
  });

  test("mobile filters expose every taxonomy and reset pagination", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${appPath("/tracker")}?page=2`);
    await waitForApplication(page, "Infrastructure Deal Tape");

    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    const sectorFilter = dialog.getByRole("button", { name: "Filter by Sector" });
    await sectorFilter.focus();
    await sectorFilter.press("Enter");
    const powerOption = page.getByRole("option", { name: /Power & ET/ });
    await expect(powerOption).toBeFocused();
    await powerOption.press("Space");
    await expect(page).toHaveURL(/sector=Power(?:\+|%20)%26(?:\+|%20)ET/);
    await expect(page).not.toHaveURL(/page=2/);
    await expect(trigger).toContainText("1");

    await powerOption.press("Escape");
    await expect(sectorFilter).toBeFocused();
    await expect(dialog).toBeVisible();

    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("drawers are deep-linkable and restore focus", async ({ page }) => {
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const row = page.locator("tbody [data-row-trigger]").first();
    await row.focus();
    await row.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/focus=/);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/focus=/);
    await expect(row).toBeFocused();
  });

  for (const database of [
    { path: "/funds", heading: "Infrastructure Fund Database" },
    { path: "/portfolio", heading: "Infrastructure Portfolio Company Database" },
  ] as const) {
    test(`${database.path} drawer restores focus to its triggering result`, async ({ page }) => {
      await page.goto(appPath(database.path));
      await waitForApplication(page, database.heading);

      const row = page.locator("tbody tr[role=button]").first();
      await row.focus();
      await row.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(row).toBeFocused();
      await expect(page).not.toHaveURL(/focus=/);
    });
  }

  test("cross-database search is ranked, grouped, and deep-linked", async ({ page }) => {
    await page.goto(`${appPath("/search")}?q=Brookfield`);
    await waitForApplication(page, "Search InfraSight");
    await expect(page.getByRole("heading", { name: "Deals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Funds" })).toBeVisible();
    await expect(page.locator('a[href*="focus="]').first()).toBeVisible();
  });

  for (const database of [
    { path: "/funds", heading: "Infrastructure Fund Database", sort: "Strategy" },
    { path: "/portfolio", heading: "Infrastructure Portfolio Company Database", sort: "Sector" },
  ] as const) {
    test(`${database.path} writes sort state atomically and restores it with browser history`, async ({ page }) => {
      await page.goto(`${appPath(database.path)}?page=2`);
      await waitForApplication(page, database.heading);

      await page.getByRole("button", { name: database.sort, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`sort=${database.sort.toLowerCase()}`));
      await expect(page).not.toHaveURL(/page=2/);
      await expect(page).not.toHaveURL(/direction=/);

      await page.goBack();
      await expect(page).toHaveURL(/page=2/);
      await expect(page).not.toHaveURL(/sort=/);
    });
  }

  test("manager-grouped fund pages remain capped at 25 result records", async ({ page }) => {
    await page.goto(`${appPath("/funds")}?view=managers`);
    await waitForApplication(page, "Infrastructure Fund Database");

    await expect(page.locator("tbody tr[role=button]")).toHaveCount(25);
    await expect(page.getByRole("button", { name: "Next page" })).toBeVisible();
    await expect(page.locator("tbody").getByRole("button", { expanded: true }).first()).toBeVisible();
  });

  test("news filters are reachable without a horizontally scrolling mobile row", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appPath("/news"));
    await waitForApplication(page, "Daily Intelligence Feed");

    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    for (const label of ["Category", "Entity", "Source", "Confidence"]) {
      await expect(dialog.getByRole("button", { name: `Filter by ${label}` })).toBeVisible();
    }
    await dialog.getByRole("button", { name: "30D" }).click();
    await expect(trigger).toContainText("1");
    await dialog.press("Escape");
    await expect(trigger).toBeFocused();
    for (const width of [320, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoHorizontalOverflow(page);
    }
  });

  for (const [path, heading] of [
    ["/tracker", "Infrastructure Deal Tape"],
    ["/funds", "Infrastructure Fund Database"],
    ["/portfolio", "Infrastructure Portfolio Company Database"],
  ] as const) {
    test(`${path} has no horizontal overflow from mobile to desktop`, async ({ page }) => {
      for (const width of [320, 390, 768, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(appPath(path));
        await waitForApplication(page, heading);
        await expectNoHorizontalOverflow(page);
      }
    });
  }
});
