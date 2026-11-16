// @vitest-environment node
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { describe, expect, it, vi } from "vitest";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { buildNextDigestEdition, easternDigestCutoff } from "./digest";
import { createOpenAiModelClient, readProcessingSettings } from "./models";
import { applyReviewedDealLifecycle } from "./mutations";
import { drainNewsWork } from "./processing";
import { reviewNewsDraft } from "./review";
import { captureDocument, fetchEdgarCapture } from "./source";
import { EDGAR_SOURCE_KEY } from "./policy";
import { getNewsFeed } from "@/modules/news/queries";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

const connectionString = process.env.NEWS_TEST_DATABASE_URL;
const canTest = Boolean(connectionString && connectionString === process.env.DATABASE_URL
  && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(connectionString).hostname));

const accession = "0001108426-25-000048";
const signing = "On May 18, 2025, TXNM Energy, Inc. entered into an Agreement and Plan of Merger.";
const relatedParty = "Parent and Merger Sub are affiliates of Blackstone Infrastructure Partners L.P.";
const consideration = "Each share can be converted into the right to receive $61.25 in cash (the Per Share Merger Consideration).";
const filingDate = "Date of Report: May 19, 2025";
const title = "TXNM Energy signs Blackstone Infrastructure merger agreement";

function extraction() {
  const claim = (key: string, kind: string, value: string, section: number, quote: string, amount: string | null = null) => ({
    key, kind, value, amount, currency: null, attribution: "DISCLOSED", attributedTo: "TXNM Energy", evidence: { section, quote },
  });
  return {
    headline: title,
    summary: "TXNM Energy disclosed that it signed a merger agreement with affiliates of Blackstone Infrastructure. The agreement provides for $61.25 in cash per share.",
    category: "TRANSACTION_ACTIVITY",
    eventKind: "SIGNING",
    occurredOn: "2025-05-18",
    firstDisclosedOn: "2025-05-19",
    novelty: "FIRST_FORMAL_DISCLOSURE",
    transactionForm: "ACQUISITION",
    relevance: "RELEVANT",
    qualification: { kind: "DIRECT_EXPLICIT_STRATEGY", reason: "The acquirer is a Blackstone Infrastructure affiliate.",
      evidence: { section: 2, quote: relatedParty } },
    fundDisclosure: "UNDISCLOSED",
    claims: [
      claim("merger", "EVENT", "entered into an Agreement and Plan of Merger", 1, signing),
      claim("signed", "OCCURRENCE_DATE", "2025-05-18", 1, signing),
      claim("disclosed", "FIRST_DISCLOSURE_DATE", "2025-05-19", 0, filingDate),
      claim("share-price", "PER_SHARE_CONSIDERATION", "$61.25", 3, consideration, "61.25"),
    ],
    entities: [
      { key: "target", kind: "COMPANY", label: "TXNM Energy", role: "TARGET", evidence: { section: 1, quote: signing } },
    ],
  };
}

async function seedAdmin(db: PrismaClient, suffix: string) {
  return db.user.create({ data: { email: `news-test-${suffix}@example.test`, passwordHash: "invalid", role: "ADMIN" } });
}

describe.skipIf(!canTest)("evidence-backed news on disposable PostgreSQL", () => {
  it("captures a TXNM filing, preserves delivery/version identity, and publishes only the reviewed revision", async () => {
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    const suffix = randomUUID();
    const settings = readProcessingSettings({ NODE_ENV: "test", NEWS_PROCESSING_VERSION: suffix });
    process.env.NEWS_EVIDENCE_ENABLED = "true";
    try {
      const user = await seedAdmin(db, suffix);
      const legacyNews = await db.newsItem.create({
        data: { legacyId: `legacy-news-${suffix}`, title: "Existing news", category: "TRANSACTION_ACTIVITY", publishedAt: new Date("2026-10-01") },
      });
      const originalDeal = await db.deal.create({
        data: { legacyId: `legacy-deal-${suffix}`, title: "Existing deal", target: "Unrelated legacy target",
          sector: "UTILITIES", region: "NORTH_AMERICA", date: new Date("2026-10-02"), dealStatus: "ANNOUNCED", categories: [], keyHighlights: [] },
      });
      const company = await db.company.upsert({
        where: { name_country: { name: "TXNM Energy", country: "United States" } },
        create: {
          name: "TXNM Energy", country: "United States", countryTags: ["United States"],
          companyStatus: "ACTIVE", sector: "UTILITIES", region: "NORTH_AMERICA",
        },
        update: {},
      });
      const capture = await fetchEdgarCapture({
        accession, userAgent: "InfraSight fixture contact@example.test", deliveryKey: suffix,
      }, { pace: async () => {}, fetchResponse: vi.fn<typeof fetch>(async (url) => {
        if (String(url).startsWith("https://data.sec.gov/")) return Response.json({
          cik: "1108426",
          filings: { recent: {
            accessionNumber: [accession], acceptanceDateTime: ["2025-05-19T12:00:00.000Z"],
            form: ["8-K"], primaryDocument: ["pnm-20250519.htm"],
          } },
        });
        expect(String(url)).toContain("/1108426/000110842625000048/pnm-20250519.htm");
        return new Response([filingDate, signing, relatedParty, consideration].map((line) => `<p>${line}</p>`).join(""),
          { headers: { "content-type": "text/html" } });
      }) });
      const initial = await captureDocument(db, capture, settings);
      const redelivery = await captureDocument(db, { ...capture, deliveryKey: `${suffix}-repeat` }, settings);
      expect(redelivery).toMatchObject({ versionId: initial.versionId, newDelivery: true, newVersion: false });
      expect(await captureDocument(db, capture, settings)).toMatchObject({ newDelivery: false, newVersion: false });

      const sourceBefore = await db.newsSourceVersion.findUniqueOrThrow({ where: { id: initial.versionId } });
      const models: string[] = [];
      const model = createOpenAiModelClient("fixture-only", vi.fn<typeof fetch>(async (_url, request) => {
        const payload = JSON.parse(String(request?.body)) as { model: string; store: boolean };
        expect(payload.store).toBe(false);
        models.push(payload.model);
        const result = payload.model === settings.SCREEN.model ? {
          stories: [{ startSection: 0, endSection: 3, relevance: "RELEVANT", reason: "Binding infrastructure transaction." }],
        } : extraction();
        return Response.json({
          model: payload.model,
          status: "completed",
          output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(result) }] }],
          usage: { input_tokens: 10, output_tokens: 8, total_tokens: 18 },
        }, { headers: { "x-request-id": `fixture-${models.length}` } });
      }));
      const result = await drainNewsWork(db, { sourceKey: EDGAR_SOURCE_KEY, model, limit: 10 });
      expect(result.failed).toBe(0);
      expect(result.completed).toBeGreaterThanOrEqual(2);
      expect(models).toContain("gpt-6-luna");
      expect(models).toContain("gpt-6.1-sol");

      const draft = await db.newsRevision.findFirstOrThrow({
        where: { sourceVersionId: initial.versionId, status: "DRAFT", work: { config: { path: ["version"], equals: suffix } } },
        include: { claims: { include: { evidence: true } }, matches: true, development: true },
      });
      expect(draft).toMatchObject({
        title, occurredOn: new Date("2025-05-18"), firstDisclosedOn: new Date("2025-05-19"),
        qualification: "DIRECT_EXPLICIT_STRATEGY", evidenceStatus: "DISCLOSED",
      });
      expect(draft.decisionDetails).toMatchObject({ fundDisclosure: "UNDISCLOSED" });
      expect(draft.claims).toEqual(expect.arrayContaining([expect.objectContaining({
        kind: "PER_SHARE_CONSIDERATION", value: { key: "share-price", text: "$61.25", amount: "61.25", currency: null },
        evidence: [expect.objectContaining({ versionId: initial.versionId, quote: consideration })],
      })]));
      expect(draft.matches).toEqual(expect.arrayContaining([expect.objectContaining({ companyId: company.id })]));
      const attempts = await db.newsProcessingAttempt.findMany({ where: { work: { versionId: initial.versionId } } });
      expect(attempts.some((attempt) => attempt.actualModel === "gpt-6-luna" && attempt.providerRequestId && attempt.usage)).toBe(true);
      const dealCount = await db.deal.count();
      const copy = `${title} — reviewed ${suffix.slice(0, 8)}`;
      expect((await getNewsFeed()).items.some((item) => item.title === copy)).toBe(false);
      const edit = await reviewNewsDraft(user.id, {
        action: "edit", revisionId: draft.id, expectedApprovedRevisionId: draft.development.approvedRevisionId,
        title: copy, summary: draft.summary,
      });
      expect((await getNewsFeed()).items.some((item) => item.title === copy)).toBe(false);
      const approve = {
        action: "approve", revisionId: edit.revisionId, expectedApprovedRevisionId: draft.development.approvedRevisionId,
        evidenceReviewed: true, correction: false, distinctFromLegacy: true,
      } as const;
      await reviewNewsDraft(user.id, approve);
      await expect(reviewNewsDraft(user.id, approve)).rejects.toThrow(/draft changed/i);
      expect(await db.deal.count()).toBe(dealCount);
      expect(await db.newsSourceVersion.findUniqueOrThrow({ where: { id: initial.versionId } })).toEqual(sourceBefore);

      const item = (await getNewsFeed()).items.find((candidate) => candidate.title === copy);
      expect(item).toMatchObject({ id: `evidence:${draft.development.id}`, sourceUrl: expect.stringContaining("sec.gov/") });
      expect(item?.mentions).toEqual(expect.arrayContaining([expect.objectContaining({ id: company.id })]));
      expect(item).not.toHaveProperty("claims");
      expect(item).not.toHaveProperty("sourceVersionId");
      expect((await getNewsFeed()).items).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: legacyNews.legacyId, title: legacyNews.title }),
      ]));
      expect(await db.deal.findUnique({ where: { id: originalDeal.id } })).toEqual(originalDeal);
    } finally {
      await db.$disconnect();
    }
  });

  it("applies only a current evidenced deal update and includes the approved revision in one edition", async () => {
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    const suffix = randomUUID();
    try {
      const user = await seedAdmin(db, suffix);
      const priorEdition = await db.newsDigestEdition.findFirst({ orderBy: { date: "desc" } });
      const advance = (date: string, days: number) => new Date(
        new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000,
      ).toISOString().slice(0, 10);
      const startDate = priorEdition ? advance(priorEdition.date, 1) : "2026-03-07";
      const secondDate = advance(startDate, 1);
      const afterFirstCutoff = new Date(easternDigestCutoff(startDate).getTime() + 60_000);
      const afterSecondCutoff = new Date(easternDigestCutoff(secondDate).getTime() + 60_000);
      const deal = await db.deal.create({ data: {
        legacyId: suffix, target: "Fixture transmission assets", title: "Existing transmission transaction", sector: "UTILITIES",
        region: "NORTH_AMERICA", date: new Date("2026-03-01"), closingDate: new Date("2026-03-04"),
        dealStatus: "ANNOUNCED", categories: [], keyHighlights: [],
      } });
      const document = await db.newsSourceDocument.create({
        data: { sourceKey: "fixture-newsletter", externalKey: suffix, sourceName: "Fixture", canonicalUrl: "" },
      });
      const version = await db.newsSourceVersion.create({
        data: {
          documentId: document.id, contentHash: suffix, policyVersion: "1", publishedAt: new Date("2026-03-07"),
          sections: ["Fixture transmission assets completed the transaction."],
        },
      });
      const thread = await db.newsTransactionThread.create({
        data: { dealId: deal.id, identityKey: `deal:${deal.id}`, label: deal.target },
      });
      const development = await db.newsDevelopment.create({ data: { threadId: thread.id, kind: "CLOSING" } });
      const revision = await db.newsRevision.create({ data: {
        developmentId: development.id, number: 1, status: "APPROVED", title: `Fixture close ${suffix}`, summary: "Reviewed",
        category: "TRANSACTION_ACTIVITY", confidence: "HIGH", sourceVersionId: version.id, reviewedById: user.id,
        reviewedAt: afterFirstCutoff, qualification: "DIRECT_TRADITIONAL_ASSET",
        evidenceStatus: "DISCLOSED", relevance: "RELEVANT", dealEligibility: "INELIGIBLE", publicationEligibility: "READY_FOR_REVIEW",
        proposal: {
          kind: "UPDATE_DEAL_LIFECYCLE", dealId: deal.id,
          expectedUpdatedAt: new Date(deal.updatedAt.getTime() - 1).toISOString(), status: "CLOSED", eventClaimKey: "close",
        },
        claims: { create: [{
          kind: "EVENT", value: { key: "close", text: "completed the transaction" }, attribution: "DISCLOSED",
          attributedTo: "Issuer", evidence: { create: [{ versionId: version.id, section: 0, quote: "completed the transaction" }] },
        }] },
      } });
      await db.newsDevelopment.update({ where: { id: development.id }, data: { approvedRevisionId: revision.id } });
      const mutate = () => db.$transaction((tx) => applyReviewedDealLifecycle(tx, { revisionId: revision.id, actorId: user.id }),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      await expect(mutate()).rejects.toThrow(/deal changed/i);
      await db.newsRevision.update({ where: { id: revision.id }, data: { proposal: {
        kind: "UPDATE_DEAL_LIFECYCLE", dealId: deal.id, expectedUpdatedAt: deal.updatedAt.toISOString(),
        status: "CLOSED", eventClaimKey: "close",
      } } });
      const receipt = await mutate();
      expect(await mutate()).toEqual(receipt);
      expect(await db.auditEvent.count({ where: { id: receipt.auditEventId, actorId: user.id } })).toBe(1);
      expect(await db.deal.findUniqueOrThrow({ where: { id: deal.id } })).toMatchObject({
        legacyId: deal.legacyId, date: deal.date, dealStatus: "CLOSED", closingDate: deal.closingDate,
      });

      const edition = () => db.$transaction((tx) => buildNextDigestEdition(tx, {
        startDate, now: afterSecondCutoff,
      }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      expect((await edition())?.date).toBe(startDate);
      expect((await edition())?.date).toBe(secondDate);
      expect(await edition()).toBeNull();
      expect(await db.newsDigestEntry.findUnique({ where: { revisionId: revision.id } })).toMatchObject({
        editionDate: secondDate, materialRevisionId: revision.id,
      });
    } finally {
      await db.$disconnect();
    }
  });
});
