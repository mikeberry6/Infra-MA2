import { expect, test } from "@playwright/test";
import { appPath, expectDatabasePage } from "./helpers";

test("search filters by record type and opens the deal's lazy scorecard", async ({ page }) => {
  await expectDatabasePage(page, "/tracker", "Infrastructure Deal Tape");
  const firstDeal = page.locator('table a[href*="?focus="]').first();
  await expect(firstDeal).toBeVisible();
  const target = (await firstDeal.innerText()).trim();
  const href = await firstDeal.getAttribute("href");
  const id = new URL(href!, "https://example.test").searchParams.get("focus");

  await page.goto(appPath("/search"));
  const search = page.getByRole("search", { name: "Research databases" });
  await search.getByRole("searchbox").fill(target.slice(0, 120));
  await search.getByRole("button", { name: "Search" }).click();
  await page.getByRole("navigation", { name: "Filter search by record type" })
    .getByRole("link", { name: /^Deals \d/ }).click();
  await expect(page).toHaveURL(/type=deal/);
  await expect(page.getByText(/^Showing .* of .* results? for/)).toBeVisible();

  const detailResponse = page.waitForResponse((response) => (
    new URL(response.url()).pathname === appPath(`/api/deals/${encodeURIComponent(id!)}`)
  ));
  await page.getByRole("list", { name: "Search results" }).locator(`a[href="${href}"]`).click();
  expect((await detailResponse).ok()).toBe(true);
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByRole("heading", { name: target, exact: true })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Open full deal profile" })).toHaveAttribute("href", appPath(`/deals/${encodeURIComponent(id!)}`));
  await expect(drawer.getByText("Loading deal details…")).toHaveCount(0);
});

test("public pages have social metadata and the root crawler entry points resolve", async ({ page, request }) => {
  await expectDatabasePage(page, "/tracker", "Infrastructure Deal Tape");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(new URL(canonical!).pathname).toBe(appPath("/tracker"));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/social-preview$/);
  const socialPreview = await request.get(appPath("/social-preview"));
  expect(socialPreview.ok()).toBe(true);
  expect(socialPreview.headers()["content-type"]).toMatch(/^image\/png/);

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(appPath("/sitemap.xml"));

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain(appPath("/tracker"));
  expect(xml).toContain(appPath("/deals/"));
  expect(xml).toContain(appPath("/weekly-briefing?edition="));
  expect(xml).not.toContain(appPath("/admin"));
});

test("the original earnings URL permanently redirects to the dated archive", async ({ request }) => {
  const response = await request.get(appPath("/earnings"), { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(appPath("/earnings/archive/q4-2025"));
});

test("restores a saved deal screen after a reload", async ({ page }) => {
  await expectDatabasePage(page, "/tracker", "Infrastructure Deal Tape");
  const search = page.getByRole("textbox", { name: "Search deals" });
  const target = (await page.locator('table a[href*="?focus="]').first().innerText()).trim();
  await search.fill(target);
  await expect(page).toHaveURL(/q=/);
  await page.getByText("Saved screens", { exact: true }).click();
  await page.getByRole("textbox", { name: "Name this screen" }).fill("My precedent screen");
  await page.getByRole("button", { name: "Save current screen" }).click();
  await expect(page.getByText("Screen saved on this browser.")).toBeVisible();

  await page.goto(appPath("/tracker"));
  await page.getByText("Saved screens", { exact: true }).click();
  await page.getByRole("button", { name: "My precedent screen", exact: true }).click();
  await expect(search).toHaveValue(target);
  await expect(page).toHaveURL(/q=/);
});

test("compares two published deals and shows evidence", async ({ page }) => {
  await page.goto(appPath("/compare"));
  await expect(page.getByRole("heading", { name: "Compare records", level: 1 })).toBeVisible();
  const first = page.getByLabel("Record 1");
  const second = page.getByLabel("Record 2");
  await first.selectOption({ index: 1 });
  await second.selectOption({ index: 2 });
  await page.getByRole("button", { name: "Compare selected" }).click();
  const comparison = page.getByRole("table", { name: "Selected deals comparison" });
  await expect(comparison.getByRole("columnheader")).toHaveCount(3);
  await expect(comparison.getByRole("rowheader", { name: "Source" })).toBeVisible();
  await expect(comparison.getByRole("rowheader", { name: "Enterprise value" })).toBeVisible();
});
