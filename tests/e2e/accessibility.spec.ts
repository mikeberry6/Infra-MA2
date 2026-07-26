import { expect, test } from "@playwright/test";
import {
  ADMIN_E2E_ENV,
  applyWcagTextSpacing,
  appPath,
  configuredAdminE2E,
  expectNoAutomaticWcagAaViolations,
  expectNoHorizontalOverflow,
  signInAsConfiguredAdmin,
  waitForApplication,
} from "./helpers";

// Authenticated checks in this file fill an isolated administrator password.
// Do not retain browser traces whose action payloads could disclose it.
test.use({ trace: "off" });

const routes = [
  { path: "/tracker", heading: "Infrastructure Deal Tape" },
  { path: "/funds", heading: "Infrastructure Fund Database" },
  { path: "/portfolio", heading: "Infrastructure Portfolio Company Database" },
  { path: "/search", heading: "Search InfraSight" },
  { path: "/news", heading: "Daily Intelligence Feed" },
  { path: "/dashboard", heading: "M&A Conditions Dashboard" },
  { path: "/earnings", heading: "Earnings Tracker" },
  { path: "/login", heading: "Sign in" },
] as const;

const ADMIN_ROUTES = [
  { path: "/admin", heading: "Admin" },
  { path: "/admin/deals", heading: "Deals" },
  { path: "/admin/deals/new", heading: "New deal" },
  { path: "/admin/funds", heading: "Funds" },
  { path: "/admin/funds/new", heading: "New fund" },
  { path: "/admin/companies", heading: "Companies" },
  { path: "/admin/companies/new", heading: "New company" },
  { path: "/admin/sources", heading: "Sources" },
  { path: "/admin/dashboard-signals", heading: "Dashboard signal review" },
  { path: "/admin/audit", heading: "Audit log" },
  { path: "/admin/users", heading: "Users" },
] as const;

// 640 CSS px is the 200%-equivalent reflow viewport for a 1280px-wide layout.
// Keep the separate visual-regression matrix at its mandated five widths.
const RESPONSIVE_WIDTHS = [320, 390, 640, 768, 1280, 1440] as const;
const ADMIN_SCROLL_REGIONS = new Map([
  ["/admin/deals", { name: "Deals table", lastColumn: "Actions" }],
  ["/admin/funds", { name: "Funds table", lastColumn: "Actions" }],
  ["/admin/companies", { name: "Companies table", lastColumn: "Actions" }],
  ["/admin/sources", { name: "Sources table", lastColumn: "URL" }],
  ["/admin/users", { name: "Users table", lastColumn: "Created" }],
]);

for (const { path, heading } of routes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(appPath(path));
    await waitForApplication(page, heading);
    await expect(page.locator("a button")).toHaveCount(0);
    await expectNoAutomaticWcagAaViolations(page, { context: path });
  });
}

test("authenticated administration pages have no automatically detectable WCAG A/AA violations", { tag: "@sensitive" }, async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated admin accessibility checks`,
  );

  await signInAsConfiguredAdmin(page);
  for (const { path, heading } of ADMIN_ROUTES) {
    await page.goto(appPath(path));
    await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
    await expect(
      page.getByRole("heading", { name: heading, level: 1, exact: true }),
    ).toBeVisible();
    await expect(page.locator("a button")).toHaveCount(0);
    await expectNoAutomaticWcagAaViolations(page, { context: path });
  }
});

test("authenticated administration pages have no body-level horizontal overflow at required widths", { tag: "@sensitive" }, async ({ page }) => {
  test.setTimeout(240_000);
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated admin responsive checks`,
  );

  await signInAsConfiguredAdmin(page);
  for (const width of RESPONSIVE_WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(width);

    for (const { path, heading } of ADMIN_ROUTES) {
      const response = await page.goto(appPath(path));
      expect(response?.ok(), `${path} should load successfully at ${width}px`).toBeTruthy();
      await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
      await expect(
        page.getByRole("heading", { name: heading, level: 1, exact: true }),
        `${path} should render its authenticated admin heading at ${width}px`,
      ).toBeVisible();
      await expectNoHorizontalOverflow(page, `${path} at ${width}px`);

      const scrollRegion = ADMIN_SCROLL_REGIONS.get(path);
      if (scrollRegion && width <= 390) {
        const region = page.getByRole("region", { name: scrollRegion.name });
        await expect(region).toBeVisible();
        expect(
          await region.evaluate((element) => element.scrollWidth > element.clientWidth),
          `${path} should expose a horizontal table scroll region at ${width}px`,
        ).toBe(true);
        await region.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
        });
        await expect(
          region.getByRole("columnheader", { name: scrollRegion.lastColumn }),
        ).toBeInViewport();
      }
    }
  }
});

test("public routes retain content and controls under WCAG text-spacing overrides", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 900 });

  for (const { path, heading } of routes) {
    await page.goto(appPath(path));
    await waitForApplication(page, heading);
    await applyWcagTextSpacing(page);
    await expect(
      page.getByRole("heading", { name: heading, level: 1, exact: true }),
      `${path} heading should remain visible with WCAG text spacing`,
    ).toBeVisible();
    await expectNoHorizontalOverflow(page, `${path} with WCAG text spacing`);

    const representativeControl = page.locator(
      "main a:visible, main button:visible, main input:visible, main select:visible, main textarea:visible",
    ).first();
    if (await representativeControl.count()) {
      await representativeControl.focus();
      await expect(representativeControl).toBeFocused();
    }
  }
});

test("authenticated administration retains content and controls under WCAG text-spacing overrides", { tag: "@sensitive" }, async ({ page }) => {
  test.setTimeout(180_000);
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated admin text-spacing checks`,
  );

  await signInAsConfiguredAdmin(page);
  await page.setViewportSize({ width: 390, height: 900 });
  for (const { path, heading } of ADMIN_ROUTES) {
    await page.goto(appPath(path));
    await expect(page).toHaveURL(new RegExp(`${appPath(path)}$`));
    await expect(
      page.getByRole("heading", { name: heading, level: 1, exact: true }),
    ).toBeVisible();
    await applyWcagTextSpacing(page);
    await expectNoHorizontalOverflow(page, `${path} with WCAG text spacing`);

    const representativeControl = page.locator(
      "main a:visible, main button:visible, main input:visible, main select:visible, main textarea:visible",
    ).first();
    await expect(representativeControl).toBeVisible();
    await representativeControl.focus();
    await expect(representativeControl).toBeFocused();
  }
});

test("the skip link is the first keyboard stop and targets main content", async ({ page }) => {
  await page.goto(appPath("/tracker"));
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the not-found action is a single link rather than nested interactive content", async ({ page }) => {
  await page.goto(appPath("/this-route-does-not-exist"));
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to deals" })).toHaveAttribute(
    "href",
    appPath("/tracker"),
  );
  await expect(page.locator("a button")).toHaveCount(0);
  await expectNoAutomaticWcagAaViolations(page, { context: "not-found state" });
});

test("deterministic no-result states have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  const impossibleQuery = "a11y-no-match-7f91c4d2";
  const emptyStates = [
    {
      path: `/tracker?q=${impossibleQuery}`,
      heading: "Infrastructure Deal Tape",
      message: "No deals match your current filters.",
    },
    {
      path: `/funds?q=${impossibleQuery}`,
      heading: "Infrastructure Fund Database",
      message: "No funds match your current filters.",
    },
    {
      path: `/portfolio?q=${impossibleQuery}`,
      heading: "Infrastructure Portfolio Company Database",
      message: "No portfolio companies match your current filters.",
    },
    {
      path: `/news?q=${impossibleQuery}`,
      heading: "Daily Intelligence Feed",
      message: "0 items",
    },
    {
      path: `/search?q=${impossibleQuery}`,
      heading: "Search InfraSight",
      message: "No results matched your query.",
    },
  ] as const;

  await page.setViewportSize({ width: 390, height: 900 });
  for (const state of emptyStates) {
    await page.goto(appPath(state.path));
    await waitForApplication(page, state.heading);
    await expect(page.getByText(state.message, { exact: true }).first()).toBeVisible();
    await expectNoAutomaticWcagAaViolations(page, {
      context: `${state.path} no-result state`,
    });
  }
});

test("mobile filter sheet remains accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appPath("/tracker"));
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await expectNoAutomaticWcagAaViolations(page, {
    include: '[role="dialog"]',
    context: "mobile filter sheet",
    excludeNextBadge: false,
  });
});

for (const database of [
  {
    path: "/tracker",
    heading: "Infrastructure Deal Tape",
    trigger: "tbody [data-deal-row-trigger]",
    name: "deal drawer",
  },
  {
    path: "/funds",
    heading: "Infrastructure Fund Database",
    trigger: "tbody [data-fund-row-trigger]",
    name: "fund drawer",
  },
  {
    path: "/portfolio",
    heading: "Infrastructure Portfolio Company Database",
    trigger: "tbody [data-company-row-trigger]",
    name: "portfolio company scorecard",
  },
] as const) {
  test(`${database.name} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(appPath(database.path));
    await page.getByRole("heading", {
      name: database.heading,
      level: 1,
    }).waitFor();
    await page.locator(database.trigger).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toBeHidden();
    await expect(dialog.getByText(/^Last verified /)).toBeVisible();
    await expectNoAutomaticWcagAaViolations(page, {
      include: '[role="dialog"]',
      context: database.name,
      excludeNextBadge: false,
    });
  });
}

test("a drawer loading state has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  let releaseRequest: () => void = () => {};
  const requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route("**/api/deals/*", async (route) => {
    await requestGate;
    await route.continue();
  });

  await page.goto(appPath("/tracker"));
  await waitForApplication(page, "Infrastructure Deal Tape");
  await page.locator("tbody [data-deal-row-trigger]").first().click();
  const dialog = page.getByRole("dialog");
  const loading = dialog.getByRole("status");

  try {
    await expect(loading).toContainText("Loading the latest verified detail");
    await expectNoAutomaticWcagAaViolations(page, {
      include: '[role="dialog"]',
      context: "deal drawer loading state",
      excludeNextBadge: false,
    });
  } finally {
    releaseRequest();
  }
  await expect(loading).toBeHidden();
});

test("open multiselect popup has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(appPath("/tracker"));
  await waitForApplication(page, "Infrastructure Deal Tape");
  await page.getByRole("button", { name: "Filter by Sector" }).click();
  await expect(page.getByRole("listbox", { name: "Sector options" })).toBeVisible();

  await expectNoAutomaticWcagAaViolations(page, { context: "open multiselect popup" });
});

test("admin import preview has no automatically detectable WCAG A/AA violations", { tag: "@sensitive" }, async ({ page }) => {
  test.skip(
    !configuredAdminE2E(),
    `${ADMIN_E2E_ENV.join(", ")} are required for authenticated import-preview accessibility checks`,
  );

  await page.route(
    (url) => url.pathname.endsWith("/api/imports/deals") && url.searchParams.get("preview") === "1",
    (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [{ id: "A11Y-PREVIEW-ONLY", title: "Accessibility preview fixture" }],
        previewToken: "accessibility-preview-token",
        total: 1,
        valid: 1,
        creates: 1,
        updates: 0,
        unchanged: 0,
        quarantined: 1,
        warnings: [{
          row: 2,
          id: "A11Y-PREVIEW-WARNING",
          code: "PUBLISHED_DEAL_UPDATE_BLOCKED",
          existingStatus: "PUBLISHED",
          error: "Published deal requires editorial review",
        }],
        errors: [{
          row: 3,
          id: "A11Y-PREVIEW-ERROR",
          code: "MISSING_REQUIRED_FIELD",
          error: "Buyer is required",
        }],
        ownershipChanges: [],
      }),
    }),
  );
  await signInAsConfiguredAdmin(page, "/admin/deals");
  await waitForApplication(page, "Deals");
  const fileInput = page.getByLabel("Select CSV");
  await expect(fileInput).toBeEnabled();
  await fileInput.setInputFiles({
    name: "accessibility-preview.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("id,title\nA11Y-PREVIEW-ONLY,Accessibility preview fixture"),
  });

  const preview = page.getByRole("region", { name: "Import preview" });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("no imported records have been changed");
  await expect(
    preview.getByRole("heading", { name: "Warnings and quarantined rows (1)" }),
  ).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Validation errors (1)" }),
  ).toBeVisible();
  await expectNoAutomaticWcagAaViolations(page, {
    include: '[aria-label="Import preview"]',
    context: "admin import preview",
    excludeNextBadge: false,
  });
});

test("reduced-motion preference suppresses drawer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/tracker"));
  await page.getByRole("heading", { name: "Infrastructure Deal Tape", level: 1 }).waitFor();
  await page.locator("tbody [data-deal-row-trigger]").first().click();

  const animationDurationMs = await page.getByRole("dialog").evaluate((element) => {
    const values = getComputedStyle(element).animationDuration.split(",");
    return Math.max(...values.map((value) => {
      const duration = value.trim();
      if (duration.endsWith("ms")) return Number.parseFloat(duration);
      if (duration.endsWith("s")) return Number.parseFloat(duration) * 1000;
      return Number.parseFloat(duration) || 0;
    }));
  });

  expect(animationDurationMs).toBeLessThanOrEqual(0.011);
});
