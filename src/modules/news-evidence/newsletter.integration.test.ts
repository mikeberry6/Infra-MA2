// @vitest-environment node
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import type { SourceSection, StoryExtraction } from "./contracts";
import deliveries from "./fixtures/newsletter-deliveries.json";
import { ModelFailure, readProcessingSettings, type ModelClient, type ModelRequest } from "./models";
import { FIXTURE_SOURCE_KEY } from "./policy";
import { drainNewsWork } from "./processing";
import { captureDocument, fixtureCapturesSchema } from "./source";

const databaseUrl = process.env.NEWS_TEST_DATABASE_URL;
const canTest = Boolean(databaseUrl && databaseUrl === process.env.DATABASE_URL
  && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(databaseUrl).hostname));
const captures = fixtureCapturesSchema.parse(deliveries);

function fixtureCapture(index: number, suffix: string) {
  const original = captures[index];
  return { ...original, externalKey: `${original.externalKey}-${suffix}`, deliveryKey: `${original.deliveryKey}-${suffix}` };
}

const ordinaryStory: Omit<StoryExtraction, "headline" | "summary" | "claims" | "entities"> = {
  category: "PORTFOLIO_COMPANY_NEWS",
  eventKind: "OPERATIONAL_UPDATE",
  occurredOn: null,
  firstDisclosedOn: null,
  novelty: "UNKNOWN",
  transactionForm: "OTHER",
  relevance: "RELEVANT",
  qualification: { kind: "NOT_APPLICABLE", reason: "An operating development.", evidence: null },
  fundDisclosure: "NOT_APPLICABLE",
};

function sourceEvidence(section: SourceSection, value: string) {
  return { section: section.index, quote: value };
}

function extract({ index, text }: SourceSection, money?: SourceSection): StoryExtraction {
  const isSigning = text.startsWith("Cedar Intertie ");
  const isSaleProcess = text.startsWith("Sale exploration");
  const entity = isSigning ? "Cedar Intertie" : isSaleProcess ? "Meridian Grid" : "Harborline Fibre";
  const headline = isSigning ? "Cedar Intertie signs to sell its network"
    : isSaleProcess ? "Meridian Grid reportedly considers strategic options" : "Harborline Fibre deploys a new link";
  const quote = text.slice(0, text.indexOf(".") + 1);
  const eventClaim = {
    key: "event", kind: "EVENT", value: quote, amount: null, currency: null, attribution: "REPORTED",
    attributedTo: "Infrastructure Ledger", evidence: { section: index, quote },
  } as const;
  const extraction: StoryExtraction = {
    ...ordinaryStory,
    headline,
    summary: quote,
    claims: [eventClaim],
    entities: [{ key: "target", kind: "COMPANY", label: entity, role: "TARGET", evidence: { section: index, quote } }],
  };
  if (isSaleProcess) return { ...extraction, eventKind: "SALE_PROCESS", category: "RUMORED_SALES_PROCESS" };
  if (!isSigning || !money) return extraction;
  const compactDate = "On January 9, 2026, Cedar Intertie first made public a definitive agreement signed January 8, 2026 with Northline Infrastructure, the buyer.";
  const corrected = money.text.startsWith("Correction:");
  const value = corrected ? "US$1.1 billion" : "US$1.2 billion";

  return {
    ...extraction,
    category: "TRANSACTION_ACTIVITY",
    eventKind: "SIGNING",
    novelty: "FIRST_FORMAL_DISCLOSURE",
    transactionForm: "ACQUISITION",
    occurredOn: "2026-01-08",
    firstDisclosedOn: "2026-01-09",
    qualification: {
      kind: "DIRECT_EXPLICIT_STRATEGY", reason: "Northline Infrastructure is the disclosed acquirer.",
      evidence: sourceEvidence({ index, text }, compactDate),
    },
    fundDisclosure: "UNDISCLOSED",
    claims: [
      eventClaim,
      { ...eventClaim, key: "occurred", kind: "OCCURRENCE_DATE", value: "2026-01-08", evidence: { section: index, quote: compactDate } },
      { ...eventClaim, key: "formal", kind: "FIRST_DISCLOSURE_DATE", value: "2026-01-09", evidence: { section: index, quote: compactDate } },
      {
        ...eventClaim, key: "ev", kind: "ENTERPRISE_VALUE", value,
        amount: corrected ? "1100000000" : "1200000000", currency: "USD",
        evidence: sourceEvidence(money, money.text.slice(0, money.text.indexOf(" billion.") + " billion.".length)),
      },
    ],
  };
}

function fixtureModel(): ModelClient {
  return {
    provider: "fixture",
    async run<T>(request: ModelRequest<T>) {
      const input = request.input as { sections: SourceSection[]; entities?: { entity: { key: string } }[] };
      const requestedModel = request.settings[request.stage].model;
      const audit = { requestedModel, providerRequestId: "local-fixture" };
      let response: unknown;
      if (request.stage === "SCREEN") {
        const contents = input.sections.map(({ text }) => text).join(" ");
        if (contents.includes("Prestwick Wind submitted")) {
          throw new ModelFailure("HTTP_503", "The fixture model is unavailable.", true, audit);
        }
        const saleProcess = contents.includes("Sale exploration");
        response = { stories: saleProcess
          ? [{ startSection: 1, endSection: 1, relevance: "RELEVANT", reason: "Reported sale exploration." }]
          : [
              { startSection: 1, endSection: 2, relevance: "RELEVANT", reason: "Signed acquisition." },
              { startSection: 3, endSection: 3, relevance: "RELEVANT", reason: "Fiber network opening." },
            ] };
      } else if (request.stage === "EXTRACT") {
        response = extract(input.sections[0], input.sections[1]);
      } else {
        response = { decisions: input.entities?.map(({ entity }) => ({
          entityKey: entity.key, candidateId: null, evidence: null, reason: "The source does not distinguish same-name companies.",
        })) ?? [] };
      }
      return { result: request.schema.parse(response), audit };
    },
  };
}

async function seedCompany(db: PrismaClient, name: string, country: string) {
  return db.company.upsert({
    where: { name_country: { name, country } },
    update: {},
    create: {
      name, country, countryTags: [country], companyStatus: "ACTIVE", sector: "UTILITIES", region: "NORTH_AMERICA",
    },
  });
}

describe.skipIf(!canTest)("newsletter fixture processing on disposable PostgreSQL", () => {
  it("splits distinct stories, deduplicates delivery, attaches a correction, and retains ambiguity", async () => {
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
    const suffix = randomUUID();
    const settings = readProcessingSettings({ NODE_ENV: "test", NEWS_PROCESSING_VERSION: suffix });
    try {
      await seedCompany(db, "Cedar Intertie", "United States");
      await seedCompany(db, "Harborline Fibre", "Canada");
      await seedCompany(db, "Meridian Grid", "United States");
      await seedCompany(db, "Meridian Grid", "Canada");
      const original = await captureDocument(db, fixtureCapture(0, suffix), settings);
      const duplicate = await captureDocument(db, fixtureCapture(1, suffix), settings);
      expect(duplicate).toMatchObject({ versionId: original.versionId, newDelivery: true, newVersion: false });

      const correction = await captureDocument(db, fixtureCapture(2, suffix), settings);
      expect(correction).toMatchObject({ documentId: original.documentId, newDelivery: true, newVersion: true });
      const correctedVersion = await db.newsSourceVersion.findUniqueOrThrow({ where: { id: correction.versionId } });
      expect(correctedVersion.amendsVersionId).toBe(original.versionId);
      const ambiguous = await captureDocument(db, fixtureCapture(3, suffix), settings);

      const run = await drainNewsWork(db, { sourceKey: FIXTURE_SOURCE_KEY, model: fixtureModel(), limit: 30 });
      expect(run).toMatchObject({ completed: 13, failed: 0, retryable: 0 });
      expect(await db.newsStory.count({ where: { versionId: original.versionId } })).toBe(2);
      const revisions = await db.newsRevision.findMany({
        where: { sourceVersionId: { in: [original.versionId, correction.versionId, ambiguous.versionId] } },
        include: { claims: { include: { evidence: true } }, matches: true, development: true },
      });
      expect(revisions).toHaveLength(5);
      const originals = revisions.filter(({ sourceVersionId }) => sourceVersionId === original.versionId);
      expect(originals.map(({ title }) => title).sort()).toEqual([
        "Cedar Intertie signs to sell its network",
        "Harborline Fibre deploys a new link",
      ]);
      const signing = originals.find(({ title }) => title.startsWith("Cedar"));
      const corrected = revisions.find(({ sourceVersionId, title }) => sourceVersionId === correction.versionId && title.startsWith("Cedar"));
      expect(corrected?.developmentId).toBe(signing?.developmentId);
      expect(corrected?.claims).toEqual(expect.arrayContaining([expect.objectContaining({
        kind: "ENTERPRISE_VALUE", value: { key: "ev", text: "US$1.1 billion", amount: "1100000000", currency: "USD" },
        evidence: [expect.objectContaining({ versionId: correction.versionId })],
      })]));
      expect(signing?.claims).toEqual(expect.arrayContaining([expect.objectContaining({
        kind: "ENTERPRISE_VALUE", value: { key: "ev", text: "US$1.2 billion", amount: "1200000000", currency: "USD" },
        evidence: [expect.objectContaining({ versionId: original.versionId })],
      })]));
      const sale = revisions.find(({ sourceVersionId }) => sourceVersionId === ambiguous.versionId);
      expect(sale).toMatchObject({ dealEligibility: "INELIGIBLE", relevance: "RELEVANT", evidenceStatus: "REPORTED", isRumor: true });
      expect(sale?.matches).toEqual([expect.objectContaining({
        status: "UNRESOLVED", companyId: null, candidateSnapshot: { kind: "COMPANY", candidates: expect.any(Array) },
      })]);
      expect(revisions.every(({ status, development }) => status === "DRAFT" && development.approvedRevisionId === null)).toBe(true);
    } finally {
      await db.$disconnect();
    }
  });

  it("records a failed model attempt, waits before retry, and reaches terminal failure", async () => {
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
    const suffix = randomUUID();
    const settings = readProcessingSettings({ NODE_ENV: "test", NEWS_PROCESSING_VERSION: suffix, NEWS_MODEL_MAX_ATTEMPTS: "2" });
    try {
      const { versionId } = await captureDocument(db, fixtureCapture(7, suffix), settings);
      const drain = () => drainNewsWork(db, { sourceKey: FIXTURE_SOURCE_KEY, model: fixtureModel(), limit: 5 });
      expect(await drain()).toMatchObject({ retryable: 1, failed: 0 });
      const pending = await db.newsWork.findFirstOrThrow({ where: { versionId } });
      expect(pending.status).toBe("PENDING");
      expect(pending.notBefore.getTime()).toBeGreaterThan(Date.now());
      expect(await drain()).toMatchObject({ retryable: 0, failed: 0 });

      await db.newsWork.update({ where: { id: pending.id }, data: { notBefore: new Date(0) } });
      expect(await drain()).toMatchObject({ retryable: 0, failed: 1 });
      const failed = await db.newsWork.findUniqueOrThrow({
        where: { id: pending.id }, include: { attempts: { orderBy: { attempt: "asc" } } },
      });
      expect(failed).toMatchObject({ status: "FAILED", attemptCount: 2, leaseToken: null });
      expect(failed.attempts).toMatchObject([
        { status: "RETRYABLE", errorCode: "HTTP_503", requestedModel: "gpt-6-luna" },
        { status: "FAILED", errorCode: "HTTP_503", requestedModel: "gpt-6-luna" },
      ]);
      expect(await db.newsStory.count({ where: { versionId } })).toBe(0);
    } finally {
      await db.$disconnect();
    }
  });
});
