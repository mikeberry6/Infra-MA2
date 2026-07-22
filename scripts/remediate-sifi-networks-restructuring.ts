/**
 * Exact-ID, hash-gated remediation planner for the SiFi Networks April 2026
 * ownership close and June 2026 restructuring events.
 *
 * Dry run (default; the database transaction is always rolled back):
 *   npx tsx scripts/remediate-sifi-networks-restructuring.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/sifi-networks-plan.json
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-sifi-networks-restructuring.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/sifi-networks-receipt.json
 *
 * Database timestamps are PostgreSQL `timestamp without time zone` wall-clock
 * values. The snapshot serializes them with `to_char`; it never converts them
 * through JavaScript Date or appends a timezone suffix.
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  REVIEWED_SIFI_NETWORKS_ACTION_COUNT,
  REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256,
  REVIEWED_SIFI_NETWORKS_MANIFEST,
  REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
  SIFI_NETWORKS_RESTRUCTURING_SCHEMA_VERSION,
  SIFI_NETWORKS_RESTRUCTURING_SCOPE,
  buildSifiNetworksPlan,
  type CitationIdentityIndexState,
  type CitationSnapshot,
  type CompanySnapshot,
  type DealSnapshot,
  type MilestoneSnapshot,
  type OwnershipSnapshot,
  type ParticipantSnapshot,
  type SchemaCapabilities,
  type SifiNetworksAction,
  type SifiNetworksPlan,
  type SifiNetworksSnapshot,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/sifi-networks-restructuring";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:sifi-networks-restructuring:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: SifiNetworksSnapshot;
  plan: SifiNetworksPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  dealUpdates: string[];
  companyUpdates: string[];
  citationUpdates: string[];
  milestoneUpdates: string[];
  milestoneDeletes: string[];
  sourceInserts: string[];
  milestoneInserts: string[];
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

async function loadColumnNames(
  client: Client,
  table: string,
): Promise<Set<string>> {
  const result = await client.query<{ columnName: string }>(
    `
      SELECT column_name AS "columnName"
      FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = $1
    `,
    [table],
  );
  return new Set(result.rows.map((row) => row.columnName));
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

async function loadSchemaCapabilities(
  client: Client,
): Promise<SchemaCapabilities> {
  const citationColumns = await loadColumnNames(client, "Citation");
  return {
    citationIsPrimary: citationColumns.has("isPrimary"),
    sourceUrlUnique: await hasReadySourceUrlUniqueIndex(client),
    citationIdentityIndex: await loadCitationIdentityIndexState(client),
  };
}

async function loadDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_SIFI_NETWORKS_MANIFEST.deal.current.id;
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

async function loadCompany(client: Client): Promise<CompanySnapshot | null> {
  const id = REVIEWED_SIFI_NETWORKS_MANIFEST.company.current.id;
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

async function loadOwnershipPeriods(
  client: Client,
): Promise<OwnershipSnapshot[]> {
  const companyId = REVIEWED_SIFI_NETWORKS_MANIFEST.company.current.id;
  const result = await client.query<OwnershipSnapshot>(
    `
      SELECT op.id, op."companyId", op."fundId", f."fundName",
             op."organizationId", o.name AS "organizationName",
             op."vehicleName", op.stake, op."investmentYear", op."exitYear",
             op."isActive", to_char(op."createdAt", $2) AS "createdAt"
      FROM "OwnershipPeriod" op
      LEFT JOIN "Fund" f ON f.id = op."fundId"
      LEFT JOIN "Organization" o ON o.id = op."organizationId"
      WHERE op."companyId" = $1
      ORDER BY op.id
    `,
    [companyId, NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadParticipants(
  client: Client,
): Promise<ParticipantSnapshot[]> {
  const dealId = REVIEWED_SIFI_NETWORKS_MANIFEST.deal.current.id;
  const result = await client.query<ParticipantSnapshot>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName", dp.role::text, dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp."dealId" = $1
      ORDER BY dp.id
    `,
    [dealId],
  );
  return result.rows;
}

async function loadMilestones(client: Client): Promise<MilestoneSnapshot[]> {
  const companyId = REVIEWED_SIFI_NETWORKS_MANIFEST.company.current.id;
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", m.date, m.event, m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      WHERE m."companyId" = $1
      ORDER BY m.id
    `,
    [companyId, NAIVE_MILLIS_FORMAT],
  );
  return result.rows;
}

async function loadCitationToRetag(
  client: Client,
): Promise<CitationSnapshot | null> {
  const id = REVIEWED_SIFI_NETWORKS_MANIFEST.citationUpdate.current.id;
  const result = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci.id = $1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

async function loadCitationUpdateConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const current = REVIEWED_SIFI_NETWORKS_MANIFEST.citationUpdate.current;
  const proposed = REVIEWED_SIFI_NETWORKS_MANIFEST.citationUpdate.proposed;
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
      current.id,
      proposed.sourceId,
      proposed.dealId,
      proposed.companyId,
      proposed.purpose,
      proposed.evidenceLabel,
    ],
  );
  return result.rows;
}

async function loadProposedSourceMatches(
  client: Client,
): Promise<SourceSnapshot[]> {
  const sources = REVIEWED_SIFI_NETWORKS_MANIFEST.insertedSources.map(
    (row) => row.proposed,
  );
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text
      FROM "Source" s
      WHERE s.id = ANY($1::text[]) OR s.url = ANY($2::text[])
      ORDER BY s.id
    `,
    [sources.map((source) => source.id), sources.map((source) => source.url)],
  );
  return result.rows;
}

async function loadProposedCitationMatches(
  client: Client,
): Promise<CitationSnapshot[]> {
  const citations = REVIEWED_SIFI_NETWORKS_MANIFEST.insertedCitations.map(
    (row) => row.proposed,
  );
  const result = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci.id = ANY($1::text[])
         OR (
           ci."companyId" = $2
           AND ci."sourceId" = ANY($3::text[])
           AND EXISTS (
             SELECT 1
             FROM unnest(
               $3::text[], $4::text[], $5::text[], $6::text[], $7::text[]
             ) AS wanted("sourceId", purpose, "evidenceLabel", "dealId", id)
             WHERE wanted."sourceId" = ci."sourceId"
               AND wanted.purpose = ci.purpose::text
               AND wanted."evidenceLabel" IS NOT DISTINCT FROM ci."evidenceLabel"
               AND wanted."dealId" IS NOT DISTINCT FROM ci."dealId"
           )
         )
      ORDER BY ci.id
    `,
    [
      citations.map((citation) => citation.id),
      REVIEWED_SIFI_NETWORKS_MANIFEST.company.current.id,
      citations.map((citation) => citation.sourceId),
      citations.map((citation) => citation.purpose),
      citations.map((citation) => citation.evidenceLabel),
      citations.map((citation) => citation.dealId),
      citations.map((citation) => citation.id),
    ],
  );
  return result.rows;
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "DealParticipant") AS "dealParticipants",
           (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "Source") AS sources,
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load SiFi remediation table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<SifiNetworksSnapshot> {
  const schema = await loadSchemaCapabilities(client);
  const deal = await loadDeal(client);
  const company = await loadCompany(client);
  const ownershipPeriods = await loadOwnershipPeriods(client);
  const participants = await loadParticipants(client);
  const milestones = await loadMilestones(client);
  const citationToRetag = await loadCitationToRetag(client);
  const citationUpdateConflicts = await loadCitationUpdateConflicts(client);
  const proposedSourceMatches = await loadProposedSourceMatches(client);
  const proposedCitationMatches = await loadProposedCitationMatches(client);
  const tableCounts = await loadTableCounts(client);
  return {
    deal,
    company,
    ownershipPeriods,
    participants,
    milestones,
    citationToRetag,
    citationUpdateConflicts,
    proposedSourceMatches,
    proposedCitationMatches,
    schema,
    tableCounts,
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  built: {
    snapshot: SifiNetworksSnapshot;
    plan: SifiNetworksPlan;
  },
) {
  return {
    schemaVersion: SIFI_NETWORKS_RESTRUCTURING_SCHEMA_VERSION,
    scope: SIFI_NETWORKS_RESTRUCTURING_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_SIFI_NETWORKS_ACTION_COUNT,
      actionSetSha256: REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
    },
    snapshotSha256: built.plan.snapshotSha256,
    tableCounts: built.snapshot.tableCounts,
    schema: built.snapshot.schema,
    counts: built.plan.counts,
    actions: built.plan.actions,
    quarantinedFields: built.plan.quarantinedFields,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: SifiNetworksSnapshot,
): BuiltPlan {
  const plan = buildSifiNetworksPlan(snapshot);
  const hashMaterial = planHashMaterial(target, { snapshot, plan });
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
  expectedIsolation: "repeatable read" | "serializable",
): Promise<void> {
  const result = await client.query<{
    database: string;
    isolation: string;
    timezone: string;
  }>(`
    SELECT current_database() AS database,
           current_setting('transaction_isolation') AS isolation,
           current_setting('TimeZone') AS timezone
  `);
  const row = result.rows[0];
  if (row?.database !== target.database) {
    throw new Error(
      `Connected database ${row?.database ?? "<missing>"} does not match ${target.database}`,
    );
  }
  if (row.isolation !== expectedIsolation) {
    throw new Error(
      `Transaction isolation is ${row.isolation}; expected ${expectedIsolation}`,
    );
  }
  if (row.timezone !== "UTC") {
    throw new Error(`Transaction timezone is ${row.timezone}; expected UTC`);
  }
}

async function lockReviewedRows(client: Client): Promise<void> {
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
  await client.query(`SELECT id FROM "Deal" WHERE id = $1 FOR UPDATE`, [
    manifest.deal.current.id,
  ]);
  await client.query(`SELECT id FROM "Company" WHERE id = $1 FOR UPDATE`, [
    manifest.company.current.id,
  ]);
  await client.query(
    `SELECT id FROM "OwnershipPeriod" WHERE "companyId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.company.current.id],
  );
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE "dealId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.deal.current.id],
  );
  await client.query(
    `SELECT id FROM "Milestone" WHERE "companyId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.company.current.id],
  );
  await client.query(`SELECT id FROM "Citation" WHERE id = $1 FOR UPDATE`, [
    manifest.citationUpdate.current.id,
  ]);
  await client.query(
    `SELECT id FROM "Source" WHERE id = ANY($1::text[]) OR url = ANY($2::text[]) ORDER BY id FOR UPDATE`,
    [
      manifest.insertedSources.map((row) => row.proposed.id),
      manifest.insertedSources.map((row) => row.proposed.url),
    ],
  );
  await client.query(
    `SELECT id FROM "Citation" WHERE id = ANY($1::text[]) OR "companyId" = $2 AND "sourceId" = ANY($3::text[]) ORDER BY id FOR UPDATE`,
    [
      manifest.insertedCitations.map((row) => row.proposed.id),
      manifest.company.current.id,
      manifest.insertedCitations.map((row) => row.proposed.sourceId),
    ],
  );
}

function actionsOfType<T extends SifiNetworksAction["actionType"]>(
  actions: SifiNetworksAction[],
  actionType: T,
): Extract<SifiNetworksAction, { actionType: T }>[] {
  return actions.filter(
    (action): action is Extract<SifiNetworksAction, { actionType: T }> =>
      action.actionType === actionType,
  );
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

async function applyDealUpdate(
  client: Client,
  action: Extract<SifiNetworksAction, { actionType: "DEAL_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Deal" d
      SET description = $25,
          "keyHighlights" = $26::text[],
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
      proposed.description,
      proposed.keyHighlights,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Deal ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyCompanyUpdate(
  client: Client,
  action: Extract<SifiNetworksAction, { actionType: "COMPANY_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Company" c
      SET description = $16,
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE c.id = $1
        AND c.name = $2
        AND c.sector::text = $3
        AND c.subsector = $4
        AND c.region::text = $5
        AND c.country = $6
        AND c."countryTags" = $7::text[]
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
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Company ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyCitationUpdate(
  client: Client,
  action: Extract<SifiNetworksAction, { actionType: "CITATION_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Citation" ci
      SET purpose = $10::"CitationPurpose",
          "evidenceLabel" = $11
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
      action.proposed.purpose,
      action.proposed.evidenceLabel,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Citation ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyMilestoneUpdate(
  client: Client,
  action: Extract<SifiNetworksAction, { actionType: "MILESTONE_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Milestone" m
      SET date = $7,
          event = $8,
          category = $9::"MilestoneCategory",
          "sortDate" = $10::timestamp
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
      proposed.category,
      proposed.sortDate,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Milestone ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyMilestoneDeletes(
  client: Client,
  actions: Extract<SifiNetworksAction, { actionType: "MILESTONE_DELETE" }>[],
): Promise<string[]> {
  const deleted: string[] = [];
  for (const action of actions) {
    const current = action.current;
    const result = await client.query<{ id: string }>(
      `
        DELETE FROM "Milestone" m
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
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `Milestone ${action.id} failed its exact delete predicate`,
      );
    }
    deleted.push(result.rows[0].id);
  }
  return deleted.sort();
}

async function applySourceInserts(
  client: Client,
  actions: Extract<SifiNetworksAction, { actionType: "SOURCE_INSERT" }>[],
): Promise<string[]> {
  const inserted: string[] = [];
  for (const action of actions) {
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "Source" (id, label, url, type)
        SELECT $1, $2, $3, $4::"SourceType"
        WHERE NOT EXISTS (
          SELECT 1 FROM "Source" s WHERE s.id = $1 OR s.url = $3
        )
        RETURNING id
      `,
      [proposed.id, proposed.label, proposed.url, proposed.type],
    );
    if (result.rows.length !== 1) {
      throw new Error(`Source ${action.id} failed its exact insert predicate`);
    }
    inserted.push(result.rows[0].id);
  }
  return inserted.sort();
}

async function applyMilestoneInserts(
  client: Client,
  actions: Extract<SifiNetworksAction, { actionType: "MILESTONE_INSERT" }>[],
): Promise<string[]> {
  const inserted: string[] = [];
  for (const action of actions) {
    const proposed = action.proposed;
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO "Milestone" (id, "companyId", date, event, category, "sortDate")
        SELECT $1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp
        WHERE EXISTS (
          SELECT 1 FROM "Company" c WHERE c.id = $2 AND c.name = $7
        )
          AND NOT EXISTS (SELECT 1 FROM "Milestone" m WHERE m.id = $1)
        RETURNING id
      `,
      [
        proposed.id,
        proposed.companyId,
        proposed.date,
        proposed.event,
        proposed.category,
        proposed.sortDate,
        REVIEWED_SIFI_NETWORKS_MANIFEST.company.current.name,
      ],
    );
    if (result.rows.length !== 1) {
      throw new Error(
        `Milestone ${action.id} failed its exact insert predicate`,
      );
    }
    inserted.push(result.rows[0].id);
  }
  return inserted.sort();
}

async function applyCitationInserts(
  client: Client,
  actions: Extract<SifiNetworksAction, { actionType: "CITATION_INSERT" }>[],
  citationIsPrimary: boolean,
): Promise<string[]> {
  const inserted: string[] = [];
  for (const action of actions) {
    const proposed = action.proposed;
    const query = citationIsPrimary
      ? `
          INSERT INTO "Citation"
            (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel", "isPrimary")
          SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6, false
          WHERE EXISTS (
            SELECT 1 FROM "Source" s
            WHERE s.id = $2 AND s.label = $7 AND s.url = $8 AND s.type::text = $9
          )
            AND NOT EXISTS (
              SELECT 1 FROM "Citation" ci
              WHERE ci.id = $1 OR (
                ci."sourceId" = $2
                AND ci."dealId" IS NOT DISTINCT FROM $3
                AND ci."companyId" IS NOT DISTINCT FROM $4
                AND ci.purpose = $5::"CitationPurpose"
                AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
              )
            )
          RETURNING id
        `
      : `
          INSERT INTO "Citation"
            (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
          SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6
          WHERE EXISTS (
            SELECT 1 FROM "Source" s
            WHERE s.id = $2 AND s.label = $7 AND s.url = $8 AND s.type::text = $9
          )
            AND NOT EXISTS (
              SELECT 1 FROM "Citation" ci
              WHERE ci.id = $1 OR (
                ci."sourceId" = $2
                AND ci."dealId" IS NOT DISTINCT FROM $3
                AND ci."companyId" IS NOT DISTINCT FROM $4
                AND ci.purpose = $5::"CitationPurpose"
                AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
              )
            )
          RETURNING id
        `;
    const result = await client.query<{ id: string }>(query, [
      proposed.id,
      proposed.sourceId,
      proposed.dealId,
      proposed.companyId,
      proposed.purpose,
      proposed.evidenceLabel,
      proposed.sourceLabel,
      proposed.sourceUrl,
      proposed.sourceType,
    ]);
    if (result.rows.length !== 1) {
      throw new Error(
        `Citation ${action.id} failed its exact insert predicate`,
      );
    }
    inserted.push(result.rows[0].id);
  }
  return inserted.sort();
}

async function applyApprovedActions(
  client: Client,
  built: BuiltPlan,
): Promise<MutationIds> {
  const actions = built.plan.actions;
  const deal = actionsOfType(actions, "DEAL_UPDATE")[0];
  const company = actionsOfType(actions, "COMPANY_UPDATE")[0];
  const citation = actionsOfType(actions, "CITATION_UPDATE")[0];
  const milestone = actionsOfType(actions, "MILESTONE_UPDATE")[0];
  if (!deal || !company || !citation || !milestone) {
    throw new Error("Approved SiFi action set is structurally incomplete");
  }
  return {
    dealUpdates: await applyDealUpdate(client, deal),
    companyUpdates: await applyCompanyUpdate(client, company),
    citationUpdates: await applyCitationUpdate(client, citation),
    milestoneUpdates: await applyMilestoneUpdate(client, milestone),
    milestoneDeletes: await applyMilestoneDeletes(
      client,
      actionsOfType(actions, "MILESTONE_DELETE"),
    ),
    sourceInserts: await applySourceInserts(
      client,
      actionsOfType(actions, "SOURCE_INSERT"),
    ),
    milestoneInserts: await applyMilestoneInserts(
      client,
      actionsOfType(actions, "MILESTONE_INSERT"),
    ),
    citationInserts: await applyCitationInserts(
      client,
      actionsOfType(actions, "CITATION_INSERT"),
      built.snapshot.schema.citationIsPrimary,
    ),
  };
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  row: T,
): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: SifiNetworksSnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
  const actionIds = <T extends SifiNetworksAction["actionType"]>(type: T) =>
    actionsOfType(input.before.plan.actions, type)
      .map((action) => action.id)
      .sort();

  exact(
    "Updated Deal IDs",
    input.mutations.dealUpdates,
    actionIds("DEAL_UPDATE"),
  );
  exact(
    "Updated Company IDs",
    input.mutations.companyUpdates,
    actionIds("COMPANY_UPDATE"),
  );
  exact(
    "Updated Citation IDs",
    input.mutations.citationUpdates,
    actionIds("CITATION_UPDATE"),
  );
  exact(
    "Updated Milestone IDs",
    input.mutations.milestoneUpdates,
    actionIds("MILESTONE_UPDATE"),
  );
  exact(
    "Deleted Milestone IDs",
    input.mutations.milestoneDeletes,
    actionIds("MILESTONE_DELETE"),
  );
  exact(
    "Inserted Source IDs",
    input.mutations.sourceInserts,
    actionIds("SOURCE_INSERT"),
  );
  exact(
    "Inserted Milestone IDs",
    input.mutations.milestoneInserts,
    actionIds("MILESTONE_INSERT"),
  );
  exact(
    "Inserted Citation IDs",
    input.mutations.citationInserts,
    actionIds("CITATION_INSERT"),
  );

  if (!input.after.deal || !input.after.company) {
    throw new Error("Postcondition failed: SiFi Deal or Company is missing");
  }
  exact(
    "SiFi Deal",
    withoutUpdatedAt(input.after.deal),
    manifest.deal.proposed,
  );
  if (input.after.deal.updatedAt === manifest.deal.current.updatedAt) {
    throw new Error("Postcondition failed: Deal.updatedAt did not advance");
  }
  exact(
    "SiFi Company",
    withoutUpdatedAt(input.after.company),
    manifest.company.proposed,
  );
  if (input.after.company.updatedAt === manifest.company.current.updatedAt) {
    throw new Error("Postcondition failed: Company.updatedAt did not advance");
  }
  exact(
    "SiFi OwnershipPeriod set",
    sorted(input.after.ownershipPeriods),
    sorted(manifest.ownershipGuards),
  );
  exact(
    "SiFi DealParticipant set",
    sorted(input.after.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "SiFi Milestone set",
    sorted(input.after.milestones),
    sorted([
      ...manifest.protectedMilestones,
      manifest.milestoneUpdate.proposed,
      ...manifest.insertedMilestones.map((row) => row.proposed),
    ]),
  );
  exact(
    "SiFi County Times Citation",
    input.after.citationToRetag,
    manifest.citationUpdate.proposed,
  );
  exact(
    "SiFi County Times Citation conflicts",
    input.after.citationUpdateConflicts,
    [],
  );
  exact(
    "SiFi official Source set",
    sorted(input.after.proposedSourceMatches),
    sorted(manifest.insertedSources.map((row) => row.proposed)),
  );
  exact(
    "SiFi official Citation set",
    sorted(input.after.proposedCitationMatches),
    sorted(manifest.insertedCitations.map((row) => row.proposed)),
  );
  exact(
    "Schema capabilities",
    input.after.schema,
    input.before.snapshot.schema,
  );
  exact("Table counts", input.after.tableCounts, {
    ...input.before.snapshot.tableCounts,
    milestones:
      input.before.snapshot.tableCounts.milestones -
      manifest.deletedMilestones.length +
      manifest.insertedMilestones.length,
    sources:
      input.before.snapshot.tableCounts.sources +
      manifest.insertedSources.length,
    citations:
      input.before.snapshot.tableCounts.citations +
      manifest.insertedCitations.length,
  });
  if (
    input.after.deal.target !== "SiFi Networks America LLC" ||
    input.after.company.name !== "SiFi Networks America Limited" ||
    input.after.company.companyStatus !== "ACTIVE"
  ) {
    throw new Error(
      "Postcondition failed: SiFi identity/status quarantine changed",
    );
  }
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

function planArtifact(built: BuiltPlan, dryRun: boolean) {
  return {
    generatedAt: new Date().toISOString(),
    dryRun,
    planSha256: built.planSha256,
    ...built.hashMaterial,
    targetSnapshot: built.snapshot,
  };
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
    if (apply) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        LOCK_KEY,
      ]);
      await lockReviewedRows(client);
    }
    await assertConnectedDatabase(
      client,
      target,
      apply ? "serializable" : "repeatable read",
    );

    const before = buildPlan(target, await loadSnapshot(client));
    if (manifestOutput) {
      await writeJson(manifestOutput, planArtifact(before, !apply));
    }
    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          manifestSha256: REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
          actionSetSha256: before.plan.actionSetSha256,
          actionCount: before.plan.actionCount,
          counts: before.plan.counts,
          sourceUrls: REVIEWED_SIFI_NETWORKS_MANIFEST.insertedSources.map(
            (row) => row.proposed.url,
          ),
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

    const mutations = await applyApprovedActions(client, before);
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: SIFI_NETWORKS_RESTRUCTURING_SCHEMA_VERSION,
      scope: SIFI_NETWORKS_RESTRUCTURING_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      manifestSha256: REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutations,
      rollbackRows: {
        deal: REVIEWED_SIFI_NETWORKS_MANIFEST.deal.current,
        company: REVIEWED_SIFI_NETWORKS_MANIFEST.company.current,
        citation: REVIEWED_SIFI_NETWORKS_MANIFEST.citationUpdate.current,
        updatedMilestone:
          REVIEWED_SIFI_NETWORKS_MANIFEST.milestoneUpdate.current,
        deletedMilestones: REVIEWED_SIFI_NETWORKS_MANIFEST.deletedMilestones,
        insertedMilestoneIds:
          REVIEWED_SIFI_NETWORKS_MANIFEST.insertedMilestones.map(
            (row) => row.proposed.id,
          ),
        insertedCitationIds:
          REVIEWED_SIFI_NETWORKS_MANIFEST.insertedCitations.map(
            (row) => row.proposed.id,
          ),
        insertedSourceIds: REVIEWED_SIFI_NETWORKS_MANIFEST.insertedSources.map(
          (row) => row.proposed.id,
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
        dealTargetPreserved: true,
        dealRemainedClosedWithClosingDateQuarantined: true,
        companyRemainedActive: true,
        ownershipAndParticipantsUnchanged: true,
        acquisitionMilestoneCorrectedToCountyTimesMetadata: true,
        june5AdministrationAndPrepackRecorded: true,
        lowSignalMilestonesDeleted: true,
        officialSourcesAndCitationsInserted: true,
        tableCountDeltasExact: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} exact SiFi corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
