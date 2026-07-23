import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { appPath } from "./helpers";

for (const path of [
  "/tracker",
  "/funds",
  "/portfolio",
  "/search",
  "/news",
  "/dashboard",
  "/earnings",
  "/login",
]) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }, testInfo) => {
    await page.goto(appPath(path));
    await page.locator("main").waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .exclude("[data-next-badge]")
      .analyze();
    await testInfo.attach("axe-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("mobile filter sheet remains accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appPath("/tracker"));
  await page.getByRole("button", { name: /^Filters/ }).click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("reduced-motion preference suppresses drawer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/tracker"));
  await page.locator("button[data-deal-row-trigger]").first().click();
  const durationMs = await page.getByRole("dialog").evaluate((element) => {
    return Math.max(...getComputedStyle(element).animationDuration.split(",").map((value) => {
      const duration = value.trim();
      if (duration.endsWith("ms")) return Number.parseFloat(duration);
      if (duration.endsWith("s")) return Number.parseFloat(duration) * 1_000;
      return Number.parseFloat(duration) || 0;
    }));
  });
  expect(durationMs).toBeLessThanOrEqual(0.011);
});
