import { expect, test } from "@playwright/test";
import { appPath, expectDatabasePage } from "./helpers";

test("public database searches have accessible names", async ({ page }) => {
  await expectDatabasePage(page, "/funds", "Infrastructure Fund Database");
  await expect(page.getByRole("textbox", { name: "Search funds" })).toBeVisible();

  await expectDatabasePage(page, "/portfolio", "Infrastructure Portfolio Company Database");
  await expect(page.getByRole("textbox", { name: "Search portfolio companies" })).toBeVisible();
});

test("the fund scorecard is keyboard operable and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await expectDatabasePage(page, "/funds", "Infrastructure Fund Database");

  const title = page.locator('main tbody a[href*="focus="]').first();
  await expect(title).toBeVisible();
  await title.focus();
  await title.press("Enter");

  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await drawer.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(title).toBeFocused();
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

test("a keyboard-activated transaction source opens independently of the scorecard", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await expectDatabasePage(page, "/tracker", "Infrastructure Deal Tape");
  const source = page.locator('tbody a[target="_blank"]').first();
  const href = await source.getAttribute("href");
  expect(href).toBeTruthy();
  await page.context().route(href!, (route) => route.fulfill({ body: "Transaction source" }));
  const popupPromise = page.waitForEvent("popup");
  await source.press("Enter");
  const popup = await popupPromise;
  await expect(popup.getByText("Transaction source")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await popup.close();
});

test("mobile transaction cards appear before the collapsed market snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectDatabasePage(page, "/tracker", "Infrastructure Deal Tape");
  await expect(page.locator("main article").first()).toBeInViewport();
  const snapshot = page.locator("#market-snapshot details");
  await expect(snapshot).toHaveJSProperty("open", false);
  await snapshot.locator("summary").click();
  await expect(snapshot.getByRole("heading", { name: "Top fund activity" })).toBeVisible();
  await expect(snapshot.getByRole("heading", { name: "Top industries" })).toBeVisible();
  await expect(snapshot.getByRole("heading", { name: "Top regions" })).toBeVisible();
});
