/**
 * Evidence-gated exact-ID remediation for seven reviewed portfolio-company
 * cards. Sunrise Renewables and unsupported sub-actions remain quarantined.
 * Dry-run is the default and exercises every mutation inside a serializable
 * transaction before rolling it back.
 *
 * Dry run:
 *   npx tsx scripts/remediate-high-confidence-data-corrections.ts
 *
 * Reviewed apply (not performed by the implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-high-confidence-data-corrections.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=<new JSON path>
 */
import "dotenv/config";

import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client, type QueryResult } from "pg";
import {
  HIGH_CONFIDENCE_DATA_CORRECTIONS_SCHEMA_VERSION,
  HIGH_CONFIDENCE_DATA_CORRECTIONS_SCOPE,
  REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT,
  REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256,
  REVIEWED_HIGH_CONFIDENCE_MANIFEST,
  REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256,
  buildHighConfidencePlan,
  type CitationIdentityIndexState,
  type CitationSnapshot,
  type CompanyGuard,
  type CompanyProtection,
  type HighConfidenceAction,
  type HighConfidencePlan,
  type HighConfidenceSnapshot,
  type MilestoneSnapshot,
  type OwnershipSnapshot,
  type ProtectedSetDigest,
  type TableCounts,
} from "./portfolio-review/high-confidence-data-corrections";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:high-confidence-data-corrections:v1";
const CITATION_IDENTITY_INDEX = "Citation_company_identity_unique";
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';
const DEFAULT_PLAN_OUTPUT =
  "audits/portfolio-company-review-2026-07-22/high-confidence-data-corrections-plan.json";

interface DatabaseTarget {
  host: string;
  database: string;
}

interface LoadedState {
  snapshot: HighConfidenceSnapshot;
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  citationRows: CitationSnapshot[];
}

interface BuiltPlan {
  state: LoadedState;
  plan: HighConfidencePlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  ownershipUpdates: string[];
  milestoneUpdates: string[];
  milestoneInserts: string[];
  citationUpdates: string[];
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

function assertOne(result: QueryResult, label: string): void {
  if (result.rowCount !== 1) {
    throw new Error(
      `${label} affected ${result.rowCount ?? 0} rows; expected 1`,
    );
  }
}

function companyIds(): string[] {
  return REVIEWED_HIGH_CONFIDENCE_MANIFEST.companyGuards.map((row) => row.id);
}

async function loadCompanyGuards(client: Client): Promise<CompanyGuard[]> {
  const result = await client.query<CompanyGuard>(
    `
      SELECT c.id, c.name, c."companyStatus"::text AS "companyStatus",
             c.status::text AS "recordStatus",
             to_char(c."updatedAt", $2) AS "updatedAt"
      FROM "Company" c
      WHERE c.id = ANY($1::text[])
      ORDER BY c.id
    `,
    [companyIds(), NAIVE_MICROS_FORMAT],
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

async function loadCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const proposed = REVIEWED_HIGH_CONFIDENCE_MANIFEST.citationUpdates.map(
    (action) => ({
      id: action.id,
      sourceId: action.proposed.sourceId,
      companyId: action.proposed.companyId,
      dealId: action.proposed.dealId,
      purpose: action.proposed.purpose,
      evidenceLabel: action.proposed.evidenceLabel,
    }),
  );
  const result = await client.query<CitationSnapshot>(
    `
      WITH proposed AS (
        SELECT *
        FROM jsonb_to_recordset($1::jsonb) AS p(
          id text, "sourceId" text, "companyId" text, "dealId" text,
          purpose text, "evidenceLabel" text
        )
      )
      SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId",
             ci.purpose::text, ci."evidenceLabel",
             s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType"
      FROM proposed p
      JOIN "Citation" ci
        ON ci.id <> p.id
       AND ci."sourceId" = p."sourceId"
       AND ci."companyId" IS NOT DISTINCT FROM p."companyId"
       AND ci."dealId" IS NOT DISTINCT FROM p."dealId"
       AND ci.purpose::text = p.purpose
       AND ci."evidenceLabel" IS NOT DISTINCT FROM p."evidenceLabel"
      JOIN "Source" s ON s.id = ci."sourceId"
      ORDER BY ci.id
    `,
    [JSON.stringify(proposed)],
  );
  return result.rows;
}

async function loadMilestoneConflicts(
  client: Client,
): Promise<MilestoneSnapshot[]> {
  const proposed = REVIEWED_HIGH_CONFIDENCE_MANIFEST.milestoneInserts.map(
    (action) => action.proposed,
  );
  const result = await client.query<MilestoneSnapshot>(
    `
      WITH proposed AS (
        SELECT *
        FROM jsonb_to_recordset($1::jsonb) AS p(
          id text, "companyId" text, date text, event text
        )
      )
      SELECT m.id, m."companyId", c.name AS "companyName", m.date,
             m.event, m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM proposed p
      JOIN "Milestone" m
        ON m.id = p.id
        OR (
          m.id <> p.id AND m."companyId" = p."companyId"
          AND m.date = p.date AND m.event = p.event
        )
      JOIN "Company" c ON c.id = m."companyId"
      ORDER BY m.id
    `,
    [JSON.stringify(proposed), NAIVE_MICROS_FORMAT],
  );
  return result.rows;
}

async function loadTableCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(`
    SELECT
      (SELECT count(*)::int FROM "Company") AS companies,
      (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
      (SELECT count(*)::int FROM "Milestone") AS milestones,
      (SELECT count(*)::int FROM "Citation") AS citations,
      (SELECT count(*)::int FROM "Source") AS sources
  `);
  return result.rows[0];
}

async function loadCitationIdentityIndex(
  client: Client,
): Promise<CitationIdentityIndexState> {
  const result = await client.query<{
    isUnique: boolean;
    isValid: boolean;
    isReady: boolean;
    nullsNotDistinct: boolean;
    definition: string;
  }>(
    `
      SELECT i.indisunique AS "isUnique", i.indisvalid AS "isValid",
             i.indisready AS "isReady",
             i.indnullsnotdistinct AS "nullsNotDistinct",
             pg_get_indexdef(i.indexrelid) AS definition
      FROM pg_class x
      JOIN pg_index i ON i.indexrelid = x.oid
      WHERE x.relname = $1
    `,
    [CITATION_IDENTITY_INDEX],
  );
  const row = result.rows[0];
  return row
    ? { exists: true, ...row }
    : {
        exists: false,
        isUnique: false,
        isValid: false,
        isReady: false,
        nullsNotDistinct: false,
        definition: null,
      };
}

function protections(
  ownershipRows: OwnershipSnapshot[],
  milestoneRows: MilestoneSnapshot[],
  citationRows: CitationSnapshot[],
): CompanyProtection[] {
  return REVIEWED_HIGH_CONFIDENCE_MANIFEST.companyGuards
    .map((company) => ({
      companyId: company.id,
      companyName: company.name,
      ownership: digest(
        ownershipRows.filter((row) => row.companyId === company.id),
      ),
      milestones: digest(
        milestoneRows.filter((row) => row.companyId === company.id),
      ),
      citations: digest(
        citationRows.filter((row) => row.companyId === company.id),
      ),
    }))
    .sort((left, right) => left.companyId.localeCompare(right.companyId));
}

async function loadState(
  client: Client,
  includeConflicts: boolean,
): Promise<LoadedState> {
  const companyGuards = await loadCompanyGuards(client);
  const ownershipRows = await loadOwnershipRows(client);
  const milestoneRows = await loadMilestoneRows(client);
  const citationRows = await loadCitationRows(client);
  const ownershipIds = new Set(
    REVIEWED_HIGH_CONFIDENCE_MANIFEST.ownershipUpdates.map((row) => row.id),
  );
  const milestoneIds = new Set(
    REVIEWED_HIGH_CONFIDENCE_MANIFEST.milestoneUpdates.map((row) => row.id),
  );
  const citationIds = new Set(
    REVIEWED_HIGH_CONFIDENCE_MANIFEST.citationUpdates.map((row) => row.id),
  );
  return {
    ownershipRows,
    milestoneRows,
    citationRows,
    snapshot: {
      companyGuards,
      ownershipTargets: ownershipRows.filter((row) => ownershipIds.has(row.id)),
      milestoneTargets: milestoneRows.filter((row) => milestoneIds.has(row.id)),
      citationTargets: citationRows.filter((row) => citationIds.has(row.id)),
      protectedSets: protections(ownershipRows, milestoneRows, citationRows),
      proposedCitationConflicts: includeConflicts
        ? await loadCitationConflicts(client)
        : [],
      proposedMilestoneConflicts: includeConflicts
        ? await loadMilestoneConflicts(client)
        : [],
      tableCounts: await loadTableCounts(client),
      citationIdentityIndex: await loadCitationIdentityIndex(client),
    },
  };
}

function planHashMaterial(plan: HighConfidencePlan, target: DatabaseTarget) {
  return {
    schemaVersion: HIGH_CONFIDENCE_DATA_CORRECTIONS_SCHEMA_VERSION,
    scope: HIGH_CONFIDENCE_DATA_CORRECTIONS_SCOPE,
    databaseTarget: target,
    reviewedActionCount: REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT,
    reviewedActionSetSha256: REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256,
    reviewedManifestSha256: REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256,
    snapshotSha256: plan.snapshotSha256,
    actionSetSha256: plan.actionSetSha256,
    actions: plan.actions,
    counts: plan.counts,
    quarantinedFields: plan.quarantinedFields,
  };
}

async function buildPlan(
  client: Client,
  target: DatabaseTarget,
): Promise<BuiltPlan> {
  const state = await loadState(client, true);
  const plan = buildHighConfidencePlan(state.snapshot);
  const hashMaterial = planHashMaterial(plan, target);
  return { state, plan, hashMaterial, planSha256: sha256(hashMaterial) };
}

async function applyOwnershipUpdate(
  client: Client,
  action: Extract<HighConfidenceAction, { actionType: "OWNERSHIP_UPDATE" }>,
): Promise<void> {
  const row = action.current;
  const result = await client.query(
    `
      UPDATE "OwnershipPeriod"
      SET "vehicleName" = $2
      WHERE id = $1
        AND "companyId" = $3
        AND "fundId" IS NOT DISTINCT FROM $4::text
        AND "organizationId" IS NOT DISTINCT FROM $5::text
        AND "vehicleName" IS NOT DISTINCT FROM $6::text
        AND stake IS NOT DISTINCT FROM $7::text
        AND "investmentYear" IS NOT DISTINCT FROM $8::int
        AND "exitYear" IS NOT DISTINCT FROM $9::int
        AND "isActive" = $10
        AND to_char("createdAt", $11) = $12
      RETURNING id
    `,
    [
      action.id,
      action.proposed.vehicleName,
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
    ],
  );
  assertOne(result, `Ownership update ${action.id}`);
}

async function applyMilestoneUpdate(
  client: Client,
  action: Extract<HighConfidenceAction, { actionType: "MILESTONE_UPDATE" }>,
): Promise<void> {
  const row = action.current;
  const result = await client.query(
    `
      UPDATE "Milestone"
      SET category = $2::"MilestoneCategory"
      WHERE id = $1
        AND "companyId" = $3
        AND date = $4
        AND event = $5
        AND category::text = $6
        AND (
          ($7::text IS NULL AND "sortDate" IS NULL)
          OR to_char("sortDate", $8) = $7
        )
      RETURNING id
    `,
    [
      action.id,
      action.proposed.category,
      row.companyId,
      row.date,
      row.event,
      row.category,
      row.sortDate,
      NAIVE_MICROS_FORMAT,
    ],
  );
  assertOne(result, `Milestone update ${action.id}`);
}

async function applyMilestoneInsert(
  client: Client,
  action: Extract<HighConfidenceAction, { actionType: "MILESTONE_INSERT" }>,
): Promise<void> {
  const row = action.proposed;
  const result = await client.query(
    `
      INSERT INTO "Milestone" (
        id, "companyId", date, event, category, "sortDate"
      )
      VALUES ($1, $2, $3, $4, $5::"MilestoneCategory", $6::timestamp)
      RETURNING id
    `,
    [row.id, row.companyId, row.date, row.event, row.category, row.sortDate],
  );
  assertOne(result, `Milestone insert ${action.id}`);
}

async function applyCitationUpdate(
  client: Client,
  action: Extract<HighConfidenceAction, { actionType: "CITATION_UPDATE" }>,
): Promise<void> {
  const row = action.current;
  const result = await client.query(
    `
      UPDATE "Citation"
      SET purpose = $2::"CitationPurpose"
      WHERE id = $1
        AND "sourceId" = $3
        AND "dealId" IS NOT DISTINCT FROM $4::text
        AND "companyId" IS NOT DISTINCT FROM $5::text
        AND purpose::text = $6
        AND "evidenceLabel" IS NOT DISTINCT FROM $7::text
      RETURNING id
    `,
    [
      action.id,
      action.proposed.purpose,
      row.sourceId,
      row.dealId,
      row.companyId,
      row.purpose,
      row.evidenceLabel,
    ],
  );
  assertOne(result, `Citation update ${action.id}`);
}

async function applyActions(
  client: Client,
  actions: readonly HighConfidenceAction[],
): Promise<MutationIds> {
  const ids: MutationIds = {
    ownershipUpdates: [],
    milestoneUpdates: [],
    milestoneInserts: [],
    citationUpdates: [],
  };
  for (const action of actions) {
    if (action.actionType === "OWNERSHIP_UPDATE") {
      await applyOwnershipUpdate(client, action);
      ids.ownershipUpdates.push(action.id);
    } else if (action.actionType === "MILESTONE_UPDATE") {
      await applyMilestoneUpdate(client, action);
      ids.milestoneUpdates.push(action.id);
    } else if (action.actionType === "MILESTONE_INSERT") {
      await applyMilestoneInsert(client, action);
      ids.milestoneInserts.push(action.id);
    } else {
      await applyCitationUpdate(client, action);
      ids.citationUpdates.push(action.id);
    }
  }
  return ids;
}

function expectedAfter(before: LoadedState): LoadedState {
  const manifest = REVIEWED_HIGH_CONFIDENCE_MANIFEST;
  const ownership = new Map(before.ownershipRows.map((row) => [row.id, row]));
  const milestones = new Map(before.milestoneRows.map((row) => [row.id, row]));
  const citations = new Map(before.citationRows.map((row) => [row.id, row]));
  for (const action of manifest.ownershipUpdates) {
    ownership.set(action.id, action.proposed);
  }
  for (const action of manifest.milestoneUpdates) {
    milestones.set(action.id, action.proposed);
  }
  for (const action of manifest.milestoneInserts) {
    milestones.set(action.id, action.proposed);
  }
  for (const action of manifest.citationUpdates) {
    citations.set(action.id, action.proposed);
  }
  const ownershipRows = sorted([...ownership.values()]);
  const milestoneRows = sorted([...milestones.values()]);
  const citationRows = sorted([...citations.values()]);
  const tableCounts = {
    ...before.snapshot.tableCounts,
    milestones: before.snapshot.tableCounts.milestones + 1,
  };
  return {
    ownershipRows,
    milestoneRows,
    citationRows,
    snapshot: {
      ...before.snapshot,
      ownershipTargets: sorted(
        manifest.ownershipUpdates.map((row) => row.proposed),
      ),
      milestoneTargets: sorted(
        manifest.milestoneUpdates.map((row) => row.proposed),
      ),
      citationTargets: sorted(
        manifest.citationUpdates.map((row) => row.proposed),
      ),
      protectedSets: protections(ownershipRows, milestoneRows, citationRows),
      proposedCitationConflicts: [],
      proposedMilestoneConflicts: [],
      tableCounts,
    },
  };
}

function assertPostconditions(before: LoadedState, after: LoadedState): void {
  const expected = expectedAfter(before);
  exact(
    "Company guards",
    after.snapshot.companyGuards,
    expected.snapshot.companyGuards,
  );
  exact("Ownership rows", after.ownershipRows, expected.ownershipRows);
  exact("Milestone rows", after.milestoneRows, expected.milestoneRows);
  exact("Citation rows", after.citationRows, expected.citationRows);
  exact(
    "Protected sets",
    after.snapshot.protectedSets,
    expected.snapshot.protectedSets,
  );
  exact(
    "Table counts",
    after.snapshot.tableCounts,
    expected.snapshot.tableCounts,
  );
  exact(
    "Citation identity index",
    after.snapshot.citationIdentityIndex,
    expected.snapshot.citationIdentityIndex,
  );
}

function rollbackRows(plan: HighConfidencePlan) {
  return {
    ownershipUpdates: plan.actions
      .filter(
        (
          action,
        ): action is Extract<
          HighConfidenceAction,
          { actionType: "OWNERSHIP_UPDATE" }
        > => action.actionType === "OWNERSHIP_UPDATE",
      )
      .map((action) => action.current),
    milestoneUpdates: plan.actions
      .filter(
        (
          action,
        ): action is Extract<
          HighConfidenceAction,
          { actionType: "MILESTONE_UPDATE" }
        > => action.actionType === "MILESTONE_UPDATE",
      )
      .map((action) => action.current),
    milestoneDeletes: plan.actions
      .filter(
        (
          action,
        ): action is Extract<
          HighConfidenceAction,
          { actionType: "MILESTONE_INSERT" }
        > => action.actionType === "MILESTONE_INSERT",
      )
      .map((action) => ({ id: action.id })),
    citationUpdates: plan.actions
      .filter(
        (
          action,
        ): action is Extract<
          HighConfidenceAction,
          { actionType: "CITATION_UPDATE" }
        > => action.actionType === "CITATION_UPDATE",
      )
      .map((action) => action.current),
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

async function beginGuardedTransaction(client: Client): Promise<void> {
  await client.query("BEGIN");
  await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
    LOCK_KEY,
  ]);
  await client.query(`
    LOCK TABLE "Company", "OwnershipPeriod", "Milestone", "Citation", "Source"
    IN SHARE ROW EXCLUSIVE MODE
  `);
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = hasFlag("apply");
  const target = parseDatabaseTarget(connectionString, apply);
  const approvalHash = option("approval-hash");
  const receiptOutput = option("receipt-output");
  const planOutput = option("plan-output") ?? DEFAULT_PLAN_OUTPUT;
  if (apply && !approvalHash) {
    throw new Error("Apply requires --approval-hash=<exact plan SHA-256>");
  }
  if (apply && !receiptOutput) {
    throw new Error("Apply requires --receipt-output=<new JSON path>");
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
    const built = await buildPlan(client, target);
    if (built.plan.actionCount !== REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT) {
      throw new Error("Plan action count drifted from reviewed scope");
    }
    if (
      built.plan.actionSetSha256 !== REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256
    ) {
      throw new Error("Plan action-set SHA-256 drifted from reviewed scope");
    }
    if (apply && approvalHash !== built.planSha256) {
      throw new Error("--approval-hash does not match the exact live plan");
    }

    const planArtifact = {
      generatedAt: new Date().toISOString(),
      mode: apply ? "APPLY" : "DRY_RUN_ROLLBACK",
      planSha256: built.planSha256,
      hashMaterial: built.hashMaterial,
      snapshot: built.state.snapshot,
      rollback: rollbackRows(built.plan),
    };
    const mutationIds = await applyActions(client, built.plan.actions);
    const after = await loadState(client, false);
    assertPostconditions(built.state, after);

    if (!apply) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      const restored = await loadState(client, true);
      exact("Rollback snapshot", restored.snapshot, built.state.snapshot);
      exact(
        "Rollback ownership rows",
        restored.ownershipRows,
        built.state.ownershipRows,
      );
      exact(
        "Rollback milestone rows",
        restored.milestoneRows,
        built.state.milestoneRows,
      );
      exact(
        "Rollback citation rows",
        restored.citationRows,
        built.state.citationRows,
      );
      await writeJson(planOutput, planArtifact, false);
      console.log(
        JSON.stringify(
          {
            mode: "DRY_RUN_ROLLBACK",
            planSha256: built.planSha256,
            actionCount: built.plan.actionCount,
            mutationIds,
            quarantinedFields: built.plan.quarantinedFields.length,
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
      schemaVersion: HIGH_CONFIDENCE_DATA_CORRECTIONS_SCHEMA_VERSION,
      scope: HIGH_CONFIDENCE_DATA_CORRECTIONS_SCOPE,
      appliedAt: new Date().toISOString(),
      databaseTarget: target,
      planSha256: built.planSha256,
      actionSetSha256: built.plan.actionSetSha256,
      snapshotSha256: built.plan.snapshotSha256,
      mutationIds,
      before: {
        ownershipTargets: built.state.snapshot.ownershipTargets,
        milestoneTargets: built.state.snapshot.milestoneTargets,
        citationTargets: built.state.snapshot.citationTargets,
        tableCounts: built.state.snapshot.tableCounts,
      },
      after: {
        ownershipTargets: after.snapshot.ownershipTargets,
        milestoneTargets: after.snapshot.milestoneTargets,
        citationTargets: after.snapshot.citationTargets,
        tableCounts: after.snapshot.tableCounts,
      },
      rollback: rollbackRows(built.plan),
      quarantinedFields: built.plan.quarantinedFields,
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
          planSha256: built.planSha256,
          receiptSha256: receipt.receiptSha256,
          receiptOutput: path.resolve(receiptOutput!),
          planOutput: path.resolve(planOutput),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
