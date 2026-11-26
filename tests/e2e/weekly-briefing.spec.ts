import { test, expect } from "@playwright/test";
import { appPath } from "./helpers";

for (const width of [375, 1280]) {
  test(`renders the dated web briefing and its archive actions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(appPath("/weekly-briefing?edition=2026-10-30"));
    const issue = page.locator("article[data-briefing-edition='2026-10-30']");
    await expect(issue.getByRole("heading", { name: "Plenum Power | EIG" })).toBeVisible();
    await expect(issue.getByRole("link", { name: "Source for Plenum Power | EIG" })).toHaveAttribute("target", "_blank");
    await expect(issue.getByRole("link", { name: "Email for this edition" })).toHaveAttribute("href", "/email-format/2026-10-30.html");
    const verified = await issue.getAttribute("data-briefing-deal-list") === "verified";
    const tracker = issue.getByRole("link", { name: verified ? "View these deals" : "Browse all deals" });
    await expect(tracker).toHaveAttribute("href", verified ? "/tracker?briefing=2026-10-30&via=briefing" : "/tracker");
    await expect(issue.locator("iframe")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("returns HTTP 404 before streaming an unknown edition", async ({ request }) => {
  for (const query of ["edition=1900-01-01", "edition=", "edition=missing&edition=2026-10-30"]) {
    const response = await request.get(appPath(`/weekly-briefing?${query}`), { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  }
});
