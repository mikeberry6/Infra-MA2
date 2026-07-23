import { expect, test, type Locator, type Page } from "@playwright/test";
import { appPath, expectNoHorizontalOverflow, waitForApplication } from "./helpers";
import {
  DRAWER_SHELL_BUDGET_MS,
  drawerShellMeasure,
  type DrawerKind,
} from "../../src/lib/drawer-performance";

const RESPONSIVE_WIDTHS = [320, 390, 768, 1280, 1440] as const;

async function firstRecordTrigger(page: Page, path: "/tracker" | "/funds" | "/portfolio"): Promise<Locator> {
  if (path === "/tracker") return page.locator("[data-deal-row-trigger]").first();
  return page.locator("tbody button").filter({ hasText: /.+/ }).first();
}

async function expectDrawerShellWithinBudget(page: Page, kind: DrawerKind) {
  const shellDuration = await page.evaluate((measureName) => {
    const entries = performance.getEntriesByName(measureName, "measure");
    return entries.at(-1)?.duration ?? null;
  }, drawerShellMeasure(kind));

  expect(shellDuration).not.toBeNull();
  expect(shellDuration ?? Number.POSITIVE_INFINITY).toBeLessThan(DRAWER_SHELL_BUDGET_MS);
}

test.describe("anonymous database journeys", () => {
  test("root permanently resolves to the canonical deal database", async ({ page }) => {
    await page.goto(appPath("/"));
    await expect(page).toHaveURL(new RegExp(`${appPath("/tracker")}$`));
    await waitForApplication(page, "Infrastructure Deal Tape");
  });

  test("deal browse, sort, paginate, search, and browser history are URL-addressable", async ({ page }) => {
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    await page.getByRole("button", { name: "Target / Seller" }).click();
    await expect(page).toHaveURL(/sort=target/);
    await expect(page).toHaveURL(/direction=asc/);

    const nextPage = page.getByRole("button", { name: "Next page" });
    if (await nextPage.isVisible()) {
      await nextPage.click();
      await expect(page).toHaveURL(/page=2/);
      await expect(page.getByRole("heading", { name: "Deal results" })).toBeFocused();
    }

    await page.getByRole("textbox", { name: "Search deals" }).fill("Brookfield");
    await expect(page).toHaveURL(/q=Brookfield/);
    await expect(page).not.toHaveURL(/page=2/);

    await page.goBack();
    await expect(page).not.toHaveURL(/q=Brookfield/);
    await page.goForward();
    await expect(page).toHaveURL(/q=Brookfield/);
  });

  test("mobile filters expose every deal taxonomy, active count, and removable chips", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${appPath("/tracker")}?page=2`);
    await waitForApplication(page, "Infrastructure Deal Tape");

    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    for (const label of ["Sector", "Region", "Category"]) {
      await expect(dialog.getByRole("button", { name: `Filter by ${label}` })).toBeVisible();
    }

    const sectorFilter = dialog.getByRole("button", { name: "Filter by Sector" });
    await sectorFilter.click();
    const option = page.getByRole("option").first();
    const optionName = (await option.textContent())?.trim() ?? "";
    await option.click();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(trigger).toContainText("1");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    if (optionName) {
      await expect(page.getByRole("button", { name: new RegExp(`Remove .*${optionName}`) })).toBeVisible();
    }
  });

  for (const database of [
    {
      path: "/tracker",
      heading: "Infrastructure Deal Tape",
      apiPattern: "**/api/deals/*",
      kind: "deal",
    },
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      apiPattern: "**/api/funds/*",
      kind: "fund",
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      apiPattern: "**/api/portfolio/*",
      kind: "company",
    },
  ] as const) {
    test(`${database.path} drawer is deep-linkable, keyboard closable, and restores focus`, async ({ page }) => {
      await page.route(database.apiPattern, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.continue();
      });
      await page.goto(appPath(database.path));
      await waitForApplication(page, database.heading);

      const trigger = await firstRecordTrigger(page, database.path);
      await trigger.focus();
      await trigger.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("status")).toContainText("Loading the latest verified detail");
      await expectDrawerShellWithinBudget(page, database.kind);
      await expect(page).toHaveURL(/focus=/);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect(dialog.getByRole("status")).toBeHidden();
      await expect(dialog.getByText(/^Last verified /)).toBeVisible();

      const focusedInsideDialog = await dialog.evaluate((element) => element.contains(document.activeElement));
      expect(focusedInsideDialog).toBe(true);

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(page).not.toHaveURL(/focus=/);
      await expect(trigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

      await trigger.press("Enter");
      const focusedUrl = page.url();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectDrawerShellWithinBudget(page, database.kind);
      expect(await page.getByRole("dialog").getByRole("status").count()).toBe(0);
      await page.reload();
      await expect(page).toHaveURL(focusedUrl);
      await expect(page.getByRole("dialog")).toBeVisible();
    });
  }

  test("a failed lazy deal detail can be retried without blocking or closing the drawer", async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/deals/*", async (route) => {
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "temporarily unavailable" }),
        });
        return;
      }
      await route.continue();
    });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    await page.locator("[data-deal-row-trigger]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectDrawerShellWithinBudget(page, "deal");
    const alert = dialog.getByRole("alert");
    await expect(alert).toContainText("Latest detail could not be loaded");
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(alert).toBeHidden();
    await expect(dialog.getByText(/^Last verified /)).toBeVisible();
    expect(attempts).toBe(2);
  });

  test("a terminal detail response removes the stale public drawer and focus URL", async ({ page }) => {
    await page.route("**/api/deals/*", (route) => route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "Deal not found" }),
    }));
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const trigger = page.locator("[data-deal-row-trigger]").first();
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).not.toHaveURL(/focus=/);
  });

  test("cross-database search keeps a global relevance rank, grouping, scopes, and drawer links", async ({ page }) => {
    await page.goto(`${appPath("/search")}?q=Brookfield`);
    await waitForApplication(page, "Search InfraSight");
    await expect(page.getByRole("heading", { name: "All results" })).toBeVisible();
    await expect(page.getByText(/Relevance #\d+/).first()).toBeVisible();

    const firstResult = page.locator('a[href*="focus="]').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();
    await expect(page).toHaveURL(/focus=/);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goBack();
    await waitForApplication(page, "Search InfraSight");
    await expect(page).toHaveURL(/\/search\?q=Brookfield/);

    const dealScope = page.getByRole("link", { name: /^Deals\s/ });
    await dealScope.click();
    await expect(page).toHaveURL(/q=Brookfield&scope=deal/);
    await expect(page.getByRole("heading", { name: "Deals" })).toBeVisible();
  });

  for (const database of [
    { path: "/funds", heading: "Infrastructure Fund Database", sort: "Strategy" },
    { path: "/portfolio", heading: "Infrastructure Portfolio Company Database", sort: "Sector" },
  ] as const) {
    test(`${database.path} restores atomic sort state with browser history`, async ({ page }) => {
      await page.goto(`${appPath(database.path)}?page=2`);
      await waitForApplication(page, database.heading);
      await page.getByRole("button", { name: database.sort, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`sort=${database.sort.toLowerCase()}`));
      await expect(page).not.toHaveURL(/page=2/);
      await page.goBack();
      await expect(page).toHaveURL(/page=2/);
      await expect(page).not.toHaveURL(/sort=/);
    });
  }

  test("manager-grouped fund pages never render more than 25 records initially", async ({ page }) => {
    await page.goto(`${appPath("/funds")}?view=managers`);
    await waitForApplication(page, "Infrastructure Fund Database");
    expect(await page.locator("tbody tr").filter({ has: page.getByRole("button", { name: /^Open / }) }).count())
      .toBeLessThanOrEqual(25);
  });

  for (const [path, heading] of [
    ["/tracker", "Infrastructure Deal Tape"],
    ["/funds", "Infrastructure Fund Database"],
    ["/portfolio", "Infrastructure Portfolio Company Database"],
    ["/dashboard", "M&A Conditions Dashboard"],
    ["/news", "Daily Intelligence Feed"],
    ["/search", "Search InfraSight"],
    ["/earnings", "Earnings Tracker"],
    ["/login", "Sign in"],
  ] as const) {
    test(`${path} has no body-level horizontal overflow at required widths`, async ({ page }) => {
      for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(appPath(path));
        await waitForApplication(page, heading);
        await expectNoHorizontalOverflow(page, `${path} at ${width}px`);
      }
    });
  }
});
