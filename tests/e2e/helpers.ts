import { expect, type Page } from "@playwright/test";

const basePath = (process.env.E2E_BASE_PATH || "/Infra-MA2").replace(/\/$/, "");

export function appPath(route: string) {
  return `${basePath}${route === "/" ? "" : route}`;
}

export async function expectDatabasePage(page: Page, route: string, heading: string) {
  const response = await page.goto(appPath(route));
  expect(response?.status(), `${route} should return HTTP 200`).toBe(200);
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
  await expect(page.getByText(/data could not be loaded/i)).toHaveCount(0);
}
