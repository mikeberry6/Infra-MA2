import { test, expect } from "@playwright/test";
const basePath = (process.env.E2E_BASE_PATH || "/Infra-MA2").replace(/\/$/, "");
for (const width of [375, 1280]) {
  test(`weekly briefing links to the deal filter and renders at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(`${basePath}/weekly-briefing?edition=2026-10-30`);
    await expect(page.getByRole("link", { name: "View these deals" })).toHaveAttribute("href", `${basePath}/tracker?briefing=2026-10-30&via=briefing`);
    await expect(page.frameLocator("iframe").getByText("Plenum Power | EIG", { exact: true })).toBeVisible();
    await expect(page.frameLocator("iframe").getByRole("link", { name: "Source", exact: true }).first()).toHaveAttribute("target", "_blank");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
