import { expect, test } from "@playwright/test";
import { appPath, expectDatabasePage } from "./helpers";

const firstAddition = "Antin Mid Cap Fund II";
const lastAddition = "Stonepeak Infrastructure Fund IV";
const unchangedFund = "Partners Group Direct Infrastructure Fund IV";

test("the reviewed lineage additions are present and the fund total is 194", async ({ page }) => {
  await expectDatabasePage(page, "/funds", "Infrastructure Fund Database");
  await expect(page.getByText(/194\s+of\s+194 funds/)).toBeVisible();

  const search = page.getByRole("textbox", { name: "Search funds" });
  for (const fundName of [firstAddition, lastAddition]) {
    await search.fill(fundName);
    await expect(page.getByText(fundName, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/1\s+of\s+194 funds/)).toBeVisible();
  }
});

test("a new fund opens in the existing scorecard drawer", async ({ page }) => {
  await page.goto(appPath("/funds"));
  await page.getByRole("heading", { name: "Infrastructure Fund Database", level: 1 }).waitFor();
  await page.getByRole("textbox", { name: "Search funds" }).fill(lastAddition);
  await page.getByText(lastAddition, { exact: true }).first().click();

  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: lastAddition })).toBeVisible();
  await expect(drawer.getByText("Fund overview", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/focus=FUND-171/);
});

test("existing strategy badges remain unchanged", async ({ page }) => {
  await page.goto(appPath("/funds"));
  await page.getByRole("heading", { name: "Infrastructure Fund Database", level: 1 }).waitFor();
  await page.getByRole("textbox", { name: "Search funds" }).fill(unchangedFund);
  await page.getByText(unchangedFund, { exact: true }).first().click();

  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("Core-Plus", { exact: true }).first()).toBeVisible();
  await expect(drawer.getByText("Value-Add", { exact: true }).first()).toBeVisible();
});
