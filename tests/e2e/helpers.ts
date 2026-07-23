import { expect, type Page } from "@playwright/test";
import { assertIsolatedWriteTarget } from "./isolation-guard";

export const BASE_PATH = process.env.E2E_BASE_PATH || "/Infra-MA2";
export const ADMIN_E2E_ENV = [
  "E2E_DATABASE_URL",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
] as const;

export function appPath(path = "/") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return suffix === "/" ? BASE_PATH : `${BASE_PATH}${suffix}`;
}

export async function waitForApplication(page: Page, heading: string | RegExp) {
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
}

export async function expectNoHorizontalOverflow(page: Page, context?: string) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
        };
      })
      .filter(({ left, right }) => left < -1 || right > window.innerWidth + 1)
      .slice(0, 10),
  }));
  const diagnostic = [
    context,
    `viewport=${dimensions.viewport}`,
    `document=${dimensions.document}`,
    `body=${dimensions.body}`,
    dimensions.offenders.length > 0
      ? `possible offenders=${JSON.stringify(dimensions.offenders)}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  expect(dimensions.document, diagnostic).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.body, diagnostic).toBeLessThanOrEqual(dimensions.viewport);
}

export function configuredAdminE2E(): boolean {
  return ADMIN_E2E_ENV.every((name) => Boolean(process.env[name]));
}

/** Authenticate only against Playwright's explicitly isolated local target. */
export async function signInAsConfiguredAdmin(page: Page, callbackPath = "/admin") {
  assertIsolatedWriteTarget();
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(`${ADMIN_E2E_ENV.join(", ")} are required for authenticated E2E`);
  }

  await page.goto(`${appPath("/login")}?callbackUrl=${encodeURIComponent(appPath(callbackPath))}`);
  await page.getByRole("textbox", { name: /Email(?: address)?/i }).fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(new RegExp(`${appPath(callbackPath)}$`));
}
