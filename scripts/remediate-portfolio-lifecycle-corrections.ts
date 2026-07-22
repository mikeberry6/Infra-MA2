/**
 * Apply the reviewed exact-row portfolio lifecycle correction tranche.
 *
 * This command is read-only by default. Apply requires the exact plan SHA-256
 * printed by a fresh dry run, explicit database host/name guards, and a new
 * receipt path. All database timestamps in the reviewed manifest are raw
 * PostgreSQL `timestamp without time zone` values formatted with `to_char`;
 * they are never round-tripped through JavaScript Date or labeled with `Z`.
 *
 * Dry run:
 *   npx tsx --env-file=.env.local scripts/remediate-portfolio-lifecycle-corrections.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/lifecycle-correction-plan.json
 *
 * Reviewed apply (not performed by the identification/audit run):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx --env-file=.env.local scripts/remediate-portfolio-lifecycle-corrections.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/lifecycle-correction-receipt.json
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  PORTFOLIO_LIFECYCLE_CORRECTION_SCHEMA_VERSION,
  REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT,
  REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256,
  REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST,
  REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256,
  buildPortfolioLifecycleCorrectionPlan,
  expectedPortfolioLifecycleSourceRows,
  type CitationLifecycleSnapshot,
  type CompanyCountryTagsSnapshot,
  type DealLifecycleSnapshot,
  type LifecycleTableCounts,
  type MilestoneLifecycleSnapshot,
  type OwnershipLifecycleSnapshot,
  type PortfolioLifecycleSnapshot,
  type SourceLifecycleSnapshot,
} from "./portfolio-review/lifecycle-corrections";
import { sha256 } from "./portfolio-review/lib";

const SCOPE = "REVIEWED_EXACT_PORTFOLIO_LIFECYCLE_CORRECTIONS" as const;
const LOCK_KEY = "infra-ma2:portfolio-lifecycle-corrections:v1";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: PortfolioLifecycleSnapshot;
  plan: ReturnType<typeof buildPortfolioLifecycleCorrectionPlan>;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function parseDatabaseTarget(connectionString: string, requireExplicit: boolean): DatabaseTarget {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const target = {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
  };
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (requireExplicit && (!expectedHost || !expectedDatabase)) {
    throw new Error("Apply requires EXPECTED_DATABASE_HOST and EXPECTED_DATABASE_NAME");
  }
  if (expectedHost && expectedHost !== target.host) {
    throw new Error("Database host does not match EXPECTED_DATABASE_HOST");
  }
  if (expectedDatabase && expectedDatabase !== target.database) {
    throw new Error("Database name does not match EXPECTED_DATABASE_NAME");
  }
  return target;
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} does not match the reviewed postcondition`);
  }
}

function byId<T extends { id: string }>(label: string, rows: T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id)) throw new Error(`${label} contains duplicate ID ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

async function loadTableCounts(client: Client): Promise<LifecycleTableCounts> {
  const result = await client.query<LifecycleTableCounts>(`
    SELECT (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load lifecycle table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<PortfolioLifecycleSnapshot> {
  const manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST;
  const dealIds = manifest.dealUpdates.map((action) => action.id);
  const ownershipIds = sortedUnique([
    ...manifest.ownershipUpdates.map((action) => action.id),
    ...manifest.ownershipDeletes.map((action) => action.id),
    ...manifest.incumbentOwnershipGuards.map((guard) => guard.current.id),
  ]);
  const companyIds = manifest.companyUpdates.map((action) => action.id);
  const milestoneIds = manifest.milestoneUpdates.map((action) => action.id);
  const citationIds = manifest.citationUpdates.map((action) => action.id);
  const sourceIds = expectedPortfolioLifecycleSourceRows().map((source) => source.id);
  const milestoneInsert = manifest.milestoneInserts[0];
  const citationUpdate = manifest.citationUpdates[0];
  if (!milestoneInsert || !citationUpdate) {
    throw new Error("Reviewed manifest must contain the deterministic milestone and citation actions");
  }

  const deals = await client.query<DealLifecycleSnapshot>(`
    SELECT d.id, d."legacyId", d.title, d.target, d.description, d.stake,
           d."assetScale", d."keyHighlights",
           to_char(d.date, $2) AS date,
           d."dealStatus"::text AS "dealStatus",
           CASE WHEN d."closingDate" IS NULL THEN NULL ELSE to_char(d."closingDate", $2) END AS "closingDate",
           d.status::text AS "recordStatus",
           to_char(d."updatedAt", $3) AS "updatedAt"
    FROM "Deal" d
    WHERE d.id = ANY($1::text[])
    ORDER BY d.id
  `, [dealIds, NAIVE_MILLIS_FORMAT, NAIVE_MICROS_FORMAT]);

  const ownership = await client.query<OwnershipLifecycleSnapshot>(`
    SELECT op.id, op."companyId", c.name AS "companyName",
           op."fundId", f."fundName", op."organizationId",
           o.name AS "organizationName", op."vehicleName", op.stake,
           op."investmentYear", op."exitYear", op."isActive",
           to_char(op."createdAt", $2) AS "createdAt"
    FROM "OwnershipPeriod" op
    JOIN "Company" c ON c.id = op."companyId"
    LEFT JOIN "Fund" f ON f.id = op."fundId"
    LEFT JOIN "Organization" o ON o.id = op."organizationId"
    WHERE op.id = ANY($1::text[])
    ORDER BY op.id
  `, [ownershipIds, NAIVE_MICROS_FORMAT]);

  const companies = await client.query<CompanyCountryTagsSnapshot>(`
    SELECT c.id, c.name, c.country, c."countryTags", c.region::text,
           c."companyStatus"::text AS "companyStatus",
           c.status::text AS "recordStatus",
           to_char(c."updatedAt", $2) AS "updatedAt"
    FROM "Company" c
    WHERE c.id = ANY($1::text[])
    ORDER BY c.id
  `, [companyIds, NAIVE_MICROS_FORMAT]);

  const milestones = await client.query<MilestoneLifecycleSnapshot>(`
    SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
           m.category::text,
           CASE WHEN m."sortDate" IS NULL THEN NULL ELSE to_char(m."sortDate", $2) END AS "sortDate"
    FROM "Milestone" m
    JOIN "Company" c ON c.id = m."companyId"
    WHERE m.id = ANY($1::text[])
    ORDER BY m.id
  `, [milestoneIds, NAIVE_MILLIS_FORMAT]);

  const citations = await client.query<CitationLifecycleSnapshot>(`
    SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
           ci.purpose::text, ci."evidenceLabel",
           s.label AS "sourceLabel", s.url AS "sourceUrl", s.type::text AS "sourceType"
    FROM "Citation" ci
    JOIN "Source" s ON s.id = ci."sourceId"
    WHERE ci.id = ANY($1::text[])
    ORDER BY ci.id
  `, [citationIds]);

  const sources = await client.query<SourceLifecycleSnapshot>(`
    SELECT s.id, s.label, s.url, s.type::text
    FROM "Source" s
    WHERE s.id = ANY($1::text[])
    ORDER BY s.id
  `, [sourceIds]);

  const proposedMilestoneConflicts = await client.query<MilestoneLifecycleSnapshot>(`
    SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
           m.category::text,
           CASE WHEN m."sortDate" IS NULL THEN NULL ELSE to_char(m."sortDate", $7) END AS "sortDate"
    FROM "Milestone" m
    JOIN "Company" c ON c.id = m."companyId"
    WHERE m.id = $1
       OR (m."companyId" = $2
           AND m.date = $3
           AND m.event = $4
           AND m.category::text = $5
           AND m."sortDate" IS NOT DISTINCT FROM $6::timestamp)
    ORDER BY m.id
  `, [
    milestoneInsert.id,
    milestoneInsert.proposed.companyId,
    milestoneInsert.proposed.date,
    milestoneInsert.proposed.event,
    milestoneInsert.proposed.category,
    milestoneInsert.proposed.sortDate,
    NAIVE_MILLIS_FORMAT,
  ]);

  const proposedCitationConflicts = await client.query<CitationLifecycleSnapshot>(`
    SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
           ci.purpose::text, ci."evidenceLabel",
           s.label AS "sourceLabel", s.url AS "sourceUrl", s.type::text AS "sourceType"
    FROM "Citation" ci
    JOIN "Source" s ON s.id = ci."sourceId"
    WHERE ci.id <> $1
      AND ci."sourceId" = $2
      AND ci."dealId" = $3
      AND ci."companyId" = $4
      AND ci.purpose::text = $5
      AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
    ORDER BY ci.id
  `, [
    citationUpdate.id,
    citationUpdate.proposed.sourceId,
    citationUpdate.proposed.dealId,
    citationUpdate.proposed.companyId,
    citationUpdate.proposed.purpose,
    citationUpdate.proposed.evidenceLabel,
  ]);

  return {
    deals: deals.rows,
    ownershipPeriods: ownership.rows,
    companies: companies.rows,
    milestones: milestones.rows,
    citations: citations.rows,
    sources: sources.rows,
    proposedMilestoneConflicts: proposedMilestoneConflicts.rows,
    proposedCitationConflicts: proposedCitationConflicts.rows,
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(snapshot: PortfolioLifecycleSnapshot) {
  const plan = buildPortfolioLifecycleCorrectionPlan(snapshot);
  return {
    schemaVersion: PORTFOLIO_LIFECYCLE_CORRECTION_SCHEMA_VERSION,
    scope: SCOPE,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization: "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT,
      actionSetSha256: REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    quarantinedFindings: plan.quarantinedFindings,
  };
}

function buildPlan(snapshot: PortfolioLifecycleSnapshot): BuiltPlan {
  const plan = buildPortfolioLifecycleCorrectionPlan(snapshot);
  const hashMaterial = planHashMaterial(snapshot);
  return {
    snapshot,
    plan,
    hashMaterial,
    planSha256: sha256(hashMaterial),
  };
}

async function writeJson(outputPath: string, value: unknown, exclusive = false): Promise<void> {
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
    throw new Error(`Receipt output already exists: ${path.resolve(outputPath)}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Receipt output already exists:")) {
      throw error;
    }
  }
}

async function applyDealUpdates(client: Client): Promise<string[]> {
  const updatedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.dealUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      UPDATE "Deal" d
      SET title = $14,
          description = $15,
          stake = $16,
          "assetScale" = $17,
          "keyHighlights" = $18::text[],
          date = $19::timestamp,
          "dealStatus" = $20::"DealStatusEnum",
          "closingDate" = $21::timestamp,
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE d.id = $1
        AND d."legacyId" = $2
        AND d.title = $3
        AND d.target = $4
        AND d.description = $5
        AND d.stake IS NOT DISTINCT FROM $6
        AND d."assetScale" IS NOT DISTINCT FROM $7
        AND d."keyHighlights" = $8::text[]
        AND d.date = $9::timestamp
        AND d."dealStatus"::text = $10
        AND d."closingDate" IS NOT DISTINCT FROM $11::timestamp
        AND d.status::text = $12
        AND d."updatedAt" = $13::timestamp
      RETURNING d.id
    `, [
      current.id,
      current.legacyId,
      current.title,
      current.target,
      current.description,
      current.stake,
      current.assetScale,
      current.keyHighlights,
      current.date,
      current.dealStatus,
      current.closingDate,
      current.recordStatus,
      current.updatedAt,
      proposed.title,
      proposed.description,
      proposed.stake,
      proposed.assetScale,
      proposed.keyHighlights,
      proposed.date,
      proposed.dealStatus,
      proposed.closingDate,
    ]);
    if (result.rows.length !== 1) throw new Error(`Deal ${action.id} failed its exact update predicate`);
    updatedIds.push(result.rows[0].id);
  }
  return updatedIds.sort();
}

async function applyOwnershipUpdates(client: Client): Promise<string[]> {
  const updatedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.ownershipUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      UPDATE "OwnershipPeriod" op
      SET "fundId" = $14,
          "organizationId" = $15,
          "vehicleName" = $16,
          stake = $17,
          "investmentYear" = $18,
          "exitYear" = $19,
          "isActive" = $20
      WHERE op.id = $1
        AND op."companyId" = $2
        AND op."fundId" IS NOT DISTINCT FROM $3
        AND op."organizationId" IS NOT DISTINCT FROM $4
        AND op."vehicleName" IS NOT DISTINCT FROM $5
        AND op.stake IS NOT DISTINCT FROM $6
        AND op."investmentYear" IS NOT DISTINCT FROM $7
        AND op."exitYear" IS NOT DISTINCT FROM $8
        AND op."isActive" = $9
        AND op."createdAt" = $10::timestamp
        AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = op."companyId" AND c.name = $11)
        AND ($12::text IS NULL OR EXISTS (SELECT 1 FROM "Fund" f WHERE f.id = op."fundId" AND f."fundName" = $12))
        AND ($13::text IS NULL OR EXISTS (SELECT 1 FROM "Organization" o WHERE o.id = op."organizationId" AND o.name = $13))
      RETURNING op.id
    `, [
      current.id,
      current.companyId,
      current.fundId,
      current.organizationId,
      current.vehicleName,
      current.stake,
      current.investmentYear,
      current.exitYear,
      current.isActive,
      current.createdAt,
      current.companyName,
      current.fundName,
      current.organizationName,
      proposed.fundId,
      proposed.organizationId,
      proposed.vehicleName,
      proposed.stake,
      proposed.investmentYear,
      proposed.exitYear,
      proposed.isActive,
    ]);
    if (result.rows.length !== 1) {
      throw new Error(`OwnershipPeriod ${action.id} failed its exact update predicate`);
    }
    updatedIds.push(result.rows[0].id);
  }
  return updatedIds.sort();
}

async function applyOwnershipDeletes(client: Client): Promise<string[]> {
  const deletedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.ownershipDeletes) {
    const current = action.current;
    const result = await client.query<{ id: string }>(`
      DELETE FROM "OwnershipPeriod" op
      WHERE op.id = $1
        AND op."companyId" = $2
        AND op."fundId" IS NOT DISTINCT FROM $3
        AND op."organizationId" IS NOT DISTINCT FROM $4
        AND op."vehicleName" IS NOT DISTINCT FROM $5
        AND op.stake IS NOT DISTINCT FROM $6
        AND op."investmentYear" IS NOT DISTINCT FROM $7
        AND op."exitYear" IS NOT DISTINCT FROM $8
        AND op."isActive" = $9
        AND op."createdAt" = $10::timestamp
        AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = op."companyId" AND c.name = $11)
        AND ($12::text IS NULL OR EXISTS (SELECT 1 FROM "Fund" f WHERE f.id = op."fundId" AND f."fundName" = $12))
        AND ($13::text IS NULL OR EXISTS (SELECT 1 FROM "Organization" o WHERE o.id = op."organizationId" AND o.name = $13))
      RETURNING op.id
    `, [
      current.id,
      current.companyId,
      current.fundId,
      current.organizationId,
      current.vehicleName,
      current.stake,
      current.investmentYear,
      current.exitYear,
      current.isActive,
      current.createdAt,
      current.companyName,
      current.fundName,
      current.organizationName,
    ]);
    if (result.rows.length !== 1) {
      throw new Error(`OwnershipPeriod ${action.id} failed its exact delete predicate`);
    }
    deletedIds.push(result.rows[0].id);
  }
  return deletedIds.sort();
}

async function applyMilestoneUpdates(client: Client): Promise<string[]> {
  const updatedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.milestoneUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      UPDATE "Milestone" m
      SET date = $8,
          event = $9,
          category = $10::"MilestoneCategory",
          "sortDate" = $11::timestamp
      WHERE m.id = $1
        AND m."companyId" = $2
        AND m.date = $3
        AND m.event = $4
        AND m.category::text = $5
        AND m."sortDate" IS NOT DISTINCT FROM $6::timestamp
        AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = m."companyId" AND c.name = $7)
      RETURNING m.id
    `, [
      current.id,
      current.companyId,
      current.date,
      current.event,
      current.category,
      current.sortDate,
      current.companyName,
      proposed.date,
      proposed.event,
      proposed.category,
      proposed.sortDate,
    ]);
    if (result.rows.length !== 1) throw new Error(`Milestone ${action.id} failed its exact update predicate`);
    updatedIds.push(result.rows[0].id);
  }
  return updatedIds.sort();
}

async function applyMilestoneInserts(client: Client): Promise<string[]> {
  const insertedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.milestoneInserts) {
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      INSERT INTO "Milestone" (id, "companyId", date, event, category, "sortDate")
      SELECT $1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp
      WHERE EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $2 AND c.name = $7)
        AND NOT EXISTS (SELECT 1 FROM "Milestone" m WHERE m.id = $1)
      RETURNING id
    `, [
      proposed.id,
      proposed.companyId,
      proposed.date,
      proposed.event,
      proposed.category,
      proposed.sortDate,
      proposed.companyName,
    ]);
    if (result.rows.length !== 1) throw new Error(`Milestone ${action.id} failed its exact insert predicate`);
    insertedIds.push(result.rows[0].id);
  }
  return insertedIds.sort();
}

async function applyCompanyUpdates(client: Client): Promise<string[]> {
  const updatedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.companyUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      UPDATE "Company" c
      SET "countryTags" = $9::text[],
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE c.id = $1
        AND c.name = $2
        AND c.country = $3
        AND c."countryTags" = $4::text[]
        AND c.region::text = $5
        AND c."companyStatus"::text = $6
        AND c.status::text = $7
        AND c."updatedAt" = $8::timestamp
      RETURNING c.id
    `, [
      current.id,
      current.name,
      current.country,
      current.countryTags,
      current.region,
      current.companyStatus,
      current.recordStatus,
      current.updatedAt,
      proposed.countryTags,
    ]);
    if (result.rows.length !== 1) throw new Error(`Company ${action.id} failed its exact update predicate`);
    updatedIds.push(result.rows[0].id);
  }
  return updatedIds.sort();
}

async function applyCitationUpdates(client: Client): Promise<string[]> {
  const updatedIds: string[] = [];
  for (const action of REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.citationUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(`
      UPDATE "Citation" ci
      SET "dealId" = $9
      WHERE ci.id = $1
        AND ci."sourceId" = $2
        AND ci."dealId" IS NOT DISTINCT FROM $3
        AND ci."companyId" IS NOT DISTINCT FROM $4
        AND ci.purpose::text = $5
        AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
        AND EXISTS (
          SELECT 1 FROM "Source" s
          WHERE s.id = ci."sourceId" AND s.label = $7 AND s.url = $8
        )
      RETURNING ci.id
    `, [
      current.id,
      current.sourceId,
      current.dealId,
      current.companyId,
      current.purpose,
      current.evidenceLabel,
      current.sourceLabel,
      current.sourceUrl,
      proposed.dealId,
    ]);
    if (result.rows.length !== 1) throw new Error(`Citation ${action.id} failed its exact update predicate`);
    updatedIds.push(result.rows[0].id);
  }
  return updatedIds.sort();
}

function withoutUpdatedAt<T extends { updatedAt: string }>(row: T): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: PortfolioLifecycleSnapshot;
  mutations: {
    dealUpdates: string[];
    ownershipUpdates: string[];
    ownershipDeletes: string[];
    milestoneUpdates: string[];
    milestoneInserts: string[];
    companyUpdates: string[];
    citationUpdates: string[];
  };
}): void {
  const manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST;
  exact("Updated Deal IDs", input.mutations.dealUpdates, manifest.dealUpdates.map((action) => action.id).sort());
  exact("Updated OwnershipPeriod IDs", input.mutations.ownershipUpdates, manifest.ownershipUpdates.map((action) => action.id).sort());
  exact("Deleted OwnershipPeriod IDs", input.mutations.ownershipDeletes, manifest.ownershipDeletes.map((action) => action.id).sort());
  exact("Updated Milestone IDs", input.mutations.milestoneUpdates, manifest.milestoneUpdates.map((action) => action.id).sort());
  exact("Inserted Milestone IDs", input.mutations.milestoneInserts, manifest.milestoneInserts.map((action) => action.id).sort());
  exact("Updated Company IDs", input.mutations.companyUpdates, manifest.companyUpdates.map((action) => action.id).sort());
  exact("Updated Citation IDs", input.mutations.citationUpdates, manifest.citationUpdates.map((action) => action.id).sort());

  const dealById = byId("post-apply Deal snapshot", input.after.deals);
  for (const action of manifest.dealUpdates) {
    const actual = dealById.get(action.id);
    if (!actual) throw new Error(`Postcondition failed: Deal ${action.id} is missing`);
    exact(`Deal ${action.id}`, withoutUpdatedAt(actual), action.proposed);
    if (actual.updatedAt === action.current.updatedAt) {
      throw new Error(`Postcondition failed: Deal ${action.id} updatedAt did not change`);
    }
  }

  const ownershipById = byId("post-apply OwnershipPeriod snapshot", input.after.ownershipPeriods);
  for (const action of manifest.ownershipUpdates) {
    exact(`OwnershipPeriod ${action.id}`, ownershipById.get(action.id), action.proposed);
  }
  for (const action of manifest.ownershipDeletes) {
    if (ownershipById.has(action.id)) throw new Error(`Postcondition failed: OwnershipPeriod ${action.id} was not deleted`);
  }
  for (const guard of manifest.incumbentOwnershipGuards) {
    exact(`Incumbent OwnershipPeriod ${guard.current.id}`, ownershipById.get(guard.current.id), guard.current);
  }

  const milestoneById = byId("post-apply Milestone snapshot", input.after.milestones);
  for (const action of manifest.milestoneUpdates) {
    exact(`Milestone ${action.id}`, milestoneById.get(action.id), action.proposed);
  }
  exact(
    "Inserted Milestone state",
    input.after.proposedMilestoneConflicts,
    manifest.milestoneInserts.map((action) => action.proposed),
  );

  const companyById = byId("post-apply Company snapshot", input.after.companies);
  for (const action of manifest.companyUpdates) {
    const actual = companyById.get(action.id);
    if (!actual) throw new Error(`Postcondition failed: Company ${action.id} is missing`);
    exact(`Company ${action.id}`, withoutUpdatedAt(actual), action.proposed);
    if (actual.updatedAt === action.current.updatedAt) {
      throw new Error(`Postcondition failed: Company ${action.id} updatedAt did not change`);
    }
  }

  const citationById = byId("post-apply Citation snapshot", input.after.citations);
  for (const action of manifest.citationUpdates) {
    exact(`Citation ${action.id}`, citationById.get(action.id), action.proposed);
  }
  if (input.after.proposedCitationConflicts.length > 0) {
    throw new Error("Postcondition failed: the Cordelio citation identity conflicts");
  }
  exact("Evidence Source state", input.after.sources, input.before.snapshot.sources);

  exact("Deal table count", input.after.tableCounts.deals, input.before.snapshot.tableCounts.deals);
  exact("Company table count", input.after.tableCounts.companies, input.before.snapshot.tableCounts.companies);
  exact(
    "OwnershipPeriod table count",
    input.after.tableCounts.ownershipPeriods,
    input.before.snapshot.tableCounts.ownershipPeriods - manifest.ownershipDeletes.length,
  );
  exact(
    "Milestone table count",
    input.after.tableCounts.milestones,
    input.before.snapshot.tableCounts.milestones + manifest.milestoneInserts.length,
  );
  exact("Citation table count", input.after.tableCounts.citations, input.before.snapshot.tableCounts.citations);
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
    throw new Error("Apply requires --approval-hash=<exact lowercase SHA-256 from dry-run>");
  }
  if (apply && !receiptOutput) throw new Error("Apply requires --receipt-output=<new JSON path>");
  if (!apply && receiptOutput) throw new Error("--receipt-output is valid only with --apply");
  if (receiptOutput) await assertPathAbsent(receiptOutput);

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(apply
      ? "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      : "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await client.query("SET LOCAL TIME ZONE 'UTC'");
    if (apply) await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [LOCK_KEY]);

    const before = buildPlan(await loadSnapshot(client));
    const artifact = {
      ...before.hashMaterial,
      generatedAt: new Date().toISOString(),
      database: target,
      dryRun: true,
      planSha256: before.planSha256,
    };
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(JSON.stringify({
      planSha256: before.planSha256,
      actionSetSha256: before.plan.actionSetSha256,
      actionCount: before.plan.actionCount,
      ...before.plan.counts,
    }, null, 2));

    if (!apply) {
      await client.query("ROLLBACK");
      console.log("Dry-run complete; no database rows changed.");
      return;
    }
    if (approvalHash !== before.planSha256) {
      throw new Error(`Approval hash does not match current plan SHA-256 ${before.planSha256}`);
    }

    const mutations = {
      dealUpdates: await applyDealUpdates(client),
      ownershipUpdates: await applyOwnershipUpdates(client),
      ownershipDeletes: await applyOwnershipDeletes(client),
      milestoneUpdates: await applyMilestoneUpdates(client),
      milestoneInserts: await applyMilestoneInserts(client),
      companyUpdates: await applyCompanyUpdates(client),
      citationUpdates: await applyCitationUpdates(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: PORTFOLIO_LIFECYCLE_CORRECTION_SCHEMA_VERSION,
      scope: SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      actionSetSha256: before.plan.actionSetSha256,
      mutations,
      deletedOwnershipRows: REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.ownershipDeletes.map((action) => action.current),
      actions: before.plan.actions,
      quarantinedFindings: before.plan.quarantinedFindings,
      before: {
        snapshotSha256: before.plan.snapshotSha256,
        tableCounts: before.snapshot.tableCounts,
      },
      after: {
        snapshotSha256: sha256(after),
        tableCounts: after.tableCounts,
      },
      postconditions: {
        exactMutationIds: true,
        fullDeletedOwnershipRowsRecorded: true,
        incumbentOwnershipGuardsUnchanged: true,
        onlyCordelioReceivedClosingDate: true,
        deterministicMilestoneInserted: true,
        CordelioClosingCitationLinked: true,
        quarantinedRowsUntouched: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(`Applied ${before.plan.actionCount} exact lifecycle corrections and wrote ${path.resolve(receiptOutput!)}.`);
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
