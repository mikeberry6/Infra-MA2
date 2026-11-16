// @vitest-environment node
import { randomInt, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { getNewsFeed } from "@/modules/news/queries";
import { EDGAR_SOURCE_KEY, FIXTURE_SOURCE_KEY, edgarCanonicalUrl } from "./policy";
import { reviewNewsDraft } from "./review";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));

const connectionString = process.env.NEWS_TEST_DATABASE_URL;
const canTest = Boolean(connectionString && connectionString === process.env.DATABASE_URL
  && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(connectionString).hostname));

describe.skipIf(!canTest)("review and approved projection on disposable PostgreSQL", () => {
  it("preserves a legacy ID, groups signing and closing, and publishes exactly the approved correction", async () => {
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    const suffix = randomUUID();
    vi.stubEnv("NEWS_EVIDENCE_ENABLED", "true");
    try {
      const companyName = `Fixture assets ${suffix}`;
      const buyerName = `Fixture infrastructure ${suffix}`;
      const [actor, company, buyer] = await Promise.all([
        db.user.create({ data: { email: `review-${suffix}@example.test`, passwordHash: "unused", role: "ADMIN" } }),
        db.company.create({ data: { name: companyName, country: "United States", countryTags: ["United States"], sector: "UTILITIES", region: "NORTH_AMERICA", companyStatus: "ACTIVE" } }),
        db.organization.create({ data: { name: buyerName, types: ["FUND_MANAGER"] } }),
      ]);
      const accession = `0001108426-26-${String(randomInt(100_000, 1_000_000))}`;
      const canonicalUrl = edgarCanonicalUrl(accession);
      const document = await db.newsSourceDocument.create({ data: {
        sourceKey: EDGAR_SOURCE_KEY, externalKey: suffix, canonicalUrl, sourceName: "Test source",
      } });
      const legacy = await db.newsItem.create({ data: {
        legacyId: `LEGACY-REVIEW-${suffix}`, title: `Existing report ${suffix}`, sourceUrl: canonicalUrl,
        publishedAt: new Date("2026-11-11"), category: "TRANSACTION_ACTIVITY",
      } });
      const approvals = { action: "approve", evidenceReviewed: true, correction: false, distinctFromLegacy: false, expectedApprovedRevisionId: null } as const;

      async function draft(kind: string, title: string, date: string, fact: string, otherVersionId?: string) {
        const text = `${companyName} and ${buyerName} ${fact}.`;
        const version = await db.newsSourceVersion.create({ data: {
          documentId: document.id, contentHash: randomUUID(), policyVersion: "1", publishedAt: new Date(date), sections: [{ index: 0, text }],
        } });
        const development = await db.newsDevelopment.create({ data: { kind } });
        const evidence = { sourceVersionId: version.id, section: 0, quote: text };
        return db.newsRevision.create({ data: {
          developmentId: development.id, sourceVersionId: version.id, number: 1, title, summary: text,
          occurredOn: new Date(date), firstDisclosedOn: new Date(date), category: "TRANSACTION_ACTIVITY", confidence: "HIGH",
          qualification: "DIRECT_EXPLICIT_STRATEGY", evidenceStatus: "DISCLOSED", relevance: "RELEVANT", dealEligibility: "INELIGIBLE",
          publicationEligibility: "READY_FOR_REVIEW", decisionDetails: { fundDisclosure: "UNDISCLOSED", transactionForm: "ACQUISITION" },
          claims: { create: [{ kind: "EVENT", value: { text: fact }, attribution: "DISCLOSED", attributedTo: companyName,
            evidence: { create: [version.id, ...(otherVersionId ? [otherVersionId] : [])].map((versionId) => ({ section: 0, quote: text, versionId })) } }] },
          matches: { create: [
            { mention: companyName, role: "TARGET", status: "MATCHED", evidence, companyId: company.id },
            { mention: buyerName, role: "BUYER", status: "MATCHED", evidence, organizationId: buyer.id },
          ] },
        } });
      }

      const signing = await draft("SIGNING", `Signing ${suffix}`, "2026-11-11", "signed a merger agreement");
      await expect(reviewNewsDraft(actor.id, { ...approvals, revisionId: signing.id })).rejects.toThrow(/duplicate legacy item/i);
      await reviewNewsDraft(actor.id, { ...approvals, revisionId: signing.id, legacyItemId: legacy.id, transactionLink: { kind: "new" } });
      const signingDevelopment = await db.newsDevelopment.findUniqueOrThrow({ where: { id: signing.developmentId } });
      expect(signingDevelopment.threadId).toBeTruthy();
      expect(signingDevelopment.legacyNewsItemId).toBe(legacy.id);
      expect(await db.newsItem.findUniqueOrThrow({ where: { id: legacy.id } })).toEqual(legacy);

      const closing = await draft("CLOSING", `Closing ${suffix}`, "2026-11-13", "closed the merger");
      const signingTarget = { id: signing.developmentId, expectedApprovedRevisionId: signing.id };
      await expect(reviewNewsDraft(actor.id, { ...approvals, revisionId: closing.id, target: signingTarget })).rejects.toThrow(/separate developments/i);
      await reviewNewsDraft(actor.id, { ...approvals, revisionId: closing.id, distinctFromLegacy: true,
        transactionLink: { kind: "thread", id: signingDevelopment.threadId! } });
      expect(await db.newsDevelopment.findUniqueOrThrow({ where: { id: closing.developmentId } })).toMatchObject({
        kind: "CLOSING", threadId: signingDevelopment.threadId, approvedRevisionId: closing.id,
      });

      const copyOnly = await draft("CORRECTION", `Reworded signing ${suffix}`, "2026-11-11", "signed a merger agreement");
      const reworded = await reviewNewsDraft(actor.id, { ...approvals, revisionId: copyOnly.id, correction: true, target: signingTarget });
      expect(await db.newsRevision.findUniqueOrThrow({ where: { id: reworded.revisionId } })).toMatchObject({
        status: "APPROVED", materialChange: false, correctsRevisionId: signing.id,
      });
      const additionalSupport = await db.newsSourceVersion.create({ data: {
        contentHash: suffix, policyVersion: "1", publishedAt: new Date("2026-11-11"),
        sections: [{ index: 0, text: `${companyName} and ${buyerName} signed a binding asset purchase agreement.` }],
        document: { create: { sourceKey: FIXTURE_SOURCE_KEY, externalKey: suffix, canonicalUrl: "", sourceName: "Synthetic support" } },
      } });
      const corrected = await draft("CORRECTION", `Corrected signing ${suffix}`, "2026-11-11", "signed a binding asset purchase agreement", additionalSupport.id);
      await expect(reviewNewsDraft(actor.id, { ...approvals, revisionId: corrected.id, correction: true, target: signingTarget })).rejects.toThrow(/related development changed/i);
      const beforeApproval = (await getNewsFeed()).items.find(({ id }) => id === legacy.legacyId);
      expect(beforeApproval?.title).toBe(copyOnly.title);
      const final = await reviewNewsDraft(actor.id, { ...approvals, revisionId: corrected.id, correction: true,
        target: { ...signingTarget, expectedApprovedRevisionId: reworded.revisionId } });
      expect(await db.newsRevision.findUniqueOrThrow({ where: { id: final.revisionId } })).toMatchObject({
        status: "APPROVED", materialChange: true, correctsRevisionId: reworded.revisionId,
      });
      expect(await db.newsRevision.findUniqueOrThrow({ where: { id: signing.id } })).toMatchObject({ status: "APPROVED", title: signing.title });
      const rows = (await getNewsFeed()).items;
      expect(rows.filter(({ id }) => id === legacy.legacyId)).toEqual([expect.objectContaining({ title: corrected.title, sourceUrl: canonicalUrl })]);
      expect(rows.some(({ title }) => title === closing.title)).toBe(true);
      expect(rows.some(({ title }) => title === legacy.title || title === signing.title)).toBe(false);

      vi.stubEnv("VERCEL_ENV", "production");
      const withoutFixtureSupport = (await getNewsFeed()).items;
      expect(withoutFixtureSupport.filter(({ id }) => id === legacy.legacyId)).toEqual([expect.objectContaining({ title: legacy.title })]);
      expect(withoutFixtureSupport.some(({ title }) => title === closing.title)).toBe(true);
    } finally {
      vi.unstubAllEnvs();
      await db.$disconnect();
    }
  });
});
