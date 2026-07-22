/**
 * Fail-closed ownership-identity/card remediation for Phoenix Renewables,
 * Golden State Wind, OnTrac, and Tract.
 *
 * Dry-run is the default. It applies all reviewed mutations inside a
 * SERIALIZABLE transaction, verifies the exact post-state, rolls back, and
 * verifies that the protected live snapshot was restored.
 *
 * Rehearsal:
 *   npm run db:portfolio:ownership-identity-card-corrections
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npm run db:portfolio:ownership-identity-card-corrections -- \
 *     --apply --approval-hash=<fresh-plan-sha256> \
 *     --receipt-output=<new-json-path>
 */
import "dotenv/config";

import { constants } from "node:fs";
import { access, mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client, type QueryResult } from "pg";
import {
  OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCHEMA_VERSION,
  OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCOPE,
  REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT,
  REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256,
  REVIEWED_OWNERSHIP_IDENTITY_MANIFEST,
  REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
  buildOwnershipIdentityPlan,
  type CitationSnapshot,
  type CompanyProtection,
  type CompanySnapshot,
  type EntityIdConflict,
  type MilestoneSnapshot,
  type OrganizationSnapshot,
  type OwnershipIdentityAction,
  type OwnershipIdentityPlan,
  type OwnershipIdentitySnapshot,
  type OwnershipSnapshot,
  type ProtectedSetDigest,
  type SchemaCapabilities,
  type SourceSnapshot,
  type TableCounts,
} from "./portfolio-review/ownership-identity-card-corrections";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:ownership-identity-card-corrections:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';
const DEFAULT_PLAN_OUTPUT =
  "audits/portfolio-company-review-2026-07-22/ownership-identity-card-corrections-plan.json";

interface DatabaseTarget {
  host: string;
  database: string;
}

interface LoadedState {
  snapshot: OwnershipIdentitySnapshot;
  companyRows: CompanySnapshot[];
  organizationRows: OrganizationSnapshot[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  sourceRows: SourceSnapshot[];
  citationRows: CitationSnapshot[];
}

interface BuiltPlan {
  state: LoadedState;
  plan: OwnershipIdentityPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

type MutationIds = Record<OwnershipIdentityAction["actionType"], string[]>;

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

function digest<T extends { id: string }>(
  rows: readonly T[],
): ProtectedSetDigest {
  const ordered = sorted(rows);
  return { count: ordered.length, sha256: sha256(ordered) };
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    const differingKeys =
      actual &&
      expected &&
      typeof actual === "object" &&
      typeof expected === "object" &&
      !Array.isArray(actual) &&
      !Array.isArray(expected)
        ? [...new Set([...Object.keys(actual), ...Object.keys(expected)])]
            .filter(
              (key) =>
                sha256((actual as Record<string, unknown>)[key]) !==
                sha256((expected as Record<string, unknown>)[key]),
            )
            .sort()
            .join(", ")
        : "non-object value";
    throw new Error(
      `${label} failed its exact postcondition; differing keys: ${differingKeys}`,
    );
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

function companyIds(): string[] {
  return REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.companyRows.map((row) => row.id);
}

function insertedOrganizationIds(): string[] {
  return REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.organizationInserts.map(
    (action) => action.id,
  );
}

function sourceIds(): string[] {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  return [
    ...manifest.sourceUpdates.map((action) => action.id),
    ...manifest.sourceInserts.map((action) => action.id),
  ];
}

async function loadCompanyRows(client: Client): Promise<CompanySnapshot[]> {
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
      WHERE c.id = ANY($1::text[])
      ORDER BY c.id
    `,
    [companyIds(), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadOrganizationRows(
  client: Client,
): Promise<OrganizationSnapshot[]> {
  const result = await client.query<OrganizationSnapshot>(
    `
      SELECT o.id, o.name, o.types::text[], o.website, o.headquarters,
             o.description, o.status::text AS "recordStatus",
             to_char(o."createdAt", $2) AS "createdAt",
             to_char(o."updatedAt", $2) AS "updatedAt"
      FROM "Organization" o
      WHERE o.id = ANY($1::text[])
      ORDER BY o.id
    `,
    [insertedOrganizationIds(), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadOwnershipRows(client: Client): Promise<OwnershipSnapshot[]> {
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
    [companyIds(), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadMilestoneRows(client: Client): Promise<MilestoneSnapshot[]> {
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date,
             m.event, m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m."companyId" = ANY($1::text[])
      ORDER BY m.id
    `,
    [companyIds(), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadSourceRows(client: Client): Promise<SourceSnapshot[]> {
  const result = await client.query<SourceSnapshot>(
    `
      SELECT s.id, s.label, s.url, s.type::text,
             to_char(s."createdAt", $2) AS "createdAt"
      FROM "Source" s
      WHERE s.id = ANY($1::text[])
      ORDER BY s.id
    `,
    [sourceIds(), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadCitationRows(client: Client): Promise<CitationSnapshot[]> {
  const result = await client.query<CitationSnapshot>(
    `
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM "Citation" ci
      JOIN "Source" s ON s.id = ci."sourceId"
      WHERE ci."companyId" = ANY($1::text[])
      ORDER BY ci.id
    `,
    [companyIds()],
  );
  return result.rows;
}

function protections(
  companies: CompanySnapshot[],
  ownership: OwnershipSnapshot[],
  milestones: MilestoneSnapshot[],
  citations: CitationSnapshot[],
): CompanyProtection[] {
  return companies
    .map((company) => ({
      companyId: company.id,
      companyName: company.name,
      ownership: digest(
        ownership.filter((row) => row.companyId === company.id),
      ),
      milestones: digest(
        milestones.filter((row) => row.companyId === company.id),
      ),
      citations: digest(
        citations.filter((row) => row.companyId === company.id),
      ),
    }))
    .sort((left, right) => left.companyId.localeCompare(right.companyId));
}

async function loadOrganizationConflicts(
  client: Client,
): Promise<OrganizationSnapshot[]> {
  const rows = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.organizationInserts.map(
    (action) => action.proposed,
  );
  const result = await client.query<OrganizationSnapshot>(
    `
      WITH proposed AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS p(id text, name text)
      )
      SELECT DISTINCT o.id, o.name, o.types::text[], o.website,
             o.headquarters, o.description,
             o.status::text AS "recordStatus",
             to_char(o."createdAt", $2) AS "createdAt",
             to_char(o."updatedAt", $2) AS "updatedAt"
      FROM proposed p
      JOIN "Organization" o
        ON o.id = p.id OR lower(o.name) = lower(p.name)
      ORDER BY o.id
    `,
    [JSON.stringify(rows), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadOwnershipConflicts(
  client: Client,
): Promise<OwnershipSnapshot[]> {
  const rows = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.ownershipInserts.map(
    (action) => action.proposed,
  );
  const result = await client.query<OwnershipSnapshot>(
    `
      WITH proposed AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS p(id text, "companyId" text, "organizationId" text,
               "vehicleName" text)
      )
      SELECT DISTINCT op.id, op."companyId", c.name AS "companyName",
             op."fundId", f."fundName", op."organizationId",
             o.name AS "organizationName", op."vehicleName", op.stake,
             op."investmentYear", op."exitYear", op."isActive",
             to_char(op."createdAt", $2) AS "createdAt"
      FROM proposed p
      JOIN "OwnershipPeriod" op
        ON op.id = p.id OR (
          op."companyId" = p."companyId"
          AND op."organizationId" IS NOT DISTINCT FROM p."organizationId"
          AND op."vehicleName" IS NOT DISTINCT FROM p."vehicleName"
        )
      JOIN "Company" c ON c.id = op."companyId"
      LEFT JOIN "Fund" f ON f.id = op."fundId"
      LEFT JOIN "Organization" o ON o.id = op."organizationId"
      ORDER BY op.id
    `,
    [JSON.stringify(rows), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadMilestoneConflicts(
  client: Client,
): Promise<MilestoneSnapshot[]> {
  const rows = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.milestoneInserts.map(
    (action) => action.proposed,
  );
  const result = await client.query<MilestoneSnapshot>(
    `
      WITH proposed AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS p(id text, "companyId" text, date text, event text)
      )
      SELECT DISTINCT m.id, m."companyId", c.name AS "companyName",
             m.date, m.event, m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM proposed p
      JOIN "Milestone" m
        ON m.id = p.id OR (
          m."companyId" = p."companyId"
          AND m.date = p.date AND m.event = p.event
        )
      JOIN "Company" c ON c.id = m."companyId"
      ORDER BY m.id
    `,
    [JSON.stringify(rows), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadSourceConflicts(client: Client): Promise<SourceSnapshot[]> {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const rows = [
    ...manifest.sourceInserts.map((action) => ({
      id: action.id,
      updateId: null,
      url: action.proposed.url,
    })),
    ...manifest.sourceUpdates.map((action) => ({
      id: action.id,
      updateId: action.id,
      url: action.proposed.url,
    })),
  ];
  const result = await client.query<SourceSnapshot>(
    `
      WITH proposed AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS p(id text, "updateId" text, url text)
      )
      SELECT DISTINCT s.id, s.label, s.url, s.type::text,
             to_char(s."createdAt", $2) AS "createdAt"
      FROM proposed p
      JOIN "Source" s
        ON (p."updateId" IS NULL AND s.id = p.id)
        OR (s.url = p.url AND s.id IS DISTINCT FROM p."updateId")
      ORDER BY s.id
    `,
    [JSON.stringify(rows), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const rows = [
    ...manifest.citationInserts.map((action) => ({
      ...action.proposed,
      updateId: null,
    })),
    ...manifest.citationUpdates.map((action) => ({
      ...action.proposed,
      updateId: action.id,
    })),
  ];
  const result = await client.query<CitationSnapshot>(
    `
      WITH proposed AS (
        SELECT * FROM jsonb_to_recordset($1::jsonb)
          AS p(id text, "updateId" text, "sourceId" text, "dealId" text,
               "companyId" text, purpose text, "evidenceLabel" text)
      )
      SELECT DISTINCT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM proposed p
      JOIN "Citation" ci
        ON (p."updateId" IS NULL AND ci.id = p.id)
        OR (
          ci.id IS DISTINCT FROM p."updateId"
          AND ci."sourceId" = p."sourceId"
          AND ci."dealId" IS NOT DISTINCT FROM p."dealId"
          AND ci."companyId" IS NOT DISTINCT FROM p."companyId"
          AND ci.purpose::text = p.purpose
          AND ci."evidenceLabel" IS NOT DISTINCT FROM p."evidenceLabel"
        )
      JOIN "Source" s ON s.id = ci."sourceId"
      ORDER BY ci.id
    `,
    [JSON.stringify(rows)],
  );
  return result.rows;
}

async function loadEntityIdConflicts(
  client: Client,
): Promise<EntityIdConflict[]> {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const checks = [
    {
      kind: "Organization",
      ids: manifest.organizationInserts.map((action) => action.id),
    },
    {
      kind: "OwnershipPeriod",
      ids: manifest.ownershipInserts.map((action) => action.id),
    },
    {
      kind: "Milestone",
      ids: manifest.milestoneInserts.map((action) => action.id),
    },
    { kind: "Source", ids: manifest.sourceInserts.map((action) => action.id) },
    {
      kind: "Citation",
      ids: manifest.citationInserts.map((action) => action.id),
    },
  ];
  const conflicts: EntityIdConflict[] = [];
  for (const check of checks) {
    const table = `"${check.kind}"`;
    const result = await client.query<{ id: string }>(
      `SELECT id FROM ${table} WHERE id = ANY($1::text[]) ORDER BY id`,
      [check.ids],
    );
    conflicts.push(
      ...result.rows.map((row) => ({ kind: check.kind, id: row.id })),
    );
  }
  return conflicts.sort(
    (left, right) =>
      left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id),
  );
}

async function loadSchema(client: Client): Promise<SchemaCapabilities> {
  const column = await client.query<{ citationIsPrimary: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Citation'
        AND column_name = 'isPrimary'
    ) AS "citationIsPrimary"
  `);
  const index = await client.query<{
    name: string;
    isUnique: boolean;
    isValid: boolean;
    isReady: boolean;
    nullsNotDistinct: boolean;
    definition: string;
  }>(
    `
      SELECT x.relname AS name, i.indisunique AS "isUnique",
             i.indisvalid AS "isValid", i.indisready AS "isReady",
             i.indnullsnotdistinct AS "nullsNotDistinct",
             pg_get_indexdef(i.indexrelid) AS definition
      FROM pg_class x
      JOIN pg_index i ON i.indexrelid = x.oid
      WHERE x.relname IN ($1, 'Source_url_key')
      ORDER BY x.relname
    `,
    [CITATION_IDENTITY_INDEX],
  );
  const citationIndex = index.rows.find(
    (row) => row.name === CITATION_IDENTITY_INDEX,
  );
  const sourceIndex = index.rows.find((row) => row.name === "Source_url_key");
  return {
    citationIsPrimary: column.rows[0]?.citationIsPrimary ?? false,
    sourceUrlUnique: Boolean(
      sourceIndex?.isUnique && sourceIndex.isValid && sourceIndex.isReady,
    ),
    citationIdentityIndex: citationIndex
      ? {
          exists: true,
          isUnique: citationIndex.isUnique,
          isValid: citationIndex.isValid,
          isReady: citationIndex.isReady,
          nullsNotDistinct: citationIndex.nullsNotDistinct,
          definition: citationIndex.definition,
        }
      : {
          exists: false,
          isUnique: false,
          isValid: false,
          isReady: false,
          nullsNotDistinct: false,
          definition: null,
        },
  };
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT
      (SELECT count(*)::int FROM "Company") AS companies,
      (SELECT count(*)::int FROM "Organization") AS organizations,
      (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
      (SELECT count(*)::int FROM "Milestone") AS milestones,
      (SELECT count(*)::int FROM "Source") AS sources,
      (SELECT count(*)::int FROM "Citation") AS citations
  `);
  return result.rows[0];
}

async function loadState(
  client: Client,
  includeConflicts: boolean,
): Promise<LoadedState> {
  const companyRows = await loadCompanyRows(client);
  const organizationRows = await loadOrganizationRows(client);
  const ownershipRows = await loadOwnershipRows(client);
  const milestoneRows = await loadMilestoneRows(client);
  const sourceRows = await loadSourceRows(client);
  const citationRows = await loadCitationRows(client);
  const updateSourceIds = new Set(
    REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.sourceUpdates.map(
      (action) => action.id,
    ),
  );
  return {
    companyRows,
    organizationRows,
    ownershipRows,
    milestoneRows,
    sourceRows,
    citationRows,
    snapshot: {
      companyRows,
      ownershipRows,
      milestoneRows,
      citationRows,
      sourceTargets: sourceRows.filter((row) => updateSourceIds.has(row.id)),
      protectedSets: protections(
        companyRows,
        ownershipRows,
        milestoneRows,
        citationRows,
      ),
      organizationConflicts: includeConflicts
        ? await loadOrganizationConflicts(client)
        : [],
      ownershipConflicts: includeConflicts
        ? await loadOwnershipConflicts(client)
        : [],
      milestoneConflicts: includeConflicts
        ? await loadMilestoneConflicts(client)
        : [],
      sourceConflicts: includeConflicts
        ? await loadSourceConflicts(client)
        : [],
      citationConflicts: includeConflicts
        ? await loadCitationConflicts(client)
        : [],
      entityIdConflicts: includeConflicts
        ? await loadEntityIdConflicts(client)
        : [],
      schema: await loadSchema(client),
      tableCounts: await loadTableCounts(client),
    },
  };
}

function planHashMaterial(plan: OwnershipIdentityPlan, target: DatabaseTarget) {
  return {
    schemaVersion: OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCHEMA_VERSION,
    scope: OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCOPE,
    databaseTarget: target,
    reviewedActionCount: REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT,
    reviewedActionSetSha256: REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256,
    reviewedManifestSha256: REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
    snapshotSha256: plan.snapshotSha256,
    actionSetSha256: plan.actionSetSha256,
    actions: plan.actions,
    counts: plan.counts,
    quarantinedClaims: plan.quarantinedClaims,
  };
}

async function buildPlan(
  client: Client,
  target: DatabaseTarget,
): Promise<BuiltPlan> {
  const state = await loadState(client, true);
  const plan = buildOwnershipIdentityPlan(state.snapshot);
  const hashMaterial = planHashMaterial(plan, target);
  return { state, plan, hashMaterial, planSha256: sha256(hashMaterial) };
}

function actionsOfType<T extends OwnershipIdentityAction["actionType"]>(
  actions: readonly OwnershipIdentityAction[],
  actionType: T,
): Extract<OwnershipIdentityAction, { actionType: T }>[] {
  return actions.filter(
    (action): action is Extract<OwnershipIdentityAction, { actionType: T }> =>
      action.actionType === actionType,
  );
}

async function applyCompanyUpdate(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "COMPANY_UPDATE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        UPDATE "Company" c
        SET description = $2, "updatedAt" = clock_timestamp()
        WHERE c.id = $1 AND c.name = $3 AND c.sector::text = $4
          AND c.subsector = $5 AND c.region::text = $6 AND c.country = $7
          AND c."countryTags"::text[] = $8::text[]
          AND c.description = $9
          AND c."companyStatus"::text = $10
          AND c.website IS NOT DISTINCT FROM $11::text
          AND c."yearFounded" IS NOT DISTINCT FROM $12::int
          AND c.headquarters IS NOT DISTINCT FROM $13::text
          AND c.status::text = $14
          AND to_char(c."createdAt", $15) = $16
          AND to_char(c."updatedAt", $15) = $17
        RETURNING c.id
      `,
      [
        action.id,
        action.proposed.description,
        row.name,
        row.sector,
        row.subsector,
        row.region,
        row.country,
        row.countryTags,
        row.description,
        row.companyStatus,
        row.website,
        row.yearFounded,
        row.headquarters,
        row.recordStatus,
        NAIVE_MICROS_FORMAT,
        row.createdAt,
        row.updatedAt,
      ],
    ),
    `Company update ${action.id}`,
  );
}

async function applyOwnershipUpdate(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "OWNERSHIP_UPDATE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        UPDATE "OwnershipPeriod" op
        SET stake = $2, "investmentYear" = $3
        WHERE op.id = $1 AND op."companyId" = $4
          AND op."fundId" IS NOT DISTINCT FROM $5::text
          AND op."organizationId" IS NOT DISTINCT FROM $6::text
          AND op."vehicleName" IS NOT DISTINCT FROM $7::text
          AND op.stake IS NOT DISTINCT FROM $8::text
          AND op."investmentYear" IS NOT DISTINCT FROM $9::int
          AND op."exitYear" IS NOT DISTINCT FROM $10::int
          AND op."isActive" = $11
          AND to_char(op."createdAt", $12) = $13
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = op."companyId" AND c.name = $14)
          AND EXISTS (SELECT 1 FROM "Organization" o WHERE o.id = op."organizationId" AND o.name = $15)
        RETURNING op.id
      `,
      [
        action.id,
        action.proposed.stake,
        action.proposed.investmentYear,
        row.companyId,
        row.fundId,
        row.organizationId,
        row.vehicleName,
        row.stake,
        row.investmentYear,
        row.exitYear,
        row.isActive,
        NAIVE_MICROS_FORMAT,
        row.createdAt,
        row.companyName,
        row.organizationName,
      ],
    ),
    `Ownership update ${action.id}`,
  );
}

async function applyOwnershipDelete(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "OWNERSHIP_DELETE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        DELETE FROM "OwnershipPeriod" op
        WHERE op.id = $1 AND op."companyId" = $2
          AND op."fundId" IS NOT DISTINCT FROM $3::text
          AND op."organizationId" IS NOT DISTINCT FROM $4::text
          AND op."vehicleName" IS NOT DISTINCT FROM $5::text
          AND op.stake IS NOT DISTINCT FROM $6::text
          AND op."investmentYear" IS NOT DISTINCT FROM $7::int
          AND op."exitYear" IS NOT DISTINCT FROM $8::int
          AND op."isActive" = $9
          AND to_char(op."createdAt", $10) = $11
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = op."companyId" AND c.name = $12)
          AND EXISTS (SELECT 1 FROM "Organization" o WHERE o.id = op."organizationId" AND o.name = $13)
        RETURNING op.id
      `,
      [
        row.id,
        row.companyId,
        row.fundId,
        row.organizationId,
        row.vehicleName,
        row.stake,
        row.investmentYear,
        row.exitYear,
        row.isActive,
        NAIVE_MICROS_FORMAT,
        row.createdAt,
        row.companyName,
        row.organizationName,
      ],
    ),
    `Ownership delete ${action.id}`,
  );
}

async function applyOrganizationInsert(
  client: Client,
  action: Extract<
    OwnershipIdentityAction,
    { actionType: "ORGANIZATION_INSERT" }
  >,
): Promise<string> {
  const row = action.proposed;
  return assertOne(
    await client.query(
      `
        INSERT INTO "Organization"
          (id, name, types, website, headquarters, description, status,
           "createdAt", "updatedAt")
        SELECT $1, $2, $3::"OrgType"[], $4, $5, $6, $7::"RecordStatus",
               clock_timestamp(), clock_timestamp()
        WHERE NOT EXISTS (
          SELECT 1 FROM "Organization" o
          WHERE o.id = $1 OR lower(o.name) = lower($2)
        )
        RETURNING id
      `,
      [
        row.id,
        row.name,
        row.types,
        row.website,
        row.headquarters,
        row.description,
        row.recordStatus,
      ],
    ),
    `Organization insert ${action.id}`,
  );
}

async function applyOwnershipInsert(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "OWNERSHIP_INSERT" }>,
): Promise<string> {
  const row = action.proposed;
  return assertOne(
    await client.query(
      `
        INSERT INTO "OwnershipPeriod"
          (id, "fundId", "organizationId", "companyId", "vehicleName",
           stake, "investmentYear", "exitYear", "isActive")
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
        WHERE EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $4 AND c.name = $10)
          AND EXISTS (SELECT 1 FROM "Organization" o WHERE o.id = $3 AND o.name = $11)
          AND NOT EXISTS (
            SELECT 1 FROM "OwnershipPeriod" op
            WHERE op.id = $1 OR (
              op."companyId" = $4
              AND op."organizationId" IS NOT DISTINCT FROM $3
              AND op."vehicleName" IS NOT DISTINCT FROM $5
            )
          )
        RETURNING id
      `,
      [
        row.id,
        row.fundId,
        row.organizationId,
        row.companyId,
        row.vehicleName,
        row.stake,
        row.investmentYear,
        row.exitYear,
        row.isActive,
        row.companyName,
        row.organizationName,
      ],
    ),
    `Ownership insert ${action.id}`,
  );
}

async function applyMilestoneUpdate(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "MILESTONE_UPDATE" }>,
): Promise<string> {
  const row = action.current;
  const proposed = action.proposed;
  return assertOne(
    await client.query(
      `
        UPDATE "Milestone" m
        SET date = $2, event = $3, category = $4::"MilestoneCategory",
            "sortDate" = $5::timestamp
        WHERE m.id = $1 AND m."companyId" = $6 AND m.date = $7
          AND m.event = $8 AND m.category::text = $9
          AND m."sortDate" IS NOT DISTINCT FROM $10::timestamp
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = m."companyId" AND c.name = $11)
        RETURNING m.id
      `,
      [
        row.id,
        proposed.date,
        proposed.event,
        proposed.category,
        proposed.sortDate,
        row.companyId,
        row.date,
        row.event,
        row.category,
        row.sortDate,
        row.companyName,
      ],
    ),
    `Milestone update ${action.id}`,
  );
}

async function applyMilestoneDelete(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "MILESTONE_DELETE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        DELETE FROM "Milestone" m
        WHERE m.id = $1 AND m."companyId" = $2 AND m.date = $3
          AND m.event = $4 AND m.category::text = $5
          AND m."sortDate" IS NOT DISTINCT FROM $6::timestamp
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = m."companyId" AND c.name = $7)
        RETURNING m.id
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
    ),
    `Milestone delete ${action.id}`,
  );
}

async function applyMilestoneInsert(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "MILESTONE_INSERT" }>,
): Promise<string> {
  const row = action.proposed;
  return assertOne(
    await client.query(
      `
        INSERT INTO "Milestone"
          (id, "companyId", date, event, category, "sortDate")
        SELECT $1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp
        WHERE EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $2 AND c.name = $7)
          AND NOT EXISTS (
            SELECT 1 FROM "Milestone" m
            WHERE m.id = $1 OR (
              m."companyId" = $2 AND m.date = $3 AND m.event = $4
            )
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
    ),
    `Milestone insert ${action.id}`,
  );
}

async function applyCitationUpdate(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "CITATION_UPDATE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        UPDATE "Citation" ci
        SET purpose = $2::"CitationPurpose", "evidenceLabel" = $3
        WHERE ci.id = $1 AND ci."sourceId" = $4
          AND ci."dealId" IS NOT DISTINCT FROM $5::text
          AND ci."companyId" IS NOT DISTINCT FROM $6::text
          AND ci.purpose::text = $7
          AND ci."evidenceLabel" IS NOT DISTINCT FROM $8::text
        RETURNING ci.id
      `,
      [
        row.id,
        action.proposed.purpose,
        action.proposed.evidenceLabel,
        row.sourceId,
        row.dealId,
        row.companyId,
        row.purpose,
        row.evidenceLabel,
      ],
    ),
    `Citation update ${action.id}`,
  );
}

async function applyCitationDelete(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "CITATION_DELETE" }>,
): Promise<string> {
  const row = action.current;
  return assertOne(
    await client.query(
      `
        DELETE FROM "Citation" ci
        WHERE ci.id = $1 AND ci."sourceId" = $2
          AND ci."dealId" IS NOT DISTINCT FROM $3::text
          AND ci."companyId" IS NOT DISTINCT FROM $4::text
          AND ci.purpose::text = $5
          AND ci."evidenceLabel" IS NOT DISTINCT FROM $6::text
          AND EXISTS (
            SELECT 1 FROM "Source" s WHERE s.id = ci."sourceId"
              AND s.label = $7 AND s.url = $8 AND s.type::text = $9
          )
        RETURNING ci.id
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
    ),
    `Citation delete ${action.id}`,
  );
}

async function applySourceUpdate(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "SOURCE_UPDATE" }>,
): Promise<string> {
  const row = action.current;
  const proposed = action.proposed;
  return assertOne(
    await client.query(
      `
        UPDATE "Source" s
        SET label = $2, url = $3, type = $4::"SourceType"
        WHERE s.id = $1 AND s.label = $5 AND s.url = $6
          AND s.type::text = $7
          AND to_char(s."createdAt", $8) = $9
          AND NOT EXISTS (
            SELECT 1 FROM "Source" other
            WHERE other.id <> s.id AND other.url = $3
          )
        RETURNING s.id
      `,
      [
        row.id,
        proposed.label,
        proposed.url,
        proposed.type,
        row.label,
        row.url,
        row.type,
        NAIVE_MICROS_FORMAT,
        row.createdAt,
      ],
    ),
    `Source update ${action.id}`,
  );
}

async function applySourceInsert(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "SOURCE_INSERT" }>,
): Promise<string> {
  const row = action.proposed;
  return assertOne(
    await client.query(
      `
        INSERT INTO "Source" (id, label, url, type)
        SELECT $1, $2, $3, $4::"SourceType"
        WHERE NOT EXISTS (
          SELECT 1 FROM "Source" s WHERE s.id = $1 OR s.url = $3
        )
        RETURNING id
      `,
      [row.id, row.label, row.url, row.type],
    ),
    `Source insert ${action.id}`,
  );
}

async function applyCitationInsert(
  client: Client,
  action: Extract<OwnershipIdentityAction, { actionType: "CITATION_INSERT" }>,
  citationIsPrimary: boolean,
): Promise<string> {
  const row = action.proposed;
  const sql = citationIsPrimary
    ? `
        INSERT INTO "Citation"
          (id, "sourceId", "dealId", "companyId", purpose,
           "evidenceLabel", "isPrimary")
        SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6, false
        WHERE EXISTS (
          SELECT 1 FROM "Source" s WHERE s.id = $2
            AND s.label = $7 AND s.url = $8 AND s.type::text = $9
        )
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $4)
          AND NOT EXISTS (
            SELECT 1 FROM "Citation" ci WHERE ci.id = $1 OR (
              ci."sourceId" = $2
              AND ci."dealId" IS NOT DISTINCT FROM $3::text
              AND ci."companyId" IS NOT DISTINCT FROM $4::text
              AND ci.purpose = $5::"CitationPurpose"
              AND ci."evidenceLabel" IS NOT DISTINCT FROM $6::text
            )
          )
        RETURNING id
      `
    : `
        INSERT INTO "Citation"
          (id, "sourceId", "dealId", "companyId", purpose, "evidenceLabel")
        SELECT $1, $2, $3, $4, $5::"CitationPurpose", $6
        WHERE EXISTS (
          SELECT 1 FROM "Source" s WHERE s.id = $2
            AND s.label = $7 AND s.url = $8 AND s.type::text = $9
        )
          AND EXISTS (SELECT 1 FROM "Company" c WHERE c.id = $4)
          AND NOT EXISTS (
            SELECT 1 FROM "Citation" ci WHERE ci.id = $1 OR (
              ci."sourceId" = $2
              AND ci."dealId" IS NOT DISTINCT FROM $3::text
              AND ci."companyId" IS NOT DISTINCT FROM $4::text
              AND ci.purpose = $5::"CitationPurpose"
              AND ci."evidenceLabel" IS NOT DISTINCT FROM $6::text
            )
          )
        RETURNING id
      `;
  return assertOne(
    await client.query(sql, [
      row.id,
      row.sourceId,
      row.dealId,
      row.companyId,
      row.purpose,
      row.evidenceLabel,
      row.sourceLabel,
      row.sourceUrl,
      row.sourceType,
    ]),
    `Citation insert ${action.id}`,
  );
}

function emptyMutationIds(): MutationIds {
  return {
    COMPANY_UPDATE: [],
    OWNERSHIP_UPDATE: [],
    OWNERSHIP_DELETE: [],
    ORGANIZATION_INSERT: [],
    OWNERSHIP_INSERT: [],
    MILESTONE_UPDATE: [],
    MILESTONE_DELETE: [],
    MILESTONE_INSERT: [],
    SOURCE_UPDATE: [],
    SOURCE_INSERT: [],
    CITATION_UPDATE: [],
    CITATION_DELETE: [],
    CITATION_INSERT: [],
  };
}

async function applyActions(
  client: Client,
  plan: OwnershipIdentityPlan,
  citationIsPrimary: boolean,
): Promise<MutationIds> {
  const ids = emptyMutationIds();
  for (const action of actionsOfType(plan.actions, "COMPANY_UPDATE")) {
    ids.COMPANY_UPDATE.push(await applyCompanyUpdate(client, action));
  }
  for (const action of actionsOfType(plan.actions, "OWNERSHIP_UPDATE")) {
    ids.OWNERSHIP_UPDATE.push(await applyOwnershipUpdate(client, action));
  }
  for (const action of actionsOfType(plan.actions, "OWNERSHIP_DELETE")) {
    ids.OWNERSHIP_DELETE.push(await applyOwnershipDelete(client, action));
  }
  for (const action of actionsOfType(plan.actions, "ORGANIZATION_INSERT")) {
    ids.ORGANIZATION_INSERT.push(await applyOrganizationInsert(client, action));
  }
  for (const action of actionsOfType(plan.actions, "OWNERSHIP_INSERT")) {
    ids.OWNERSHIP_INSERT.push(await applyOwnershipInsert(client, action));
  }
  for (const action of actionsOfType(plan.actions, "MILESTONE_UPDATE")) {
    ids.MILESTONE_UPDATE.push(await applyMilestoneUpdate(client, action));
  }
  for (const action of actionsOfType(plan.actions, "MILESTONE_DELETE")) {
    ids.MILESTONE_DELETE.push(await applyMilestoneDelete(client, action));
  }
  for (const action of actionsOfType(plan.actions, "MILESTONE_INSERT")) {
    ids.MILESTONE_INSERT.push(await applyMilestoneInsert(client, action));
  }
  for (const action of actionsOfType(plan.actions, "CITATION_UPDATE")) {
    ids.CITATION_UPDATE.push(await applyCitationUpdate(client, action));
  }
  for (const action of actionsOfType(plan.actions, "CITATION_DELETE")) {
    ids.CITATION_DELETE.push(await applyCitationDelete(client, action));
  }
  for (const action of actionsOfType(plan.actions, "SOURCE_UPDATE")) {
    ids.SOURCE_UPDATE.push(await applySourceUpdate(client, action));
  }
  for (const action of actionsOfType(plan.actions, "SOURCE_INSERT")) {
    ids.SOURCE_INSERT.push(await applySourceInsert(client, action));
  }
  for (const action of actionsOfType(plan.actions, "CITATION_INSERT")) {
    ids.CITATION_INSERT.push(
      await applyCitationInsert(client, action, citationIsPrimary),
    );
  }
  for (const values of Object.values(ids)) values.sort();
  return ids;
}

function withoutUpdatedAt<T extends { updatedAt: string }>(
  row: T,
): Omit<T, "updatedAt"> {
  const { updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

function withoutOrganizationTimestamps(
  row: OrganizationSnapshot,
): Omit<OrganizationSnapshot, "createdAt" | "updatedAt"> {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

function withoutOwnershipCreatedAt(
  row: OwnershipSnapshot,
): Omit<OwnershipSnapshot, "createdAt"> {
  const { createdAt: _createdAt, ...rest } = row;
  return rest;
}

function withoutSourceCreatedAt(
  row: SourceSnapshot,
): Omit<SourceSnapshot, "createdAt"> {
  const { createdAt: _createdAt, ...rest } = row;
  return rest;
}

function expectedCitationRows(before: LoadedState): CitationSnapshot[] {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const sources = new Map(
    manifest.sourceUpdates.map((action) => [action.id, action.proposed]),
  );
  const rows = new Map(
    before.citationRows.map((row) => [
      row.id,
      sources.has(row.sourceId)
        ? {
            ...row,
            sourceLabel: sources.get(row.sourceId)!.label,
            sourceUrl: sources.get(row.sourceId)!.url,
            sourceType: sources.get(row.sourceId)!.type,
          }
        : row,
    ]),
  );
  for (const action of manifest.citationUpdates)
    rows.set(action.id, action.proposed);
  for (const action of manifest.citationDeletes) rows.delete(action.id);
  for (const action of manifest.citationInserts)
    rows.set(action.id, action.proposed);
  return sorted([...rows.values()]);
}

function expectedMilestoneRows(before: LoadedState): MilestoneSnapshot[] {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const rows = new Map(before.milestoneRows.map((row) => [row.id, row]));
  for (const action of manifest.milestoneUpdates)
    rows.set(action.id, action.proposed);
  for (const action of manifest.milestoneDeletes) rows.delete(action.id);
  for (const action of manifest.milestoneInserts)
    rows.set(action.id, action.proposed);
  return sorted([...rows.values()]);
}

function assertMutationIds(ids: MutationIds): void {
  for (const actionType of Object.keys(ids) as Array<keyof MutationIds>) {
    exact(
      `${actionType} mutation IDs`,
      ids[actionType],
      actionsOfType(
        REVIEWED_OWNERSHIP_IDENTITY_MANIFEST[
          {
            COMPANY_UPDATE: "companyUpdates",
            OWNERSHIP_UPDATE: "ownershipUpdates",
            OWNERSHIP_DELETE: "ownershipDeletes",
            ORGANIZATION_INSERT: "organizationInserts",
            OWNERSHIP_INSERT: "ownershipInserts",
            MILESTONE_UPDATE: "milestoneUpdates",
            MILESTONE_DELETE: "milestoneDeletes",
            MILESTONE_INSERT: "milestoneInserts",
            SOURCE_UPDATE: "sourceUpdates",
            SOURCE_INSERT: "sourceInserts",
            CITATION_UPDATE: "citationUpdates",
            CITATION_DELETE: "citationDeletes",
            CITATION_INSERT: "citationInserts",
          }[actionType] as keyof typeof REVIEWED_OWNERSHIP_IDENTITY_MANIFEST
        ] as OwnershipIdentityAction[],
        actionType,
      )
        .map((action) => action.id)
        .sort(),
    );
  }
}

function assertPostconditions(
  before: LoadedState,
  after: LoadedState,
  mutationIds: MutationIds,
): void {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  assertMutationIds(mutationIds);

  const companies = new Map(after.companyRows.map((row) => [row.id, row]));
  for (const current of manifest.companyRows) {
    const actual = companies.get(current.id);
    if (!actual)
      throw new Error(`Postcondition: Company ${current.id} missing`);
    const action = manifest.companyUpdates.find((row) => row.id === current.id);
    if (action) {
      exact(`Company ${current.id}`, withoutUpdatedAt(actual), action.proposed);
      if (actual.updatedAt === action.current.updatedAt) {
        throw new Error(`Postcondition: Company ${current.id} did not advance`);
      }
    } else {
      exact(`Company guard ${current.id}`, actual, current);
    }
  }

  exact(
    "Inserted organizations",
    sorted(after.organizationRows).map(withoutOrganizationTimestamps),
    sorted(manifest.organizationInserts.map((row) => row.proposed)),
  );

  const ownership = new Map(after.ownershipRows.map((row) => [row.id, row]));
  for (const action of manifest.ownershipUpdates)
    exact(`Ownership ${action.id}`, ownership.get(action.id), action.proposed);
  for (const guard of manifest.ownershipGuards)
    exact(`Ownership guard ${guard.id}`, ownership.get(guard.id), guard);
  for (const action of manifest.ownershipDeletes) {
    if (ownership.has(action.id))
      throw new Error(`Postcondition: Ownership ${action.id} not deleted`);
  }
  for (const action of manifest.ownershipInserts) {
    const actual = ownership.get(action.id);
    if (!actual)
      throw new Error(`Postcondition: Ownership ${action.id} missing`);
    exact(
      `Inserted ownership ${action.id}`,
      withoutOwnershipCreatedAt(actual),
      action.proposed,
    );
  }
  exact(
    "Ownership row IDs",
    [...ownership.keys()].sort(),
    [
      ...before.ownershipRows
        .filter(
          (row) =>
            !manifest.ownershipDeletes.some((action) => action.id === row.id),
        )
        .map((row) => row.id),
      ...manifest.ownershipInserts.map((action) => action.id),
    ].sort(),
  );

  exact(
    "Milestone rows",
    sorted(after.milestoneRows),
    expectedMilestoneRows(before),
  );
  exact(
    "Citation rows",
    sorted(after.citationRows),
    expectedCitationRows(before),
  );

  const sources = new Map(after.sourceRows.map((row) => [row.id, row]));
  for (const action of manifest.sourceUpdates)
    exact(`Source ${action.id}`, sources.get(action.id), action.proposed);
  for (const action of manifest.sourceInserts) {
    const actual = sources.get(action.id);
    if (!actual) throw new Error(`Postcondition: Source ${action.id} missing`);
    exact(
      `Inserted source ${action.id}`,
      withoutSourceCreatedAt(actual),
      action.proposed,
    );
  }

  exact("Schema capabilities", after.snapshot.schema, before.snapshot.schema);
  exact(
    "Company count",
    after.snapshot.tableCounts.companies,
    before.snapshot.tableCounts.companies,
  );
  exact(
    "Organization count",
    after.snapshot.tableCounts.organizations,
    before.snapshot.tableCounts.organizations +
      manifest.organizationInserts.length,
  );
  exact(
    "Ownership count",
    after.snapshot.tableCounts.ownershipPeriods,
    before.snapshot.tableCounts.ownershipPeriods -
      manifest.ownershipDeletes.length +
      manifest.ownershipInserts.length,
  );
  exact(
    "Milestone count",
    after.snapshot.tableCounts.milestones,
    before.snapshot.tableCounts.milestones -
      manifest.milestoneDeletes.length +
      manifest.milestoneInserts.length,
  );
  exact(
    "Source count",
    after.snapshot.tableCounts.sources,
    before.snapshot.tableCounts.sources + manifest.sourceInserts.length,
  );
  exact(
    "Citation count",
    after.snapshot.tableCounts.citations,
    before.snapshot.tableCounts.citations -
      manifest.citationDeletes.length +
      manifest.citationInserts.length,
  );
}

function rollbackRows(plan: OwnershipIdentityPlan) {
  return {
    companyUpdates: actionsOfType(plan.actions, "COMPANY_UPDATE").map(
      (action) => action.current,
    ),
    ownershipUpdates: actionsOfType(plan.actions, "OWNERSHIP_UPDATE").map(
      (action) => action.current,
    ),
    deletedOwnershipRows: actionsOfType(plan.actions, "OWNERSHIP_DELETE").map(
      (action) => action.current,
    ),
    insertedOwnershipIds: actionsOfType(plan.actions, "OWNERSHIP_INSERT").map(
      (action) => action.id,
    ),
    insertedOrganizationIds: actionsOfType(
      plan.actions,
      "ORGANIZATION_INSERT",
    ).map((action) => action.id),
    milestoneUpdates: actionsOfType(plan.actions, "MILESTONE_UPDATE").map(
      (action) => action.current,
    ),
    deletedMilestoneRows: actionsOfType(plan.actions, "MILESTONE_DELETE").map(
      (action) => action.current,
    ),
    insertedMilestoneIds: actionsOfType(plan.actions, "MILESTONE_INSERT").map(
      (action) => action.id,
    ),
    sourceUpdates: actionsOfType(plan.actions, "SOURCE_UPDATE").map(
      (action) => action.current,
    ),
    insertedSourceIds: actionsOfType(plan.actions, "SOURCE_INSERT").map(
      (action) => action.id,
    ),
    citationUpdates: actionsOfType(plan.actions, "CITATION_UPDATE").map(
      (action) => action.current,
    ),
    deletedCitationRows: actionsOfType(plan.actions, "CITATION_DELETE").map(
      (action) => action.current,
    ),
    insertedCitationIds: actionsOfType(plan.actions, "CITATION_INSERT").map(
      (action) => action.id,
    ),
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

/**
 * Replace a receipt atomically so a failed finalization cannot truncate the
 * durable COMMIT_PENDING marker. The temporary file lives beside the receipt,
 * which keeps the rename on the same filesystem.
 */
async function replaceJsonAtomically(
  outputPath: string,
  value: unknown,
): Promise<void> {
  const absolutePath = path.resolve(outputPath);
  const temporaryPath = `${absolutePath}.tmp-${process.pid}-${Date.now()}`;
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryPath, absolutePath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
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

async function beginGuardedTransaction(client: Client): Promise<void> {
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
    LOCK_KEY,
  ]);
  await client.query(`
    LOCK TABLE "Company", "Organization", "OwnershipPeriod", "Milestone",
               "Source", "Citation"
    IN SHARE ROW EXCLUSIVE MODE
  `);
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = hasFlag("apply");
  const refreshMaterial = hasFlag("refresh-material");
  const approvalHash = option("approval-hash");
  const receiptOutput = option("receipt-output");
  const planOutput = option("plan-output") ?? DEFAULT_PLAN_OUTPUT;
  const target = parseDatabaseTarget(connectionString, apply);

  if (apply && refreshMaterial) {
    throw new Error("--refresh-material cannot be combined with --apply");
  }

  if (apply && (!approvalHash || !/^[0-9a-f]{64}$/.test(approvalHash))) {
    throw new Error("Apply requires --approval-hash=<exact lowercase SHA-256>");
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
  if (receiptOutput) await assertNewReceiptPath(receiptOutput);

  const client = new Client({ connectionString });
  await client.connect();
  let transactionOpen = false;
  let committed = false;
  let pendingReceiptMaterial: Record<string, unknown> | null = null;
  let pendingReceiptWritten = false;
  try {
    await beginGuardedTransaction(client);
    transactionOpen = true;
    if (refreshMaterial) {
      const state = await loadState(client, true);
      await client.query("ROLLBACK");
      transactionOpen = false;
      console.log(
        JSON.stringify(
          {
            companyRows: state.snapshot.companyRows,
            ownershipRows: state.snapshot.ownershipRows,
            milestoneRows: state.snapshot.milestoneRows,
            citationRows: state.snapshot.citationRows,
            sourceTargets: state.snapshot.sourceTargets,
            protectedSets: state.snapshot.protectedSets,
            conflicts: {
              organizations: state.snapshot.organizationConflicts,
              ownership: state.snapshot.ownershipConflicts,
              milestones: state.snapshot.milestoneConflicts,
              sources: state.snapshot.sourceConflicts,
              citations: state.snapshot.citationConflicts,
              entityIds: state.snapshot.entityIdConflicts,
            },
            schema: state.snapshot.schema,
            tableCounts: state.snapshot.tableCounts,
          },
          null,
          2,
        ),
      );
      return;
    }
    const before = await buildPlan(client, target);
    if (before.plan.actionCount !== REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT) {
      throw new Error("Plan action count drifted from reviewed scope");
    }
    if (
      before.plan.actionSetSha256 !==
      REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256
    ) {
      throw new Error("Plan action-set SHA-256 drifted from reviewed scope");
    }
    if (apply && approvalHash !== before.planSha256) {
      throw new Error("--approval-hash does not match the exact live plan");
    }

    const artifact = {
      generatedAt: new Date().toISOString(),
      mode: apply ? "APPLY" : "DRY_RUN_MUTATE_ROLLBACK",
      planSha256: before.planSha256,
      hashMaterial: before.hashMaterial,
      snapshot: before.state.snapshot,
      rollbackRows: rollbackRows(before.plan),
    };

    const mutationIds = await applyActions(
      client,
      before.plan,
      before.state.snapshot.schema.citationIsPrimary,
    );
    const after = await loadState(client, false);
    assertPostconditions(before.state, after, mutationIds);

    if (!apply) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      const restored = await loadState(client, true);
      exact("Rollback-restored state", restored, before.state);
      await writeJson(planOutput, artifact, false);
      console.log(
        JSON.stringify(
          {
            mode: "DRY_RUN_MUTATE_ROLLBACK",
            planSha256: before.planSha256,
            manifestSha256: REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
            actionSetSha256: before.plan.actionSetSha256,
            actionCount: before.plan.actionCount,
            mutationIds,
            tableCounts: before.state.snapshot.tableCounts,
            quarantinedClaims: before.plan.quarantinedClaims.length,
            rollbackVerified: true,
            planOutput: path.resolve(planOutput),
          },
          null,
          2,
        ),
      );
      return;
    }

    pendingReceiptMaterial = {
      schemaVersion: OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCHEMA_VERSION,
      scope: OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCOPE,
      state: "COMMIT_PENDING",
      preparedAt: new Date().toISOString(),
      databaseTarget: target,
      planSha256: before.planSha256,
      manifestSha256: REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutationIds,
      rollbackRows: rollbackRows(before.plan),
      before: {
        snapshotSha256: before.plan.snapshotSha256,
        tableCounts: before.state.snapshot.tableCounts,
      },
      after: {
        snapshotSha256: sha256(after),
        tableCounts: after.snapshot.tableCounts,
      },
      quarantinedClaims: before.plan.quarantinedClaims,
      postconditions: {
        exactMutationIds: true,
        protectedCompanySetsVerified: true,
        fullDeletedRowsRecorded: true,
        insertedRowIdsRecorded: true,
        exactTableDeltasVerified: true,
        receiptPathWasAbsentBeforeMutation: true,
      },
    };

    // Recheck immediately before creation to close the preflight/write race.
    await assertNewReceiptPath(receiptOutput!);
    await writeJson(
      receiptOutput!,
      {
        ...pendingReceiptMaterial,
        receiptSha256: sha256(pendingReceiptMaterial),
      },
      true,
    );
    pendingReceiptWritten = true;
    await writeJson(planOutput, artifact, false);

    await client.query("COMMIT");
    transactionOpen = false;
    committed = true;

    const appliedReceiptMaterial = {
      ...pendingReceiptMaterial,
      state: "APPLIED",
      appliedAt: new Date().toISOString(),
    };
    const receipt = {
      ...appliedReceiptMaterial,
      receiptSha256: sha256(appliedReceiptMaterial),
    };
    await replaceJsonAtomically(receiptOutput!, receipt);
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
    if (transactionOpen) {
      await client.query("ROLLBACK").catch(() => undefined);
      transactionOpen = false;
    }
    if (
      pendingReceiptMaterial &&
      pendingReceiptWritten &&
      receiptOutput &&
      !committed
    ) {
      const notAppliedReceiptMaterial = {
        ...pendingReceiptMaterial,
        state: "NOT_APPLIED",
        failedAt: new Date().toISOString(),
      };
      try {
        await replaceJsonAtomically(receiptOutput, {
          ...notAppliedReceiptMaterial,
          receiptSha256: sha256(notAppliedReceiptMaterial),
        });
      } catch {
        // Preserve the original database or filesystem failure.
      }
    }
    if (committed && pendingReceiptMaterial && receiptOutput) {
      throw new Error(
        `Database commit succeeded, but receipt finalization failed; COMMIT_PENDING receipt remains at ${path.resolve(receiptOutput)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
