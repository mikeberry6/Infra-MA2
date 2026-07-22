/**
 * Exact-ID, hash-gated reconciliation for the reviewed deal-card gaps.
 *
 * Dry run (default, always rolled back):
 *   npx tsx --env-file=.env.local scripts/remediate-deal-gap-reconciliation.ts
 *
 * Reviewed apply (not performed while this tranche is being built):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx --env-file=.env.local scripts/remediate-deal-gap-reconciliation.ts \
 *     --apply --approval-hash=<exact fresh dry-run SHA-256> \
 *     --receipt-output=<new receipt JSON path>
 *
 * Reviewed PostgreSQL timestamps are timestamp-without-time-zone wall clocks.
 * They are serialized with to_char and never round-tripped through Date.
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  DEAL_GAP_RECONCILIATION_SCHEMA_VERSION,
  DEAL_GAP_RECONCILIATION_SCOPE,
  REVIEWED_DEAL_GAP_ACTION_COUNT,
  REVIEWED_DEAL_GAP_ACTION_SET_SHA256,
  REVIEWED_DEAL_GAP_MANIFEST,
  REVIEWED_DEAL_GAP_MANIFEST_SHA256,
  buildDealGapReconciliationPlan,
  type CitationSnapshot,
  type CompanyGuard,
  type DealGapPlan,
  type DealGapSnapshot,
  type DealSnapshot,
  type MilestoneSnapshot,
  type OrganizationGuard,
  type OwnershipInsertState,
  type OwnershipSnapshot,
  type ReconciliationTableCounts,
} from "./portfolio-review/deal-gap-reconciliation";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:deal-gap-reconciliation:v1";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: DealGapSnapshot;
  plan: DealGapPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  dealUpdates: string[];
  milestoneUpdates: string[];
  citationUpdates: string[];
  ownershipUpdates: string[];
  ownershipDeletes: string[];
  ownershipInserts: string[];
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

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function byId<T extends { id: string }>(
  label: string,
  rows: readonly T[],
): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id))
      throw new Error(`${label} contains duplicate ID ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} does not match the reviewed postcondition`);
  }
}

function withoutUpdatedAt(row: DealSnapshot): Omit<DealSnapshot, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  void _updatedAt;
  return rest;
}

function withoutCreatedAt(row: OwnershipSnapshot): OwnershipInsertState {
  const { createdAt: _createdAt, ...rest } = row;
  void _createdAt;
  return rest;
}

async function loadTableCounts(
  client: Client,
): Promise<ReconciliationTableCounts> {
  const result = await client.query<ReconciliationTableCounts>(`
    SELECT (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "Citation") AS citations,
           (SELECT count(*)::int FROM "Source") AS sources,
           (SELECT count(*)::int FROM "Organization") AS organizations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load deal-gap table counts");
  return row;
}

async function loadDeals(client: Client): Promise<DealSnapshot[]> {
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;
  const ids = sortedUnique([
    ...manifest.dealUpdates.map((action) => action.id),
    ...manifest.protectedDeals.map((row) => row.id),
  ]);
  const result = await client.query<DealSnapshot>(
    `
      SELECT d.id, d."legacyId", d.title, d.target,
             to_char(d.date, $2) AS date, d.description,
             d."keyHighlights"::text[] AS "keyHighlights",
             d."dealStatus"::text AS "dealStatus",
             CASE WHEN d."closingDate" IS NULL THEN NULL
                  ELSE to_char(d."closingDate", $2) END AS "closingDate",
             d.status::text AS "recordStatus",
             to_char(d."updatedAt", $3) AS "updatedAt"
      FROM "Deal" d
      WHERE d.id = ANY($1::text[])
      ORDER BY d.id
    `,
    [ids, NAIVE_MILLIS_FORMAT, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadMilestones(client: Client): Promise<MilestoneSnapshot[]> {
  const ids = REVIEWED_DEAL_GAP_MANIFEST.milestoneUpdates.map(
    (action) => action.id,
  );
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
             m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m.id = ANY($1::text[])
      ORDER BY m.id
    `,
    [ids, NAIVE_MILLIS_FORMAT],
  );
  return result.rows;
}

async function loadCitations(client: Client): Promise<CitationSnapshot[]> {
  const ids = sortedUnique([
    ...REVIEWED_DEAL_GAP_MANIFEST.citationUpdates.map((action) => action.id),
    ...REVIEWED_DEAL_GAP_MANIFEST.citationGuards.map((row) => row.id),
  ]);
  const result = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci.id = ANY($1::text[])
      ORDER BY ci.id
    `,
    [ids],
  );
  return result.rows;
}

async function loadOwnershipPeriods(
  client: Client,
): Promise<OwnershipSnapshot[]> {
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;
  const ids = sortedUnique([
    ...manifest.ownershipUpdates.map((action) => action.id),
    ...manifest.ownershipDeletes.map((action) => action.id),
    ...manifest.ownershipInserts.map((action) => action.id),
    ...manifest.ownershipGuards.map((row) => row.id),
  ]);
  const result = await client.query<OwnershipSnapshot>(
    `
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
    `,
    [ids, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadCompanies(client: Client): Promise<CompanyGuard[]> {
  const ids = REVIEWED_DEAL_GAP_MANIFEST.companyGuards.map((row) => row.id);
  const result = await client.query<CompanyGuard>(
    `
      SELECT c.id, c.name, c.country,
             c."companyStatus"::text AS "companyStatus",
             c.status::text AS "recordStatus",
             to_char(c."updatedAt", $2) AS "updatedAt"
      FROM "Company" c
      WHERE c.id = ANY($1::text[])
      ORDER BY c.id
    `,
    [ids, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadOrganizations(client: Client): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_DEAL_GAP_MANIFEST.organizationGuards.map(
    (row) => row.id,
  );
  const result = await client.query<OrganizationGuard>(
    `
      SELECT o.id, o.name, o.types::text[], o.status::text AS "recordStatus"
      FROM "Organization" o
      WHERE o.id = ANY($1::text[])
      ORDER BY o.id
    `,
    [ids],
  );
  return result.rows;
}

async function loadProposedCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const conflicts = new Map<string, CitationSnapshot>();
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.citationUpdates) {
    const proposed = action.proposed;
    const result = await client.query<CitationSnapshot>(
      `
        SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
               ci.purpose::text, ci."evidenceLabel",
               s.label AS "sourceLabel", s.url AS "sourceUrl",
               s.type::text AS "sourceType"
        FROM "Citation" ci
        JOIN "Source" s ON s.id = ci."sourceId"
        WHERE ci.id <> $1
          AND ci."sourceId" = $2
          AND ci."dealId" IS NOT DISTINCT FROM $3
          AND ci."companyId" IS NOT DISTINCT FROM $4
          AND ci.purpose::text = $5
          AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
        ORDER BY ci.id
      `,
      [
        proposed.id,
        proposed.sourceId,
        proposed.dealId,
        proposed.companyId,
        proposed.purpose,
        proposed.evidenceLabel,
      ],
    );
    for (const row of result.rows) conflicts.set(row.id, row);
  }
  return [...conflicts.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

async function loadProposedOwnershipConflicts(
  client: Client,
): Promise<OwnershipSnapshot[]> {
  const conflicts = new Map<string, OwnershipSnapshot>();
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.ownershipInserts) {
    const proposed = action.proposed;
    const result = await client.query<OwnershipSnapshot>(
      `
        SELECT op.id, op."companyId", c.name AS "companyName",
               op."fundId", f."fundName", op."organizationId",
               o.name AS "organizationName", op."vehicleName", op.stake,
               op."investmentYear", op."exitYear", op."isActive",
               to_char(op."createdAt", $5) AS "createdAt"
        FROM "OwnershipPeriod" op
        JOIN "Company" c ON c.id = op."companyId"
        LEFT JOIN "Fund" f ON f.id = op."fundId"
        LEFT JOIN "Organization" o ON o.id = op."organizationId"
        WHERE op.id = $1
           OR (op."companyId" = $2
               AND op."organizationId" IS NOT DISTINCT FROM $3
               AND op."vehicleName" IS NOT DISTINCT FROM $4)
        ORDER BY op.id
      `,
      [
        proposed.id,
        proposed.companyId,
        proposed.organizationId,
        proposed.vehicleName,
        NAIVE_MICROS_FORMAT,
      ],
    );
    for (const row of result.rows) conflicts.set(row.id, row);
  }
  return [...conflicts.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

async function loadSnapshot(client: Client): Promise<DealGapSnapshot> {
  return {
    deals: await loadDeals(client),
    milestones: await loadMilestones(client),
    citations: await loadCitations(client),
    ownershipPeriods: await loadOwnershipPeriods(client),
    companies: await loadCompanies(client),
    organizations: await loadOrganizations(client),
    proposedCitationConflicts: await loadProposedCitationConflicts(client),
    proposedOwnershipConflicts: await loadProposedOwnershipConflicts(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(snapshot: DealGapSnapshot) {
  const plan = buildDealGapReconciliationPlan(snapshot);
  return {
    schemaVersion: DEAL_GAP_RECONCILIATION_SCHEMA_VERSION,
    scope: DEAL_GAP_RECONCILIATION_SCOPE,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_DEAL_GAP_ACTION_COUNT,
      actionSetSha256: REVIEWED_DEAL_GAP_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_DEAL_GAP_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    quarantinedFindings: plan.quarantinedFindings,
  };
}

function buildPlan(snapshot: DealGapSnapshot): BuiltPlan {
  const plan = buildDealGapReconciliationPlan(snapshot);
  const hashMaterial = planHashMaterial(snapshot);
  return {
    snapshot,
    plan,
    hashMaterial,
    planSha256: sha256(hashMaterial),
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
  }
}

async function applyDealUpdates(client: Client): Promise<string[]> {
  const updated: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.dealUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        UPDATE "Deal" d
        SET date = $12::timestamp,
            description = $13,
            "keyHighlights" = $14::text[],
            "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
        WHERE d.id = $1
          AND d."legacyId" = $2
          AND d.title = $3
          AND d.target = $4
          AND d.date = $5::timestamp
          AND d.description = $6
          AND d."keyHighlights" = $7::text[]
          AND d."dealStatus"::text = $8
          AND d."closingDate" IS NOT DISTINCT FROM $9::timestamp
          AND d.status::text = $10
          AND d."updatedAt" = $11::timestamp
        RETURNING d.id
      `,
      [
        current.id,
        current.legacyId,
        current.title,
        current.target,
        current.date,
        current.description,
        current.keyHighlights,
        current.dealStatus,
        current.closingDate,
        current.recordStatus,
        current.updatedAt,
        proposed.date,
        proposed.description,
        proposed.keyHighlights,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(`Deal ${action.id} failed its exact update predicate`);
    }
    updated.push(result.rows[0]!.id);
  }
  return updated.sort();
}

async function applyMilestoneUpdates(client: Client): Promise<string[]> {
  const updated: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.milestoneUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        UPDATE "Milestone" m
        SET date = $8, event = $9, category = $10::"MilestoneCategory",
            "sortDate" = $11::timestamp
        WHERE m.id = $1
          AND m."companyId" = $2
          AND m.date = $3
          AND m.event = $4
          AND m.category::text = $5
          AND m."sortDate" IS NOT DISTINCT FROM $6::timestamp
          AND EXISTS (
            SELECT 1 FROM "Company" c
            WHERE c.id = m."companyId" AND c.name = $7
          )
        RETURNING m.id
      `,
      [
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
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `Milestone ${action.id} failed its exact update predicate`,
      );
    }
    updated.push(result.rows[0]!.id);
  }
  return updated.sort();
}

async function applyCitationUpdates(client: Client): Promise<string[]> {
  const updated: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.citationUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        UPDATE "Citation" ci
        SET "dealId" = $10,
            purpose = $11::"CitationPurpose",
            "evidenceLabel" = $12
        WHERE ci.id = $1
          AND ci."sourceId" = $2
          AND ci."dealId" IS NOT DISTINCT FROM $3
          AND ci."companyId" IS NOT DISTINCT FROM $4
          AND ci.purpose::text = $5
          AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
          AND EXISTS (
            SELECT 1 FROM "Source" s
            WHERE s.id = ci."sourceId"
              AND s.label = $7
              AND s.url = $8
              AND s.type::text = $9
          )
        RETURNING ci.id
      `,
      [
        current.id,
        current.sourceId,
        current.dealId,
        current.companyId,
        current.purpose,
        current.evidenceLabel,
        current.sourceLabel,
        current.sourceUrl,
        current.sourceType,
        proposed.dealId,
        proposed.purpose,
        proposed.evidenceLabel,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `Citation ${action.id} failed its exact update predicate`,
      );
    }
    updated.push(result.rows[0]!.id);
  }
  return updated.sort();
}

async function applyOwnershipUpdates(client: Client): Promise<string[]> {
  const updated: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.ownershipUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
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
          AND EXISTS (
            SELECT 1 FROM "Company" c
            WHERE c.id = op."companyId" AND c.name = $11
          )
          AND ($12::text IS NULL OR EXISTS (
            SELECT 1 FROM "Fund" f
            WHERE f.id = op."fundId" AND f."fundName" = $12
          ))
          AND ($13::text IS NULL OR EXISTS (
            SELECT 1 FROM "Organization" o
            WHERE o.id = op."organizationId" AND o.name = $13
          ))
        RETURNING op.id
      `,
      [
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
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `OwnershipPeriod ${action.id} failed its exact update predicate`,
      );
    }
    updated.push(result.rows[0]!.id);
  }
  return updated.sort();
}

async function applyOwnershipDeletes(client: Client): Promise<string[]> {
  const deleted: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.ownershipDeletes) {
    const current = action.current;
    const result = await client.query<{ id: string }>(
      `
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
          AND EXISTS (
            SELECT 1 FROM "Company" c
            WHERE c.id = op."companyId" AND c.name = $11
          )
          AND ($12::text IS NULL OR EXISTS (
            SELECT 1 FROM "Fund" f
            WHERE f.id = op."fundId" AND f."fundName" = $12
          ))
          AND ($13::text IS NULL OR EXISTS (
            SELECT 1 FROM "Organization" o
            WHERE o.id = op."organizationId" AND o.name = $13
          ))
        RETURNING op.id
      `,
      [
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
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `OwnershipPeriod ${action.id} failed its exact delete predicate`,
      );
    }
    deleted.push(result.rows[0]!.id);
  }
  return deleted.sort();
}

async function applyOwnershipInserts(client: Client): Promise<string[]> {
  const inserted: string[] = [];
  for (const action of REVIEWED_DEAL_GAP_MANIFEST.ownershipInserts) {
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "OwnershipPeriod"
          (id, "fundId", "organizationId", "companyId", "vehicleName", stake,
           "investmentYear", "exitYear", "isActive")
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
        WHERE EXISTS (
          SELECT 1 FROM "Company" c
          WHERE c.id = $4 AND c.name = $10
        )
          AND EXISTS (
            SELECT 1 FROM "Organization" o
            WHERE o.id = $3 AND o.name = $11
          )
          AND NOT EXISTS (
            SELECT 1 FROM "OwnershipPeriod" op
            WHERE op.id = $1
               OR (op."companyId" = $4
                   AND op."organizationId" IS NOT DISTINCT FROM $3
                   AND op."vehicleName" IS NOT DISTINCT FROM $5)
          )
        RETURNING id
      `,
      [
        proposed.id,
        proposed.fundId,
        proposed.organizationId,
        proposed.companyId,
        proposed.vehicleName,
        proposed.stake,
        proposed.investmentYear,
        proposed.exitYear,
        proposed.isActive,
        proposed.companyName,
        proposed.organizationName,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `OwnershipPeriod ${action.id} failed its exact insert predicate`,
      );
    }
    inserted.push(result.rows[0]!.id);
  }
  return inserted.sort();
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: DealGapSnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;
  exact(
    "Updated Deal IDs",
    input.mutations.dealUpdates,
    manifest.dealUpdates.map((action) => action.id).sort(),
  );
  exact(
    "Updated Milestone IDs",
    input.mutations.milestoneUpdates,
    manifest.milestoneUpdates.map((action) => action.id).sort(),
  );
  exact(
    "Updated Citation IDs",
    input.mutations.citationUpdates,
    manifest.citationUpdates.map((action) => action.id).sort(),
  );
  exact(
    "Updated OwnershipPeriod IDs",
    input.mutations.ownershipUpdates,
    manifest.ownershipUpdates.map((action) => action.id).sort(),
  );
  exact(
    "Deleted OwnershipPeriod IDs",
    input.mutations.ownershipDeletes,
    manifest.ownershipDeletes.map((action) => action.id).sort(),
  );
  exact(
    "Inserted OwnershipPeriod IDs",
    input.mutations.ownershipInserts,
    manifest.ownershipInserts.map((action) => action.id).sort(),
  );

  const deals = byId("post-apply Deal", input.after.deals);
  for (const action of manifest.dealUpdates) {
    const actual = deals.get(action.id);
    if (!actual)
      throw new Error(`Postcondition failed: Deal ${action.id} is missing`);
    exact(`Deal ${action.id}`, withoutUpdatedAt(actual), action.proposed);
    if (actual.updatedAt === action.current.updatedAt) {
      throw new Error(
        `Postcondition failed: Deal ${action.id} updatedAt did not change`,
      );
    }
  }
  for (const row of manifest.protectedDeals) {
    exact(`Protected Deal ${row.id}`, deals.get(row.id), row);
  }

  const milestones = byId("post-apply Milestone", input.after.milestones);
  for (const action of manifest.milestoneUpdates) {
    exact(`Milestone ${action.id}`, milestones.get(action.id), action.proposed);
  }

  const citations = byId("post-apply Citation", input.after.citations);
  for (const action of manifest.citationUpdates) {
    exact(`Citation ${action.id}`, citations.get(action.id), action.proposed);
  }
  for (const row of manifest.citationGuards) {
    exact(`Citation guard ${row.id}`, citations.get(row.id), row);
  }
  if (input.after.proposedCitationConflicts.length > 0) {
    throw new Error("Postcondition failed: a citation identity conflicts");
  }

  const ownership = byId(
    "post-apply OwnershipPeriod",
    input.after.ownershipPeriods,
  );
  for (const action of manifest.ownershipUpdates) {
    exact(
      `OwnershipPeriod ${action.id}`,
      ownership.get(action.id),
      action.proposed,
    );
  }
  for (const action of manifest.ownershipDeletes) {
    if (ownership.has(action.id)) {
      throw new Error(
        `Postcondition failed: OwnershipPeriod ${action.id} was not deleted`,
      );
    }
  }
  for (const row of manifest.ownershipGuards) {
    exact(`Ownership guard ${row.id}`, ownership.get(row.id), row);
  }
  for (const action of manifest.ownershipInserts) {
    const actual = ownership.get(action.id);
    if (!actual) {
      throw new Error(
        `Postcondition failed: OwnershipPeriod ${action.id} is missing`,
      );
    }
    exact(
      `Inserted OwnershipPeriod ${action.id}`,
      withoutCreatedAt(actual),
      action.proposed,
    );
  }
  exact(
    "Post-apply ownership identities",
    input.after.proposedOwnershipConflicts.map(withoutCreatedAt),
    manifest.ownershipInserts.map((action) => action.proposed),
  );

  exact(
    "Company guards",
    input.after.companies,
    input.before.snapshot.companies,
  );
  exact(
    "Organization guards",
    input.after.organizations,
    input.before.snapshot.organizations,
  );

  const beforeCounts = input.before.snapshot.tableCounts;
  const afterCounts = input.after.tableCounts;
  exact("Deal table count", afterCounts.deals, beforeCounts.deals);
  exact("Company table count", afterCounts.companies, beforeCounts.companies);
  exact(
    "OwnershipPeriod table count",
    afterCounts.ownershipPeriods,
    beforeCounts.ownershipPeriods -
      manifest.ownershipDeletes.length +
      manifest.ownershipInserts.length,
  );
  exact(
    "Milestone table count",
    afterCounts.milestones,
    beforeCounts.milestones,
  );
  exact("Citation table count", afterCounts.citations, beforeCounts.citations);
  exact("Source table count", afterCounts.sources, beforeCounts.sources);
  exact(
    "Organization table count",
    afterCounts.organizations,
    beforeCounts.organizations,
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
    await client.query("SET LOCAL TIME ZONE 'UTC'");
    if (apply) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        LOCK_KEY,
      ]);
    }

    const before = buildPlan(await loadSnapshot(client));
    const artifact = {
      ...before.hashMaterial,
      generatedAt: new Date().toISOString(),
      database: target,
      dryRun: true,
      planSha256: before.planSha256,
    };
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          actionSetSha256: before.plan.actionSetSha256,
          actionCount: before.plan.actionCount,
          ...before.plan.counts,
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

    const mutations: MutationIds = {
      dealUpdates: await applyDealUpdates(client),
      milestoneUpdates: await applyMilestoneUpdates(client),
      citationUpdates: await applyCitationUpdates(client),
      ownershipUpdates: await applyOwnershipUpdates(client),
      ownershipDeletes: await applyOwnershipDeletes(client),
      ownershipInserts: await applyOwnershipInserts(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: DEAL_GAP_RECONCILIATION_SCHEMA_VERSION,
      scope: DEAL_GAP_RECONCILIATION_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      actionSetSha256: before.plan.actionSetSha256,
      mutations,
      deletedOwnershipRows: REVIEWED_DEAL_GAP_MANIFEST.ownershipDeletes.map(
        (action) => action.current,
      ),
      insertedOwnershipRows: after.proposedOwnershipConflicts,
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
        insertedOwnershipRowsRecorded: true,
        incumbentOwnershipGuardsUnchanged: true,
        pendingDealStatusesPreserved: true,
        verticalBridgeKkrOwnerPreserved: true,
        excludedTranchesUntouched: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} exact deal-gap corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
