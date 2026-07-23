import { expect, type Page } from "@playwright/test";

export const BASE_PATH = process.env.E2E_BASE_PATH || "/Infra-MA2";

export function appPath(path = "/") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return suffix === "/" ? BASE_PATH : `${BASE_PATH}${suffix}`;
}

export async function waitForApplication(page: Page, heading: string | RegExp) {
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
}

export async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(dimensions.document, dimensions.body)).toBeLessThanOrEqual(dimensions.viewport);
}
