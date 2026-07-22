/**
 * Exact-ID, hash-gated remediation for Talen Energy's completed acquisition
 * of Cornerstone Generation. Dry-run is the default and always rolls back.
 * Database timestamps are serialized as raw PostgreSQL
 * `timestamp without time zone` wall-clock strings. They are never converted
 * through JavaScript Date or given a timezone suffix.
 *
 * Dry run:
 *   npm run db:portfolio:cornerstone-talen-close -- \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/cornerstone-talen-close-plan.json
 *
 * Reviewed apply (not performed by the audit run):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npm run db:portfolio:cornerstone-talen-close -- \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/cornerstone-talen-close-receipt.json
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  CORNERSTONE_CITATION_REQUIREMENTS,
  CORNERSTONE_SOURCE_REQUIREMENTS,
  CORNERSTONE_TALEN_CLOSE_SCHEMA_VERSION,
  CORNERSTONE_TALEN_CLOSE_SCOPE,
  REVIEWED_CORNERSTONE_TALEN_MANIFEST,
  REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
  buildCornerstoneTalenClosePlan,
  type CitationIdentityIndexState,
  type CitationSnapshot,
  type CompanySnapshot,
  type CornerstoneTalenAction,
  type CornerstoneTalenPlan,
  type CornerstoneTalenSnapshot,
  type DealParticipantSnapshot,
  type DealSnapshot,
  type MilestoneSnapshot,
  type OrganizationGuard,
  type OwnershipSnapshot,
  type SchemaCapabilities,
  type SourceRequirement,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/cornerstone-talen-close";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:cornerstone-talen-close:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: CornerstoneTalenSnapshot;
  plan: CornerstoneTalenPlan;
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
  const citation = await loadColumnNames(client, "Citation");
  const company = await loadColumnNames(client, "Company");
  const deal = await loadColumnNames(client, "Deal");
  return {
    citationIsPrimary: citation.has("isPrimary"),
    companyLastVerifiedAt: company.has("lastVerifiedAt"),
    dealLastVerifiedAt: deal.has("lastVerifiedAt"),
    dealSellerDisclosure:
      deal.has("sellerDisclosureStatus") && deal.has("sellerDisclosureReason"),
    sourceUrlUnique: await hasReadySourceUrlUniqueIndex(client),
    citationIdentityIndex: await loadCitationIdentityIndexState(client),
  };
}

const rawWallClock = (expression: string, format = NAIVE_MILLIS_FORMAT): string =>
  `to_char(${expression}, '${format}')`;

async function loadDeal(
  client: Client,
  schema: SchemaCapabilities,
): Promise<DealSnapshot | null> {
  const sellerProjection = schema.dealSellerDisclosure
    ? `d."sellerDisclosureStatus"::text AS "sellerDisclosureStatus",
       d."sellerDisclosureReason" AS "sellerDisclosureReason"`
    : `'LEGACY_UNREVIEWED'::text AS "sellerDisclosureStatus",
       NULL::text AS "sellerDisclosureReason"`;
  const verifiedProjection = schema.dealLastVerifiedAt
    ? `${rawWallClock('d."lastVerifiedAt"', NAIVE_MICROS_FORMAT)} AS "lastVerifiedAt"`
    : `NULL::text AS "lastVerifiedAt"`;
  const result = await client.query<DealSnapshot>(`
    SELECT d.id, d."legacyId", d.title, d.target, d.sector::text,
           d.subsector, d.region::text, d.categories::text[],
           ${rawWallClock("d.date")} AS date,
           d.description, d."targetDescription", d.country,
           d."enterpriseValue", d."equityValue", d.stake,
           d."dealStatus"::text, ${rawWallClock('d."closingDate"')} AS "closingDate",
           ${sellerProjection},
           d."assetScale", d."valuationMultiple", d."fundVehicle",
           d."keyHighlights"::text[], d.status::text AS "recordStatus",
           ${verifiedProjection},
           ${rawWallClock('d."createdAt"', NAIVE_MICROS_FORMAT)} AS "createdAt",
           ${rawWallClock('d."updatedAt"', NAIVE_MICROS_FORMAT)} AS "updatedAt"
    FROM "Deal" d
    WHERE d.id = $1
  `, [REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.id]);
  return result.rows[0] ?? null;
}

async function loadParticipants(
  client: Client,
): Promise<DealParticipantSnapshot[]> {
  const result = await client.query<DealParticipantSnapshot>(`
    SELECT dp.id, dp."dealId", dp."organizationId",
           o.name AS "organizationName", dp.role::text, dp."displayName"
    FROM "DealParticipant" dp
    JOIN "Organization" o ON o.id = dp."organizationId"
    WHERE dp."dealId" = $1
    ORDER BY dp.id
  `, [REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.id]);
  return result.rows;
}

async function loadOrganizations(client: Client): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_CORNERSTONE_TALEN_MANIFEST.organizationGuards.map(
    (organization) => organization.id,
  );
  const result = await client.query<OrganizationGuard>(`
    SELECT o.id, o.name, o.types::text[], o.status::text AS "recordStatus"
    FROM "Organization" o
    WHERE o.id = ANY($1::text[])
    ORDER BY o.id
  `, [ids]);
  return result.rows;
}

async function loadOwnershipPeriods(client: Client): Promise<OwnershipSnapshot[]> {
  const companyId = REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.id;
  const result = await client.query<OwnershipSnapshot>(`
    SELECT op.id, op."companyId", c.name AS "companyName",
           op."fundId", f."fundName", op."organizationId",
           o.name AS "organizationName", op."vehicleName", op.stake,
           op."investmentYear", op."exitYear", op."isActive",
           ${rawWallClock('op."createdAt"', NAIVE_MICROS_FORMAT)} AS "createdAt"
    FROM "OwnershipPeriod" op
    JOIN "Company" c ON c.id = op."companyId"
    LEFT JOIN "Fund" f ON f.id = op."fundId"
    LEFT JOIN "Organization" o ON o.id = op."organizationId"
    WHERE op."companyId" = $1
    ORDER BY op.id
  `, [companyId]);
  return result.rows;
}

async function loadCompany(
  client: Client,
  schema: SchemaCapabilities,
): Promise<CompanySnapshot | null> {
  const verifiedProjection = schema.companyLastVerifiedAt
    ? `${rawWallClock('c."lastVerifiedAt"', NAIVE_MICROS_FORMAT)} AS "lastVerifiedAt"`
    : `NULL::text AS "lastVerifiedAt"`;
  const result = await client.query<CompanySnapshot>(`
    SELECT c.id, c.name, c.sector::text, c.subsector, c.region::text,
           c.country, c."countryTags"::text[], c.description,
           c."companyStatus"::text, c.website, c."yearFounded",
           c.headquarters, c.status::text AS "recordStatus",
           ${verifiedProjection},
           ${rawWallClock('c."createdAt"', NAIVE_MICROS_FORMAT)} AS "createdAt",
           ${rawWallClock('c."updatedAt"', NAIVE_MICROS_FORMAT)} AS "updatedAt"
    FROM "Company" c
    WHERE c.id = $1
  `, [REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.id]);
  return result.rows[0] ?? null;
}

async function loadMilestones(client: Client): Promise<MilestoneSnapshot[]> {
  const result = await client.query<MilestoneSnapshot>(`
    SELECT m.id, m."companyId", m.date, m.event, m.category::text,
           ${rawWallClock('m."sortDate"')} AS "sortDate"
    FROM "Milestone" m
    WHERE m."companyId" = $1
    ORDER BY m.id
  `, [REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.id]);
  return result.rows;
}

async function loadSourceMatches(client: Client): Promise<SourceSnapshot[]> {
  const ids = CORNERSTONE_SOURCE_REQUIREMENTS.map((source) => source.preferredId);
  const urls = CORNERSTONE_SOURCE_REQUIREMENTS.map((source) => source.url);
  const result = await client.query<SourceSnapshot>(`
    SELECT s.id, s.label, s.url, s.type::text
    FROM "Source" s
    WHERE s.id = ANY($1::text[]) OR s.url = ANY($2::text[])
    ORDER BY s.id
  `, [ids, urls]);
  return result.rows;
}

async function loadCitationMatches(
  client: Client,
  schema: SchemaCapabilities,
): Promise<CitationSnapshot[]> {
  const primaryProjection = schema.citationIsPrimary
    ? `ci."isPrimary"`
    : `false AS "isPrimary"`;
  const ids = CORNERSTONE_CITATION_REQUIREMENTS.map((citation) => citation.id);
  const result = await client.query<CitationSnapshot>(`
    SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
           ci.purpose::text, ci."evidenceLabel", ${primaryProjection}
    FROM "Citation" ci
    WHERE ci.id = ANY($1::text[])
       OR (ci."companyId" = $2 AND ci."dealId" = $3)
    ORDER BY ci.id
  `, [
    ids,
    REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.id,
    REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.id,
  ]);
  return result.rows;
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
  if (!row) throw new Error("Failed to load database table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<CornerstoneTalenSnapshot> {
  const schema = await loadSchemaCapabilities(client);
  // pg clients execute one query at a time. Keep this sequence explicit so the
  // exact snapshot remains compatible with pg 9's stricter client contract.
  const deal = await loadDeal(client, schema);
  const participants = await loadParticipants(client);
  const organizations = await loadOrganizations(client);
  const ownershipPeriods = await loadOwnershipPeriods(client);
  const company = await loadCompany(client, schema);
  const milestones = await loadMilestones(client);
  const sourceMatches = await loadSourceMatches(client);
  const citationMatches = await loadCitationMatches(client, schema);
  const tableCounts = await loadTableCounts(client);
  return {
    deal,
    participants,
    organizations,
    ownershipPeriods,
    company,
    milestones,
    sourceMatches,
    citationMatches,
    schema,
    tableCounts,
  };
}

function planHashMaterial(target: DatabaseTarget, built: {
  snapshot: CornerstoneTalenSnapshot;
  plan: CornerstoneTalenPlan;
}) {
  return {
    schemaVersion: CORNERSTONE_TALEN_CLOSE_SCHEMA_VERSION,
    scope: CORNERSTONE_TALEN_CLOSE_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedManifestSha256: REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
    snapshotSha256: built.plan.snapshotSha256,
    actionSetSha256: built.plan.actionSetSha256,
    actions: built.plan.actions,
    resolvedSourceIds: built.plan.resolvedSourceIds,
    reusedSourceIds: built.plan.reusedSourceIds,
    reusedCitationIds: built.plan.reusedCitationIds,
    quarantinedFields: built.plan.quarantinedFields,
    schema: built.snapshot.schema,
    tableCounts: built.snapshot.tableCounts,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: CornerstoneTalenSnapshot,
): BuiltPlan {
  const plan = buildCornerstoneTalenClosePlan(snapshot);
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
  const manifest = REVIEWED_CORNERSTONE_TALEN_MANIFEST;
  await client.query(`SELECT id FROM "Deal" WHERE id = $1 FOR UPDATE`, [
    manifest.deal.current.id,
  ]);
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE "dealId" = $1 ORDER BY id FOR UPDATE`,
    [manifest.deal.current.id],
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
    `SELECT id FROM "Source" WHERE id = ANY($1::text[]) OR url = ANY($2::text[]) ORDER BY id FOR UPDATE`,
    [
      CORNERSTONE_SOURCE_REQUIREMENTS.map((source) => source.preferredId),
      CORNERSTONE_SOURCE_REQUIREMENTS.map((source) => source.url),
    ],
  );
  await client.query(
    `SELECT id FROM "Citation" WHERE id = ANY($1::text[]) OR ("companyId" = $2 AND "dealId" = $3) ORDER BY id FOR UPDATE`,
    [
      CORNERSTONE_CITATION_REQUIREMENTS.map((citation) => citation.id),
      manifest.company.current.id,
      manifest.deal.current.id,
    ],
  );
}

function actionsOfType<T extends CornerstoneTalenAction["actionType"]>(
  actions: CornerstoneTalenAction[],
  actionType: T,
): Extract<CornerstoneTalenAction, { actionType: T }>[] {
  return actions.filter(
    (action): action is Extract<CornerstoneTalenAction, { actionType: T }> =>
      action.actionType === actionType,
  );
}

function assertReturnedIds(
  label: string,
  actual: Array<{ id: string }>,
  expected: string[],
): void {
  const actualIds = actual.map((row) => row.id).sort();
  const expectedIds = [...expected].sort();
  if (sha256(actualIds) !== sha256(expectedIds)) {
    throw new Error(`${label} returned IDs outside the approved action set`);
  }
}

async function applyApprovedActions(
  client: Client,
  built: BuiltPlan,
): Promise<Record<string, string[]>> {
  const actions = built.plan.actions;
  const deal = actionsOfType(actions, "DEAL_UPDATE")[0];
  const participant = actionsOfType(actions, "PARTICIPANT_UPDATE")[0];
  const company = actionsOfType(actions, "COMPANY_UPDATE")[0];
  const ownerships = actionsOfType(actions, "OWNERSHIP_UPDATE");
  const milestone = actionsOfType(actions, "MILESTONE_INSERT")[0];
  const sources = actionsOfType(actions, "SOURCE_INSERT");
  const citations = actionsOfType(actions, "CITATION_INSERT");
  if (!deal || !participant || !company || !milestone || ownerships.length !== 2) {
    throw new Error("Approved Cornerstone action set is structurally incomplete");
  }

  const dealResult = await client.query<{ id: string }>(`
    UPDATE "Deal"
    SET title = $2,
        description = $3,
        "targetDescription" = $4,
        "dealStatus" = $5::"DealStatusEnum",
        "closingDate" = $6::timestamp,
        "assetScale" = $7,
        "keyHighlights" = $8::text[],
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `, [
    deal.id,
    deal.proposed.title,
    deal.proposed.description,
    deal.proposed.targetDescription,
    deal.proposed.dealStatus,
    deal.proposed.closingDate,
    deal.proposed.assetScale,
    deal.proposed.keyHighlights,
  ]);
  assertReturnedIds("Deal update", dealResult.rows, [deal.id]);

  const participantResult = await client.query<{ id: string }>(`
    UPDATE "DealParticipant"
    SET "organizationId" = $2,
        "displayName" = $3
    WHERE id = $1
    RETURNING id
  `, [
    participant.id,
    participant.proposed.organizationId,
    participant.proposed.displayName,
  ]);
  assertReturnedIds("DealParticipant update", participantResult.rows, [participant.id]);

  const ownershipRows: Array<{ id: string }> = [];
  for (const ownership of ownerships) {
    const result = await client.query<{ id: string }>(`
      UPDATE "OwnershipPeriod"
      SET "vehicleName" = $2,
          stake = $3,
          "investmentYear" = $4,
          "exitYear" = $5,
          "isActive" = $6
      WHERE id = $1
      RETURNING id
    `, [
      ownership.id,
      ownership.proposed.vehicleName,
      ownership.proposed.stake,
      ownership.proposed.investmentYear,
      ownership.proposed.exitYear,
      ownership.proposed.isActive,
    ]);
    ownershipRows.push(...result.rows);
  }
  assertReturnedIds(
    "OwnershipPeriod updates",
    ownershipRows,
    ownerships.map((action) => action.id),
  );

  const companyResult = await client.query<{ id: string }>(`
    UPDATE "Company"
    SET description = $2,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `, [company.id, company.proposed.description]);
  assertReturnedIds("Company update", companyResult.rows, [company.id]);

  const sourceRows: Array<{ id: string }> = [];
  for (const source of sources) {
    const result = await client.query<{ id: string }>(`
      INSERT INTO "Source" (id, label, url, type)
      VALUES ($1, $2, $3, $4::"SourceType")
      RETURNING id
    `, [source.id, source.proposed.label, source.proposed.url, source.proposed.type]);
    sourceRows.push(...result.rows);
  }
  assertReturnedIds(
    "Source inserts",
    sourceRows,
    sources.map((action) => action.id),
  );

  const milestoneResult = await client.query<{ id: string }>(`
    INSERT INTO "Milestone" (id, "companyId", date, event, category, "sortDate")
    VALUES ($1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp)
    RETURNING id
  `, [
    milestone.id,
    milestone.proposed.companyId,
    milestone.proposed.date,
    milestone.proposed.event,
    milestone.proposed.category,
    milestone.proposed.sortDate,
  ]);
  assertReturnedIds("Milestone insert", milestoneResult.rows, [milestone.id]);

  const citationRows: Array<{ id: string }> = [];
  for (const citation of citations) {
    const query = built.snapshot.schema.citationIsPrimary
      ? `
          INSERT INTO "Citation"
            (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel", "isPrimary")
          VALUES ($1, $2, $3, $4, $5::"CitationPurpose", $6, false)
          RETURNING id
        `
      : `
          INSERT INTO "Citation"
            (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
          VALUES ($1, $2, $3, $4, $5::"CitationPurpose", $6)
          RETURNING id
        `;
    const result = await client.query<{ id: string }>(query, [
      citation.id,
      citation.proposed.sourceId,
      citation.proposed.dealId,
      citation.proposed.companyId,
      citation.proposed.purpose,
      citation.proposed.evidenceLabel,
    ]);
    citationRows.push(...result.rows);
  }
  assertReturnedIds(
    "Citation inserts",
    citationRows,
    citations.map((action) => action.id),
  );

  return {
    deals: dealResult.rows.map((row) => row.id),
    dealParticipants: participantResult.rows.map((row) => row.id),
    ownershipPeriods: ownershipRows.map((row) => row.id),
    companies: companyResult.rows.map((row) => row.id),
    milestones: milestoneResult.rows.map((row) => row.id),
    sources: sourceRows.map((row) => row.id),
    citations: citationRows.map((row) => row.id),
  };
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  value: T,
): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = value;
  return rest;
}

function expectedCitation(
  requirement: (typeof CORNERSTONE_CITATION_REQUIREMENTS)[number],
  resolvedSourceIds: Record<SourceRequirement["key"], string>,
): CitationSnapshot {
  return {
    id: requirement.id,
    sourceId: resolvedSourceIds[requirement.sourceKey],
    dealId: requirement.dealId,
    companyId: requirement.companyId,
    purpose: requirement.purpose,
    evidenceLabel: requirement.evidenceLabel,
    isPrimary: false,
  };
}

function assertPostconditions(before: BuiltPlan, after: CornerstoneTalenSnapshot): void {
  const manifest = REVIEWED_CORNERSTONE_TALEN_MANIFEST;
  if (!after.deal || !after.company) {
    throw new Error("Postcondition failed: Cornerstone Deal or Company is missing");
  }
  exact("Deal", withoutUpdatedAt(after.deal), manifest.deal.proposed);
  if (after.deal.updatedAt === before.snapshot.deal?.updatedAt) {
    throw new Error("Postcondition failed: Deal.updatedAt did not advance");
  }
  if (after.deal.enterpriseValue !== null || after.deal.equityValue !== null) {
    throw new Error("Postcondition failed: purchase price was assigned to a valuation field");
  }

  const expectedParticipants = [
    manifest.buyerParticipant.proposed,
    manifest.sellerParticipantGuard,
  ].sort((left, right) => left.id.localeCompare(right.id));
  exact(
    "DealParticipant set",
    [...after.participants].sort((left, right) => left.id.localeCompare(right.id)),
    expectedParticipants,
  );
  exact(
    "Organization guards",
    [...after.organizations].sort((left, right) => left.id.localeCompare(right.id)),
    [...manifest.organizationGuards].sort((left, right) => left.id.localeCompare(right.id)),
  );
  exact(
    "OwnershipPeriod set",
    [...after.ownershipPeriods].sort((left, right) => left.id.localeCompare(right.id)),
    manifest.ownershipUpdates
      .map((update) => update.proposed)
      .sort((left, right) => left.id.localeCompare(right.id)),
  );

  exact("Company", withoutUpdatedAt(after.company), manifest.company.proposed);
  if (after.company.updatedAt === before.snapshot.company?.updatedAt) {
    throw new Error("Postcondition failed: Company.updatedAt did not advance");
  }
  if (/\b2022\b|acquired the business from Talen/i.test(after.company.description)) {
    throw new Error("Postcondition failed: stale 2022/Talen history remains");
  }

  exact(
    "Milestone set",
    [...after.milestones].sort((left, right) => left.id.localeCompare(right.id)),
    [...manifest.protectedMilestones, manifest.closingMilestone].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
  );

  const sourceById = new Map(after.sourceMatches.map((source) => [source.id, source]));
  for (const requirement of CORNERSTONE_SOURCE_REQUIREMENTS) {
    const id = before.plan.resolvedSourceIds[requirement.key];
    exact(`Source ${requirement.key}`, sourceById.get(id), {
      id,
      label: requirement.label,
      url: requirement.url,
      type: requirement.type,
    });
  }
  const citationById = new Map(
    after.citationMatches.map((citation) => [citation.id, citation]),
  );
  for (const requirement of CORNERSTONE_CITATION_REQUIREMENTS) {
    exact(
      `Citation ${requirement.id}`,
      citationById.get(requirement.id),
      expectedCitation(requirement, before.plan.resolvedSourceIds),
    );
  }

  exact("Schema capabilities", after.schema, before.snapshot.schema);
  const sourceInserts = before.plan.counts.sourceInserts;
  const citationInserts = before.plan.counts.citationInserts;
  exact("Table counts", after.tableCounts, {
    ...before.snapshot.tableCounts,
    milestones: before.snapshot.tableCounts.milestones + 1,
    sources: before.snapshot.tableCounts.sources + sourceInserts,
    citations: before.snapshot.tableCounts.citations + citationInserts,
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
  try {
    await access(path.resolve(outputPath));
    throw new Error(`Receipt output already exists: ${path.resolve(outputPath)}`);
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

function planArtifact(built: BuiltPlan) {
  return {
    generatedAt: new Date().toISOString(),
    planSha256: built.planSha256,
    ...built.hashMaterial,
    counts: built.plan.counts,
    targetSnapshot: {
      deal: built.snapshot.deal,
      participants: built.snapshot.participants,
      organizations: built.snapshot.organizations,
      ownershipPeriods: built.snapshot.ownershipPeriods,
      company: built.snapshot.company,
      milestones: built.snapshot.milestones,
      sourceMatches: built.snapshot.sourceMatches,
      citationMatches: built.snapshot.citationMatches,
    },
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
  if (receiptOutput) {
    await mkdir(path.dirname(path.resolve(receiptOutput)), { recursive: true });
    await assertPathAbsent(receiptOutput);
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [LOCK_KEY]);
      await lockReviewedRows(client);
    }
    await assertConnectedDatabase(
      client,
      target,
      apply ? "serializable" : "repeatable read",
    );

    const before = buildPlan(target, await loadSnapshot(client));
    const artifact = planArtifact(before);
    if (manifestOutput) await writeJson(manifestOutput, artifact);
    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          reviewedManifestSha256: REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
          actionSetSha256: before.plan.actionSetSha256,
          actionCount: before.plan.actionCount,
          counts: before.plan.counts,
          reusedSourceIds: before.plan.reusedSourceIds,
          reusedCitationIds: before.plan.reusedCitationIds,
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

    const appliedIds = await applyApprovedActions(client, before);
    const after = await loadSnapshot(client);
    assertPostconditions(before, after);
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: CORNERSTONE_TALEN_CLOSE_SCHEMA_VERSION,
      scope: CORNERSTONE_TALEN_CLOSE_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      appliedIds,
      before: before.snapshot,
      after,
      postconditions: {
        exactDealAndParticipantState: true,
        sellerPreserved: true,
        exactOwnershipState: true,
        july2025MilestonePreserved: true,
        june2026ClosingMilestoneAdded: true,
        exactOfficialSourcesAndCitations: true,
        purchasePriceNotAssignedToEnterpriseValue: true,
        tableCountDeltasExact: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied Cornerstone/Talen close remediation and wrote ${path.resolve(receiptOutput!)}.`,
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
