import { expect, test, type Page } from "@playwright/test";
import {
  appPath,
  expectDialogTabLoop,
  expectNoHorizontalOverflow,
  isEffectivelyInert,
  waitForApplication,
} from "./helpers";
import {
  DRAWER_SHELL_BUDGET_MS,
  drawerShellMeasure,
  type DrawerKind,
} from "../../src/lib/drawer-performance";

// 640 CSS px is the 200%-equivalent reflow viewport for a 1280px-wide layout.
const RESPONSIVE_WIDTHS = [320, 390, 640, 768, 1280, 1440] as const;

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
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`${appPath("/tracker")}?page=2`);
    await waitForApplication(page, "Infrastructure Deal Tape");

    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    expect(await isEffectivelyInert(trigger)).toBe(true);
    await expectDialogTabLoop(page, dialog);

    const sectorFilter = dialog.getByRole("button", { name: "Filter by Sector" });
    const regionFilter = dialog.getByRole("button", { name: "Filter by Region" });
    await sectorFilter.focus();
    await sectorFilter.press("Enter");
    let powerOption = page.getByRole("option", { name: /Power & ET/ });
    await expect(powerOption).toBeFocused();
    expect(await isEffectivelyInert(powerOption)).toBe(false);
    await powerOption.press("Shift+Tab");
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeHidden();
    await expect(dialog.getByRole("button", { name: "Close filters" })).toBeFocused();

    await sectorFilter.focus();
    await sectorFilter.press("Enter");
    powerOption = page.getByRole("option", { name: /Power & ET/ });
    await expect(powerOption).toBeFocused();
    await powerOption.press("Tab");
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeHidden();
    await expect(regionFilter).toBeFocused();

    await sectorFilter.focus();
    await sectorFilter.press("Enter");
    powerOption = page.getByRole("option", { name: /Power & ET/ });
    await expect(powerOption).toBeFocused();
    await powerOption.press("Space");
    await expect(page).toHaveURL(/sector=Power(?:\+|%20)%26(?:\+|%20)ET/);
    await expect(page).not.toHaveURL(/page=2/);
    await expect(trigger).toContainText("1");

    await powerOption.press("Escape");
    await expect(sectorFilter).toBeFocused();
    await expect(dialog).toBeVisible();

    const clearAll = dialog.getByRole("button", { name: "Clear all filters" });
    await clearAll.focus();
    await clearAll.press("Enter");
    await expect(dialog.getByRole("button", { name: "View results" })).toBeFocused();
    await expect(page).not.toHaveURL(/sector=/);
    await expect(trigger).not.toContainText("1");

    await dialog.getByRole("button", { name: "View results" }).press("Enter");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await isEffectivelyInert(trigger)).toBe(false);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("desktop multiselect exits in both directions and dismisses without changing state", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const search = page.getByRole("textbox", { name: "Search deals" });
    const sector = page.getByRole("button", { name: "Filter by Sector" });
    const region = page.getByRole("button", { name: "Filter by Region" });
    expect(await isEffectivelyInert(sector)).toBe(false);

    await sector.press("Enter");
    let firstOption = page.getByRole("listbox", { name: "Sector options" }).getByRole("option").first();
    await expect(firstOption).toBeFocused();
    await firstOption.press("Tab");
    await expect(region).toBeFocused();
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeHidden();

    await sector.focus();
    await sector.press("Enter");
    firstOption = page.getByRole("listbox", { name: "Sector options" }).getByRole("option").first();
    await expect(firstOption).toBeFocused();
    await firstOption.press("Shift+Tab");
    await expect(search).toBeFocused();
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeHidden();

    const startingUrl = page.url();
    await sector.focus();
    await sector.press("Enter");
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeVisible();
    await page.locator("[data-multiselect-overlay]").click({ position: { x: 1, y: 1 } });
    await expect(page.getByRole("listbox", { name: "Sector options" })).toBeHidden();
    await expect(sector).toBeFocused();
    expect(page.url()).toBe(startingUrl);
  });

  for (const database of [
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      filterLabels: ["Strategy", "Status", "Size", "Sector"],
      representative: { label: "Strategy", option: "Core", parameter: "strategy" },
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      filterLabels: ["Sector", "Country", "Firm", "Year"],
      representative: { label: "Sector", option: "Digital", parameter: "sector" },
    },
  ] as const) {
    test(`${database.path} mobile sheet makes every filter keyboard-reachable and URL-restorable`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${appPath(database.path)}?page=2`);
      await waitForApplication(page, database.heading);

      const sheetTrigger = page.getByRole("button", { name: /^Filters/ });
      await sheetTrigger.focus();
      await sheetTrigger.press("Enter");

      const dialog = page.getByRole("dialog", { name: "Filters" });
      await expect(dialog).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

      for (const label of database.filterLabels) {
        const filterTrigger = dialog.getByRole("button", { name: `Filter by ${label}` });
        await expect(filterTrigger).toBeVisible();
        await filterTrigger.focus();
        await filterTrigger.press("Enter");

        const options = page.getByRole("listbox", { name: `${label} options` });
        await expect(options).toBeVisible();
        await expect(options.getByRole("option").first()).toBeFocused();

        await options.getByRole("option").first().press("Escape");
        await expect(filterTrigger).toBeFocused();
        await expect(dialog).toBeVisible();
      }

      const representativeTrigger = dialog.getByRole("button", {
        name: `Filter by ${database.representative.label}`,
      });
      await representativeTrigger.press("Enter");
      const representativeOptions = page
        .getByRole("listbox", {
          name: `${database.representative.label} options`,
        })
        .getByRole("option");
      const representativeIndex = (await representativeOptions.allTextContents())
        .map((label) => label.trim())
        .indexOf(database.representative.option);
      expect(representativeIndex).toBeGreaterThanOrEqual(0);
      await expect(representativeOptions.first()).toBeFocused();
      for (let index = 0; index < representativeIndex; index += 1) {
        await page.keyboard.press("ArrowDown");
      }
      const representativeOption = representativeOptions.nth(representativeIndex);
      await expect(representativeOption).toBeFocused();
      await representativeOption.press("Space");

      await expect.poll(() => (
        new URL(page.url()).searchParams.get(database.representative.parameter)
      )).toBe(database.representative.option);
      await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBeNull();
      await expect(sheetTrigger).toContainText("1");

      await representativeOption.press("Escape");
      await expect(representativeTrigger).toBeFocused();
      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(sheetTrigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
      await expectNoHorizontalOverflow(page);
    });
  }

  test("drawers are deep-linkable and restore focus", async ({ page }) => {
    await page.route("**/api/deals/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.continue();
    });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const row = page.locator("tbody [data-deal-row-trigger]").first();
    await row.focus();
    await row.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toContainText("Loading the latest verified detail");
    await expectDrawerShellWithinBudget(page, "deal");
    await expect(page).toHaveURL(/focus=/);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(dialog.getByRole("status")).toBeHidden();
    await expect(dialog.getByText(/^Last verified /)).toBeVisible();
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    expect(await isEffectivelyInert(row)).toBe(true);
    await row.evaluate((element) => (element as HTMLElement).focus());
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expectDialogTabLoop(page, dialog);

    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/focus=/);
    await expect(row).toBeFocused();
    expect(await isEffectivelyInert(row)).toBe(false);

    await row.press("Enter");
    await expect(page).toHaveURL(/[?&]focus=/);
    const focusedUrl = page.url();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectDrawerShellWithinBudget(page, "deal");
    expect(await page.getByRole("dialog").getByRole("status").count()).toBe(0);
    await page.goBack();
    await expect(page).not.toHaveURL(/focus=/);
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(row).toBeFocused();
    await page.goForward();
    await expect(page).toHaveURL(focusedUrl);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(focusedUrl);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

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
    const retry = alert.getByRole("button", { name: "Retry" });
    await retry.focus();
    await retry.click();
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expect(alert).toBeHidden();
    await expect(dialog.getByText(/^Last verified /)).toBeVisible();
    expect(attempts).toBe(2);
  });

  test("fund sibling navigation keeps modal focus and restores the originating row", async ({ page }) => {
    await page.goto(appPath("/funds"));
    await waitForApplication(page, "Infrastructure Fund Database");

    const managerGroups = page.locator("tbody button[aria-expanded]");
    let multiFundGroupIndex = -1;
    for (let index = 0; index < await managerGroups.count(); index += 1) {
      const countText = await managerGroups.nth(index).locator("span").last().textContent();
      if (Number(countText?.trim()) > 1) {
        multiFundGroupIndex = index;
        break;
      }
    }
    expect(multiFundGroupIndex).toBeGreaterThanOrEqual(0);
    const managerGroupRow = managerGroups.nth(multiFundGroupIndex).locator("xpath=ancestor::tr");
    const row = managerGroupRow.locator(
      "xpath=following-sibling::tr[.//*[@data-fund-row-trigger]][1]//*[@data-fund-row-trigger]",
    );
    await row.focus();
    await row.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toBeHidden();

    const siblingSectionLabel = dialog.getByText(/^Other .+ vehicles$/);
    await expect(siblingSectionLabel).toBeVisible();
    const currentFundName = (await dialog.locator("#fund-drawer-title").textContent())?.trim();
    const siblingFundNames = (await siblingSectionLabel
      .locator("..")
      .locator(".type-row-title")
      .allTextContents())
      .map((name) => name.trim())
      .filter(Boolean);
    const narrowFundName = [currentFundName, ...siblingFundNames]
      .filter((name): name is string => Boolean(name))
      .sort((left, right) => right.length - left.length)[0];
    if (!narrowFundName) throw new Error("Expected a manager fund name.");
    const sibling = siblingSectionLabel.locator("..").getByRole("button").first();
    const originalUrl = page.url();
    await sibling.focus();
    await sibling.click();

    await expect(page).not.toHaveURL(originalUrl);
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(row).toBeFocused();

    await page.goto(`${appPath("/funds")}?q=${encodeURIComponent(narrowFundName)}`);
    await waitForApplication(page, "Infrastructure Fund Database");
    const narrowedFundTrigger = page.getByRole("button", {
      name: `Open ${narrowFundName} fund details`,
      exact: true,
    });
    await expect(page.locator("[data-fund-row-trigger]")).toHaveCount(1);
    await narrowedFundTrigger.click();
    const filteredDialog = page.getByRole("dialog");
    await expect(filteredDialog).toBeVisible();
    await expect(filteredDialog.getByText(/^Other .+ vehicles$/)).toHaveCount(0);
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

      const row = page.locator(
        database.kind === "fund"
          ? "tbody [data-fund-row-trigger]"
          : "tbody [data-company-row-trigger]",
      ).first();
      await row.focus();
      await row.press("Enter");
      let dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("status")).toContainText("Loading the latest verified detail");
      await expectDrawerShellWithinBudget(page, database.kind);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect(dialog.getByRole("status")).toBeHidden();
      await expect(dialog.getByText(/^Last verified /)).toBeVisible();
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      expect(await isEffectivelyInert(row)).toBe(true);
      await row.evaluate((element) => (element as HTMLElement).focus());
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      await expectDialogTabLoop(page, dialog);

      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(row).toBeFocused();
      expect(await isEffectivelyInert(row)).toBe(false);
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

      await row.press("Enter");
      await expect(page).toHaveURL(/[?&]focus=/);
      const focusedUrl = page.url();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.goBack();
      await expect(page).not.toHaveURL(/focus=/);
      await expect(page.getByRole("dialog")).toBeHidden();
      await expect(row).toBeFocused();
      await page.goForward();
      await expect(page).toHaveURL(focusedUrl);
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.reload();
      await expect(page).toHaveURL(focusedUrl);
      await expect(page.getByRole("dialog")).toBeVisible();
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
    expect(href).toMatch(/\/(?:tracker|funds|portfolio)\?focus=/);

    await firstResult.click();
    await expect(page).toHaveURL(/focus=/);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goBack();
    await waitForApplication(page, "Search InfraSight");
    await expect(page).toHaveURL(/\/search\?q=Brookfield/);

    const dealScope = page.getByRole("link", { name: /^Deals\s/ });
    await expect(dealScope).toHaveAttribute(
      "href",
      `${appPath("/search")}?q=Brookfield&scope=deal`,
    );
    await dealScope.click();
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
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      sort: "Strategy",
      sortButton: "Sort funds within each manager by Strategy",
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      sort: "Sector",
      sortButton: "Sector",
    },
  ] as const) {
    test(`${database.path} writes sort state atomically and restores it with browser history`, async ({ page }) => {
      await page.goto(`${appPath(database.path)}?page=2`);
      await waitForApplication(page, database.heading);

      const sortButton = page.getByRole("button", { name: database.sortButton, exact: true });
      if (database.path === "/funds") {
        await expect(page.getByText("Managers A–Z · column sort applies within each manager")).toBeVisible();
        await expect(sortButton.locator("xpath=ancestor::th")).not.toHaveAttribute("aria-sort");
      }
      await sortButton.click();
      await expect(page).toHaveURL(new RegExp(`sort=${database.sort.toLowerCase()}`));
      await expect(page).not.toHaveURL(/page=2/);
      await expect(page).not.toHaveURL(/direction=/);

      await page.goBack();
      await expect(page).toHaveURL(/page=2/);
      await expect(page).not.toHaveURL(/sort=/);
      await expect(page).not.toHaveURL(/direction=/);
    });
  }

  test("manager-grouped fund pages remain capped at 25 result records", async ({ page }) => {
    await page.goto(`${appPath("/funds")}?view=managers`);
    await waitForApplication(page, "Infrastructure Fund Database");

    await expect(page.locator("tbody [data-fund-row-trigger]")).toHaveCount(25);
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
