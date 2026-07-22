/**
 * Exact-ID, hash-gated card-parity remediation for Cornerstone Generation,
 * Rover Pipeline, and Vigor Marine Group. Dry-run is the default and always
 * rolls back. Apply requires an exact reviewed plan hash, explicit database
 * target guards, a serializable transaction, and a new receipt path.
 *
 * PostgreSQL `timestamp without time zone` values are serialized as raw wall
 * clocks with `to_char`; they never pass through JavaScript Date.
 *
 * Dry run:
 *   npx tsx scripts/remediate-card-parity-corrections.ts
 *
 * Reviewed apply (not performed by the implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-card-parity-corrections.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=<new JSON path>
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  CARD_PARITY_CORRECTIONS_SCHEMA_VERSION,
  CARD_PARITY_CORRECTIONS_SCOPE,
  REVIEWED_CARD_PARITY_ACTION_COUNT,
  REVIEWED_CARD_PARITY_ACTION_SET_SHA256,
  REVIEWED_CARD_PARITY_MANIFEST,
  REVIEWED_CARD_PARITY_MANIFEST_SHA256,
  buildCardParityCorrectionPlan,
  type CardParityPlan,
  type CardParitySnapshot,
  type CitationIdentityIndexState,
  type CitationSnapshot,
  type CompanyGuard,
  type CompanySnapshot,
  type DealGuard,
  type DealSnapshot,
  type IdCollision,
  type MilestoneSnapshot,
  type OrganizationGuard,
  type OwnershipSnapshot,
  type ParticipantGuard,
  type SchemaCapabilities,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/card-parity-corrections";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:cornerstone-rover-vigor-card-parity:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: CardParitySnapshot;
  plan: CardParityPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  companyUpdates: string[];
  dealUpdates: string[];
  ownershipUpdates: string[];
  milestoneUpdates: string[];
  milestoneInserts: string[];
  sourceInserts: string[];
  citationUpdates: string[];
  citationInserts: string[];
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

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

async function loadCompany(client: Client): Promise<CompanySnapshot | null> {
  const id = REVIEWED_CARD_PARITY_MANIFEST.companyUpdate.id;
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

async function loadCompanyGuards(client: Client): Promise<CompanyGuard[]> {
  const ids = REVIEWED_CARD_PARITY_MANIFEST.companyGuards.map((row) => row.id);
  const result = await client.query<CompanyGuard>(
    `
      SELECT c.id, c.name, c."companyStatus"::text AS "companyStatus",
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

async function loadDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_CARD_PARITY_MANIFEST.dealUpdate.id;
  const result = await client.query<DealSnapshot>(
    `
      SELECT d.id, d."legacyId", d.title, d.target, d.sector::text,
             d.subsector, d.region::text, d.categories::text[],
             to_char(d.date, $2) AS date,
             d.description, d."targetDescription", d.country,
             d."enterpriseValue", d."equityValue", d.stake,
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

async function loadDealGuards(client: Client): Promise<DealGuard[]> {
  const ids = REVIEWED_CARD_PARITY_MANIFEST.dealGuards.map((row) => row.id);
  const result = await client.query<DealGuard>(
    `
      SELECT d.id, d."legacyId", d.target,
             to_char(d.date, $2) AS date,
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

async function loadParticipantGuards(
  client: Client,
): Promise<ParticipantGuard[]> {
  const dealIds = REVIEWED_CARD_PARITY_MANIFEST.dealGuards.map((row) => row.id);
  dealIds.push(REVIEWED_CARD_PARITY_MANIFEST.dealUpdate.id);
  const result = await client.query<ParticipantGuard>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName", dp.role::text, dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp."dealId" = ANY($1::text[])
      ORDER BY dp.id
    `,
    [dealIds],
  );
  return result.rows;
}

async function loadOrganizationGuards(
  client: Client,
): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_CARD_PARITY_MANIFEST.organizationGuards.map(
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

async function loadOwnershipRows(client: Client): Promise<OwnershipSnapshot[]> {
  const companyIds = [
    REVIEWED_CARD_PARITY_MANIFEST.companyUpdate.id,
    ...REVIEWED_CARD_PARITY_MANIFEST.companyGuards.map((row) => row.id),
  ];
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
      WHERE op."companyId" = ANY($1::text[])
      ORDER BY op.id
    `,
    [companyIds, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadMilestoneRows(client: Client): Promise<MilestoneSnapshot[]> {
  const companyIds = [
    REVIEWED_CARD_PARITY_MANIFEST.companyUpdate.id,
    ...REVIEWED_CARD_PARITY_MANIFEST.companyGuards.map((row) => row.id),
  ];
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
             m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m."companyId" = ANY($1::text[])
      ORDER BY m.id
    `,
    [companyIds, NAIVE_MILLIS_FORMAT],
  );
  return result.rows;
}

async function loadSourceGuards(client: Client): Promise<SourceSnapshot[]> {
  const ids = REVIEWED_CARD_PARITY_MANIFEST.sourceGuards.map((row) => row.id);
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text
      FROM "Source" s
      WHERE s.id = ANY($1::text[])
      ORDER BY s.id
    `,
    [ids],
  );
  return result.rows;
}

async function loadProposedSourceMatches(
  client: Client,
): Promise<SourceSnapshot[]> {
  const proposed = REVIEWED_CARD_PARITY_MANIFEST.sourceInserts.map(
    (action) => action.proposed,
  );
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text
      FROM "Source" s
      WHERE s.id = ANY($1::text[]) OR s.url = ANY($2::text[])
      ORDER BY s.id
    `,
    [proposed.map((row) => row.id), proposed.map((row) => row.url)],
  );
  return result.rows;
}

async function loadCitationRows(client: Client): Promise<CitationSnapshot[]> {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  const ids = [
    ...manifest.citationGuards.map((row) => row.id),
    ...manifest.citationInserts.map((action) => action.id),
  ];
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

async function loadProposedCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  const proposals = [
    manifest.citationUpdate.proposed,
    ...manifest.citationInserts.map((action) => action.proposed),
  ];
  const conflicts: CitationSnapshot[] = [];
  for (const proposed of proposals) {
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
    conflicts.push(...result.rows);
  }
  return sorted(conflicts);
}

async function loadProposedIdCollisions(
  client: Client,
): Promise<IdCollision[]> {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  const sourceIds = manifest.sourceInserts.map((action) => action.id);
  const citationIds = manifest.citationInserts.map((action) => action.id);
  const milestoneIds = manifest.milestoneInserts.map((action) => action.id);
  const result = await client.query<IdCollision>(
    `
      SELECT 'Source'::text AS "tableName", s.id
      FROM "Source" s WHERE s.id = ANY($1::text[])
      UNION ALL
      SELECT 'Citation'::text AS "tableName", ci.id
      FROM "Citation" ci WHERE ci.id = ANY($2::text[])
      UNION ALL
      SELECT 'Milestone'::text AS "tableName", m.id
      FROM "Milestone" m WHERE m.id = ANY($3::text[])
      ORDER BY "tableName", id
    `,
    [sourceIds, citationIds, milestoneIds],
  );
  return result.rows;
}

async function hasReadySourceUrlUniqueIndex(client: Client): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_class table_class
      JOIN pg_namespace ns ON ns.oid = table_class.relnamespace
      JOIN pg_index pi ON pi.indrelid = table_class.oid
      JOIN pg_attribute attr
        ON attr.attrelid = table_class.oid
       AND attr.attnum = ANY(pi.indkey)
      WHERE ns.nspname = current_schema()
        AND table_class.relname = 'Source'
        AND attr.attname = 'url'
        AND pi.indisunique
        AND pi.indisvalid
        AND pi.indisready
        AND pi.indnkeyatts = 1
    ) AS exists
  `);
  return result.rows[0]?.exists ?? false;
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
      LEFT JOIN pg_namespace ns ON ns.nspname = current_schema()
      LEFT JOIN pg_class idx
        ON idx.relnamespace = ns.oid
       AND idx.relname = $1
       AND idx.relkind = 'i'
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

async function loadSchemaCapabilities(
  client: Client,
): Promise<SchemaCapabilities> {
  return {
    sourceUrlUnique: await hasReadySourceUrlUniqueIndex(client),
    citationIdentityIndex: await loadCitationIdentityIndexState(client),
  };
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "DealParticipant") AS "dealParticipants",
           (SELECT count(*)::int FROM "Organization") AS organizations,
           (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "Source") AS sources,
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load card-parity table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<CardParitySnapshot> {
  return {
    company: await loadCompany(client),
    companyGuards: await loadCompanyGuards(client),
    deal: await loadDeal(client),
    dealGuards: await loadDealGuards(client),
    participantGuards: await loadParticipantGuards(client),
    organizationGuards: await loadOrganizationGuards(client),
    ownershipRows: await loadOwnershipRows(client),
    milestoneRows: await loadMilestoneRows(client),
    sourceGuards: await loadSourceGuards(client),
    proposedSourceMatches: await loadProposedSourceMatches(client),
    citationRows: await loadCitationRows(client),
    proposedCitationConflicts: await loadProposedCitationConflicts(client),
    proposedIdCollisions: await loadProposedIdCollisions(client),
    schema: await loadSchemaCapabilities(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  snapshot: CardParitySnapshot,
) {
  const plan = buildCardParityCorrectionPlan(snapshot);
  return {
    schemaVersion: CARD_PARITY_CORRECTIONS_SCHEMA_VERSION,
    scope: CARD_PARITY_CORRECTIONS_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_CARD_PARITY_ACTION_COUNT,
      actionSetSha256: REVIEWED_CARD_PARITY_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_CARD_PARITY_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    quarantinedFields: plan.quarantinedFields,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: CardParitySnapshot,
): BuiltPlan {
  const plan = buildCardParityCorrectionPlan(snapshot);
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
  const result = await client.query<{ database: string }>(
    `SELECT current_database() AS database`,
  );
  if (result.rows[0]?.database !== target.database) {
    throw new Error("Connected database does not match parsed DATABASE_URL");
  }
}

async function lockReviewedRows(client: Client): Promise<void> {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  const companyIds = [
    manifest.companyUpdate.id,
    ...manifest.companyGuards.map((row) => row.id),
  ];
  const dealIds = [
    manifest.dealUpdate.id,
    ...manifest.dealGuards.map((row) => row.id),
  ];
  const participantIds = manifest.participantGuards.map((row) => row.id);
  const organizationIds = manifest.organizationGuards.map((row) => row.id);
  const ownershipIds = manifest.ownershipRows.map((row) => row.id);
  const milestoneIds = manifest.milestoneRows.map((row) => row.id);
  const sourceIds = manifest.sourceGuards.map((row) => row.id);
  const citationIds = manifest.citationGuards.map((row) => row.id);
  await client.query(
    `LOCK TABLE "Source", "Citation", "Milestone" IN SHARE ROW EXCLUSIVE MODE`,
  );
  await client.query(
    `SELECT id FROM "Company" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [companyIds],
  );
  await client.query(
    `SELECT id FROM "Deal" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [dealIds],
  );
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [participantIds],
  );
  await client.query(
    `SELECT id FROM "Organization" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [organizationIds],
  );
  await client.query(
    `SELECT id FROM "OwnershipPeriod" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [ownershipIds],
  );
  await client.query(
    `SELECT id FROM "Milestone" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [milestoneIds],
  );
  await client.query(
    `SELECT id FROM "Source" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [sourceIds],
  );
  await client.query(
    `SELECT id FROM "Citation" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [citationIds],
  );
}

async function applyCompanyUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_CARD_PARITY_MANIFEST.companyUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Company" c
      SET description = $16,
          website = $17,
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE c.id = $1
        AND c.name = $2
        AND c.sector::text = $3
        AND c.subsector = $4
        AND c.region::text = $5
        AND c.country = $6
        AND c."countryTags"::text[] = $7::text[]
        AND c.description = $8
        AND c."companyStatus"::text = $9
        AND c.website IS NOT DISTINCT FROM $10
        AND c."yearFounded" IS NOT DISTINCT FROM $11
        AND c.headquarters IS NOT DISTINCT FROM $12
        AND c.status::text = $13
        AND c."createdAt" = $14::timestamp
        AND c."updatedAt" = $15::timestamp
      RETURNING c.id
    `,
    [
      current.id,
      current.name,
      current.sector,
      current.subsector,
      current.region,
      current.country,
      current.countryTags,
      current.description,
      current.companyStatus,
      current.website,
      current.yearFounded,
      current.headquarters,
      current.recordStatus,
      current.createdAt,
      current.updatedAt,
      proposed.description,
      proposed.website,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Company ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyDealUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_CARD_PARITY_MANIFEST.dealUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Deal" d
      SET date = $25::timestamp,
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE d.id = $1
        AND d."legacyId" = $2
        AND d.title = $3
        AND d.target = $4
        AND d.sector::text = $5
        AND d.subsector = $6
        AND d.region::text = $7
        AND d.categories = $8::"DealCategory"[]
        AND d.date = $9::timestamp
        AND d.description = $10
        AND d."targetDescription" = $11
        AND d.country = $12
        AND d."enterpriseValue" IS NOT DISTINCT FROM $13
        AND d."equityValue" IS NOT DISTINCT FROM $14
        AND d.stake IS NOT DISTINCT FROM $15
        AND d."dealStatus"::text = $16
        AND d."closingDate" IS NOT DISTINCT FROM $17::timestamp
        AND d."assetScale" IS NOT DISTINCT FROM $18
        AND d."valuationMultiple" IS NOT DISTINCT FROM $19
        AND d."fundVehicle" IS NOT DISTINCT FROM $20
        AND d."keyHighlights" = $21::text[]
        AND d.status::text = $22
        AND d."createdAt" = $23::timestamp
        AND d."updatedAt" = $24::timestamp
      RETURNING d.id
    `,
    [
      current.id,
      current.legacyId,
      current.title,
      current.target,
      current.sector,
      current.subsector,
      current.region,
      current.categories,
      current.date,
      current.description,
      current.targetDescription,
      current.country,
      current.enterpriseValue,
      current.equityValue,
      current.stake,
      current.dealStatus,
      current.closingDate,
      current.assetScale,
      current.valuationMultiple,
      current.fundVehicle,
      current.keyHighlights,
      current.recordStatus,
      current.createdAt,
      current.updatedAt,
      proposed.date,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Deal ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyOwnershipUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_CARD_PARITY_MANIFEST.ownershipUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "OwnershipPeriod" op
      SET "vehicleName" = $13,
          "investmentYear" = $14
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
        AND EXISTS (
          SELECT 1 FROM "Organization" o
          WHERE o.id = op."organizationId" AND o.name = $12
        )
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
      current.organizationName,
      proposed.vehicleName,
      proposed.investmentYear,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(
      `OwnershipPeriod ${action.id} failed its exact update predicate`,
    );
  }
  return [result.rows[0].id];
}

async function applyMilestoneUpdates(client: Client): Promise<string[]> {
  const ids: string[] = [];
  for (const action of REVIEWED_CARD_PARITY_MANIFEST.milestoneUpdates) {
    const current = action.current;
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
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
    ids.push(result.rows[0].id);
  }
  return ids.sort();
}

async function applyMilestoneInserts(client: Client): Promise<string[]> {
  const ids: string[] = [];
  for (const action of REVIEWED_CARD_PARITY_MANIFEST.milestoneInserts) {
    const row = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "Milestone" (id, "companyId", date, event, category, "sortDate")
        SELECT $1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp
        WHERE EXISTS (
          SELECT 1 FROM "Company" c WHERE c.id = $2 AND c.name = $7
        )
        RETURNING id
      `,
      [
        row.id,
        row.companyId,
        row.date,
        row.event,
        row.category,
        row.sortDate,
        row.companyName,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(`Milestone ${action.id} failed its guarded insert`);
    }
    ids.push(result.rows[0].id);
  }
  return ids.sort();
}

async function applySourceInserts(client: Client): Promise<string[]> {
  const ids: string[] = [];
  for (const action of REVIEWED_CARD_PARITY_MANIFEST.sourceInserts) {
    const row = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "Source" (id, label, url, type)
        VALUES ($1, $2, $3, $4::"SourceType")
        RETURNING id
      `,
      [row.id, row.label, row.url, row.type],
    );
    if (result.rows.length !== 1) {
      throw new Error(`Source ${action.id} failed its exact insert`);
    }
    ids.push(result.rows[0].id);
  }
  return ids.sort();
}

async function applyCitationUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_CARD_PARITY_MANIFEST.citationUpdate;
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
    throw new Error(`Citation ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyCitationInserts(client: Client): Promise<string[]> {
  const ids: string[] = [];
  for (const action of REVIEWED_CARD_PARITY_MANIFEST.citationInserts) {
    const row = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "Citation"
          (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
        SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6
        WHERE EXISTS (
          SELECT 1 FROM "Source" s
          WHERE s.id = $2 AND s.label = $7 AND s.url = $8 AND s.type::text = $9
        )
        RETURNING id
      `,
      [
        row.id,
        row.sourceId,
        row.dealId,
        row.companyId,
        row.purpose,
        row.evidenceLabel,
        row.sourceLabel,
        row.sourceUrl,
        row.sourceType,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(`Citation ${action.id} failed its guarded insert`);
    }
    ids.push(result.rows[0].id);
  }
  return ids.sort();
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  row: T,
): Omit<T, "updatedAt"> {
  const { updatedAt, ...rest } = row;
  void updatedAt;
  return rest;
}

function replaceById<T extends { id: string }>(
  rows: readonly T[],
  replacements: readonly T[],
): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const row of replacements) byId.set(row.id, row);
  return sorted([...byId.values()]);
}

function expectedPostIdCollisions(): IdCollision[] {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  return [
    ...manifest.citationInserts.map((action) => ({
      tableName: "Citation" as const,
      id: action.id,
    })),
    ...manifest.milestoneInserts.map((action) => ({
      tableName: "Milestone" as const,
      id: action.id,
    })),
    ...manifest.sourceInserts.map((action) => ({
      tableName: "Source" as const,
      id: action.id,
    })),
  ].sort(
    (left, right) =>
      left.tableName.localeCompare(right.tableName) ||
      left.id.localeCompare(right.id),
  );
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: CardParitySnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  exact("Company mutation IDs", input.mutations.companyUpdates, [
    manifest.companyUpdate.id,
  ]);
  exact("Deal mutation IDs", input.mutations.dealUpdates, [
    manifest.dealUpdate.id,
  ]);
  exact("Ownership mutation IDs", input.mutations.ownershipUpdates, [
    manifest.ownershipUpdate.id,
  ]);
  exact(
    "Milestone update IDs",
    input.mutations.milestoneUpdates,
    manifest.milestoneUpdates.map((action) => action.id).sort(),
  );
  exact(
    "Milestone insert IDs",
    input.mutations.milestoneInserts,
    manifest.milestoneInserts.map((action) => action.id).sort(),
  );
  exact(
    "Source insert IDs",
    input.mutations.sourceInserts,
    manifest.sourceInserts.map((action) => action.id).sort(),
  );
  exact("Citation update IDs", input.mutations.citationUpdates, [
    manifest.citationUpdate.id,
  ]);
  exact(
    "Citation insert IDs",
    input.mutations.citationInserts,
    manifest.citationInserts.map((action) => action.id).sort(),
  );

  if (!input.after.company) {
    throw new Error("Postcondition failed: Vigor Company is missing");
  }
  exact(
    "Vigor Company state",
    withoutUpdatedAt(input.after.company),
    manifest.companyUpdate.proposed,
  );
  if (
    input.after.company.updatedAt === manifest.companyUpdate.current.updatedAt
  ) {
    throw new Error(
      "Postcondition failed: Vigor Company.updatedAt did not change",
    );
  }
  exact(
    "Company guards",
    sorted(input.after.companyGuards),
    sorted(manifest.companyGuards),
  );
  if (!input.after.deal) {
    throw new Error("Postcondition failed: Vigor Deal is missing");
  }
  exact(
    "Vigor Deal state",
    withoutUpdatedAt(input.after.deal),
    manifest.dealUpdate.proposed,
  );
  if (input.after.deal.updatedAt === manifest.dealUpdate.current.updatedAt) {
    throw new Error(
      "Postcondition failed: Vigor Deal.updatedAt did not change",
    );
  }
  exact(
    "Deal guards",
    sorted(input.after.dealGuards),
    sorted(manifest.dealGuards),
  );
  exact(
    "Participant guards",
    sorted(input.after.participantGuards),
    sorted(manifest.participantGuards),
  );
  exact(
    "Organization guards",
    sorted(input.after.organizationGuards),
    sorted(manifest.organizationGuards),
  );

  const expectedOwnership = replaceById(manifest.ownershipRows, [
    manifest.ownershipUpdate.proposed,
  ]);
  exact("Ownership rows", sorted(input.after.ownershipRows), expectedOwnership);

  const expectedMilestones = replaceById(
    manifest.milestoneRows,
    manifest.milestoneUpdates.map((action) => action.proposed),
  );
  expectedMilestones.push(
    ...manifest.milestoneInserts.map((action) => action.proposed),
  );
  exact(
    "Milestone rows",
    sorted(input.after.milestoneRows),
    sorted(expectedMilestones),
  );

  exact(
    "Source guards",
    sorted(input.after.sourceGuards),
    sorted(manifest.sourceGuards),
  );
  exact(
    "Inserted Sources",
    sorted(input.after.proposedSourceMatches),
    sorted(manifest.sourceInserts.map((action) => action.proposed)),
  );

  const expectedCitations = replaceById(manifest.citationGuards, [
    manifest.citationUpdate.proposed,
  ]);
  expectedCitations.push(
    ...manifest.citationInserts.map((action) => action.proposed),
  );
  exact(
    "Citation rows",
    sorted(input.after.citationRows),
    sorted(expectedCitations),
  );
  if (input.after.proposedCitationConflicts.length > 0) {
    throw new Error("Postcondition failed: Citation identity conflict exists");
  }
  exact(
    "Inserted row ID set",
    input.after.proposedIdCollisions,
    expectedPostIdCollisions(),
  );
  exact(
    "Schema capabilities",
    input.after.schema,
    input.before.snapshot.schema,
  );
  exact("Table counts", input.after.tableCounts, {
    ...input.before.snapshot.tableCounts,
    milestones: input.before.snapshot.tableCounts.milestones + 2,
    sources: input.before.snapshot.tableCounts.sources + 2,
    citations: input.before.snapshot.tableCounts.citations + 3,
  });
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
  const resolved = path.resolve(outputPath);
  try {
    await access(resolved);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
  throw new Error(`Receipt output already exists: ${resolved}`);
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
  if (!apply && approvalHash) {
    throw new Error("--approval-hash is valid only with --apply");
  }
  if (apply && !receiptOutput) {
    throw new Error("Apply requires --receipt-output=<new JSON path>");
  }
  if (!apply && receiptOutput) {
    throw new Error("--receipt-output is valid only with --apply");
  }
  if (receiptOutput) await assertPathAbsent(receiptOutput);
  if (
    manifestOutput &&
    receiptOutput &&
    path.resolve(manifestOutput) === path.resolve(receiptOutput)
  ) {
    throw new Error("Manifest and receipt outputs must use different paths");
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      apply
        ? "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
        : "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    await client.query("SET LOCAL TIME ZONE 'UTC'");
    await assertConnectedDatabase(client, target);
    if (apply) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        LOCK_KEY,
      ]);
      await lockReviewedRows(client);
    }

    const before = buildPlan(target, await loadSnapshot(client));
    const artifact = {
      ...before.hashMaterial,
      generatedAt: new Date().toISOString(),
      dryRun: !apply,
      planSha256: before.planSha256,
    };
    if (manifestOutput) await writeJson(manifestOutput, artifact);
    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          reviewedManifestSha256: REVIEWED_CARD_PARITY_MANIFEST_SHA256,
          actionSetSha256: before.plan.actionSetSha256,
          actionCount: before.plan.actionCount,
          counts: before.plan.counts,
          quarantinedFields: before.plan.quarantinedFields.map(
            (field) => field.field,
          ),
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
      companyUpdates: await applyCompanyUpdate(client),
      dealUpdates: await applyDealUpdate(client),
      ownershipUpdates: await applyOwnershipUpdate(client),
      milestoneUpdates: await applyMilestoneUpdates(client),
      milestoneInserts: await applyMilestoneInserts(client),
      sourceInserts: await applySourceInserts(client),
      citationUpdates: await applyCitationUpdate(client),
      citationInserts: await applyCitationInserts(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: CARD_PARITY_CORRECTIONS_SCHEMA_VERSION,
      scope: CARD_PARITY_CORRECTIONS_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_CARD_PARITY_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutations,
      rollbackRows: {
        company: REVIEWED_CARD_PARITY_MANIFEST.companyUpdate.current,
        deal: REVIEWED_CARD_PARITY_MANIFEST.dealUpdate.current,
        ownership: REVIEWED_CARD_PARITY_MANIFEST.ownershipUpdate.current,
        milestones: REVIEWED_CARD_PARITY_MANIFEST.milestoneUpdates.map(
          (action) => action.current,
        ),
        citation: REVIEWED_CARD_PARITY_MANIFEST.citationUpdate.current,
        insertedMilestoneIds:
          REVIEWED_CARD_PARITY_MANIFEST.milestoneInserts.map(
            (action) => action.id,
          ),
        insertedSourceIds: REVIEWED_CARD_PARITY_MANIFEST.sourceInserts.map(
          (action) => action.id,
        ),
        insertedCitationIds: REVIEWED_CARD_PARITY_MANIFEST.citationInserts.map(
          (action) => action.id,
        ),
      },
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
        fullPriorRowsRecordedForRollback: true,
        announcedAntinOwnershipNotCreated: true,
        cornerstoneEntryAndExitMilestonesCovered: true,
        roverEntryAndExitMilestonesCovered: true,
        vigor2019And2023HistoryCorrected: true,
        vigorDealDateAlignedToOfficialAnnouncement: true,
        officialSourcesAndCitationPurposesExact: true,
        tableCountDeltasExact: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} card-parity corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
