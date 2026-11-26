import { expect, test, type Page } from "@playwright/test";
import { appPath } from "./helpers";

const gallery = appPath("/one-off-requests/email-design-gallery?edition=2026-11-21");

async function clipboardContent(page: Page) {
  return page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    return {
      html: await (await item.getType("text/html")).text(),
      text: await (await item.getType("text/plain")).text(),
    };
  });
}

test("copies the selected layout with live source links and a readable plain-text equivalent", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(gallery);
  await page.getByRole("radio", { name: "Deal digest" }).check();
  await page.getByRole("button", { name: "Compare original" }).click();
  const digest = page.frameLocator('iframe[title="Deal digest email preview"]');
  const firstSource = digest.getByRole("link", { name: /^Source for / }).first();
  const url = await firstSource.getAttribute("href");
  expect(url).toMatch(/^https?:\/\//);
  await expect(page.getByTitle("Published original email preview")).toBeVisible();
  expect(await digest.locator("body").evaluate(body => body.ownerDocument.defaultView?.innerWidth)).toBe(600);
  await page.getByRole("button", { name: "Phone" }).click();
  expect(await digest.locator("body").evaluate(body => body.ownerDocument.defaultView?.innerWidth)).toBe(375);

  await page.getByRole("button", { name: "Copy for Outlook" }).click();
  await expect(page.getByRole("status")).toContainText("Copied.");
  const copied = await clipboardContent(page);
  expect(copied.html).toContain("<table");
  expect(copied.html).toContain(url);
  expect(copied.text).toContain(`Source (${url})`);
  expect(copied.text).toContain("Key themes");
  expect(copied.text).toContain("Deal Count By Sector (YTD)");
  for (const body of [copied.html, copied.text]) {
    expect(body).not.toMatch(/Compare original|Copy for Outlook|Published original/);
  }
});

test("manually selects only the rendered email when clipboard writing is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "write", {
      value: () => Promise.reject(new DOMException("Clipboard blocked", "NotAllowedError")),
    });
  });
  await page.goto(gallery);
  const frame = page.frameLocator('iframe[title="Executive briefing email preview"]');
  await expect(frame.getByRole("heading", { name: "Key themes" })).toBeVisible();
  await page.getByRole("button", { name: "Copy for Outlook" }).click();
  await expect(page.getByRole("status")).toContainText("Email selected.");
  const manual = await frame.locator("body").evaluate(body => {
    const doc = body.ownerDocument;
    const selection = doc.getSelection()?.toString();
    const transfer = new DataTransfer();
    doc.dispatchEvent(new ClipboardEvent("copy", { clipboardData: transfer, bubbles: true, cancelable: true }));
    return { selection, html: transfer.getData("text/html"), text: transfer.getData("text/plain") };
  });
  expect(manual.selection).toContain("Blackstone");
  expect(manual.selection).not.toContain("Copy for Outlook");
  expect(manual.html).toContain("<table");
  expect(manual.text).toMatch(/Source \(https?:\/\//);
});

test("keeps the chosen layout across editions and fits the phone view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(gallery);
  await page.getByRole("radio", { name: "Research bulletin" }).check();
  await page.getByRole("combobox", { name: "Published edition" }).selectOption("2026-10-30");
  await expect(page).toHaveURL(url => url.searchParams.get("edition") === "2026-10-30");
  await expect(page.getByRole("radio", { name: "Research bulletin" })).toBeChecked();
  const frame = page.frameLocator('iframe[title="Research bulletin email preview"]');
  await expect(frame.getByRole("heading", { name: "Plenum Power | EIG" })).toBeVisible();
  expect(await frame.locator("body").evaluate(body => body.ownerDocument.defaultView?.innerWidth)).toBe(375);
  await page.getByRole("button", { name: "Compare original" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
