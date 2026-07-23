import { expect, test, type Locator, type Page } from "@playwright/test";
import { appPath, signInAsConfiguredAdmin, waitForApplication } from "./helpers";
import { assertIsolatedWriteTarget } from "./isolation-guard";
import {
  E2E_DEAL_FIXTURE_BUYER,
  E2E_DEAL_FIXTURE_SOURCE_LABEL,
  E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES,
  E2E_DEAL_FIXTURES,
} from "./deal-fixture-contract";

const WRITE_JOURNEY_ENV = [
  "E2E_DATABASE_URL",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
] as const;

const MUTATION_NAVIGATION_TIMEOUT_MS = 20_000;

function configuredWriteJourney() {
  return WRITE_JOURNEY_ENV.every((name) => Boolean(process.env[name]));
}

function dealRow(page: Page, target: string) {
  return page.locator("tbody tr").filter({ hasText: target });
}

async function runAdminServerAction(page: Page, button: Locator) {
  const currentPath = new URL(page.url()).pathname;
  const responsePromise = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(response.url()).pathname === currentPath;
  });

  await expect(button).toBeEnabled();
  await button.click();
  const response = await responsePromise;
  expect(response.ok(), `Server action at ${currentPath} should succeed`).toBeTruthy();
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function expectAuditEvent(page: Page, entityId: string, action: string, actorEmail: string) {
  const row = page
    .locator("tbody tr")
    .filter({ hasText: entityId })
    .filter({ has: page.getByText(action, { exact: true }) });
  await expect(row, `${action} should be recorded for ${entityId}`).toHaveCount(1);
  await expect(row.getByText(actorEmail, { exact: true })).toBeVisible();
}

async function createDraftDeal(page: Page, input: {
  target: string;
  title: string;
  description: string;
  sourceUrl?: string;
}) {
  await page.goto(appPath("/admin/deals/new"));
  await page.getByLabel(/^Title/).fill(input.title);
  await page.getByRole("textbox", { name: "Target (required)", exact: true }).fill(input.target);
  await page.getByLabel("Buyer (one per line)").fill(E2E_DEAL_FIXTURE_BUYER);
  await page.getByRole("combobox", { name: /^Seller disclosure/ }).selectOption("NOT_APPLICABLE");
  await page.getByLabel("Seller disclosure reason").fill("No seller applies to this isolated test fixture.");
  await page.getByLabel(/^Country/).fill("United States");
  await page.getByLabel(/^Date/).fill(new Date().toISOString().slice(0, 10));
  await page.getByLabel(/^Description/).fill(input.description);
  await page.getByRole("checkbox", { name: "Acquisition (Buyout)", exact: true }).check();
  if (input.sourceUrl) {
    await page.getByLabel("Primary Source Name").fill(E2E_DEAL_FIXTURE_SOURCE_LABEL);
    await page.getByLabel("Primary Source URL").fill(input.sourceUrl);
  }
  await page.getByRole("button", { name: "Create Deal" }).click();
  // The isolated Neon branch can incur a cold transaction on the first
  // audited mutation. Keep the assertion strict, but give the successful
  // server-action redirect a bounded mutation-specific window.
  await expect(page).toHaveURL(
    new RegExp(`${appPath("/admin/deals")}$`),
    { timeout: MUTATION_NAVIGATION_TIMEOUT_MS },
  );
}

async function bestEffortDeleteCreatedDeal(page: Page, target: string) {
  try {
    await page.goto(appPath("/admin/deals"));
    const row = dealRow(page, target);
    const rowCount = await row.count();
    if (rowCount === 0) return;
    expect(rowCount, `Cleanup should find at most one E2E deal named ${target}`).toBe(1);
    await row.getByRole("button", { name: "Delete", exact: true }).click();
    await runAdminServerAction(page, row.getByRole("button", { name: "Confirm", exact: true }));
    await expect(row, `Draft fixture ${target} should be absent after cleanup`).toHaveCount(0);
  } catch (error) {
    // Preserve the original assertion failure while leaving a useful cleanup
    // diagnostic in the Playwright report. This can only run after the target
    // guard above has proved the database is isolated.
    console.warn("Unable to remove the E2E deal during failure cleanup", error);
  }
}

async function bestEffortPreserveCreatedDeal(page: Page, target: string) {
  try {
    await page.goto(appPath("/admin/deals"));
    const row = dealRow(page, target);
    const rowCount = await row.count();
    if (rowCount === 0) return;
    expect(rowCount, `Cleanup should find at most one E2E deal named ${target}`).toBe(1);
    const deleteButton = row.getByRole("button", { name: "Delete", exact: true });
    if (await deleteButton.count()) {
      await deleteButton.click();
      await runAdminServerAction(page, row.getByRole("button", { name: "Confirm", exact: true }));
      await expect(row, `Draft fixture ${target} should be absent after cleanup`).toHaveCount(0);
      return;
    }
    const archiveButton = row.getByRole("button", { name: "Archive", exact: true });
    if (await archiveButton.count()) {
      await archiveButton.click();
      await runAdminServerAction(page, row.getByRole("button", { name: "Confirm archive", exact: true }));
    }
    await expect(
      row.getByText("ARCHIVED", { exact: true }),
      `Published fixture ${target} should be archived after cleanup`,
    ).toBeVisible();
    await expect(row.getByRole("button", { name: "Delete", exact: true })).toHaveCount(0);
  } catch (error) {
    console.warn("Unable to preserve the E2E deal during failure cleanup", error);
  }
}

test("anonymous administration access redirects safely to login", async ({ page }) => {
  await page.goto(appPath("/admin"));
  await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  expect(decodeURIComponent(new URL(page.url()).searchParams.get("callbackUrl") || "")).toBe(appPath("/admin"));
});

test("anonymous imports and exports are forbidden", async ({ request }) => {
  const exportResponse = await request.get(appPath("/api/exports/deals"));
  expect(exportResponse.status()).toBe(403);

  const importResponse = await request.post(`${appPath("/api/imports/deals")}?preview=1`, {
    data: { deals: [] },
  });
  expect(importResponse.status()).toBe(403);
});

test("invalid credentials return one generic message", async ({ page }) => {
  test.skip(
    !process.env.E2E_DATABASE_URL,
    "E2E_DATABASE_URL is required because failed-login throttling writes to the database",
  );
  assertIsolatedWriteTarget();

  await page.goto(appPath("/login"));
  await page.getByRole("textbox", { name: "Email" }).fill("unknown@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.locator("form").getByRole("alert"))
    .toHaveText("The email or password was not recognized.");
});

test("configured administrator previews a CSV before explicitly committing its draft", async ({ page, context }) => {
  test.setTimeout(90_000);
  test.skip(
    !configuredWriteJourney(),
    `${WRITE_JOURNEY_ENV.join(", ")} are required for the authenticated import journey`,
  );
  assertIsolatedWriteTarget();

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const legacyId = `E2E-IMPORT-${runId}`;
  const target = `${E2E_DEAL_FIXTURES.csvPreview.targetPrefix}${runId}`;
  const csv = [
    "id,title,target,buyer,seller,sellerDisclosureStatus,sellerDisclosureReason,sector,subsector,region,category,date,description,targetDescription,country,status",
    [
      legacyId,
      `${target} acquisition`,
      target,
      E2E_DEAL_FIXTURE_BUYER,
      "",
      "NOT_APPLICABLE",
      "No seller applies to this isolated CSV fixture.",
      "Digital",
      "Fiber",
      "North America",
      "Acquisition (Buyout)",
      new Date().toISOString().slice(0, 10),
      E2E_DEAL_FIXTURES.csvPreview.description,
      "A synthetic fiber platform used only in the isolated E2E database.",
      "United States",
      "Announced",
    ].join(","),
  ].join("\n");
  const importStages: string[] = [];
  let commitAttempted = false;

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() !== "POST" || !url.pathname.endsWith("/api/imports/deals")) return;
    importStages.push(url.searchParams.get("preview") === "1" ? "preview" : "commit");
  });

  try {
    await signInAsConfiguredAdmin(page, "/admin/deals");
    await waitForApplication(page, "Deals");
    await expect(dealRow(page, target)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Confirm import" })).toHaveCount(0);

    await page.getByLabel("Select CSV").setInputFiles({
      name: "isolated-deal-preview.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });

    const preview = page.getByRole("region", { name: "Import preview" });
    await expect(preview).toBeVisible();
    await expect(preview).toContainText("no imported records have been changed");
    await expect(preview).toContainText("Confirming will write 1 create and 0 updates");
    await expect(preview.getByRole("button", { name: "Confirm import" })).toBeEnabled();
    expect(importStages).toEqual(["preview"]);

    // A second authenticated server render proves preview created only its
    // short-lived confirmation record, not the domain deal.
    const verificationPage = await context.newPage();
    try {
      await verificationPage.goto(appPath("/admin/deals"));
      await waitForApplication(verificationPage, "Deals");
      await expect(dealRow(verificationPage, target)).toHaveCount(0);
    } finally {
      await verificationPage.close();
    }

    commitAttempted = true;
    await preview.getByRole("button", { name: "Confirm import" }).click();
    await expect(page.getByText("1 deal committed as drafts.", { exact: true })).toBeVisible();
    expect(importStages).toEqual(["preview", "commit"]);
    await expect(page.getByRole("link", { name: "View audit event" })).toHaveAttribute(
      "href",
      /\/admin\/audit\?focus=/,
    );

    await page.goto(appPath("/admin/deals"));
    const row = dealRow(page, target);
    await expect(row).toHaveCount(1);
    await expect(row.getByText("DRAFT", { exact: true })).toBeVisible();
    await expect(row.locator("td").first()).toHaveText(legacyId);
  } finally {
    if (commitAttempted) await bestEffortDeleteCreatedDeal(page, target);
  }
});

test("configured administrator can complete the audited draft-to-publication journey", async ({ page }) => {
  test.setTimeout(90_000);

  const databaseUrl = process.env.E2E_DATABASE_URL;
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(
    !configuredWriteJourney(),
    `${WRITE_JOURNEY_ENV.join(", ")} are required for the authenticated write journey`,
  );
  expect(databaseUrl).toBeTruthy();
  assertIsolatedWriteTarget();

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const target = `${E2E_DEAL_FIXTURES.publishedJourney.targetPrefix}${runId}`;
  const title = `${target} acquisition`;
  const deletionTarget = `${E2E_DEAL_FIXTURES.draftDelete.targetPrefix}${runId}`;
  let createAttempted = false;
  let archived = false;
  let deletionDraftCreateAttempted = false;
  let deletionDraftDeleted = false;

  try {
    await page.goto(`${appPath("/login")}?callbackUrl=${encodeURIComponent(appPath("/admin"))}`);
    await page.getByRole("textbox", { name: "Email address" }).fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(new RegExp(`${appPath("/admin")}$`));
    await expect(page.getByRole("heading", { name: /Admin/i })).toBeVisible();

    // Mark the attempt before submitting so a committed server action whose
    // redirect times out still receives fixture cleanup in finally.
    createAttempted = true;
    await createDraftDeal(page, {
      target,
      title,
      description: E2E_DEAL_FIXTURES.publishedJourney.description,
      sourceUrl: `${E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES[0]}${runId}`,
    });

    let row = dealRow(page, target);
    await expect(row).toHaveCount(1);
    await expect(row.getByText("DRAFT", { exact: true })).toBeVisible();
    const legacyId = (await row.locator("td").first().innerText()).trim();
    expect(legacyId).toMatch(/^INF-\d{4}-/);
    const editHref = await row.getByRole("link", { name: "Edit", exact: true }).getAttribute("href");
    const canonicalId = editHref?.match(/\/admin\/deals\/([^/]+)\/edit$/)?.[1];
    expect(canonicalId, "The admin edit link should expose the canonical deal ID").toBeTruthy();

    await runAdminServerAction(
      page,
      row.getByRole("button", { name: "Submit review", exact: true }),
    );
    row = dealRow(page, target);
    await expect(row.getByText("IN_REVIEW", { exact: true })).toBeVisible();

    await runAdminServerAction(
      page,
      row.getByRole("button", { name: "Publish", exact: true }),
    );
    row = dealRow(page, target);
    await expect(row.getByText("PUBLISHED", { exact: true })).toBeVisible();

    await page.goto(
      `${appPath("/tracker")}?q=${encodeURIComponent(target)}&focus=${encodeURIComponent(legacyId)}`,
    );
    await expect(page.getByRole("heading", { name: target, level: 2, exact: true })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`focus=${encodeURIComponent(legacyId)}`));

    await page.getByRole("button", { name: "Close drawer" }).click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Export", exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^deals_export_\d{4}-\d{2}-\d{2}\.csv$/);
    await download.delete();

    await page.goto(appPath("/admin/audit"));
    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
    await expectAuditEvent(page, canonicalId!, "CREATE", email!);
    await expectAuditEvent(page, canonicalId!, "SUBMIT_FOR_REVIEW", email!);
    await expectAuditEvent(page, canonicalId!, "PUBLISH", email!);

    await page.goto(appPath("/admin/deals"));
    row = dealRow(page, target);
    await row.getByRole("button", { name: "Archive", exact: true }).click();
    await runAdminServerAction(
      page,
      row.getByRole("button", { name: "Confirm archive", exact: true }),
    );
    row = dealRow(page, target);
    await expect(row.getByText("ARCHIVED", { exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Delete", exact: true })).toHaveCount(0);
    archived = true;
    await page.goto(`${appPath("/tracker")}?q=${encodeURIComponent(target)}`);
    await expect(page.getByText(target, { exact: true })).toHaveCount(0);

    await page.goto(appPath("/admin/audit"));
    await expectAuditEvent(page, canonicalId!, "ARCHIVE", email!);

    // Hard deletion is a separate never-published-draft journey. The archived
    // fixture above remains preserved with its full editorial history.
    deletionDraftCreateAttempted = true;
    await createDraftDeal(page, {
      target: deletionTarget,
      title: `${deletionTarget} acquisition`,
      description: E2E_DEAL_FIXTURES.draftDelete.description,
      sourceUrl: `${E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES[1]}${runId}`,
    });
    row = dealRow(page, deletionTarget);
    await expect(row.getByText("DRAFT", { exact: true })).toBeVisible();
    const deletionEditHref = await row.getByRole("link", { name: "Edit", exact: true }).getAttribute("href");
    const deletionCanonicalId = deletionEditHref?.match(/\/admin\/deals\/([^/]+)\/edit$/)?.[1];
    expect(deletionCanonicalId, "The deletion fixture should expose the canonical deal ID").toBeTruthy();
    await row.getByRole("button", { name: "Delete", exact: true }).click();
    await runAdminServerAction(
      page,
      row.getByRole("button", { name: "Confirm", exact: true }),
    );
    deletionDraftDeleted = true;
    await expect(dealRow(page, deletionTarget)).toHaveCount(0);

    await page.goto(appPath("/admin/audit"));
    await expectAuditEvent(page, deletionCanonicalId!, "DELETE", email!);
  } finally {
    if (deletionDraftCreateAttempted && !deletionDraftDeleted) {
      await bestEffortDeleteCreatedDeal(page, deletionTarget);
    }
    if (createAttempted && !archived) {
      await bestEffortPreserveCreatedDeal(page, target);
    }
  }
});
