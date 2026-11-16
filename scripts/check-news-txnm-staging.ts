import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import { readProcessingSettings } from "../src/modules/news-evidence/models";
import { captureDocument, captureSchema } from "../src/modules/news-evidence/source";

const accession = "0001108426-25-000048";
const filingHash = "4766817f86918bbe89f6868450fbba47fcb1eb22258285879801f0dc8cd6e545";
const sourceName = "sec-edgar-txnm";
const externalKey = `${accession}/pnm-20250519.htm`;

function requireCheck(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function seedControls(db: PrismaClient) {
  await db.company.upsert({
    where: { name_country: { name: "TXNM Energy", country: "United States" } },
    create: { name: "TXNM Energy", aliases: ["TXNM Energy, Inc.", "TXNM", "PNM Resources"], sector: "UTILITIES",
      region: "NORTH_AMERICA", country: "United States", countryTags: ["United States"], companyStatus: "ACTIVE" },
    update: {},
  });
  await db.organization.upsert({
    where: { name: "Blackstone Infrastructure" },
    create: { name: "Blackstone Infrastructure", types: ["FUND_MANAGER"], aliases: { create: [
      { alias: "Blackstone Infrastructure Partners" }, { alias: "Blackstone Infrastructure Partners L.P." },
    ] } },
    update: {},
  });
  await db.deal.upsert({
    where: { legacyId: "NEWS-STAGING-EXISTING-DEAL" },
    create: { legacyId: "NEWS-STAGING-EXISTING-DEAL", title: "Staging control acquisition",
      target: "Staging control asset", date: new Date("2025-05-01"), dealStatus: "ANNOUNCED",
      sector: "UTILITIES", region: "NORTH_AMERICA", categories: [], keyHighlights: [] },
    update: {},
  });
  await db.newsItem.upsert({
    where: { legacyId: "NEWS-STAGING-EXISTING-NEWS" },
    create: { legacyId: "NEWS-STAGING-EXISTING-NEWS", title: "Existing staging news control",
      summary: "This pre-existing staging record is used to verify feed and data preservation.",
      category: "TRANSACTION_ACTIVITY", publishedAt: new Date("2025-05-01") },
    update: {},
  });
}

async function snapshot(db: PrismaClient) {
  const [deals, companies, organizations, funds, legacyNews, users, mutations] = await Promise.all([
    db.deal.findMany({ orderBy: { id: "asc" } }),
    db.company.findMany({ orderBy: { id: "asc" } }),
    db.organization.findMany({ orderBy: { id: "asc" } }),
    db.fund.findMany({ orderBy: { id: "asc" } }),
    db.newsItem.findMany({ orderBy: { id: "asc" } }),
    db.user.findMany({ orderBy: { id: "asc" }, select: { id: true, email: true, role: true, updatedAt: true } }),
    db.newsDealMutation.count(),
  ]);
  const digest = createHash("sha256").update(JSON.stringify([deals, companies, organizations, funds, legacyNews, users, mutations])).digest("hex");
  return { digest, dealCount: deals.length, legacyCount: legacyNews.length, mutations };
}

function stageVariable(name: string, value: string) {
  requireCheck(process.env.GITHUB_ENV, "The staging verification must run in GitHub Actions.");
  requireCheck(!/[\r\n]/.test(value), "The staging variable contains unsupported characters.");
  appendFileSync(process.env.GITHUB_ENV, `${name}=${value}\n`);
}

async function main(db: PrismaClient) {
  const mode = process.argv[2];
  if (mode === "prepare") {
    await seedControls(db);
    const before = await snapshot(db);
    requireCheck(before.dealCount === 1 && before.legacyCount === 1 && before.mutations === 0, "Unexpected staging baseline.");
    stageVariable("NEWS_STAGING_RECORD_FINGERPRINT", before.digest);
    const capture = captureSchema.parse(JSON.parse(readFileSync(".github/staging/txnm-8k-20250519.json", "utf8")));
    requireCheck(capture.sourceKey === sourceName && capture.externalKey === accession
      && capture.primaryDocument === "pnm-20250519.htm", "Unexpected staging filings.");
    const receipt = await captureDocument(db, capture, readProcessingSettings());
    const version = await db.newsSourceVersion.findUniqueOrThrow({ where: { id: receipt.versionId } });
    requireCheck(version.contentHash === filingHash, "The staging capture does not match the verified official SEC filing.");
    console.log(JSON.stringify({ event: "txnm_staging_baseline", accession, contentHash: version.contentHash, ...before }));
    return;
  }

  const version = await db.newsSourceVersion.findFirstOrThrow({
    where: { contentHash: filingHash, document: { sourceKey: sourceName, externalKey } },
  });
  const processingVersion = readProcessingSettings().version;
  const workScope = { versionId: version.id, config: { path: ["version"], equals: processingVersion } };
  const attempts = await db.newsProcessingAttempt.findMany({
    where: { work: workScope },
    select: { status: true, requestedModel: true, actualModel: true, providerRequestId: true,
      usage: true, errorCode: true, errorMessage: true, work: { select: {
        stage: true, status: true, story: { select: { startSection: true, endSection: true } },
      } } },
  });
  const receipts = attempts.map(({ providerRequestId, work, ...attempt }) => ({
    ...attempt, stage: work.stage, workStatus: work.status, story: work.story, requestIdRecorded: Boolean(providerRequestId),
  }));
  console.log(JSON.stringify({ event: "txnm_staging_model_receipts", receipts }));
  if (mode === "diagnose") {
    const drafted = await db.newsRevision.findMany({
      where: { sourceVersionId: version.id },
      select: { status: true, publicationEligibility: true, firstDisclosedOn: true, occurredOn: true,
        development: { select: { kind: true } }, claims: { select: { kind: true } } },
    });
    console.log(JSON.stringify({ event: "txnm_staging_draft_diagnostics", drafts: drafted.map((article) => ({
      ...article, claims: article.claims.map(({ kind }) => kind),
    })) }));
    return;
  }

  for (const [stage, model] of [["SCREEN", "gpt-6-luna"], ["EXTRACT", "gpt-6.1-sol"]]) {
    requireCheck(attempts.some((row) => row.work.stage === stage && row.work.status === "SUCCEEDED"
      && row.status === "SUCCEEDED" && row.requestedModel === model && row.providerRequestId && row.usage
      && (row.actualModel === model || row.actualModel?.startsWith(`${model}-`))), `Missing successful live receipt for ${model}.`);
  }
  const after = await snapshot(db);
  requireCheck(after.dealCount === 1 && after.legacyCount === 1 && after.mutations === 0
    && after.digest === process.env.NEWS_STAGING_RECORD_FINGERPRINT, "Existing staging records changed.");
  const signing = await db.newsRevision.findMany({
    where: { sourceVersionId: version.id, work: workScope,
      development: { kind: "SIGNING" }, publicationEligibility: "READY_FOR_REVIEW" },
    include: { development: true, claims: { include: { evidence: true } }, matches: true },
  });
  const mergerDrafts = signing.filter(({ claims }) => claims.some((claim) =>
    claim.kind === "PER_SHARE_CONSIDERATION" && claim.attribution === "DISCLOSED"
    && claim.evidence.some(({ quote }) => quote.includes("$61.25")),
  ));
  console.log(JSON.stringify({ event: "txnm_staging_candidates", signingCount: signing.length,
    mergerCandidates: mergerDrafts.map((article) => ({
      id: article.id, status: article.status, title: article.title, occurredOn: article.occurredOn,
      firstDisclosedOn: article.firstDisclosedOn, claims: article.claims.map(({ kind, value }) => ({ kind, value })),
    })),
  }));
  requireCheck(mergerDrafts.length === 1, "Expected exactly one supported TXNM merger signing revision with $61.25 per share.");
  const [revision] = mergerDrafts;
  const decision = revision.decisionDetails;
  requireCheck(decision && typeof decision === "object" && !Array.isArray(decision)
    && decision.fundDisclosure === "UNDISCLOSED", "The merger draft should leave the specific fund vehicle undisclosed.");
  requireCheck(/TXNM/i.test(`${revision.title} ${revision.summary}`) && /Blackstone/i.test(`${revision.title} ${revision.summary}`),
    "Expected TXNM and Blackstone in the supported staging copy.");
  requireCheck(revision.occurredOn?.toISOString().slice(0, 10) === "2025-05-18", "Expected the signing date to be May 18, 2025.");
  requireCheck(revision.firstDisclosedOn === null || revision.firstDisclosedOn.toISOString().slice(0, 10) === "2025-05-19",
    "The first-disclosure date conflicts with the approved filing.");

  if (mode === "before") {
    requireCheck(revision.status === "DRAFT" && revision.development.approvedRevisionId === null, "The test draft was already public.");
    stageVariable("NEWS_TXNM_STAGING_DRAFT_ID", revision.id);
  } else if (mode === "after") {
    requireCheck(revision.status === "APPROVED" && revision.development.approvedRevisionId === revision.id,
      "The expected TXNM revision was not approved.");
    const approved = await db.newsRevision.count({ where: { sourceVersionId: version.id, status: "APPROVED" } });
    requireCheck(approved === 1, "Unexpected extra staged approvals.");
  } else {
    throw new Error("Use prepare, before, diagnose, or after.");
  }
  console.log(JSON.stringify({ event: `txnm_staging_${mode}`, revisionId: revision.id, title: revision.title, ...after }));
}

if (process.env.NEWS_PIPELINE_TARGET !== "staging" || process.env.VERCEL_ENV === "production") {
  throw new Error("The TXNM verifier requires an isolated staging target.");
}
assertMutationDatabaseTargetFromEnv();
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
main(db).catch((error) => {
  console.error(error instanceof Error ? error.message : "Staging verification failed.");
  process.exitCode = 1;
}).finally(() => db.$disconnect());
