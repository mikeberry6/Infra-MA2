import { expect, test } from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

const viewports = [
  { name: "320", width: 320, height: 900 },
  { name: "390", width: 390, height: 900 },
  { name: "768", width: 768, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1440", width: 1440, height: 900 },
];

// Baselines are versioned review artifacts. Chromium text rasterization differs
// materially between Linux CI and macOS development, so CI owns an explicit
// Linux baseline instead of weakening the global pixel threshold. Existing
// generic baselines remain the local-development reference until a separately
// reviewed platform refresh replaces them. CI runs this tagged file before any
// database-writing browser journey, keeping the validation dataset stable.
for (const viewport of viewports) {
  test(`@visual deal database baseline at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");
    await page.evaluate(() => document.fonts.ready);
    const baseline = process.platform === "linux"
      ? `tracker-${viewport.name}-linux.png`
      : `tracker-${viewport.name}.png`;
    await expect(page).toHaveScreenshot(baseline, {
      fullPage: false,
      mask: [page.locator("footer")],
    });
  });
}
