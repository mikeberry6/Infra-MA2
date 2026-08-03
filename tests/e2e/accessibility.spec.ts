import { expect, test } from "@playwright/test";
import { appPath, expectDatabasePage } from "./helpers";

test("public database searches have accessible names", async ({ page }) => {
  await expectDatabasePage(page, "/funds", "Infrastructure Fund Database");
  await expect(page.getByRole("textbox", { name: "Search funds" })).toBeVisible();

  await expectDatabasePage(page, "/portfolio", "Infrastructure Portfolio Company Database");
  await expect(page.getByRole("textbox", { name: "Search portfolio companies" })).toBeVisible();
});

test("the fund scorecard is keyboard operable and restores focus", async ({ page }) => {
  const fundName = "Stonepeak Infrastructure Fund IV";
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(appPath("/funds"));
  await page.getByRole("heading", { name: "Infrastructure Fund Database", level: 1 }).waitFor();
  await page.getByRole("textbox", { name: "Search funds" }).fill(fundName);

  const row = page.locator('tr[role="button"]').filter({ hasText: fundName });
  await expect(row).toBeVisible();
  await row.focus();
  await row.press("Enter");

  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await drawer.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(row).toBeFocused();
});

for (const [route, heading] of [
  ["/funds", "Infrastructure Fund Database"],
  ["/portfolio", "Infrastructure Portfolio Company Database"],
] as const) {
  test(`${route} has no body-level mobile overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expectDatabasePage(page, route, heading);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
