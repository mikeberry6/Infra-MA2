import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ADMIN_E2E_ENV,
  appPath,
  configuredAdminE2E,
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

for (const path of routes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(appPath(path));
    await page.locator("main").waitFor({ state: "visible" });
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
  for (const path of [
    "/admin",
    "/admin/deals",
    "/admin/funds",
    "/admin/companies",
    "/admin/sources",
    "/admin/dashboard-signals",
    "/admin/audit",
    "/admin/users",
  ]) {
    await page.goto(appPath(path));
    await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
    await page.locator("main").waitFor({ state: "visible" });
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

test("reduced-motion preference suppresses drawer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/tracker"));
  await page.getByRole("heading", { name: "Infrastructure Deal Tape", level: 1 }).waitFor();
  await page.locator("tbody [data-row-trigger]").first().click();

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
