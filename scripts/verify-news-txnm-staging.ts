import { chromium, expect, type Page } from "@playwright/test";
import { edgarCanonicalUrl } from "../src/modules/news-evidence/policy";

const accession = "0001108426-25-000048";
const filingUrl = edgarCanonicalUrl(accession);
const perShareConsideration = /\b61\.25\b/;
const signingDate = /May\s+18,\s+2025|2025-05-18/i;
const reviewErrorCodes: Readonly<Record<string, string>> = {
  "Forbidden": "FORBIDDEN",
  "News review is disabled.": "DISABLED",
  "Check the review fields and try again.": "INVALID_INPUT",
  "This draft does not meet the source and evidence requirements for publication.": "INELIGIBLE_EVIDENCE",
  "A matched entity is no longer supported. Reprocess this draft before approval.": "UNSUPPORTED_MATCH",
  "This draft changed. Reload the review before trying again.": "DRAFT_CHANGED",
  "Publication changed. Reload before trying again.": "PUBLICATION_CHANGED",
  "Review could not be saved. Reload and try again.": "SAVE_FAILED",
};

function stagingOrigin(): string {
  const url = new URL(process.env.NEWS_TXNM_STAGING_ORIGIN ?? "");
  if (url.protocol !== "http:" || !["127.0.0.1", "[::1]"].includes(url.hostname)
    || !url.port || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("The staging browser target must be a loopback HTTP origin with an explicit port.");
  }
  return url.origin;
}

async function openNews(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Daily Intelligence Feed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
}

let checkpoint = "validate staging smoke configuration";

async function main() {
  if (process.env.NEWS_TXNM_STAGING_SMOKE !== "true" || process.env.NEWS_PIPELINE_TARGET !== "staging") {
    throw new Error("This smoke test requires an explicitly isolated staging run.");
  }
  const origin = stagingOrigin();
  const basePath = (process.env.E2E_BASE_PATH ?? "/Infra-MA2").replace(/\/$/, "");
  const revisionId = process.env.NEWS_TXNM_STAGING_DRAFT_ID;
  const alreadyApproved = process.env.NEWS_TXNM_STAGING_EXPECT_APPROVED === "true";
  const email = process.env.NEWS_TXNM_STAGING_ADMIN_EMAIL;
  const password = process.env.NEWS_TXNM_STAGING_ADMIN_PASSWORD;
  if ((basePath && !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(basePath))
    || !revisionId || !/^c[a-z0-9]{24}$/.test(revisionId) || !email || !password) {
    throw new Error("A valid staging app path, draft ID, and runner-only admin login are required.");
  }

  const newsUrl = `${origin}${basePath}/news?period=All`;
  const draftUrl = `${origin}${basePath}/admin/news-evidence/${revisionId}`;
  const digestUrl = `${origin}${basePath}/admin/news-evidence/digest`;
  checkpoint = "launch Chromium";
  const browser = await chromium.launch();

  try {
    const reader = await browser.newPage();
    const editor = await browser.newPage();
    for (const page of [reader, editor]) {
      await page.context().route("**/*", (route) => new URL(route.request().url()).origin === origin
        ? route.continue()
        : route.abort());
    }

    const filingCards = reader.getByRole("article").filter({ has: reader.locator(`a[href="${filingUrl}"]`) });
    if (!alreadyApproved) {
      checkpoint = "confirm the filing is absent from the anonymous news feed";
      await openNews(reader, newsUrl);
      await expect(filingCards).toHaveCount(0);
    }

    checkpoint = "authenticate with the staging admin account";
    const adminGate = await editor.request.get(draftUrl, { maxRedirects: 0 });
    expect(adminGate.status()).toBe(307);
    const loginUrl = new URL(adminGate.headers().location, origin);
    expect(loginUrl.pathname).toBe(`${basePath}/login`);
    expect(loginUrl.searchParams.get("callbackUrl")).toBe(`${basePath}/admin/news-evidence/${revisionId}`);
    // Next can normalize the server's loopback hostname when building redirects.
    // Keep the actual login on the explicitly verified origin.
    await editor.goto(`${origin}${loginUrl.pathname}${loginUrl.search}`);
    await expect(editor.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
    const loginEmail = editor.getByRole("textbox", { name: "Email address" });
    const loginPassword = editor.getByLabel("Password", { exact: true });
    const signIn = editor.getByRole("button", { name: "Sign In", exact: true });
    await expect(async () => {
      await loginEmail.fill(email);
      await loginPassword.fill(password);
      await expect(signIn).toBeEnabled({ timeout: 500 });
    }).toPass({ timeout: 10_000 });
    await signIn.click();
    await editor.waitForURL(draftUrl);

    checkpoint = "verify the TXNM signing draft and review classification";
    const heading = editor.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(/\bTXNM\b/i);
    const title = await heading.innerText();
    const classification = editor.getByRole("region", { name: "Classification" });
    await expect(classification.getByText(alreadyApproved ? /^approved$/i : /^draft$/i)).toBeVisible();
    await expect(classification.getByText(/^ready for review$/i)).toBeVisible();
    await expect(editor.getByText(/^signing · revision \d+$/i)).toBeVisible();

    checkpoint = "verify the fund is classified as undisclosed";
    await expect(classification.getByText(/^undisclosed$/i)).toBeVisible();

    checkpoint = "verify the EDGAR accession and the May 19 filing date";
    const evidence = editor.getByRole("region", { name: "Source evidence and extracted facts" });
    await expect(evidence.getByRole("link", { name: "Open filing" })).toHaveAttribute("href", filingUrl);
    await expect(evidence.locator("time")).toHaveText("2025-05-19");

    checkpoint = "verify the May 18 signing date";
    await expect(evidence.locator("blockquote").filter({ hasText: signingDate }).first()).toBeVisible();

    checkpoint = "verify the cited Blackstone Infrastructure connection";
    const matches = editor.getByRole("region", { name: "Entity matches" });
    const supportingQuotes = classification.locator("blockquote")
      .or(matches.locator("blockquote"))
      .or(evidence.locator("blockquote"));
    await expect(supportingQuotes.filter({ hasText: /Blackstone Infrastructure/i }).first()).toBeVisible();

    checkpoint = "verify the cited $61.25 per share consideration";
    const consideration = evidence.getByRole("listitem").filter({ hasText: /per share consideration/i });
    await expect(consideration.locator("blockquote").filter({ hasText: perShareConsideration }).first()).toBeVisible();

    if (!alreadyApproved) {
      const review = editor.getByRole("region", { name: "Review decision" });
      checkpoint = "confirm approval requires no related, legacy, or correction selection";
      await expect(review.getByLabel("Related development", { exact: true })).toHaveCount(0);
      await expect(review.getByLabel("Public legacy items with the same source URL")).toHaveCount(0);
      await expect(review.getByLabel(/this draft corrects the selected approved revision/i)).toHaveCount(0);
      await expect(editor.getByRole("button", { name: "Apply reviewed deal update" })).toHaveCount(0);

      checkpoint = "confirm the evidence in the staging approval form";
      const confirmed = review.getByRole("checkbox", { name: /I verified the draft copy, evidence, and selected record links/i });
      const approval = review.getByRole("button", { name: "Approve and publish", exact: true });
      await expect(approval).toBeDisabled();
      await expect(async () => {
        await confirmed.uncheck();
        await confirmed.check();
        await expect(approval).toBeEnabled({ timeout: 500 });
      }).toPass({ timeout: 10_000 });

      checkpoint = "submit exactly one staging approval and receive the server response";
      const [approvalResponse] = await Promise.all([
        editor.waitForResponse((response) => response.url() === draftUrl && response.request().method() === "POST"
          && Boolean(response.request().headers()["next-action"]), { timeout: 15_000 }),
        approval.click(),
      ]);
      console.log(JSON.stringify({ event: "txnm_staging_approval_response", status: approvalResponse.status() }));
      expect(approvalResponse.status()).toBe(200);
      await approvalResponse.finished();

      checkpoint = "verify the staged approval was saved";
      const approved = classification.getByText(/^approved$/i);
      const alert = review.getByRole("alert");
      try {
        await approved.or(alert).first().waitFor({ state: "visible", timeout: 3_000 });
      } catch {
        // A server-action response may arrive before the refreshed view is applied.
        await editor.reload();
      }
      if (await alert.isVisible()) {
        const message = (await alert.innerText()).trim();
        console.error(JSON.stringify({ event: "txnm_staging_approval_error", code: reviewErrorCodes[message] ?? "OTHER_REVIEW_ERROR" }));
      }
      await expect(approved).toBeVisible();
      await expect(editor).toHaveURL(draftUrl);
    }

    checkpoint = "confirm the approved revision appears in the anonymous news feed";
    await openNews(reader, newsUrl);
    await expect(filingCards).toHaveCount(1);
    await expect(filingCards.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(filingCards.getByRole("link", { name: "Source", exact: true })).toHaveAttribute("href", filingUrl);
    await expect(filingCards.getByText(/May 19, 2025|2025-05-19/).first()).toBeVisible();

    checkpoint = "check the protected staging digest archive";
    const response = await editor.goto(digestUrl);
    expect(response?.status()).toBe(200);
    await expect(editor.getByRole("heading", { level: 1, name: "Morning news digest" })).toBeVisible();

    console.log(JSON.stringify({
      accession,
      revisionId,
      absentBeforeApproval: alreadyApproved ? null : true,
      approvalSubmitted: !alreadyApproved,
      approvedRevisionVerified: true,
      publicFeedVisibleAfterApproval: true,
      digestArchiveReachable: true,
    }));
  } finally {
    await browser.close();
  }
}

main().catch(() => {
  console.error(`TXNM staging browser verification failed while attempting to ${checkpoint}.`);
  process.exitCode = 1;
});
