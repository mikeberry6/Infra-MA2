/**
 * Exact-ID, hash-gated remediation for John Laing's completed acquisition of
 * American Roads. Dry-run is the default and always rolls back.
 *
 * PostgreSQL `timestamp without time zone` values are serialized as raw wall
 * clocks with `to_char`; they never pass through JavaScript Date and never
 * receive a timezone suffix.
 *
 * Dry run:
 *   npx tsx scripts/remediate-american-roads-close.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/american-roads-close-plan.json
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-american-roads-close.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/american-roads-close-receipt.json
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  AMERICAN_ROADS_CLOSE_SCHEMA_VERSION,
  AMERICAN_ROADS_CLOSE_SCOPE,
  REVIEWED_AMERICAN_ROADS_ACTION_COUNT,
  REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256,
  REVIEWED_AMERICAN_ROADS_MANIFEST,
  REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
  buildAmericanRoadsClosePlan,
  type AmericanRoadsAction,
  type AmericanRoadsPlan,
  type AmericanRoadsSnapshot,
  type CitationSnapshot,
  type CompanySnapshot,
  type DealSnapshot,
  type MilestoneSnapshot,
  type OrganizationGuard,
  type OwnershipSnapshot,
  type ParticipantSnapshot,
  type SchemaGuards,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/american-roads-close";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:american-roads-john-laing-close:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: AmericanRoadsSnapshot;
  plan: AmericanRoadsPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  dealUpdates: string[];
  participantUpdates: string[];
  ownershipUpdates: string[];
  companyUpdates: string[];
  milestoneUpdates: string[];
  citationUpdates: string[];
  citationDeletes: string[];
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

async function loadDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_AMERICAN_ROADS_MANIFEST.deal.current.id;
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

async function loadParticipants(client: Client): Promise<ParticipantSnapshot[]> {
  const dealId = REVIEWED_AMERICAN_ROADS_MANIFEST.deal.current.id;
  const result = await client.query<ParticipantSnapshot>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName", o.types::text[] AS "organizationTypes",
             o.status::text AS "organizationStatus", dp.role::text,
             dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp."dealId" = $1
      ORDER BY dp.id
    `,
    [dealId],
  );
  return result.rows;
}

async function loadOrganizations(client: Client): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_AMERICAN_ROADS_MANIFEST.organizationGuards.map(
    (organization) => organization.id,
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

async function loadOwnershipPeriods(client: Client): Promise<OwnershipSnapshot[]> {
  const companyId = REVIEWED_AMERICAN_ROADS_MANIFEST.company.current.id;
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

async function loadCompany(client: Client): Promise<CompanySnapshot | null> {
  const id = REVIEWED_AMERICAN_ROADS_MANIFEST.company.current.id;
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

async function loadMilestones(client: Client): Promise<MilestoneSnapshot[]> {
  const companyId = REVIEWED_AMERICAN_ROADS_MANIFEST.company.current.id;
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

async function loadSources(client: Client): Promise<SourceSnapshot[]> {
  const ids = REVIEWED_AMERICAN_ROADS_MANIFEST.sourceGuards.map(
    (source) => source.id,
  );
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

const citationProjection = `
  SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
         ci.purpose::text, ci."evidenceLabel", s.label AS "sourceLabel",
         s.url AS "sourceUrl", s.type::text AS "sourceType"
  FROM "Citation" ci
  JOIN "Source" s ON s.id = ci."sourceId"
`;

async function loadCitations(client: Client): Promise<CitationSnapshot[]> {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  const result = await client.query<CitationSnapshot>(
    `${citationProjection}
      WHERE ci."dealId" = $1 OR ci."companyId" = $2
      ORDER BY ci.id
    `,
    [manifest.deal.current.id, manifest.company.current.id],
  );
  return result.rows;
}

async function loadProposedSourceConflicts(
  client: Client,
): Promise<SourceSnapshot[]> {
  const proposed = REVIEWED_AMERICAN_ROADS_MANIFEST.sourceInserts.map(
    (insert) => insert.proposed,
  );
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text
      FROM "Source" s
      WHERE s.id = ANY($1::text[]) OR s.url = ANY($2::text[])
      ORDER BY s.id
    `,
    [
      proposed.map((source) => source.id),
      proposed.map((source) => source.url),
    ],
  );
  return result.rows;
}

async function loadProposedCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const proposed = REVIEWED_AMERICAN_ROADS_MANIFEST.citationInserts.map(
    (insert) => insert.proposed,
  );
  const result = await client.query<CitationSnapshot>(
    `
      WITH proposed AS (
        SELECT *
        FROM jsonb_to_recordset($1::jsonb) AS p(
          id text,
          "sourceId" text,
          "dealId" text,
          "companyId" text,
          purpose text,
          "evidenceLabel" text
        )
      )
      ${citationProjection}
      WHERE EXISTS (
        SELECT 1
        FROM proposed p
        WHERE ci.id = p.id
           OR (
             ci."sourceId" = p."sourceId"
             AND ci."dealId" IS NOT DISTINCT FROM p."dealId"
             AND ci."companyId" IS NOT DISTINCT FROM p."companyId"
             AND ci.purpose::text = p.purpose
             AND ci."evidenceLabel" IS NOT DISTINCT FROM p."evidenceLabel"
           )
      )
      ORDER BY ci.id
    `,
    [JSON.stringify(proposed)],
  );
  return result.rows;
}

async function hasReadySourceUrlUniqueIndex(client: Client): Promise<boolean> {
  const result = await client.query<{ ready: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_class table_class
      JOIN pg_namespace ns ON ns.oid = table_class.relnamespace
      JOIN pg_index pi ON pi.indrelid = table_class.oid
      WHERE ns.nspname = current_schema()
        AND table_class.relname = 'Source'
        AND pi.indisunique
        AND pi.indisvalid
        AND pi.indisready
        AND pi.indpred IS NULL
        AND pi.indnkeyatts = 1
        AND ARRAY[
          pg_get_indexdef(pi.indexrelid, 1, true)
        ] = ARRAY['url']::text[]
    ) AS ready
  `);
  return result.rows[0]?.ready ?? false;
}

async function hasReadyCitationIdentityIndex(client: Client): Promise<boolean> {
  const result = await client.query<{ ready: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_class idx
        JOIN pg_namespace ns ON ns.oid = idx.relnamespace
        JOIN pg_index pi ON pi.indexrelid = idx.oid
        JOIN pg_class table_class ON table_class.oid = pi.indrelid
        WHERE ns.nspname = current_schema()
          AND idx.relname = $1
          AND table_class.relname = 'Citation'
          AND pi.indisunique
          AND pi.indisvalid
          AND pi.indisready
          AND pi.indnullsnotdistinct
          AND pi.indnkeyatts = 5
          AND ARRAY[
            pg_get_indexdef(pi.indexrelid, 1, true),
            pg_get_indexdef(pi.indexrelid, 2, true),
            pg_get_indexdef(pi.indexrelid, 3, true),
            pg_get_indexdef(pi.indexrelid, 4, true),
            pg_get_indexdef(pi.indexrelid, 5, true)
          ] = ARRAY[
            '"companyId"', '"sourceId"', 'purpose', '"evidenceLabel"', '"dealId"'
          ]::text[]
          AND regexp_replace(
            pg_get_expr(pi.indpred, pi.indrelid),
            '[()[:space:]]',
            '',
            'g'
          ) = '"companyId"ISNOTNULL'
      ) AS ready
    `,
    [CITATION_IDENTITY_INDEX],
  );
  return result.rows[0]?.ready ?? false;
}

async function loadSchemaGuards(client: Client): Promise<SchemaGuards> {
  return {
    sourceUrlUniqueReady: await hasReadySourceUrlUniqueIndex(client),
    citationCompanyIdentityUniqueReady:
      await hasReadyCitationIdentityIndex(client),
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
  if (!row) throw new Error("Could not load American Roads table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<AmericanRoadsSnapshot> {
  // Keep reads sequential for compatibility with pg clients that reject
  // concurrent queries on one connection.
  return {
    deal: await loadDeal(client),
    participants: await loadParticipants(client),
    organizations: await loadOrganizations(client),
    ownershipPeriods: await loadOwnershipPeriods(client),
    company: await loadCompany(client),
    milestones: await loadMilestones(client),
    sources: await loadSources(client),
    citations: await loadCitations(client),
    proposedSourceConflicts: await loadProposedSourceConflicts(client),
    proposedCitationConflicts: await loadProposedCitationConflicts(client),
    schema: await loadSchemaGuards(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  snapshot: AmericanRoadsSnapshot,
) {
  const plan = buildAmericanRoadsClosePlan(snapshot);
  return {
    schemaVersion: AMERICAN_ROADS_CLOSE_SCHEMA_VERSION,
    scope: AMERICAN_ROADS_CLOSE_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_AMERICAN_ROADS_ACTION_COUNT,
      actionSetSha256: REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    actionSetSha256: plan.actionSetSha256,
    tableCounts: snapshot.tableCounts,
    schema: snapshot.schema,
    counts: plan.counts,
    actions: plan.actions,
    quarantinedFields: plan.quarantinedFields,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: AmericanRoadsSnapshot,
): BuiltPlan {
  const plan = buildAmericanRoadsClosePlan(snapshot);
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
  expectedIsolation: "repeatable read" | "serializable",
  expectedReadOnly: boolean,
): Promise<void> {
  const result = await client.query<{
    database: string;
    isolation: string;
    timezone: string;
    readOnly: string;
  }>(`
    SELECT current_database() AS database,
           current_setting('transaction_isolation') AS isolation,
           current_setting('TimeZone') AS timezone,
           current_setting('transaction_read_only') AS "readOnly"
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
  const readOnly = row.readOnly === "on";
  if (readOnly !== expectedReadOnly) {
    throw new Error(
      `Transaction read-only state is ${row.readOnly}; expected ${expectedReadOnly ? "on" : "off"}`,
    );
  }
  if (row.timezone !== "UTC") {
    throw new Error(`Transaction timezone is ${row.timezone}; expected UTC`);
  }
}

async function lockReviewedRows(client: Client): Promise<void> {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  const proposedSources = manifest.sourceInserts.map((insert) => insert.proposed);
  const proposedCitations = manifest.citationInserts.map(
    (insert) => insert.proposed,
  );
  await client.query(`SELECT id FROM "Deal" WHERE id = $1 FOR UPDATE`, [
    manifest.deal.current.id,
  ]);
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE "dealId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.deal.current.id],
  );
  await client.query(
    `SELECT id FROM "Organization" WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE`,
    [manifest.organizationGuards.map((organization) => organization.id)],
  );
  await client.query(
    `SELECT id FROM "OwnershipPeriod" WHERE "companyId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.company.current.id],
  );
  await client.query(`SELECT id FROM "Company" WHERE id = $1 FOR UPDATE`, [
    manifest.company.current.id,
  ]);
  await client.query(
    `SELECT id FROM "Milestone" WHERE "companyId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.company.current.id],
  );
  await client.query(
    `
      SELECT id
      FROM "Source"
      WHERE id = ANY($1::text[]) OR url = ANY($2::text[])
      ORDER BY id
      FOR UPDATE
    `,
    [
      [
        ...manifest.sourceGuards.map((source) => source.id),
        ...proposedSources.map((source) => source.id),
      ],
      proposedSources.map((source) => source.url),
    ],
  );
  await client.query(
    `
      SELECT id
      FROM "Citation"
      WHERE "dealId" = $1
         OR "companyId" = $2
         OR id = ANY($3::text[])
      ORDER BY id
      FOR UPDATE
    `,
    [
      manifest.deal.current.id,
      manifest.company.current.id,
      proposedCitations.map((citation) => citation.id),
    ],
  );
}

function actionsOfType<T extends AmericanRoadsAction["actionType"]>(
  actions: AmericanRoadsAction[],
  actionType: T,
): Extract<AmericanRoadsAction, { actionType: T }>[] {
  return actions.filter(
    (action): action is Extract<AmericanRoadsAction, { actionType: T }> =>
      action.actionType === actionType,
  );
}

function assertReturnedIds(
  label: string,
  actual: Array<{ id: string }>,
  expected: string[],
): string[] {
  const actualIds = actual.map((row) => row.id).sort();
  const expectedIds = [...expected].sort();
  if (sha256(actualIds) !== sha256(expectedIds)) {
    throw new Error(`${label} returned IDs outside the approved action set`);
  }
  return actualIds;
}

async function applyDealUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "DEAL_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Deal" d
      SET title = $25,
          description = $26,
          "targetDescription" = $27,
          "dealStatus" = $28::"DealStatusEnum",
          "closingDate" = $29::timestamp,
          "assetScale" = $30,
          "keyHighlights" = $31::text[],
          "updatedAt" = clock_timestamp() AT TIME ZONE 'UTC'
      WHERE d.id = $1
        AND d."legacyId" = $2
        AND d.title = $3
        AND d.target = $4
        AND d.sector::text = $5
        AND d.subsector = $6
        AND d.region::text = $7
        AND d.categories::text[] = $8::text[]
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
      proposed.title,
      proposed.description,
      proposed.targetDescription,
      proposed.dealStatus,
      proposed.closingDate,
      proposed.assetScale,
      proposed.keyHighlights,
    ],
  );
  return assertReturnedIds("Deal update", result.rows, [action.id]);
}

async function applyParticipantUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "PARTICIPANT_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "DealParticipant" dp
      SET "organizationId" = $10,
          "displayName" = $11
      WHERE dp.id = $1
        AND dp."dealId" = $2
        AND dp."organizationId" = $3
        AND dp.role::text = $4
        AND dp."displayName" IS NOT DISTINCT FROM $5
        AND EXISTS (
          SELECT 1
          FROM "Organization" old_org
          WHERE old_org.id = dp."organizationId"
            AND old_org.name = $6
            AND old_org.types::text[] = $7::text[]
            AND old_org.status::text = $8
        )
        AND EXISTS (
          SELECT 1
          FROM "Organization" new_org
          WHERE new_org.id = $10
            AND new_org.name = $9
        )
      RETURNING dp.id
    `,
    [
      current.id,
      current.dealId,
      current.organizationId,
      current.role,
      current.displayName,
      current.organizationName,
      current.organizationTypes,
      current.organizationStatus,
      proposed.organizationName,
      proposed.organizationId,
      proposed.displayName,
    ],
  );
  return assertReturnedIds("DealParticipant update", result.rows, [action.id]);
}

async function applyOwnershipUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "OWNERSHIP_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "OwnershipPeriod" op
      SET "fundId" = $16,
          "organizationId" = $17,
          "vehicleName" = $18,
          stake = $19,
          "investmentYear" = $20,
          "exitYear" = $21,
          "isActive" = $22
      WHERE op.id = $1
        AND op."companyId" = $2
        AND op."fundId" IS NOT DISTINCT FROM $4
        AND op."organizationId" IS NOT DISTINCT FROM $6
        AND op."vehicleName" IS NOT DISTINCT FROM $8
        AND op.stake IS NOT DISTINCT FROM $9
        AND op."investmentYear" IS NOT DISTINCT FROM $10
        AND op."exitYear" IS NOT DISTINCT FROM $11
        AND op."isActive" = $12
        AND op."createdAt" = $13::timestamp
        AND EXISTS (
          SELECT 1 FROM "Company" c
          WHERE c.id = op."companyId" AND c.name = $3
        )
        AND (
          ($4::text IS NULL AND $5::text IS NULL)
          OR EXISTS (
            SELECT 1 FROM "Fund" f
            WHERE f.id = op."fundId" AND f."fundName" = $5
          )
        )
        AND (
          ($6::text IS NULL AND $7::text IS NULL)
          OR EXISTS (
            SELECT 1 FROM "Organization" o
            WHERE o.id = op."organizationId" AND o.name = $7
          )
        )
        AND (
          ($16::text IS NULL AND $14::text IS NULL)
          OR EXISTS (
            SELECT 1 FROM "Fund" f
            WHERE f.id = $16 AND f."fundName" = $14
          )
        )
        AND (
          ($17::text IS NULL AND $15::text IS NULL)
          OR EXISTS (
            SELECT 1 FROM "Organization" o
            WHERE o.id = $17 AND o.name = $15
          )
        )
      RETURNING op.id
    `,
    [
      current.id,
      current.companyId,
      current.companyName,
      current.fundId,
      current.fundName,
      current.organizationId,
      current.organizationName,
      current.vehicleName,
      current.stake,
      current.investmentYear,
      current.exitYear,
      current.isActive,
      current.createdAt,
      proposed.fundName,
      proposed.organizationName,
      proposed.fundId,
      proposed.organizationId,
      proposed.vehicleName,
      proposed.stake,
      proposed.investmentYear,
      proposed.exitYear,
      proposed.isActive,
    ],
  );
  return assertReturnedIds("OwnershipPeriod update", result.rows, [action.id]);
}

async function applyCompanyUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "COMPANY_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Company" c
      SET description = $18,
          website = $19,
          headquarters = $20,
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
        AND $16 = $1
        AND $17 = $2
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
      proposed.id,
      proposed.name,
      proposed.description,
      proposed.website,
      proposed.headquarters,
    ],
  );
  return assertReturnedIds("Company update", result.rows, [action.id]);
}

async function applyMilestoneUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "MILESTONE_UPDATE" }>,
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
  return assertReturnedIds("Milestone update", result.rows, [action.id]);
}

async function applyCitationUpdate(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "CITATION_UPDATE" }>,
): Promise<string[]> {
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Citation" ci
      SET "sourceId" = $10,
          "dealId" = $11,
          "companyId" = $12,
          purpose = $13::"CitationPurpose",
          "evidenceLabel" = $14
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
      proposed.sourceId,
      proposed.dealId,
      proposed.companyId,
      proposed.purpose,
      proposed.evidenceLabel,
    ],
  );
  return assertReturnedIds("Citation update", result.rows, [action.id]);
}

async function applyCitationDelete(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "CITATION_DELETE" }>,
): Promise<string[]> {
  const current = action.current;
  const result = await client.query<{ id: string }>(
    `
      DELETE FROM "Citation" ci
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
    ],
  );
  return assertReturnedIds("Citation delete", result.rows, [action.id]);
}

async function applySourceInsert(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "SOURCE_INSERT" }>,
): Promise<string[]> {
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
  return assertReturnedIds("Source insert", result.rows, [action.id]);
}

async function applyCitationInsert(
  client: Client,
  action: Extract<AmericanRoadsAction, { actionType: "CITATION_INSERT" }>,
): Promise<string[]> {
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO "Citation"
        (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
      SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6
      WHERE EXISTS (
        SELECT 1 FROM "Source" s
        WHERE s.id = $2
          AND s.label = $7
          AND s.url = $8
          AND s.type::text = $9
      )
        AND EXISTS (SELECT 1 FROM "Deal" d WHERE d.id = $3)
        AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $4)
        AND NOT EXISTS (
          SELECT 1
          FROM "Citation" ci
          WHERE ci.id = $1
             OR (
               ci."sourceId" = $2
               AND ci."dealId" IS NOT DISTINCT FROM $3
               AND ci."companyId" IS NOT DISTINCT FROM $4
               AND ci.purpose::text = $5::text
               AND ci."evidenceLabel" IS NOT DISTINCT FROM $6
             )
        )
      RETURNING id
    `,
    [
      proposed.id,
      proposed.sourceId,
      proposed.dealId,
      proposed.companyId,
      proposed.purpose,
      proposed.evidenceLabel,
      proposed.sourceLabel,
      proposed.sourceUrl,
      proposed.sourceType,
    ],
  );
  return assertReturnedIds("Citation insert", result.rows, [action.id]);
}

async function applyApprovedActions(
  client: Client,
  built: BuiltPlan,
): Promise<MutationIds> {
  const actions = built.plan.actions;
  const deals = actionsOfType(actions, "DEAL_UPDATE");
  const participants = actionsOfType(actions, "PARTICIPANT_UPDATE");
  const ownerships = actionsOfType(actions, "OWNERSHIP_UPDATE");
  const companies = actionsOfType(actions, "COMPANY_UPDATE");
  const milestones = actionsOfType(actions, "MILESTONE_UPDATE");
  const citationUpdates = actionsOfType(actions, "CITATION_UPDATE");
  const citationDeletes = actionsOfType(actions, "CITATION_DELETE");
  const sourceInserts = actionsOfType(actions, "SOURCE_INSERT");
  const citationInserts = actionsOfType(actions, "CITATION_INSERT");

  if (
    deals.length !== 1 ||
    participants.length !== 1 ||
    ownerships.length !== 2 ||
    companies.length !== 1 ||
    milestones.length !== 3 ||
    citationUpdates.length !== 2 ||
    citationDeletes.length !== 10 ||
    sourceInserts.length !== 2 ||
    citationInserts.length !== 2
  ) {
    throw new Error("Approved American Roads action set is structurally incomplete");
  }

  const mutations: MutationIds = {
    dealUpdates: await applyDealUpdate(client, deals[0]),
    participantUpdates: await applyParticipantUpdate(client, participants[0]),
    ownershipUpdates: [],
    companyUpdates: await applyCompanyUpdate(client, companies[0]),
    milestoneUpdates: [],
    citationUpdates: [],
    citationDeletes: [],
    sourceInserts: [],
    citationInserts: [],
  };
  for (const action of ownerships) {
    mutations.ownershipUpdates.push(...(await applyOwnershipUpdate(client, action)));
  }
  for (const action of milestones) {
    mutations.milestoneUpdates.push(...(await applyMilestoneUpdate(client, action)));
  }
  for (const action of citationUpdates) {
    mutations.citationUpdates.push(...(await applyCitationUpdate(client, action)));
  }
  for (const action of citationDeletes) {
    mutations.citationDeletes.push(...(await applyCitationDelete(client, action)));
  }
  for (const action of sourceInserts) {
    mutations.sourceInserts.push(...(await applySourceInsert(client, action)));
  }
  for (const action of citationInserts) {
    mutations.citationInserts.push(...(await applyCitationInsert(client, action)));
  }

  for (const key of Object.keys(mutations) as Array<keyof MutationIds>) {
    mutations[key].sort();
  }
  return mutations;
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  value: T,
): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = value;
  return rest;
}

function expectedFinalCitations(): CitationSnapshot[] {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  const deleteIds = new Set(
    manifest.citationDeletes.map((deletion) => deletion.current.id),
  );
  const updates = new Map(
    manifest.citationUpdates.map((update) => [
      update.current.id,
      update.proposed,
    ]),
  );
  return sorted(
    manifest.citationsCurrent
      .filter((citation) => !deleteIds.has(citation.id))
      .map((citation) => updates.get(citation.id) ?? citation)
      .concat(manifest.citationInserts.map((insert) => insert.proposed)),
  );
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: AmericanRoadsSnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  const actions = input.before.plan.actions;
  const ids = (actionType: AmericanRoadsAction["actionType"]): string[] =>
    actions
      .filter((action) => action.actionType === actionType)
      .map((action) => action.id)
      .sort();

  exact("Deal mutation IDs", input.mutations.dealUpdates, ids("DEAL_UPDATE"));
  exact(
    "Participant mutation IDs",
    input.mutations.participantUpdates,
    ids("PARTICIPANT_UPDATE"),
  );
  exact(
    "Ownership mutation IDs",
    input.mutations.ownershipUpdates,
    ids("OWNERSHIP_UPDATE"),
  );
  exact(
    "Company mutation IDs",
    input.mutations.companyUpdates,
    ids("COMPANY_UPDATE"),
  );
  exact(
    "Milestone mutation IDs",
    input.mutations.milestoneUpdates,
    ids("MILESTONE_UPDATE"),
  );
  exact(
    "Citation-update mutation IDs",
    input.mutations.citationUpdates,
    ids("CITATION_UPDATE"),
  );
  exact(
    "Citation-delete mutation IDs",
    input.mutations.citationDeletes,
    ids("CITATION_DELETE"),
  );
  exact(
    "Source-insert mutation IDs",
    input.mutations.sourceInserts,
    ids("SOURCE_INSERT"),
  );
  exact(
    "Citation-insert mutation IDs",
    input.mutations.citationInserts,
    ids("CITATION_INSERT"),
  );

  if (!input.after.deal || !input.after.company) {
    throw new Error("Postcondition failed: American Roads Deal or Company missing");
  }
  exact(
    "Deal",
    withoutUpdatedAt(input.after.deal),
    manifest.deal.proposed,
  );
  if (input.after.deal.updatedAt === manifest.deal.current.updatedAt) {
    throw new Error("Postcondition failed: Deal.updatedAt did not change");
  }
  exact(
    "DealParticipant set",
    sorted(input.after.participants),
    sorted([
      manifest.buyerParticipant.proposed,
      manifest.sellerParticipantGuard,
    ]),
  );
  exact(
    "Organization guard set",
    sorted(input.after.organizations),
    sorted(manifest.organizationGuards),
  );
  exact(
    "OwnershipPeriod set",
    sorted(input.after.ownershipPeriods),
    sorted(manifest.ownershipUpdates.map((update) => update.proposed)),
  );
  exact(
    "Company",
    withoutUpdatedAt(input.after.company),
    manifest.company.proposed,
  );
  if (input.after.company.updatedAt === manifest.company.current.updatedAt) {
    throw new Error("Postcondition failed: Company.updatedAt did not change");
  }
  exact(
    "Milestone set",
    sorted(input.after.milestones),
    sorted(manifest.milestoneUpdates.map((update) => update.proposed)),
  );
  exact(
    "Protected source guard set",
    sorted(input.after.sources),
    sorted(manifest.sourceGuards),
  );
  exact("Final citation set", sorted(input.after.citations), expectedFinalCitations());
  exact(
    "Inserted source set",
    sorted(input.after.proposedSourceConflicts),
    sorted(manifest.sourceInserts.map((insert) => insert.proposed)),
  );
  exact(
    "Inserted citation set",
    sorted(input.after.proposedCitationConflicts),
    sorted(manifest.citationInserts.map((insert) => insert.proposed)),
  );
  exact("Schema guards", input.after.schema, input.before.snapshot.schema);
  exact("Table-count deltas", input.after.tableCounts, {
    ...input.before.snapshot.tableCounts,
    sources:
      input.before.snapshot.tableCounts.sources +
      input.before.plan.counts.sourceInserts,
    citations:
      input.before.snapshot.tableCounts.citations -
      input.before.plan.counts.citationDeletes +
      input.before.plan.counts.citationInserts,
  });

  const reviewedState = JSON.stringify({
    deal: input.after.deal,
    participant: input.after.participants,
    ownership: input.after.ownershipPeriods,
    company: input.after.company,
    milestones: input.after.milestones,
    citations: input.after.citations,
  });
  if (/Equitix|John Laing Investments Limited|\bJLIL\b/i.test(reviewedState)) {
    throw new Error("Postcondition failed: unsupported Equitix/JLIL claim remains");
  }
  if (input.after.deal.closingDate !== null) {
    throw new Error("Postcondition failed: exact legal closing date was inferred");
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
    ...built.hashMaterial,
    generatedAt: new Date().toISOString(),
    dryRun,
    planSha256: built.planSha256,
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
    await assertConnectedDatabase(
      client,
      target,
      apply ? "serializable" : "repeatable read",
      !apply,
    );
    if (apply) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [LOCK_KEY]);
      await lockReviewedRows(client);
    }

    const before = buildPlan(target, await loadSnapshot(client));
    if (manifestOutput) {
      await writeJson(manifestOutput, planArtifact(before, !apply));
    }
    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          reviewedManifestSha256: REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
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

    const mutations = await applyApprovedActions(client, before);
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: AMERICAN_ROADS_CLOSE_SCHEMA_VERSION,
      scope: AMERICAN_ROADS_CLOSE_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutations,
      rollbackRows: {
        deal: REVIEWED_AMERICAN_ROADS_MANIFEST.deal.current,
        participant: REVIEWED_AMERICAN_ROADS_MANIFEST.buyerParticipant.current,
        ownershipPeriods: REVIEWED_AMERICAN_ROADS_MANIFEST.ownershipUpdates.map(
          (update) => update.current,
        ),
        company: REVIEWED_AMERICAN_ROADS_MANIFEST.company.current,
        milestones: REVIEWED_AMERICAN_ROADS_MANIFEST.milestoneUpdates.map(
          (update) => update.current,
        ),
        citationUpdates: REVIEWED_AMERICAN_ROADS_MANIFEST.citationUpdates.map(
          (update) => update.current,
        ),
        deletedCitations: REVIEWED_AMERICAN_ROADS_MANIFEST.citationDeletes.map(
          (deletion) => deletion.current,
        ),
        createdSourceIds: mutations.sourceInserts,
        createdCitationIds: mutations.citationInserts,
      },
      quarantinedFields: before.plan.quarantinedFields,
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
        buyerAndCurrentOwnerAreJohnLaing: true,
        cvcDifExitRecorded: true,
        unsupportedEquitixAndJlilClaimsRemoved: true,
        legalClosingDateRemainedNull: true,
        exactMilestonesAndOfficialSources: true,
        duplicateCitationsConsolidated: true,
        tableCountDeltasExact: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} exact American Roads corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
