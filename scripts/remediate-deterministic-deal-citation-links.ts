/**
 * Link only the reviewed deterministic-target company citations to their
 * published deals. No citation evidence is created, deleted, or rewritten:
 * the sole permitted mutation is Citation.dealId NULL -> reviewed deal ID.
 *
 * Dry-run is the default and rolls back a repeatable-read, read-only
 * transaction. Apply requires the exact plan hash printed by a dry run, an
 * explicitly matched database host/name, and a new receipt path.
 *
 * Dry run:
 *   npx tsx --env-file=.env.local scripts/remediate-deterministic-deal-citation-links.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/deal-citation-link-plan.json
 *
 * Reviewed apply (not performed by the audit run):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx --env-file=.env.local scripts/remediate-deterministic-deal-citation-links.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/deal-citation-link-receipt.json
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  DEAL_CITATION_LINK_SCHEMA_VERSION,
  REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT,
  REVIEWED_DEAL_CITATION_LINK_UPDATE_COUNT,
  REVIEWED_DEAL_CITATION_LINK_UPDATE_SET_SHA256,
  assertReviewedStrictDealCitationLinkPlan,
  buildStrictDealCitationLinkPlan,
  dealCitationLinkUpdateSetSha256,
  type DealCitationLinkCitation,
  type DealCitationLinkSource,
  type DealCitationLinkUpdate,
  type StrictDealCitationLinkPlan,
} from "./portfolio-review/deal-citation-links";
import type {
  CoverageCompany,
  CoverageDeal,
  CoverageParticipant,
  DealCoverageClassification,
} from "./portfolio-review/deal-coverage";
import { sha256 } from "./portfolio-review/lib";

const SCOPE =
  "STRICT_DETERMINISTIC_TARGET_EXACT_SOURCE_DEAL_CITATION_LINKS" as const;
const LOCK_KEY = "infra-ma2:strict-deal-citation-links:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const REVIEWED_DEAL_COVERAGE_DATASET_SHA256 =
  "952c49c3402ab5adb2867096abc823730e42d963dc66dc4fce6d342cf75a9053";
const REVIEWED_QUARANTINED_DEAL_IDS = [
  "INF-2026-066",
  "INF-2026-105",
  "INF-2026-162",
  "INF-2026-196",
] as const;
const REVIEWED_COVERAGE_COUNTS: Record<DealCoverageClassification, number> = {
  DIRECT_DEAL_COMPANY_CITATION: 44,
  DETERMINISTIC_TARGET_MATCH: 29,
  PLATFORM_BOLT_ON_MILESTONE: 18,
  SOURCE_LINKED_REVIEW_CANDIDATE: 4,
  NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP: 257,
  UNRESOLVED_AMBIGUITY: 0,
};

interface DatabaseTarget {
  host: string;
  database: string;
}

interface RawCoverageDeal extends Omit<
  CoverageDeal,
  "date" | "closingDate" | "updatedAt"
> {
  date: Date;
  closingDate: Date | null;
  updatedAt: Date;
}

interface CitationIdentityIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  definition: string | null;
}

interface DealCitationLinkSnapshot {
  deals: CoverageDeal[];
  companies: CoverageCompany[];
  participants: CoverageParticipant[];
  citations: DealCitationLinkCitation[];
  sources: DealCitationLinkSource[];
  citationIsPrimary: boolean;
  citationIdentityIndex: CitationIdentityIndexState;
}

interface SnapshotHashes {
  dealsSha256: string;
  companiesSha256: string;
  participantsSha256: string;
  citationsSha256: string;
  sourcesSha256: string;
}

interface BuiltPlan {
  snapshot: DealCitationLinkSnapshot;
  snapshotHashes: SnapshotHashes;
  plan: StrictDealCitationLinkPlan;
  coverageDatasetSha256: string;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function parseDatabaseTarget(
  connectionString: string,
  requireExplicit: boolean,
): DatabaseTarget {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const target = {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
  };
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (requireExplicit && (!expectedHost || !expectedDatabase)) {
    throw new Error(
      "Apply requires EXPECTED_DATABASE_HOST and EXPECTED_DATABASE_NAME",
    );
  }
  if (expectedHost && expectedHost !== target.host) {
    throw new Error("Database host does not match EXPECTED_DATABASE_HOST");
  }
  if (expectedDatabase && expectedDatabase !== target.database) {
    throw new Error("Database name does not match EXPECTED_DATABASE_NAME");
  }
  return target;
}

async function loadCitationIdentityIndexState(
  client: Client,
): Promise<CitationIdentityIndexState> {
  const result = await client.query<{
    exists: boolean;
    isUnique: boolean | null;
    isValid: boolean | null;
    isReady: boolean | null;
    nullsNotDistinct: boolean | null;
    definition: string | null;
  }>(
    `
    SELECT (idx.oid IS NOT NULL) AS exists,
           pi.indisunique AS "isUnique",
           pi.indisvalid AS "isValid",
           pi.indisready AS "isReady",
           pi.indnullsnotdistinct AS "nullsNotDistinct",
           pg_get_indexdef(idx.oid) AS definition
    FROM (SELECT 1) seed
    LEFT JOIN pg_namespace ns ON ns.nspname = 'public'
    LEFT JOIN pg_class idx
      ON idx.relnamespace = ns.oid AND idx.relname = $1 AND idx.relkind = 'i'
    LEFT JOIN pg_index pi ON pi.indexrelid = idx.oid
  `,
    [CITATION_IDENTITY_INDEX],
  );
  const row = result.rows[0];
  return {
    exists: row?.exists ?? false,
    isUnique: row?.isUnique ?? false,
    isValid: row?.isValid ?? false,
    isReady: row?.isReady ?? false,
    nullsNotDistinct: row?.nullsNotDistinct ?? false,
    definition: row?.definition ?? null,
  };
}

async function hasCitationIsPrimaryColumn(client: Client): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Citation'
        AND column_name = 'isPrimary'
    ) AS exists
  `);
  return result.rows[0]?.exists ?? false;
}

async function loadSnapshot(client: Client): Promise<DealCitationLinkSnapshot> {
  const citationIsPrimary = await hasCitationIsPrimaryColumn(client);
  const primaryProjection = citationIsPrimary
    ? `ci."isPrimary"`
    : `false AS "isPrimary"`;
  const deals = await client.query<RawCoverageDeal>(`
    SELECT d.id, d."legacyId", d.title, d.target, d.description,
           d.categories::text[], d.date, d."dealStatus"::text,
           d."closingDate", d.region::text, d.country, d."updatedAt"
    FROM "Deal" d
    WHERE d.status = 'PUBLISHED'
    ORDER BY d.date, d."legacyId", d.id
  `);
  const companies = await client.query<CoverageCompany>(`
    SELECT c.id, c.name, c.country, c.region::text
    FROM "Company" c
    WHERE c.status = 'PUBLISHED'
    ORDER BY c.name, c.country, c.id
  `);
  const participants = await client.query<CoverageParticipant>(`
    SELECT dp.id, dp."dealId", dp.role::text, o.name AS "organizationName", dp."displayName"
    FROM "DealParticipant" dp
    JOIN "Deal" d ON d.id = dp."dealId" AND d.status = 'PUBLISHED'
    JOIN "Organization" o ON o.id = dp."organizationId"
    ORDER BY dp."dealId", dp.role, dp.id
  `);
  const citations = await client.query<DealCitationLinkCitation>(`
    SELECT ci.id, ci."sourceId", s.label AS "sourceLabel", s.url AS "sourceUrl",
           ci.purpose::text, ci."evidenceLabel", ci."dealId", ci."companyId",
           ${primaryProjection}
    FROM "Citation" ci
    JOIN "Source" s ON s.id = ci."sourceId"
    ORDER BY ci.id
  `);
  const sources = await client.query<DealCitationLinkSource>(`
    SELECT s.id, s.label, s.url
    FROM "Source" s
    ORDER BY s.id
  `);
  return {
    deals: deals.rows.map((row) => ({
      ...row,
      date: row.date.toISOString(),
      closingDate: row.closingDate?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    companies: companies.rows,
    participants: participants.rows,
    citations: citations.rows,
    sources: sources.rows,
    citationIsPrimary,
    citationIdentityIndex: await loadCitationIdentityIndexState(client),
  };
}

function snapshotHashes(snapshot: DealCitationLinkSnapshot): SnapshotHashes {
  return {
    dealsSha256: sha256(snapshot.deals),
    companiesSha256: sha256(snapshot.companies),
    participantsSha256: sha256(snapshot.participants),
    citationsSha256: sha256(snapshot.citations),
    sourcesSha256: sha256(snapshot.sources),
  };
}

function coverageDatasetSha256(plan: StrictDealCitationLinkPlan): string {
  return sha256(
    plan.coverageRows.map((row) => ({
      dealId: row.dealId,
      classification: row.classification,
      snapshotSha256: row.snapshotSha256,
    })),
  );
}

function planHashMaterial(input: {
  snapshot: DealCitationLinkSnapshot;
  snapshotHashes: SnapshotHashes;
  plan: StrictDealCitationLinkPlan;
  coverageDatasetSha256: string;
}) {
  return {
    schemaVersion: DEAL_CITATION_LINK_SCHEMA_VERSION,
    scope: SCOPE,
    reviewedBasis: {
      coverageDatasetSha256: REVIEWED_DEAL_COVERAGE_DATASET_SHA256,
      updateSetSha256: REVIEWED_DEAL_CITATION_LINK_UPDATE_SET_SHA256,
      updateCount: REVIEWED_DEAL_CITATION_LINK_UPDATE_COUNT,
      dealCount: REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT,
    },
    snapshot: input.snapshotHashes,
    citationIsPrimary: input.snapshot.citationIsPrimary,
    citationIdentityIndex: input.snapshot.citationIdentityIndex,
    coverageDatasetSha256: input.coverageDatasetSha256,
    coverageCounts: input.plan.coverageCounts,
    deterministicTargetDeals: input.plan.deterministicTargetDeals,
    updateSetSha256: input.plan.updateSetSha256,
    uniqueDealsToLink: input.plan.uniqueDealsToLink,
    updates: input.plan.updates,
    quarantinedDeals: input.plan.quarantinedDeals,
    uniquenessConflicts: input.plan.uniquenessConflicts,
  };
}

function buildPlan(snapshot: DealCitationLinkSnapshot): BuiltPlan {
  const hashes = snapshotHashes(snapshot);
  const plan = buildStrictDealCitationLinkPlan(snapshot);
  const coverageSha = coverageDatasetSha256(plan);
  const hashMaterial = planHashMaterial({
    snapshot,
    snapshotHashes: hashes,
    plan,
    coverageDatasetSha256: coverageSha,
  });
  return {
    snapshot,
    snapshotHashes: hashes,
    plan,
    coverageDatasetSha256: coverageSha,
    hashMaterial,
    planSha256: sha256(hashMaterial),
  };
}

function assertReviewedAuditBasis(built: BuiltPlan): void {
  assertReviewedStrictDealCitationLinkPlan(built.plan);
  if (built.coverageDatasetSha256 !== REVIEWED_DEAL_COVERAGE_DATASET_SHA256) {
    throw new Error(
      `Coverage dataset SHA-256 ${built.coverageDatasetSha256} does not match reviewed basis ${REVIEWED_DEAL_COVERAGE_DATASET_SHA256}`,
    );
  }
  if (
    JSON.stringify(built.plan.coverageCounts) !==
    JSON.stringify(REVIEWED_COVERAGE_COUNTS)
  ) {
    throw new Error(
      "Coverage classification counts drifted from the reviewed 352-deal basis",
    );
  }
  const quarantinedIds = built.plan.quarantinedDeals
    .map((deal) => deal.legacyId)
    .sort();
  if (
    JSON.stringify(quarantinedIds) !==
    JSON.stringify([...REVIEWED_QUARANTINED_DEAL_IDS].sort())
  ) {
    throw new Error(
      "Deterministic-target quarantine set drifted from the reviewed four deals",
    );
  }
  const index = built.snapshot.citationIdentityIndex;
  if (
    !index.exists ||
    !index.isUnique ||
    !index.isValid ||
    !index.isReady ||
    !index.nullsNotDistinct
  ) {
    throw new Error(
      `${CITATION_IDENTITY_INDEX} is not a valid, ready, NULLS NOT DISTINCT unique index`,
    );
  }
}

function artifactFromPlan(
  target: DatabaseTarget,
  built: BuiltPlan,
  dryRun: boolean,
) {
  return {
    schemaVersion: DEAL_CITATION_LINK_SCHEMA_VERSION,
    scope: SCOPE,
    generatedAt: new Date().toISOString(),
    database: target,
    dryRun,
    planSha256: built.planSha256,
    ...built.hashMaterial,
    counts: {
      publishedDeals: built.snapshot.deals.length,
      publishedCompanies: built.snapshot.companies.length,
      citationRows: built.snapshot.citations.length,
      sourceRows: built.snapshot.sources.length,
      deterministicTargetDeals: built.plan.deterministicTargetDeals,
      strictUpdates: built.plan.updates.length,
      strictDeals: built.plan.uniqueDealsToLink,
      quarantinedDeals: built.plan.quarantinedDeals.length,
      uniquenessConflicts: built.plan.uniquenessConflicts.length,
    },
  };
}

async function writeJson(
  outputPath: string,
  value: unknown,
  exclusive = false,
): Promise<void> {
  const resolved = path.resolve(outputPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(
    resolved,
    `${JSON.stringify(value, null, 2)}\n`,
    exclusive ? { flag: "wx" } : undefined,
  );
}

async function assertPathAbsent(outputPath: string): Promise<void> {
  try {
    await access(path.resolve(outputPath));
    throw new Error(
      `Receipt output already exists: ${path.resolve(outputPath)}`,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Receipt output already exists:")
    ) {
      throw error;
    }
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

function expectedPostCoverageCounts(
  before: Record<DealCoverageClassification, number>,
): Record<DealCoverageClassification, number> {
  return {
    ...before,
    DIRECT_DEAL_COMPANY_CITATION:
      before.DIRECT_DEAL_COMPANY_CITATION +
      REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT,
    DETERMINISTIC_TARGET_MATCH:
      before.DETERMINISTIC_TARGET_MATCH -
      REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT,
  };
}

function approvedUpdateMaterial(
  rows: Array<{
    id: string;
    companyId: string | null;
    dealId: string | null;
    sourceId: string;
  }>,
): Array<
  Pick<
    DealCitationLinkUpdate,
    "citationId" | "companyId" | "dealId" | "sourceId"
  >
> {
  return rows
    .map((row) => {
      if (!row.companyId || !row.dealId) {
        throw new Error(
          `Updated Citation ${row.id} is missing its approved company/deal identity`,
        );
      }
      return {
        citationId: row.id,
        companyId: row.companyId,
        dealId: row.dealId,
        sourceId: row.sourceId,
      };
    })
    .sort((left, right) => left.citationId.localeCompare(right.citationId));
}

async function applyApprovedLinks(
  client: Client,
  updates: DealCitationLinkUpdate[],
  citationIsPrimary: boolean,
): Promise<
  Array<{
    id: string;
    companyId: string | null;
    dealId: string | null;
    sourceId: string;
    purpose: string;
    evidenceLabel: string | null;
    isPrimary: boolean;
  }>
> {
  const primaryProjection = citationIsPrimary
    ? `ci."isPrimary"`
    : `false AS "isPrimary"`;
  const result = await client.query<{
    id: string;
    companyId: string | null;
    dealId: string | null;
    sourceId: string;
    purpose: string;
    evidenceLabel: string | null;
    isPrimary: boolean;
  }>(
    `
    WITH approved("citationId", "companyId", "dealId", "sourceId") AS (
      SELECT *
      FROM unnest($1::text[], $2::text[], $3::text[], $4::text[])
    )
    UPDATE "Citation" ci
    SET "dealId" = approved."dealId"
    FROM approved
    WHERE ci.id = approved."citationId"
      AND ci."companyId" = approved."companyId"
      AND ci."sourceId" = approved."sourceId"
      AND ci."dealId" IS NULL
    RETURNING ci.id, ci."companyId", ci."dealId", ci."sourceId",
              ci.purpose::text, ci."evidenceLabel", ${primaryProjection}
  `,
    [
      updates.map((update) => update.citationId),
      updates.map((update) => update.companyId),
      updates.map((update) => update.dealId),
      updates.map((update) => update.sourceId),
    ],
  );
  return result.rows;
}

function assertApplyPostconditions(input: {
  before: BuiltPlan;
  after: BuiltPlan;
  updatedRows: Awaited<ReturnType<typeof applyApprovedLinks>>;
}): void {
  const actualUpdateSetSha256 = sha256(
    approvedUpdateMaterial(input.updatedRows),
  );
  if (actualUpdateSetSha256 !== input.before.plan.updateSetSha256) {
    throw new Error(
      "Updated Citation rows do not match the approved update-set SHA-256",
    );
  }
  if (input.updatedRows.length !== input.before.plan.updates.length) {
    throw new Error("Update count does not match the approved strict plan");
  }
  if (
    input.after.snapshot.citations.length !==
    input.before.snapshot.citations.length
  ) {
    throw new Error("Postcondition failed: Citation row count changed");
  }
  for (const key of [
    "dealsSha256",
    "companiesSha256",
    "participantsSha256",
    "sourcesSha256",
  ] as const) {
    if (input.after.snapshotHashes[key] !== input.before.snapshotHashes[key]) {
      throw new Error(
        `Postcondition failed: ${key} changed during citation linking`,
      );
    }
  }
  const approvedDealIdByCitationId = new Map(
    input.before.plan.updates.map((update) => [
      update.citationId,
      update.dealId,
    ]),
  );
  const expectedAfterCitations = input.before.snapshot.citations.map(
    (citation) => ({
      ...citation,
      dealId: approvedDealIdByCitationId.get(citation.id) ?? citation.dealId,
    }),
  );
  if (
    sha256(expectedAfterCitations) !==
    input.after.snapshotHashes.citationsSha256
  ) {
    throw new Error(
      "Postcondition failed: Citation state changed outside the approved dealId assignments",
    );
  }
  if (input.after.plan.updates.length !== 0) {
    throw new Error(
      "Postcondition failed: strict exact-source links remain after apply",
    );
  }
  const expectedCounts = expectedPostCoverageCounts(
    input.before.plan.coverageCounts,
  );
  if (
    JSON.stringify(input.after.plan.coverageCounts) !==
    JSON.stringify(expectedCounts)
  ) {
    throw new Error(
      "Postcondition failed: deal coverage classifications did not shift only as approved",
    );
  }
  const expectedCompaniesByDeal = new Map<string, string[]>();
  for (const update of input.before.plan.updates) {
    expectedCompaniesByDeal.set(
      update.dealId,
      sortedUnique([
        ...(expectedCompaniesByDeal.get(update.dealId) ?? []),
        update.companyId,
      ]),
    );
  }
  const afterRowByDeal = new Map(
    input.after.plan.coverageRows.map((row) => [row.dealId, row]),
  );
  for (const [dealId, expectedCompanyIds] of expectedCompaniesByDeal) {
    const row = afterRowByDeal.get(dealId);
    if (!row || row.classification !== "DIRECT_DEAL_COMPANY_CITATION") {
      throw new Error(
        `Postcondition failed: Deal ${dealId} is not directly linked`,
      );
    }
    const actualCompanyIds = sortedUnique(
      row.directCitationMatches.map((match) => match.companyId),
    );
    if (
      JSON.stringify(actualCompanyIds) !== JSON.stringify(expectedCompanyIds)
    ) {
      throw new Error(
        `Postcondition failed: Deal ${dealId} direct-company set is incomplete`,
      );
    }
  }
  if (input.after.plan.uniquenessConflicts.length > 0) {
    throw new Error(
      "Postcondition failed: citation uniqueness conflict remains",
    );
  }
  const index = input.after.snapshot.citationIdentityIndex;
  if (
    !index.exists ||
    !index.isUnique ||
    !index.isValid ||
    !index.isReady ||
    !index.nullsNotDistinct
  ) {
    throw new Error(
      `Postcondition failed: ${CITATION_IDENTITY_INDEX} is not ready and unique`,
    );
  }
}

function sortedUnique(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right),
  );
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = process.argv.includes("--apply");
  const approvalHash = option("approval-hash");
  const manifestOutput = option("manifest-output");
  const receiptOutput = option("receipt-output");
  const target = parseDatabaseTarget(connectionString, apply);

  if (apply && (!approvalHash || !/^[0-9a-f]{64}$/.test(approvalHash))) {
    throw new Error(
      "Apply requires --approval-hash=<exact lowercase SHA-256 from dry-run>",
    );
  }
  if (apply && !receiptOutput) {
    throw new Error("Apply requires --receipt-output=<new JSON path>");
  }
  if (!apply && receiptOutput) {
    throw new Error("--receipt-output is valid only with --apply");
  }
  if (receiptOutput) await assertPathAbsent(receiptOutput);

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      apply
        ? "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
        : "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    if (apply)
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        LOCK_KEY,
      ]);

    const before = buildPlan(await loadSnapshot(client));
    assertReviewedAuditBasis(before);
    const artifact = artifactFromPlan(target, before, !apply);
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          updateSetSha256: before.plan.updateSetSha256,
          publishedDeals: before.snapshot.deals.length,
          publishedCompanies: before.snapshot.companies.length,
          strictUpdates: before.plan.updates.length,
          strictDeals: before.plan.uniqueDealsToLink,
          quarantinedDeals: before.plan.quarantinedDeals.length,
          uniquenessConflicts: before.plan.uniquenessConflicts.length,
        },
        null,
        2,
      ),
    );

    if (!apply) {
      await client.query("ROLLBACK");
      console.log("Dry-run complete; no database rows changed.");
      return;
    }
    if (approvalHash !== before.planSha256) {
      throw new Error(
        `Approval hash does not match current plan SHA-256 ${before.planSha256}`,
      );
    }

    const updatedRows = await applyApprovedLinks(
      client,
      before.plan.updates,
      before.snapshot.citationIsPrimary,
    );
    const after = buildPlan(await loadSnapshot(client));
    assertApplyPostconditions({ before, after, updatedRows });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: DEAL_CITATION_LINK_SCHEMA_VERSION,
      scope: SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      updateSetSha256: before.plan.updateSetSha256,
      updates: before.plan.updates,
      before: {
        snapshot: before.snapshotHashes,
        coverageDatasetSha256: before.coverageDatasetSha256,
        coverageCounts: before.plan.coverageCounts,
      },
      after: {
        snapshot: after.snapshotHashes,
        coverageDatasetSha256: after.coverageDatasetSha256,
        coverageCounts: after.plan.coverageCounts,
        remainingStrictUpdates: after.plan.updates.length,
      },
      postconditions: {
        citationRowsUnchanged:
          after.snapshot.citations.length === before.snapshot.citations.length,
        onlyApprovedDealIdsChanged: true,
        everyApprovedDealDirectlyLinked: true,
        uniquenessConflicts: after.plan.uniquenessConflicts.length,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${updatedRows.length} exact-source citation links and wrote ${path.resolve(receiptOutput!)}.`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
