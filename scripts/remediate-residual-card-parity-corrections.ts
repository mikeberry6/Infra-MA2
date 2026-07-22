/**
 * Exact-ID, hash-gated follow-up for the Rover description and the disclosed
 * Lone Star seller participant on INF-2026-055. Dry-run is the default and
 * always rolls back. Apply requires explicit target guards, an exact plan
 * hash, a serializable transaction, an advisory lock, and a new receipt path.
 *
 * PostgreSQL `timestamp without time zone` values are serialized as raw wall
 * clocks with `to_char`; they never pass through JavaScript Date.
 *
 * Dry run:
 *   npx tsx scripts/remediate-residual-card-parity-corrections.ts
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-residual-card-parity-corrections.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=<new JSON path>
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  RESIDUAL_CARD_PARITY_SCHEMA_VERSION,
  RESIDUAL_CARD_PARITY_SCOPE,
  REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT,
  REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256,
  REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST,
  REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
  buildResidualCardParityPlan,
  type CitationSnapshot,
  type CompanyGuard,
  type CompanySnapshot,
  type DealParticipantSnapshot,
  type DealSnapshot,
  type OrganizationGuard,
  type OwnershipSnapshot,
  type ProtectedSetDigest,
  type ResidualCardParityPlan,
  type ResidualCardParitySnapshot,
  type RoverCardProtection,
  type SchemaCapabilities,
  type TableCounts,
  type UniqueIndexState,
} from "./portfolio-review/residual-card-parity-corrections";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:rover-vigor-residual-card-parity:v1";
const PARTICIPANT_IDENTITY_INDEX =
  "DealParticipant_dealId_organizationId_role_key";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: ResidualCardParitySnapshot;
  plan: ResidualCardParityPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  companyUpdates: string[];
  participantInserts: string[];
}

interface MilestoneDigestRow {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

interface ManagementDigestRow {
  id: string;
  companyId: string;
  companyName: string;
  personId: string;
  personName: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
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

function digest<T extends { id: string }>(
  rows: readonly T[],
): ProtectedSetDigest {
  const ordered = sorted(rows);
  return { count: ordered.length, sha256: sha256(ordered) };
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed its exact postcondition`);
  }
}

async function loadRoverCompany(
  client: Client,
): Promise<CompanySnapshot | null> {
  const id = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.roverCompanyUpdate.id;
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

async function loadVigorDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorDealGuard.id;
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

async function loadVigorCompanyGuard(
  client: Client,
): Promise<CompanyGuard | null> {
  const id = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorCompanyGuard.id;
  const result = await client.query<CompanyGuard>(
    `
      SELECT c.id, c.name, c."companyStatus"::text AS "companyStatus",
             c.status::text AS "recordStatus",
             to_char(c."updatedAt", $2) AS "updatedAt"
      FROM "Company" c
      WHERE c.id = $1
    `,
    [id, NAIVE_MICROS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadVigorOwnershipRows(
  client: Client,
): Promise<OwnershipSnapshot[]> {
  const companyId = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorCompanyGuard.id;
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

async function loadParticipantRows(
  client: Client,
): Promise<DealParticipantSnapshot[]> {
  const dealId = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorDealGuard.id;
  const result = await client.query<DealParticipantSnapshot>(
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

async function loadOrganizationGuards(
  client: Client,
): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.organizationGuards.map(
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

async function loadEvidenceCitations(
  client: Client,
): Promise<CitationSnapshot[]> {
  const ids = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.evidenceCitations.map(
    (row) => row.id,
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
      ORDER BY ci.id
    `,
    [ids],
  );
  return result.rows;
}

async function loadProposedParticipantMatches(
  client: Client,
): Promise<DealParticipantSnapshot[]> {
  const row = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorSellerInsert.proposed;
  const result = await client.query<DealParticipantSnapshot>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName", o.types::text[] AS "organizationTypes",
             o.status::text AS "organizationStatus", dp.role::text,
             dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp.id = $1
         OR (dp."dealId" = $2 AND dp."organizationId" = $3 AND dp.role::text = $4)
      ORDER BY dp.id
    `,
    [row.id, row.dealId, row.organizationId, row.role],
  );
  return result.rows;
}

async function loadRoverCardProtection(
  client: Client,
): Promise<RoverCardProtection> {
  const companyId =
    REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.roverCompanyUpdate.id;
  const ownership = await client.query<OwnershipSnapshot>(
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
  const milestones = await client.query<MilestoneDigestRow>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
             m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m."companyId" = $1
      ORDER BY m.id
    `,
    [companyId, NAIVE_MILLIS_FORMAT],
  );
  const management = await client.query<ManagementDigestRow>(
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
  const citations = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci."companyId" = $1
      ORDER BY ci.id
    `,
    [companyId],
  );
  return {
    ownershipPeriods: digest(ownership.rows),
    milestones: digest(milestones.rows),
    managementRoles: digest(management.rows),
    citations: digest(citations.rows),
  };
}

async function loadParticipantIdentityIndexState(
  client: Client,
): Promise<UniqueIndexState> {
  const result = await client.query<{
    exists: boolean;
    isUnique: boolean | null;
    isValid: boolean | null;
    isReady: boolean | null;
    definition: string | null;
  }>(
    `
      SELECT (idx.oid IS NOT NULL) AS exists,
             pi.indisunique AS "isUnique",
             pi.indisvalid AS "isValid",
             pi.indisready AS "isReady",
             pg_get_indexdef(idx.oid) AS definition
      FROM (SELECT 1) seed
      LEFT JOIN pg_namespace ns ON ns.nspname = current_schema()
      LEFT JOIN pg_class idx
        ON idx.relnamespace = ns.oid
       AND idx.relname = $1
       AND idx.relkind = 'i'
      LEFT JOIN pg_index pi ON pi.indexrelid = idx.oid
    `,
    [PARTICIPANT_IDENTITY_INDEX],
  );
  const row = result.rows[0];
  return {
    exists: row?.exists ?? false,
    isUnique: row?.isUnique ?? false,
    isValid: row?.isValid ?? false,
    isReady: row?.isReady ?? false,
    definition: row?.definition ?? null,
  };
}

async function loadSchemaCapabilities(
  client: Client,
): Promise<SchemaCapabilities> {
  return {
    dealParticipantIdentityIndex:
      await loadParticipantIdentityIndexState(client),
  };
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "DealParticipant") AS "dealParticipants",
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "ManagementRole") AS "managementRoles",
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load residual card-parity table counts");
  return row;
}

async function loadSnapshot(
  client: Client,
): Promise<ResidualCardParitySnapshot> {
  return {
    roverCompany: await loadRoverCompany(client),
    roverCardProtection: await loadRoverCardProtection(client),
    vigorDeal: await loadVigorDeal(client),
    vigorCompanyGuard: await loadVigorCompanyGuard(client),
    vigorOwnershipRows: await loadVigorOwnershipRows(client),
    participantRows: await loadParticipantRows(client),
    organizationGuards: await loadOrganizationGuards(client),
    evidenceCitations: await loadEvidenceCitations(client),
    proposedParticipantMatches: await loadProposedParticipantMatches(client),
    schema: await loadSchemaCapabilities(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  snapshot: ResidualCardParitySnapshot,
) {
  const plan = buildResidualCardParityPlan(snapshot);
  return {
    schemaVersion: RESIDUAL_CARD_PARITY_SCHEMA_VERSION,
    scope: RESIDUAL_CARD_PARITY_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT,
      actionSetSha256: REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
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
  snapshot: ResidualCardParitySnapshot,
): BuiltPlan {
  const plan = buildResidualCardParityPlan(snapshot);
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
  const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
  await client.query(
    `LOCK TABLE "DealParticipant", "OwnershipPeriod", "Milestone", "ManagementRole", "Citation" IN SHARE ROW EXCLUSIVE MODE`,
  );
  await client.query(
    `SELECT id FROM "Company" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [[manifest.roverCompanyUpdate.id, manifest.vigorCompanyGuard.id]],
  );
  await client.query(`SELECT id FROM "Deal" WHERE id = $1 FOR UPDATE`, [
    manifest.vigorDealGuard.id,
  ]);
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE "dealId" = $1 FOR UPDATE`,
    [manifest.vigorDealGuard.id],
  );
  await client.query(
    `SELECT id FROM "Organization" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [manifest.organizationGuards.map((row) => row.id)],
  );
  await client.query(
    `SELECT id FROM "OwnershipPeriod" WHERE "companyId" = ANY($1::text[]) FOR UPDATE`,
    [[manifest.roverCompanyUpdate.id, manifest.vigorCompanyGuard.id]],
  );
  await client.query(
    `SELECT id FROM "Milestone" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.roverCompanyUpdate.id],
  );
  await client.query(
    `SELECT id FROM "ManagementRole" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.roverCompanyUpdate.id],
  );
  await client.query(
    `SELECT id FROM "Citation" WHERE "companyId" = $1 OR id = ANY($2::text[]) FOR UPDATE`,
    [
      manifest.roverCompanyUpdate.id,
      manifest.evidenceCitations.map((row) => row.id),
    ],
  );
}

async function applyCompanyUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.roverCompanyUpdate;
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
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Company ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyParticipantInsert(client: Client): Promise<string[]> {
  const action = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorSellerInsert;
  const row = action.proposed;
  const deal = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorDealGuard;
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO "DealParticipant"
        (id, "dealId", "organizationId", role, "displayName")
      SELECT $1, $2, $3, $4::"ParticipantRole", $5
      WHERE EXISTS (
        SELECT 1 FROM "Deal" d
        WHERE d.id = $2
          AND d."legacyId" = $6
          AND d."dealStatus"::text = $7
          AND d."closingDate" IS NOT DISTINCT FROM $8::timestamp
      )
        AND EXISTS (
          SELECT 1 FROM "Organization" o
          WHERE o.id = $3
            AND o.name = $9
            AND o.types::text[] = $10::text[]
            AND o.status::text = $11
        )
      RETURNING id
    `,
    [
      row.id,
      row.dealId,
      row.organizationId,
      row.role,
      row.displayName,
      deal.legacyId,
      deal.dealStatus,
      deal.closingDate,
      row.organizationName,
      row.organizationTypes,
      row.organizationStatus,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`DealParticipant ${action.id} failed its guarded insert`);
  }
  return [result.rows[0].id];
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  row: T,
): Omit<T, "updatedAt"> {
  const { updatedAt, ...rest } = row;
  void updatedAt;
  return rest;
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: ResidualCardParitySnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
  exact("Company mutation IDs", input.mutations.companyUpdates, [
    manifest.roverCompanyUpdate.id,
  ]);
  exact("Participant insert IDs", input.mutations.participantInserts, [
    manifest.vigorSellerInsert.id,
  ]);

  if (!input.after.roverCompany) {
    throw new Error("Postcondition failed: Rover Company is missing");
  }
  exact(
    "Rover Company state",
    withoutUpdatedAt(input.after.roverCompany),
    manifest.roverCompanyUpdate.proposed,
  );
  if (
    input.after.roverCompany.updatedAt ===
    manifest.roverCompanyUpdate.current.updatedAt
  ) {
    throw new Error(
      "Postcondition failed: Rover Company.updatedAt did not change",
    );
  }
  exact(
    "Rover card dependency protection",
    input.after.roverCardProtection,
    manifest.roverCardProtection,
  );
  exact("Vigor Deal", input.after.vigorDeal, manifest.vigorDealGuard);
  exact(
    "Vigor Company guard",
    input.after.vigorCompanyGuard,
    manifest.vigorCompanyGuard,
  );
  exact(
    "Vigor ownership rows",
    sorted(input.after.vigorOwnershipRows),
    sorted(manifest.vigorOwnershipRows),
  );
  exact(
    "Vigor participant rows",
    sorted(input.after.participantRows),
    sorted([
      ...manifest.existingParticipantRows,
      manifest.vigorSellerInsert.proposed,
    ]),
  );
  exact(
    "Organization guards",
    sorted(input.after.organizationGuards),
    sorted(manifest.organizationGuards),
  );
  exact(
    "Evidence citations",
    sorted(input.after.evidenceCitations),
    sorted(manifest.evidenceCitations),
  );
  exact("Inserted seller identity", input.after.proposedParticipantMatches, [
    manifest.vigorSellerInsert.proposed,
  ]);
  exact(
    "Schema capabilities",
    input.after.schema,
    input.before.snapshot.schema,
  );
  exact("Table counts", input.after.tableCounts, {
    ...input.before.snapshot.tableCounts,
    dealParticipants: input.before.snapshot.tableCounts.dealParticipants + 1,
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
          reviewedManifestSha256: REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
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
      participantInserts: await applyParticipantInsert(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: RESIDUAL_CARD_PARITY_SCHEMA_VERSION,
      scope: RESIDUAL_CARD_PARITY_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutations,
      rollbackRows: {
        company: manifestCompanyRollback(),
        insertedParticipantId:
          REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorSellerInsert.id,
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
        roverOnlyDescriptionChanged: true,
        roverDependencySetsUnchanged: true,
        exactLoneStarSellerInserted: true,
        antinBuyerPreserved: true,
        announcedDealAndActiveLoneStarOwnershipPreserved: true,
        tableCountDeltaExact: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} residual card-parity corrections and wrote ${path.resolve(receiptOutput!)}.`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

function manifestCompanyRollback(): CompanySnapshot {
  return REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.roverCompanyUpdate.current;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
