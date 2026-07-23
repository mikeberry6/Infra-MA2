import { expect, test, type Page } from "@playwright/test";
import { appPath, expectNoHorizontalOverflow, waitForApplication } from "./helpers";
import { requireFullReleaseSha } from "./isolation-guard";
import {
  DRAWER_SHELL_BUDGET_MS,
  drawerShellMeasure,
  type DrawerKind,
} from "../../src/lib/drawer-performance";

const RESPONSIVE_WIDTHS = [320, 390, 768, 1280, 1440] as const;

async function expectDrawerShellWithinBudget(page: Page, kind: DrawerKind) {
  await expect.poll(() => page.evaluate((name) => {
    return performance.getEntriesByName(name, "measure").at(-1)?.duration ?? null;
  }, drawerShellMeasure(kind))).not.toBeNull();
  const duration = await page.evaluate((name) => {
    return performance.getEntriesByName(name, "measure").at(-1)?.duration ?? Number.POSITIVE_INFINITY;
  }, drawerShellMeasure(kind));
  expect(duration).toBeLessThan(DRAWER_SHELL_BUDGET_MS);
}

test.describe("anonymous public journeys", () => {
  test("root resolves to the canonical deal database", async ({ page }) => {
    await page.goto(appPath("/"));
    await expect(page).toHaveURL(new RegExp(`${appPath("/tracker")}/?$`));
    await waitForApplication(page, "Infrastructure Deal Tape");
  });

  test("deal search and mobile filter state remain URL-addressable and keyboard operable", async ({ page }) => {
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    await page.getByRole("textbox", { name: "Search deals" }).fill("Brookfield");
    await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("Brookfield");
    expect(new URL(page.url()).searchParams.get("page")).toBeNull();

    await page.setViewportSize({ width: 390, height: 844 });
    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(dialog.getByRole("button", { name: "Filter by Sector" })).toBeVisible();
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("deal taxonomy selection writes real filter and sort state to the URL", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const sectorTrigger = page.getByRole("button", { name: "Filter by Sector" });
    await sectorTrigger.click();
    const sectorOptions = page.getByRole("listbox", { name: "Sector options" });
    const firstSector = sectorOptions.getByRole("option").first();
    await expect(firstSector).toBeVisible();
    const selectedSector = (await firstSector.innerText()).trim();
    expect(selectedSector).not.toBe("");
    await firstSector.click();

    await expect.poll(() => new URL(page.url()).searchParams.get("sector"))
      .toBe(selectedSector);
    expect(new URL(page.url()).searchParams.get("page")).toBeNull();
    await expect(firstSector).toHaveAttribute("aria-selected", "true");
    await firstSector.press("Escape");
    await expect(sectorTrigger).toBeFocused();

    await page.getByRole("button", { name: "Target / Seller", exact: true }).click();
    await expect.poll(() => ({
      sort: new URL(page.url()).searchParams.get("sort"),
      direction: new URL(page.url()).searchParams.get("direction"),
      sector: new URL(page.url()).searchParams.get("sector"),
    })).toEqual({
      sort: "target",
      direction: "asc",
      sector: selectedSector,
    });
    expect(new URL(page.url()).searchParams.get("page")).toBeNull();
  });

  test("deal sort and pagination state restore with browser back and forward", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    await page.getByRole("button", { name: "Target / Seller", exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("sort")).toBe("target");
    expect(new URL(page.url()).searchParams.get("direction")).toBe("asc");

    const nextPage = page.getByRole("button", { name: "Next page" });
    const hasNextPage = await nextPage.count() > 0 && await nextPage.isEnabled();
    if (hasNextPage) {
      await nextPage.click();
      await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
      await expect(page.locator("#deal-results-heading")).toBeFocused();

      await page.goBack();
      await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBeNull();
      expect(new URL(page.url()).searchParams.get("sort")).toBe("target");
    }

    await page.goBack();
    await expect.poll(() => new URL(page.url()).searchParams.get("sort")).toBeNull();
    expect(new URL(page.url()).searchParams.get("direction")).toBeNull();

    await page.goForward();
    await expect.poll(() => new URL(page.url()).searchParams.get("sort")).toBe("target");
    expect(new URL(page.url()).searchParams.get("direction")).toBe("asc");

    if (hasNextPage) {
      await page.goForward();
      await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
      expect(new URL(page.url()).searchParams.get("sort")).toBe("target");
    } else {
      await expect(nextPage).toHaveCount(0);
    }
  });

  test("direct deal focus and browser history restore drawer and keyboard focus", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");

    const trigger = page.locator("button[data-deal-row-trigger]").first();
    await trigger.focus();
    await trigger.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    const focusId = new URL(page.url()).searchParams.get("focus");
    expect(focusId).toBeTruthy();

    await page.goBack();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect.poll(() => new URL(page.url()).searchParams.get("focus")).toBeNull();
    await expect(trigger).toBeFocused();

    await page.goForward();
    await expect.poll(() => new URL(page.url()).searchParams.get("focus")).toBe(focusId);
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").press("Escape");
    await expect(trigger).toBeFocused();

    const directUrl = `${appPath("/tracker")}?focus=${encodeURIComponent(focusId!)}`;
    await page.goto(directUrl);
    await waitForApplication(page, "Infrastructure Deal Tape");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").press("Escape");
    await expect.poll(() => new URL(page.url()).searchParams.get("focus")).toBeNull();
    await expect(page.locator("#main-content")).toBeFocused();
  });

  for (const database of [
    {
      path: "/tracker",
      heading: "Infrastructure Deal Tape",
      apiPattern: "**/api/deals/*",
      trigger: "button[data-deal-row-trigger]",
      kind: "deal",
    },
    {
      path: "/funds",
      heading: "Infrastructure Fund Database",
      apiPattern: "**/api/funds/*",
      trigger: 'tbody button[aria-label^="Open "]',
      kind: "fund",
    },
    {
      path: "/portfolio",
      heading: "Infrastructure Portfolio Company Database",
      apiPattern: "**/api/portfolio/*",
      trigger: 'tbody button[aria-label^="Open "]',
      kind: "company",
    },
  ] as const) {
    test(`${database.path} loads detail on demand, renders promptly, and reopens from cache`, async ({ page }) => {
      let detailRequests = 0;
      await page.route(database.apiPattern, async (route) => {
        detailRequests += 1;
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.continue();
      });
      await page.goto(appPath(database.path));
      await waitForApplication(page, database.heading);
      expect(detailRequests).toBe(0);

      const trigger = page.locator(database.trigger).first();
      await trigger.focus();
      await trigger.press("Enter");
      let dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(page).toHaveURL(/focus=/);
      await expectDrawerShellWithinBudget(page, database.kind);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect.poll(() => detailRequests).toBe(1);
      await expect(dialog.getByRole("status")).toBeHidden();

      await dialog.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(page).not.toHaveURL(/focus=/);
      await expect(trigger).toBeFocused();

      await trigger.press("Enter");
      dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expectDrawerShellWithinBudget(page, database.kind);
      expect(await dialog.getByRole("status").count()).toBe(0);
      await expect.poll(() => detailRequests).toBe(2);
    });
  }

  test("public result pages initially render no more than 25 records", async ({ page }) => {
    for (const database of [
      { path: "/tracker", rows: "button[data-deal-row-trigger]" },
      { path: "/funds", rows: 'tbody button[aria-label^="Open "]' },
      { path: "/portfolio", rows: 'tbody button[aria-label^="Open "]' },
    ]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(appPath(database.path));
      await expect(page.locator(database.rows)).not.toHaveCount(0);
      expect(await page.locator(database.rows).count()).toBeLessThanOrEqual(25);
    }
  });

  test("mobile news filters expose every taxonomy without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(appPath("/news"));
    await waitForApplication(page, "Daily Intelligence Feed");
    const trigger = page.getByRole("button", { name: /^Filters/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    for (const label of ["Category", "Entity", "Source", "Confidence"]) {
      await expect(dialog.getByRole("button", { name: `Filter by ${label}` })).toBeVisible();
    }
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
    test(`${path} has no body-level horizontal overflow at the target widths`, async ({ page }) => {
      for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(appPath(path));
        await waitForApplication(page, heading);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("health exposes a bounded contract and exact release identity", async ({ request }) => {
    const expectedReleaseSha = requireFullReleaseSha();
    const response = await request.get(appPath("/api/health"));
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toMatchObject({
      status: expect.stringMatching(/^(healthy|unhealthy)$/),
      database: expect.stringMatching(/^(connected|unavailable)$/),
      version: expectedReleaseSha,
      generatedAt: expect.any(String),
    });
    expect(body.version).toBe(expectedReleaseSha);
    expect(JSON.stringify(body)).not.toMatch(/password|secret|token|stack|databaseUrl/i);
    expect(response.status()).toBe(body.status === "healthy" ? 200 : 503);
  });
});
