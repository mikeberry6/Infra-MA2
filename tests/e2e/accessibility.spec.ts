import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ADMIN_E2E_ENV,
  appPath,
  configuredAdminE2E,
  expectNoHorizontalOverflow,
  signInAsConfiguredAdmin,
} from "./helpers";

const routes = [
  "/tracker",
  "/funds",
  "/portfolio",
  "/search",
  "/news",
  "/dashboard",
  "/earnings",
  "/login",
];

const ADMIN_ROUTES = [
  { path: "/admin", heading: "Admin" },
  { path: "/admin/deals", heading: "Deals" },
  { path: "/admin/deals/new", heading: "New deal" },
  { path: "/admin/funds", heading: "Funds" },
  { path: "/admin/funds/new", heading: "New fund" },
  { path: "/admin/companies", heading: "Companies" },
  { path: "/admin/companies/new", heading: "New company" },
  { path: "/admin/sources", heading: "Sources" },
  { path: "/admin/dashboard-signals", heading: "Dashboard signal review" },
  { path: "/admin/audit", heading: "Audit log" },
  { path: "/admin/users", heading: "Users" },
] as const;

const RESPONSIVE_WIDTHS = [320, 390, 768, 1280, 1440] as const;
const ADMIN_SCROLL_REGIONS = new Map([
  ["/admin/deals", { name: "Deals table", lastColumn: "Actions" }],
  ["/admin/funds", { name: "Funds table", lastColumn: "Actions" }],
  ["/admin/companies", { name: "Companies table", lastColumn: "Actions" }],
  ["/admin/sources", { name: "Sources table", lastColumn: "URL" }],
  ["/admin/users", { name: "Users table", lastColumn: "Created" }],
]);

for (const path of routes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(appPath(path));
    await page.locator("main").waitFor({ state: "visible" });
    await expect(page.locator("a button")).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[data-next-badge]")
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("authenticated administration pages have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated admin accessibility checks`,
  );

  await signInAsConfiguredAdmin(page);
  for (const { path } of ADMIN_ROUTES) {
    await page.goto(appPath(path));
    await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
    await page.locator("main").waitFor({ state: "visible" });
    await expect(page.locator("a button")).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[data-next-badge]")
      .analyze();
    expect(
      results.violations,
      `${path}\n${JSON.stringify(results.violations, null, 2)}`,
    ).toEqual([]);
  }
});

test("authenticated administration pages have no body-level horizontal overflow at required widths", async ({ page }) => {
  test.setTimeout(240_000);
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated admin responsive checks`,
  );

  await signInAsConfiguredAdmin(page);
  for (const width of RESPONSIVE_WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(width);

    for (const { path, heading } of ADMIN_ROUTES) {
      const response = await page.goto(appPath(path));
      expect(response?.ok(), `${path} should load successfully at ${width}px`).toBeTruthy();
      await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
      await expect(
        page.getByRole("heading", { name: heading, level: 1, exact: true }),
        `${path} should render its authenticated admin heading at ${width}px`,
      ).toBeVisible();
      await expectNoHorizontalOverflow(page, `${path} at ${width}px`);

      const scrollRegion = ADMIN_SCROLL_REGIONS.get(path);
      if (scrollRegion && width <= 390) {
        const region = page.getByRole("region", { name: scrollRegion.name });
        await expect(region).toBeVisible();
        expect(
          await region.evaluate((element) => element.scrollWidth > element.clientWidth),
          `${path} should expose a horizontal table scroll region at ${width}px`,
        ).toBe(true);
        await region.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
        });
        await expect(
          region.getByRole("columnheader", { name: scrollRegion.lastColumn }),
        ).toBeInViewport();
      }
    }
  }
});

test("the skip link is the first keyboard stop and targets main content", async ({ page }) => {
  await page.goto(appPath("/tracker"));
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the not-found action is a single link rather than nested interactive content", async ({ page }) => {
  await page.goto(appPath("/this-route-does-not-exist"));
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to deals" })).toHaveAttribute(
    "href",
    appPath("/tracker"),
  );
  await expect(page.locator("a button")).toHaveCount(0);
});

test("mobile filter sheet remains accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appPath("/tracker"));
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("portfolio company scorecard has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto(appPath("/portfolio"));
  await page.getByRole("heading", {
    name: "Infrastructure Portfolio Company Database",
    level: 1,
  }).waitFor();
  await page.locator("tbody tr[role=button]").first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toBeHidden();
  await expect(dialog.getByText(/^Last verified /)).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("reduced-motion preference suppresses drawer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/tracker"));
  await page.getByRole("heading", { name: "Infrastructure Deal Tape", level: 1 }).waitFor();
  await page.locator("tbody [data-deal-row-trigger]").first().click();

  const animationDurationMs = await page.getByRole("dialog").evaluate((element) => {
    const values = getComputedStyle(element).animationDuration.split(",");
    return Math.max(...values.map((value) => {
      const duration = value.trim();
      if (duration.endsWith("ms")) return Number.parseFloat(duration);
      if (duration.endsWith("s")) return Number.parseFloat(duration) * 1000;
      return Number.parseFloat(duration) || 0;
    }));
  });

  expect(animationDurationMs).toBeLessThanOrEqual(0.011);
});
