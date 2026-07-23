import { expect, test } from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

const VISUAL_WIDTHS = [320, 390, 768, 1280, 1440] as const;
const STABLE_VISUAL_CSS = `
  *, *::before, *::after {
    animation: none !important;
    caret-color: transparent !important;
    transition: none !important;
  }
  html { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; }
`;

test.describe("deterministic public application visual baselines", () => {
  test.beforeAll(() => {
    if (process.env.PLAYWRIGHT_BASE_URL) {
      throw new Error("Visual regression must run against Playwright's local application server.");
    }
  });

  for (const width of VISUAL_WIDTHS) {
    test(`empty search application shell at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(appPath("/search"));
      await waitForApplication(page, "Search InfraSight");
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: STABLE_VISUAL_CSS });

      await expect(page).toHaveScreenshot(`empty-search-${width}.png`, {
        animations: "disabled",
        caret: "hide",
        fullPage: true,
        maxDiffPixelRatio: 0.005,
        scale: "css",
        threshold: 0.15,
      });
    });
  }
});
