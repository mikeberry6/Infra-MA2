import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";
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

export async function isEffectivelyInert(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    let current: HTMLElement | null = element as HTMLElement;
    while (current) {
      if (current.inert) return true;
      current = current.parentElement;
    }
    return false;
  });
}

export async function expectDialogTabLoop(page: Page, dialog: Locator) {
  const boundaryCount = await dialog.evaluate((element) => {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const focusables = Array.from(element.querySelectorAll<HTMLElement>(selector))
      .filter((candidate) => candidate.getClientRects().length > 0);
    const first = focusables[0];
    const last = focusables.at(-1);
    if (!first || !last) return focusables.length;
    if (first === last) {
      first.dataset.e2eDialogFocusBoundary = "only";
      first.focus();
      return focusables.length;
    }
    first.dataset.e2eDialogFocusBoundary = "first";
    last.dataset.e2eDialogFocusBoundary = "last";
    first.focus();
    return focusables.length;
  });
  expect(boundaryCount).toBeGreaterThan(0);

  if (boundaryCount === 1) {
    const only = page.locator('[data-e2e-dialog-focus-boundary="only"]');
    await expect(only).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(only).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(only).toBeFocused();
    return;
  }

  const first = page.locator('[data-e2e-dialog-focus-boundary="first"]');
  const last = page.locator('[data-e2e-dialog-focus-boundary="last"]');
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
}

export async function applyWcagTextSpacing(page: Page) {
  await page.addStyleTag({
    content: `
      body *:not(svg):not(path) {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p {
        margin-bottom: 2em !important;
      }
    `,
  });
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

export async function expectNoAutomaticWcagAaViolations(
  page: Page,
  {
    include,
    context,
    excludeNextBadge = true,
  }: {
    include?: string;
    context?: string;
    excludeNextBadge?: boolean;
  } = {},
) {
  let builder = new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
  if (include) builder = builder.include(include);
  if (excludeNextBadge) builder = builder.exclude("[data-next-badge]");
  const results = await builder.analyze();
  expect(
    results.violations,
    [context, JSON.stringify(results.violations, null, 2)].filter(Boolean).join("\n"),
  ).toEqual([]);
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
  await page.waitForLoadState("load");
}
