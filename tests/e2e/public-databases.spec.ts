import { expect, test, type Page } from "@playwright/test";
import { appPath, expectNoHorizontalOverflow, waitForApplication } from "./helpers";
import {
  DRAWER_SHELL_BUDGET_MS,
  drawerShellMeasure,
  type DrawerKind,
} from "../../src/lib/drawer-performance";

const RESPONSIVE_WIDTHS = [320, 390, 768, 1280, 1440] as const;

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
    const response = await page.goto(appPath("/"));
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${appPath("/tracker")}$`));
    await waitForApplication(page, "Infrastructure Deal Tape");
  });

  test("mobile primary navigation exposes search and restores its disclosure trigger", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appPath("/earnings"));
    await waitForApplication(page, "Earnings Tracker");

    const navigation = page.getByRole("navigation", { name: "Primary" });
    const openMenu = navigation.getByRole("button", { name: "Open menu" });
    await openMenu.focus();
    await openMenu.press("Enter");

    const closeMenu = navigation.getByRole("button", { name: "Close menu" });
    await expect(closeMenu).toBeFocused();
    await expect(closeMenu).toHaveAttribute("aria-expanded", "true");
    for (const label of ["Database", "Dashboard", "News", "Earnings", "Search"]) {
      await expect(navigation.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(navigation.getByRole("searchbox", { name: "Search" })).toBeVisible();

    await closeMenu.click();
    await expect(openMenu).toBeFocused();
    await expect(openMenu).toHaveAttribute("aria-expanded", "false");
    await expect(navigation.getByRole("link", { name: "Dashboard", exact: true })).toBeHidden();

    await openMenu.press("Enter");
    await navigation.getByRole("searchbox", { name: "Search" }).fill("Brookfield");
    await navigation.getByRole("link", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${appPath("/search")}$`));
    await waitForApplication(page, "Search InfraSight");
    await expect(navigation.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
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
    await page.route("**/api/deals/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.continue();
    });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const row = page.locator("tbody [data-row-trigger]").first();
    await row.focus();
    await row.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toContainText("Loading the latest verified detail");
    await expectDrawerShellWithinBudget(page, "deal");
    await expect(page).toHaveURL(/focus=/);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/focus=/);
    await expect(row).toBeFocused();
  });

  for (const database of [
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
    test(`${database.path} drawer renders its shell within budget, restores focus, and reopens from cache`, async ({ page }) => {
      let detailRequests = 0;
      await page.route(database.apiPattern, async (route) => {
        detailRequests += 1;
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.continue();
      });
      await page.goto(appPath(database.path));
      await waitForApplication(page, database.heading);

      const row = page.locator("tbody tr[role=button]").first();
      await row.focus();
      await row.press("Enter");
      let dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("status")).toContainText("Loading the latest verified detail");
      await expectDrawerShellWithinBudget(page, database.kind);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect(dialog.getByRole("status")).toBeHidden();
      await expect(dialog.getByText(/^Last verified /)).toBeVisible();

      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(row).toBeFocused();
      await expect(page).not.toHaveURL(/focus=/);

      await row.press("Enter");
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expectDrawerShellWithinBudget(page, database.kind);
      expect(await dialog.getByRole("status").count()).toBe(0);
      await expect(dialog.getByText(/^Last verified /)).toBeVisible();
      await expect.poll(() => detailRequests).toBe(2);

      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(row).toBeFocused();
    });
  }

  test("cross-database search exposes a global ranking, entity scopes, and deep links", async ({ page }) => {
    await page.goto(`${appPath("/search")}?q=Brookfield`);
    await waitForApplication(page, "Search InfraSight");
    await expect(page.getByRole("heading", { name: "All results" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^All\s/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
    await expect(page.getByText(/Relevance #\d+/).first()).toBeVisible();
    const firstResult = page.locator('a[href*="focus="]').first();
    await expect(firstResult).toBeVisible();
    const href = await firstResult.getAttribute("href");
    let drawerKind: DrawerKind;
    if (href?.includes("/tracker?")) drawerKind = "deal";
    else if (href?.includes("/funds?")) drawerKind = "fund";
    else if (href?.includes("/portfolio?")) drawerKind = "company";
    else throw new Error(`Unexpected search result destination: ${href ?? "missing href"}`);

    await firstResult.click();
    await expect(page).toHaveURL(/focus=/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectDrawerShellWithinBudget(page, drawerKind);

    await page.goBack();
    await waitForApplication(page, "Search InfraSight");
    await expect(page).toHaveURL(/\/search\?q=Brookfield/);

    await page.getByRole("link", { name: /^Deals\s/ }).click();
    await expect(page).toHaveURL(/q=Brookfield&scope=deal/);
    await expect(page.getByRole("heading", { name: "Deals" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Deals\s/ })).toHaveAttribute("aria-current", "page");
  });

  test("cross-database search pagination is URL-addressable beyond the first result page", async ({ page }) => {
    await page.goto(`${appPath("/search")}?q=in&scope=company`);
    await waitForApplication(page, "Search InfraSight");
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/q=in&scope=company&page=2/);
    await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous" })).toBeVisible();
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
    await expectNoHorizontalOverflow(page);
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
    test(`${path} has no horizontal overflow from mobile to desktop`, async ({ page }) => {
      for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(appPath(path));
        await waitForApplication(page, heading);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("anonymous admin redirects remain overflow-free from mobile to desktop", async ({ page }) => {
    for (const width of RESPONSIVE_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(appPath("/admin"));
      await expect(page).toHaveURL(/\/login\?callbackUrl=/);
      await waitForApplication(page, "Sign in");
      expect(decodeURIComponent(new URL(page.url()).searchParams.get("callbackUrl") || ""))
        .toBe(appPath("/admin"));
      await expectNoHorizontalOverflow(page);
    }
  });
});
