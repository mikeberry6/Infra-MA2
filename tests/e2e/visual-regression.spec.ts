import { expect, test } from "@playwright/test";
import { appPath, waitForApplication } from "./helpers";

const viewports = [
  { name: "320", width: 320, height: 900 },
  { name: "390", width: 390, height: 900 },
  { name: "768", width: 768, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1440", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`deal database visual baseline at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(appPath("/tracker"));
    await waitForApplication(page, "Infrastructure Deal Tape");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`tracker-${viewport.name}.png`, {
      fullPage: false,
      mask: [page.locator("footer")],
    });
  });
}
