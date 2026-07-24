import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

const viewports = [
  { name: "320", width: 320, height: 900 },
  { name: "390", width: 390, height: 900 },
  { name: "768", width: 768, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1440", width: 1440, height: 900 },
];

const representativeRoutes = [
  {
    name: "funds",
    path: "/funds",
    heading: "Infrastructure Fund Database",
    surface: "header",
    dynamicRegions: "database",
  },
  {
    name: "portfolio",
    path: "/portfolio",
    heading: "Infrastructure Portfolio Company Database",
    surface: "header",
    dynamicRegions: "database",
  },
  {
    name: "news",
    path: "/news",
    heading: "Daily Intelligence Feed",
    surface: "header",
    dynamicRegions: "news",
  },
  {
    name: "dashboard",
    path: "/dashboard",
    heading: "M&A Conditions Dashboard",
    surface: "header",
    dynamicRegions: "dashboard",
  },
  {
    name: "search",
    path: "/search",
    heading: "Search InfraSight",
    surface: "main",
    dynamicRegions: "search",
  },
  {
    name: "login",
    path: "/login",
    heading: "Sign in",
    surface: "main",
    dynamicRegions: "none",
  },
] as const;

type RepresentativeRoute = (typeof representativeRoutes)[number];

const MASK_COLOR = "#e6e6e9";

function platformBaseline(name: string, viewport: string): string {
  return process.platform === "linux"
    ? `${name}-${viewport}-linux.png`
    : `${name}-${viewport}.png`;
}

function representativeSurface(page: Page, route: RepresentativeRoute): Locator {
  const mainContainer = page.locator("#main-content > div").first();
  return route.surface === "main"
    ? mainContainer
    : mainContainer.locator(":scope > section").first();
}

function dynamicMasks(surface: Locator, route: RepresentativeRoute): Locator[] {
  switch (route.dynamicRegions) {
    case "database":
      return [
        surface.getByRole("navigation", { name: "Database" }).locator(".mono"),
        surface.locator("dl dd"),
      ];
    case "news":
      return [
        surface.getByText(/^Updated /).locator(".mono"),
        surface.locator(".mt-5.grid > div > .mono"),
      ];
    case "dashboard":
      return [
        surface.locator(".h-11.w-11"),
        surface.getByText(/^(Risk-On|Risk-Off|Neutral)$/),
        surface.getByText(/^Updated /).locator(".mono"),
        surface.locator("dl dd"),
      ];
    case "search":
      return [surface.locator("dl dd")];
    case "none":
      return [];
  }
}

async function captureRepresentativeBaseline({
  page,
  testInfo,
  route,
  viewport,
}: {
  page: Page;
  testInfo: TestInfo;
  route: RepresentativeRoute;
  viewport: string;
}) {
  await page.goto(appPath(route.path));
  await waitForApplication(page, route.heading);
  await page.evaluate(() => document.fonts.ready);

  const surface = representativeSurface(page, route);
  await expect(surface).toBeVisible();
  const mask = dynamicMasks(surface, route);
  const actualPath = testInfo.outputPath(
    `${route.name}-${viewport}-${process.platform}-clean-actual.png`,
  );

  await surface.screenshot({
    path: actualPath,
    animations: "disabled",
    caret: "hide",
    mask,
    maskColor: MASK_COLOR,
  });
  await testInfo.attach(`${route.name}-${viewport}-clean-actual`, {
    path: actualPath,
    contentType: "image/png",
  });

  await expect(surface).toHaveScreenshot(platformBaseline(route.name, viewport), {
    animations: "disabled",
    caret: "hide",
    mask,
    maskColor: MASK_COLOR,
    maxDiffPixelRatio: process.platform === "linux" ? 0.005 : 0.02,
  });
}

// Baselines are versioned review artifacts. Chromium text rasterization differs
// materially between Linux CI and macOS development, so CI owns an explicit
// Linux baseline and a tighter reviewed threshold. Existing
// generic baselines remain the local-development reference until a separately
// reviewed platform refresh replaces them. CI runs this tagged file before any
// database-writing browser journey, keeping the validation dataset stable.
for (const viewport of viewports) {
  test(`@visual deal database baseline at ${viewport.name}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");
    await page.evaluate(() => document.fonts.ready);
    const footer = page.locator("footer");
    const actualPath = testInfo.outputPath(
      `tracker-${viewport.name}-${process.platform}-clean-actual.png`,
    );

    // Retain the exact hosted rendering even when the assertion passes. This
    // makes a future baseline refresh a reviewable artifact instead of asking
    // reviewers to infer Linux output from a different operating system.
    await page.screenshot({
      path: actualPath,
      fullPage: false,
      animations: "disabled",
      caret: "hide",
      mask: [footer],
    });
    await testInfo.attach(`tracker-${viewport.name}-clean-actual`, {
      path: actualPath,
      contentType: "image/png",
    });

    await expect(page).toHaveScreenshot(platformBaseline("tracker", viewport.name), {
      fullPage: false,
      mask: [footer],
      maxDiffPixelRatio: process.platform === "linux" ? 0.005 : 0.02,
    });
  });

  for (const route of representativeRoutes) {
    test(`@visual ${route.name} public route baseline at ${viewport.name}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await captureRepresentativeBaseline({
        page,
        testInfo,
        route,
        viewport: viewport.name,
      });
    });
  }
}
