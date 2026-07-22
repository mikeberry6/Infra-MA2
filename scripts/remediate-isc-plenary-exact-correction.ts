/**
 * Exact-ID, evidence-gated ISC deal-close and Plenary Americas card
 * correction. Dry-run is the default and exercises every mutation inside a
 * serializable transaction before rolling it back.
 *
 * Dry run:
 *   npx tsx scripts/remediate-isc-plenary-exact-correction.ts
 *
 * Reviewed apply (not performed by the implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-isc-plenary-exact-correction.ts \
 *     --apply --approval-hash=<exact fresh dry-run plan SHA-256> \
 *     --receipt-output=<new JSON path>
 */
import "dotenv/config";

import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client, type QueryResult } from "pg";
import {
  ISC_PLENARY_EXACT_CORRECTION_SCHEMA_VERSION,
  ISC_PLENARY_EXACT_CORRECTION_SCOPE,
  REVIEWED_ISC_PLENARY_ACTION_COUNT,
  REVIEWED_ISC_PLENARY_ACTION_SET_SHA256,
  REVIEWED_ISC_PLENARY_MANIFEST,
  REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
  buildIscPlenaryPlan,
  expectedPostCitations,
  expectedPostMilestones,
  expectedPostTableCounts,
  type CitationSnapshot,
  type CompanyIdentityGuard,
  type CompanySnapshot,
  type DealSnapshot,
  type EntityIdConflict,
  type IscPlenaryPlan,
  type IscPlenarySnapshot,
  type ManagementSnapshot,
  type MilestoneSnapshot,
  type OwnershipSnapshot,
  type ParticipantSnapshot,
  type SchemaGuard,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/isc-plenary-exact-correction";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:isc-plenary-exact-correction:v1";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';
const DEFAULT_PLAN_OUTPUT =
  "audits/portfolio-company-review-2026-07-22/isc-plenary-exact-correction-plan.json";

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: IscPlenarySnapshot;
  plan: IscPlenaryPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  dealUpdates: string[];
  companyUpdates: string[];
  milestoneUpdates: string[];
  milestoneInserts: string[];
  sourceUpdates: string[];
  sourceInserts: string[];
  citationInserts: string[];
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
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

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

function assertOne(result: QueryResult, label: string): string {
  if (result.rowCount !== 1) {
    throw new Error(
      `${label} affected ${result.rowCount ?? 0} rows; expected exactly 1`,
    );
  }
  const id = (result.rows[0] as { id?: unknown } | undefined)?.id;
  if (typeof id !== "string") throw new Error(`${label} did not return an ID`);
  return id;
}

async function loadDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_ISC_PLENARY_MANIFEST.dealUpdate.id;
  const result = await client.query<DealSnapshot>(
    `
      SELECT d.id, d."legacyId", d.title, d.target, d.sector::text,
             d.subsector, d.region::text, d.categories::text[],
             to_char(d.date, $2) AS date, d.description,
             d."targetDescription", d.country, d."enterpriseValue",
             d."equityValue", d.stake,
             d."dealStatus"::text AS "dealStatus",
             CASE WHEN d."closingDate" IS NULL THEN NULL
                  ELSE to_char(d."closingDate", $2) END AS "closingDate",
             d."assetScale", d."valuationMultiple", d."fundVehicle",
             d."keyHighlights"::text[], d.status::text AS "recordStatus",
             to_char(d."createdAt", $3) AS "createdAt",
             to_char(d."updatedAt", $3) AS "updatedAt"
      FROM "Deal" d
      WHERE d.id = $1
    `,
    [id, NAIVE_MILLIS_FORMAT, NAIVE_MICROS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadCompany(client: Client): Promise<CompanySnapshot | null> {
  const id = REVIEWED_ISC_PLENARY_MANIFEST.companyUpdate.id;
  const result = await client.query<CompanySnapshot>(
    `
      SELECT c.id, c.name, c.sector::text, c.subsector, c.region::text,
             c.country, c."countryTags"::text[], c.description,
             c."companyStatus"::text AS "companyStatus", c.website,
             c."yearFounded", c.headquarters,
             c.status::text AS "recordStatus",
             to_char(c."createdAt", $2) AS "createdAt",
             to_char(c."updatedAt", $2) AS "updatedAt"
      FROM "Company" c
      WHERE c.id = $1
    `,
    [id, NAIVE_MICROS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadParticipants(
  client: Client,
): Promise<ParticipantSnapshot[]> {
  const dealId = REVIEWED_ISC_PLENARY_MANIFEST.dealUpdate.id;
  const result = await client.query<ParticipantSnapshot>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName",
             o.types::text[] AS "organizationTypes",
             o.status::text AS "organizationStatus",
             dp.role::text, dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp."dealId" = $1
      ORDER BY dp.id
    `,
    [dealId],
  );
  return result.rows;
}

async function loadOwnershipRows(client: Client): Promise<OwnershipSnapshot[]> {
  const companyId = REVIEWED_ISC_PLENARY_MANIFEST.companyUpdate.id;
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
      WHERE op."companyId" = $1
      ORDER BY op.id
    `,
    [companyId, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadMilestoneRows(client: Client): Promise<MilestoneSnapshot[]> {
  const companyId = REVIEWED_ISC_PLENARY_MANIFEST.companyUpdate.id;
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date,
             m.event, m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m."companyId" = $1
      ORDER BY m.id
    `,
    [companyId, NAIVE_MILLIS_FORMAT],
  );
  return result.rows;
}

async function loadManagementRows(
  client: Client,
): Promise<ManagementSnapshot[]> {
  const companyId = REVIEWED_ISC_PLENARY_MANIFEST.companyUpdate.id;
  const result = await client.query<ManagementSnapshot>(
    `
      SELECT mr.id, mr."companyId", c.name AS "companyName",
             mr."personId", p.name AS "personName", mr.title,
             CASE WHEN mr."startDate" IS NULL THEN NULL
                  ELSE to_char(mr."startDate", $2) END AS "startDate",
             CASE WHEN mr."endDate" IS NULL THEN NULL
                  ELSE to_char(mr."endDate", $2) END AS "endDate"
      FROM "ManagementRole" mr
      JOIN "Company" c ON c.id = mr."companyId"
      JOIN "Person" p ON p.id = mr."personId"
      WHERE mr."companyId" = $1
      ORDER BY mr.id
    `,
    [companyId, NAIVE_MILLIS_FORMAT],
  );
  return result.rows;
}

async function loadCitationRows(client: Client): Promise<CitationSnapshot[]> {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const result = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci."dealId" = $1 OR ci."companyId" = $2
      ORDER BY ci.id
    `,
    [manifest.dealUpdate.id, manifest.companyUpdate.id],
  );
  return result.rows;
}

async function loadSourceById(
  client: Client,
  id: string,
): Promise<SourceSnapshot | null> {
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text,
             to_char(s."createdAt", $2) AS "createdAt"
      FROM "Source" s
      WHERE s.id = $1
    `,
    [id, NAIVE_MICROS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadSourceConflicts(client: Client): Promise<SourceSnapshot[]> {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text,
             to_char(s."createdAt", $4) AS "createdAt"
      FROM "Source" s
      WHERE s.id <> $1
        AND (s.id = $2 OR s.url = ANY($3::text[]))
      ORDER BY s.id
    `,
    [
      manifest.sourceUpdate.id,
      manifest.sourceInsert.id,
      [manifest.sourceUpdate.proposed.url, manifest.sourceInsert.proposed.url],
      NAIVE_MICROS_FORMAT,
    ],
  );
  return result.rows;
}

async function loadEntityIdConflicts(
  client: Client,
): Promise<EntityIdConflict[]> {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const result = await client.query<EntityIdConflict>(
    `
      SELECT kind, id
      FROM (
        SELECT 'Milestone'::text AS kind, m.id
        FROM "Milestone" m
        WHERE m.id = $1
        UNION ALL
        SELECT 'Citation'::text AS kind, ci.id
        FROM "Citation" ci
        WHERE ci.id = $2
      ) conflicts
      ORDER BY kind, id
    `,
    [manifest.milestoneInsert.id, manifest.citationInsert.id],
  );
  return result.rows;
}

async function loadIscCompanyRows(
  client: Client,
): Promise<CompanyIdentityGuard[]> {
  const result = await client.query<CompanyIdentityGuard>(`
    SELECT c.id, c.name, c.country, c.status::text AS "recordStatus"
    FROM "Company" c
    WHERE regexp_replace(lower(c.name), '[^a-z0-9]+', '', 'g')
          IN ('informationservicescorporation', 'isc')
    ORDER BY c.id
  `);
  return result.rows;
}

async function loadSchemaGuard(client: Client): Promise<SchemaGuard> {
  const columns = await client.query<{ columnName: string }>(`
    SELECT column_name AS "columnName"
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND ((table_name = 'Citation' AND column_name = 'isPrimary')
        OR (table_name = 'Deal' AND column_name IN
          ('sellerDisclosureStatus', 'sellerDisclosureReason')))
    ORDER BY table_name, column_name
  `);
  const names = new Set(columns.rows.map((row) => row.columnName));
  const index = await client.query<{ indexdef: string }>(`
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'Citation'
      AND indexname = 'Citation_company_identity_unique'
  `);
  return {
    citationHasIsPrimary: names.has("isPrimary"),
    dealHasSellerDisclosureStatus: names.has("sellerDisclosureStatus"),
    dealHasSellerDisclosureReason: names.has("sellerDisclosureReason"),
    citationIdentityIndexDefinition: index.rows[0]?.indexdef ?? null,
  };
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "DealParticipant") AS "dealParticipants",
           (SELECT count(*)::int FROM "Organization") AS organizations,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "ManagementRole") AS "managementRoles",
           (SELECT count(*)::int FROM "Source") AS sources,
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load global table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<IscPlenarySnapshot> {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  return {
    deal: await loadDeal(client),
    company: await loadCompany(client),
    participants: await loadParticipants(client),
    ownershipRows: await loadOwnershipRows(client),
    milestoneRows: await loadMilestoneRows(client),
    managementRows: await loadManagementRows(client),
    citationRows: await loadCitationRows(client),
    announcementSource: await loadSourceById(client, manifest.sourceUpdate.id),
    closeSource: await loadSourceById(client, manifest.sourceInsert.id),
    sourceConflicts: await loadSourceConflicts(client),
    entityIdConflicts: await loadEntityIdConflicts(client),
    iscCompanyRows: await loadIscCompanyRows(client),
    schema: await loadSchemaGuard(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  snapshot: IscPlenarySnapshot,
) {
  const plan = buildIscPlenaryPlan(snapshot);
  return {
    schemaVersion: ISC_PLENARY_EXACT_CORRECTION_SCHEMA_VERSION,
    scope: ISC_PLENARY_EXACT_CORRECTION_SCOPE,
    database: target,
    transactionMode: "SERIALIZABLE_MUTATE_AND_ROLLBACK",
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_ISC_PLENARY_ACTION_COUNT,
      actionSetSha256: REVIEWED_ISC_PLENARY_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    schema: snapshot.schema,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    seedExpectation: REVIEWED_ISC_PLENARY_MANIFEST.seedExpectation,
    quarantinedFields: plan.quarantinedFields,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: IscPlenarySnapshot,
): BuiltPlan {
  const plan = buildIscPlenaryPlan(snapshot);
  const hashMaterial = planHashMaterial(target, snapshot);
  return {
    snapshot,
    plan,
    hashMaterial,
    planSha256: sha256(hashMaterial),
  };
}

async function assertConnectedDatabase(
  client: Client,
  target: DatabaseTarget,
): Promise<void> {
  const result = await client.query<{
    database: string;
    isolation: string;
  }>(`
    SELECT current_database() AS database,
           current_setting('transaction_isolation') AS isolation
  `);
  if (result.rows[0]?.database !== target.database) {
    throw new Error("Connected database does not match parsed DATABASE_URL");
  }
  if (result.rows[0]?.isolation !== "serializable") {
    throw new Error("ISC/Plenary correction requires serializable isolation");
  }
}

async function beginGuardedTransaction(client: Client): Promise<void> {
  await client.query("BEGIN");
  await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
    LOCK_KEY,
  ]);
  await client.query(`
    LOCK TABLE "Company", "Deal", "DealParticipant", "Organization", "Fund",
               "OwnershipPeriod", "Milestone", "ManagementRole", "Person",
               "Source", "Citation"
    IN SHARE ROW EXCLUSIVE MODE
  `);
}

async function applyDealUpdate(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.dealUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Deal" d
      SET date = $9::timestamp,
          description = $10,
          "enterpriseValue" = $11,
          "dealStatus" = $12::"DealStatusEnum",
          "closingDate" = $13::timestamp,
          "keyHighlights" = $14::text[],
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE d.id = $1
        AND d.date = $2::timestamp
        AND d.description = $3
        AND d."enterpriseValue" IS NOT DISTINCT FROM $4
        AND d."dealStatus"::text = $5
        AND d."closingDate" IS NOT DISTINCT FROM $6::timestamp
        AND d."keyHighlights" IS NOT DISTINCT FROM $7::text[]
        AND d."updatedAt" = $8::timestamp
      RETURNING d.id
    `,
    [
      current.id,
      current.date,
      current.description,
      current.enterpriseValue,
      current.dealStatus,
      current.closingDate,
      current.keyHighlights,
      current.updatedAt,
      proposed.date,
      proposed.description,
      proposed.enterpriseValue,
      proposed.dealStatus,
      proposed.closingDate,
      proposed.keyHighlights,
    ],
  );
  return assertOne(result, `Deal ${action.id} update`);
}

async function applyCompanyUpdate(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.companyUpdate;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Company" c
      SET description = $4,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE c.id = $1
        AND c.description = $2
        AND c."updatedAt" = $3::timestamp
      RETURNING c.id
    `,
    [
      action.current.id,
      action.current.description,
      action.current.updatedAt,
      action.proposed.description,
    ],
  );
  return assertOne(result, `Company ${action.id} update`);
}

async function applyMilestoneUpdate(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.milestoneUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Milestone" m
      SET date = $7,
          event = $8,
          "sortDate" = $9::timestamp
      WHERE m.id = $1
        AND m."companyId" = $2
        AND m.date = $3
        AND m.event = $4
        AND m.category::text = $5
        AND m."sortDate" IS NOT DISTINCT FROM $6::timestamp
      RETURNING m.id
    `,
    [
      current.id,
      current.companyId,
      current.date,
      current.event,
      current.category,
      current.sortDate,
      proposed.date,
      proposed.event,
      proposed.sortDate,
    ],
  );
  return assertOne(result, `Milestone ${action.id} update`);
}

async function applyMilestoneInsert(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.milestoneInsert;
  const row = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO "Milestone"
        (id, "companyId", date, event, category, "sortDate")
      VALUES ($1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp)
      RETURNING id
    `,
    [row.id, row.companyId, row.date, row.event, row.category, row.sortDate],
  );
  return assertOne(result, `Milestone ${action.id} insert`);
}

async function applySourceUpdate(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.sourceUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Source" s
      SET label = $6,
          url = $7,
          type = $8::"SourceType"
      WHERE s.id = $1
        AND s.label = $2
        AND s.url = $3
        AND s.type::text = $4
        AND s."createdAt" = $5::timestamp
      RETURNING s.id
    `,
    [
      current.id,
      current.label,
      current.url,
      current.type,
      current.createdAt,
      proposed.label,
      proposed.url,
      proposed.type,
    ],
  );
  return assertOne(result, `Source ${action.id} update`);
}

async function applySourceInsert(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.sourceInsert;
  const row = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO "Source" (id, label, url, type)
      VALUES ($1, $2, $3, $4::"SourceType")
      RETURNING id
    `,
    [row.id, row.label, row.url, row.type],
  );
  return assertOne(result, `Source ${action.id} insert`);
}

async function applyCitationInsert(client: Client): Promise<string> {
  const action = REVIEWED_ISC_PLENARY_MANIFEST.citationInsert;
  const row = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO "Citation"
        (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
      VALUES ($1, $2, $3, $4, $5::"CitationPurpose", $6)
      RETURNING id
    `,
    [
      row.id,
      row.sourceId,
      row.dealId,
      row.companyId,
      row.purpose,
      row.evidenceLabel,
    ],
  );
  return assertOne(result, `Citation ${action.id} insert`);
}

async function applyActions(client: Client): Promise<MutationIds> {
  return {
    dealUpdates: [await applyDealUpdate(client)],
    companyUpdates: [await applyCompanyUpdate(client)],
    milestoneUpdates: [await applyMilestoneUpdate(client)],
    milestoneInserts: [await applyMilestoneInsert(client)],
    sourceUpdates: [await applySourceUpdate(client)],
    sourceInserts: [await applySourceInsert(client)],
    citationInserts: [await applyCitationInsert(client)],
  };
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  row: T,
): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

function withoutCreatedAt<T extends { createdAt: string }>(
  row: T,
): Omit<T, "createdAt"> {
  const { createdAt: _createdAt, ...rest } = row;
  return rest;
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: IscPlenarySnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const { before, after, mutations } = input;
  exact("Deal mutation IDs", mutations.dealUpdates, [manifest.dealUpdate.id]);
  exact("Company mutation IDs", mutations.companyUpdates, [
    manifest.companyUpdate.id,
  ]);
  exact("Milestone update IDs", mutations.milestoneUpdates, [
    manifest.milestoneUpdate.id,
  ]);
  exact("Milestone insert IDs", mutations.milestoneInserts, [
    manifest.milestoneInsert.id,
  ]);
  exact("Source update IDs", mutations.sourceUpdates, [
    manifest.sourceUpdate.id,
  ]);
  exact("Source insert IDs", mutations.sourceInserts, [
    manifest.sourceInsert.id,
  ]);
  exact("Citation insert IDs", mutations.citationInserts, [
    manifest.citationInsert.id,
  ]);

  if (!after.deal || !after.company || !after.closeSource) {
    throw new Error("Required ISC/Plenary rows are missing after mutation");
  }
  exact("ISC Deal", withoutUpdatedAt(after.deal), manifest.dealUpdate.proposed);
  if (after.deal.updatedAt === before.snapshot.deal?.updatedAt) {
    throw new Error("Deal.updatedAt did not advance");
  }
  exact(
    "Plenary Company",
    withoutUpdatedAt(after.company),
    manifest.companyUpdate.proposed,
  );
  if (after.company.updatedAt === before.snapshot.company?.updatedAt) {
    throw new Error("Company.updatedAt did not advance");
  }
  exact(
    "deal participants",
    sorted(after.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "Plenary ownership rows",
    sorted(after.ownershipRows),
    sorted(manifest.ownershipGuards),
  );
  exact(
    "Plenary milestone rows",
    sorted(after.milestoneRows),
    expectedPostMilestones(),
  );
  exact(
    "Plenary management rows",
    sorted(after.managementRows),
    sorted(manifest.managementGuards),
  );
  exact(
    "ISC/Plenary citation rows",
    sorted(after.citationRows),
    expectedPostCitations(),
  );
  exact(
    "announcement Source",
    after.announcementSource,
    manifest.sourceUpdate.proposed,
  );
  exact(
    "close Source",
    withoutCreatedAt(after.closeSource),
    manifest.sourceInsert.proposed,
  );
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/.test(
      after.closeSource.createdAt,
    )
  ) {
    throw new Error("Inserted close Source createdAt is not a raw wall clock");
  }
  exact("post-insert Source conflicts", after.sourceConflicts, [
    after.closeSource,
  ]);
  exact("post-insert entity IDs", after.entityIdConflicts, [
    { kind: "Citation", id: manifest.citationInsert.id },
    { kind: "Milestone", id: manifest.milestoneInsert.id },
  ]);
  exact("ISC Company rows", after.iscCompanyRows, []);
  exact("live schema", after.schema, before.snapshot.schema);
  exact(
    "table counts",
    after.tableCounts,
    expectedPostTableCounts(before.snapshot.tableCounts),
  );
}

function rollbackRows(plan: IscPlenaryPlan) {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  return {
    deal: manifest.dealUpdate.current,
    company: manifest.companyUpdate.current,
    milestoneUpdate: manifest.milestoneUpdate.current,
    milestoneDelete: { id: manifest.milestoneInsert.id },
    sourceUpdate: manifest.sourceUpdate.current,
    sourceDelete: { id: manifest.sourceInsert.id },
    citationDelete: { id: manifest.citationInsert.id },
    actionSetSha256: plan.actionSetSha256,
  };
}

async function writeJson(
  outputPath: string,
  value: unknown,
  exclusive: boolean,
): Promise<void> {
  const absolutePath = path.resolve(outputPath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    flag: exclusive ? "wx" : "w",
  });
}

async function assertNewReceiptPath(outputPath: string): Promise<void> {
  const absolutePath = path.resolve(outputPath);
  try {
    await access(absolutePath, constants.F_OK);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  throw new Error("Receipt output already exists; choose a new path");
}

async function assertRollbackRestored(
  client: Client,
  before: IscPlenarySnapshot,
): Promise<void> {
  await client.query(
    "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
  );
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  try {
    const restored = await loadSnapshot(client);
    exact("rollback-restored snapshot", restored, before);
    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = hasFlag("apply");
  const target = parseDatabaseTarget(connectionString, apply);
  const approvalHash = option("approval-hash");
  const receiptOutput = option("receipt-output");
  const planOutput = option("plan-output") ?? DEFAULT_PLAN_OUTPUT;

  if (apply && (!approvalHash || !/^[0-9a-f]{64}$/.test(approvalHash))) {
    throw new Error(
      "Apply requires --approval-hash=<exact lowercase SHA-256 from a fresh dry-run>",
    );
  }
  if (!apply && approvalHash) {
    throw new Error("--approval-hash is valid only with --apply");
  }
  if (apply && !receiptOutput) {
    throw new Error("Apply requires --receipt-output=<new JSON path>");
  }
  if (!apply && receiptOutput) {
    throw new Error("--receipt-output is valid only with --apply");
  }
  if (apply && path.resolve(receiptOutput!) === path.resolve(planOutput)) {
    throw new Error("Plan and receipt outputs must use different paths");
  }
  if (apply) await assertNewReceiptPath(receiptOutput!);

  const client = new Client({ connectionString });
  await client.connect();
  let transactionOpen = false;
  try {
    await beginGuardedTransaction(client);
    transactionOpen = true;
    await assertConnectedDatabase(client, target);

    const before = buildPlan(target, await loadSnapshot(client));
    if (before.plan.actionCount !== REVIEWED_ISC_PLENARY_ACTION_COUNT) {
      throw new Error("Plan action count drifted from reviewed scope");
    }
    if (
      before.plan.actionSetSha256 !== REVIEWED_ISC_PLENARY_ACTION_SET_SHA256
    ) {
      throw new Error("Plan action-set SHA-256 drifted from reviewed scope");
    }
    if (apply && approvalHash !== before.planSha256) {
      throw new Error(
        "--approval-hash does not match the exact fresh live plan",
      );
    }

    const planArtifact = {
      generatedAt: new Date().toISOString(),
      mode: apply ? "APPLY" : "DRY_RUN_ROLLBACK",
      planSha256: before.planSha256,
      hashMaterial: before.hashMaterial,
      snapshot: before.snapshot,
      rollback: rollbackRows(before.plan),
    };

    const mutationIds = await applyActions(client);
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations: mutationIds });

    if (!apply) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      await assertRollbackRestored(client, before.snapshot);
      await writeJson(planOutput, planArtifact, false);
      console.log(
        JSON.stringify(
          {
            mode: "DRY_RUN_ROLLBACK",
            planSha256: before.planSha256,
            reviewedManifestSha256: REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
            actionSetSha256: before.plan.actionSetSha256,
            actionCount: before.plan.actionCount,
            mutationIds,
            tableCounts: before.snapshot.tableCounts,
            quarantinedFields: before.plan.quarantinedFields.map(
              (field) => field.field,
            ),
            planOutput: path.resolve(planOutput),
          },
          null,
          2,
        ),
      );
      return;
    }

    await client.query("COMMIT");
    transactionOpen = false;
    const receiptMaterial = {
      schemaVersion: ISC_PLENARY_EXACT_CORRECTION_SCHEMA_VERSION,
      scope: ISC_PLENARY_EXACT_CORRECTION_SCOPE,
      appliedAt: new Date().toISOString(),
      databaseTarget: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      snapshotSha256: before.plan.snapshotSha256,
      actions: before.plan.actions,
      mutationIds,
      before: {
        tableCounts: before.snapshot.tableCounts,
        deal: before.snapshot.deal,
        company: before.snapshot.company,
      },
      after: {
        tableCounts: after.tableCounts,
        deal: after.deal,
        company: after.company,
      },
      rollback: rollbackRows(before.plan),
      quarantinedFields: before.plan.quarantinedFields,
      postconditions: {
        exactMutationIds: true,
        dealClosedOnSupportedDate: true,
        PlenaryCardSynchronized: true,
        LaCaisseParticipantPreserved: true,
        PlenaryOwnershipPreserved: true,
        ISCCompanyNotInserted: true,
        exactDependencySetsVerified: true,
        exactTableCountDeltasVerified: true,
      },
    };
    const receipt = {
      ...receiptMaterial,
      receiptSha256: sha256(receiptMaterial),
    };
    await writeJson(receiptOutput!, receipt, true);
    await writeJson(planOutput, planArtifact, false);
    console.log(
      JSON.stringify(
        {
          mode: "APPLY",
          planSha256: before.planSha256,
          receiptSha256: receipt.receiptSha256,
          receiptOutput: path.resolve(receiptOutput!),
          planOutput: path.resolve(planOutput),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
