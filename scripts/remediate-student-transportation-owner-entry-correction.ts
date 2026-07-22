/**
 * Exact-ID, fail-closed Student Transportation / Ullico milestone correction.
 * Dry-run is the default and always rolls back. Apply requires the exact fresh
 * plan hash, explicit database target guards, and a new durable receipt path.
 */
import "dotenv/config";

import { constants } from "node:fs";
import {
  access,
  link,
  mkdir,
  open,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { Client, type QueryResult } from "pg";

import { companies } from "../prisma/seed-data/companies";
import {
  REVIEWED_STUDENT_TRANSPORTATION_ACTION_COUNT,
  REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256,
  REVIEWED_STUDENT_TRANSPORTATION_MANIFEST,
  REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
  REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
  STUDENT_TRANSPORTATION_CORRECTION_SCHEMA_VERSION,
  STUDENT_TRANSPORTATION_CORRECTION_SCOPE,
  buildStudentTransportationPlan,
  studentTransportationSeedSha256,
  type CitationIndexState,
  type CitationRow,
  type CompanyGuard,
  type CompanyProtection,
  type MilestoneRow,
  type OwnershipRow,
  type ProtectedDigest,
  type StudentTransportationPlan,
  type StudentTransportationSnapshot,
  type TableCounts,
} from "./portfolio-review/student-transportation-owner-entry-correction";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:student-transportation-owner-entry-correction:v1";
const INDEX_NAME = "Citation_company_identity_unique";
const NAIVE_MICROS = 'YYYY-MM-DD"T"HH24:MI:SS.US';
const DEFAULT_PLAN_OUTPUT =
  "audits/portfolio-company-review-2026-07-22/student-transportation-owner-entry-correction-plan.json";

interface DatabaseTarget {
  host: string;
  database: string;
  port: string;
  schema: string;
}

interface FullState {
  snapshot: StudentTransportationSnapshot;
  companyGuard: CompanyGuard | null;
  ownershipRows: OwnershipRow[];
  milestoneRows: MilestoneRow[];
  citationRows: CitationRow[];
}

function hasFlag(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function parseTarget(
  connectionString: string,
  requireExplicit: boolean,
): Omit<DatabaseTarget, "schema"> & { schema?: string } {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use postgres");
  }
  const target = {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    port: parsed.port || "5432",
    schema: parsed.searchParams.get("schema") ?? undefined,
  };
  const expected = {
    host: process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase(),
    database: process.env.EXPECTED_DATABASE_NAME?.trim(),
    port: process.env.EXPECTED_DATABASE_PORT?.trim(),
    schema: process.env.EXPECTED_DATABASE_SCHEMA?.trim(),
  };
  if (
    requireExplicit &&
    (!expected.host || !expected.database || !expected.port || !expected.schema)
  ) {
    throw new Error(
      "Apply requires EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, EXPECTED_DATABASE_PORT, and EXPECTED_DATABASE_SCHEMA",
    );
  }
  for (const key of ["host", "database", "port"] as const) {
    if (expected[key] && expected[key] !== target[key]) {
      throw new Error(`Database ${key} mismatch`);
    }
  }
  if (target.schema && expected.schema && target.schema !== expected.schema) {
    throw new Error("Database schema mismatch");
  }
  return target;
}

async function assertConnectedTarget(
  client: Client,
  parsed: ReturnType<typeof parseTarget>,
): Promise<DatabaseTarget> {
  const result = await client.query<{
    database: string;
    schema: string;
    port: string;
  }>(
    `SELECT current_database() AS database,current_schema() AS schema,inet_server_port()::text AS port`,
  );
  const row = result.rows[0];
  if (!row) throw new Error("Could not resolve connected database target");
  if (row.database !== parsed.database || row.port !== parsed.port) {
    throw new Error("Connected database target differs from DATABASE_URL");
  }
  const expectedSchema = process.env.EXPECTED_DATABASE_SCHEMA?.trim();
  if (expectedSchema && row.schema !== expectedSchema) {
    throw new Error("Connected database schema mismatch");
  }
  return { ...parsed, schema: row.schema };
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function digest<T extends { id: string }>(rows: readonly T[]): ProtectedDigest {
  const ordered = sorted(rows);
  return { count: ordered.length, sha256: sha256(ordered) };
}

function protection(
  ownershipRows: OwnershipRow[],
  milestoneRows: MilestoneRow[],
  citationRows: CitationRow[],
): CompanyProtection {
  return {
    ownership: digest(ownershipRows),
    milestones: digest(milestoneRows),
    citations: digest(citationRows),
  };
}

function exact(label: string, actual: unknown, expected: unknown): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} failed exact postcondition`);
  }
}

function assertOne(result: QueryResult, label: string): void {
  if (result.rowCount !== 1) {
    throw new Error(
      `${label} affected ${result.rowCount ?? 0} rows; expected 1`,
    );
  }
}

async function loadCompany(client: Client): Promise<CompanyGuard | null> {
  const id = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.companyGuard.id;
  const result = await client.query<CompanyGuard>(
    `SELECT id,name,"yearFounded","companyStatus"::text AS "companyStatus",status::text AS "recordStatus",to_char("updatedAt",$2) AS "updatedAt" FROM "Company" WHERE id=$1`,
    [id, NAIVE_MICROS],
  );
  return result.rows[0] ?? null;
}

async function loadOwnershipRows(client: Client): Promise<OwnershipRow[]> {
  const id = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.companyGuard.id;
  const result = await client.query<OwnershipRow>(
    `SELECT op.id,op."companyId",op."fundId",op."organizationId",o.name AS "organizationName",op."vehicleName",op.stake,op."investmentYear",op."exitYear",op."isActive",to_char(op."createdAt",$2) AS "createdAt" FROM "OwnershipPeriod" op LEFT JOIN "Organization" o ON o.id=op."organizationId" WHERE op."companyId"=$1 ORDER BY op.id`,
    [id, NAIVE_MICROS],
  );
  return result.rows;
}

async function loadMilestoneRows(client: Client): Promise<MilestoneRow[]> {
  const id = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.companyGuard.id;
  const result = await client.query<MilestoneRow>(
    `SELECT id,"companyId",date,event,category::text AS category,CASE WHEN "sortDate" IS NULL THEN NULL ELSE to_char("sortDate",$2) END AS "sortDate" FROM "Milestone" WHERE "companyId"=$1 ORDER BY id`,
    [id, NAIVE_MICROS],
  );
  return result.rows;
}

async function loadCitationRows(client: Client): Promise<CitationRow[]> {
  const id = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.companyGuard.id;
  const result = await client.query<CitationRow>(
    `SELECT ci.id,ci."sourceId",ci."dealId",ci."companyId",ci.purpose::text AS purpose,ci."evidenceLabel",s.label AS "sourceLabel",s.url AS "sourceUrl",s.type::text AS "sourceType" FROM "Citation" ci JOIN "Source" s ON s.id=ci."sourceId" WHERE ci."companyId"=$1 ORDER BY ci.id`,
    [id],
  );
  return result.rows;
}

async function loadCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(
    `SELECT (SELECT count(*)::int FROM "Company") AS companies,(SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",(SELECT count(*)::int FROM "Milestone") AS milestones,(SELECT count(*)::int FROM "Source") AS sources,(SELECT count(*)::int FROM "Citation") AS citations`,
  );
  if (!result.rows[0]) throw new Error("Could not load table counts");
  return result.rows[0];
}

async function loadIndex(client: Client): Promise<CitationIndexState> {
  const result = await client.query<CitationIndexState>(
    `SELECT EXISTS(SELECT 1 FROM pg_class WHERE relname=$1 AND relkind='i') AS exists,COALESCE(i.indisunique,false) AS "isUnique",COALESCE(i.indisvalid,false) AS "isValid",COALESCE(i.indisready,false) AS "isReady",COALESCE(i.indnullsnotdistinct,false) AS "nullsNotDistinct",pg_get_indexdef(i.indexrelid) AS definition FROM (SELECT to_regclass('public."Citation_company_identity_unique"')::oid AS oid) r LEFT JOIN pg_index i ON i.indexrelid=r.oid`,
    [INDEX_NAME],
  );
  if (!result.rows[0]) throw new Error("Could not load citation index");
  return result.rows[0];
}

async function loadState(client: Client): Promise<FullState> {
  // A pg Client has one wire connection; keep reads sequential so no query is
  // issued while an earlier query is still executing.
  const companyGuard = await loadCompany(client);
  const ownershipRows = await loadOwnershipRows(client);
  const milestoneRows = await loadMilestoneRows(client);
  const citationRows = await loadCitationRows(client);
  const tableCounts = await loadCounts(client);
  const citationIndex = await loadIndex(client);
  const evidenceId =
    REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.evidenceCitationGuard.id;
  const evidenceCitationGuard =
    citationRows.find((row) => row.id === evidenceId) ?? null;
  const snapshot: StudentTransportationSnapshot = {
    companyGuard,
    ownershipRows,
    milestoneRows,
    citationRows,
    evidenceCitationGuard,
    protection: protection(ownershipRows, milestoneRows, citationRows),
    tableCounts,
    citationIndex,
    seedSha256: studentTransportationSeedSha256(companies),
  };
  return { snapshot, companyGuard, ownershipRows, milestoneRows, citationRows };
}

async function begin(client: Client): Promise<void> {
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    LOCK_KEY,
  ]);
  await client.query(
    `LOCK TABLE "Company","Organization","OwnershipPeriod","Milestone","Citation","Source" IN SHARE ROW EXCLUSIVE MODE`,
  );
}

async function applyAction(client: Client): Promise<void> {
  const { current, proposed } = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action;
  const result = await client.query(
    `UPDATE "Milestone" SET event=$2 WHERE id=$1 AND "companyId"=$3 AND date=$4 AND event=$5 AND category::text=$6 AND (($7::text IS NULL AND "sortDate" IS NULL) OR to_char("sortDate",$8)=$7) RETURNING id`,
    [
      current.id,
      proposed.event,
      current.companyId,
      current.date,
      current.event,
      current.category,
      current.sortDate,
      NAIVE_MICROS,
    ],
  );
  assertOne(result, "Student Transportation milestone update");
}

function expectedMilestones(before: MilestoneRow[]): MilestoneRow[] {
  const action = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action;
  return sorted(
    before.map((row) => (row.id === action.id ? action.proposed : row)),
  );
}

async function assertPostconditions(
  client: Client,
  before: FullState,
): Promise<void> {
  const after = await loadState(client);
  exact("Company guard", after.companyGuard, before.companyGuard);
  exact("Ownership rows", after.ownershipRows, before.ownershipRows);
  exact("Citation rows", after.citationRows, before.citationRows);
  exact(
    "Milestone rows",
    after.milestoneRows,
    expectedMilestones(before.milestoneRows),
  );
  exact(
    "Table counts",
    after.snapshot.tableCounts,
    before.snapshot.tableCounts,
  );
  exact(
    "Citation index",
    after.snapshot.citationIndex,
    before.snapshot.citationIndex,
  );
  exact("Seed replay", after.snapshot.seedSha256, before.snapshot.seedSha256);
  exact(
    "Protected ownership",
    after.snapshot.protection.ownership,
    before.snapshot.protection.ownership,
  );
  exact(
    "Protected citations",
    after.snapshot.protection.citations,
    before.snapshot.protection.citations,
  );
  exact(
    "Protected milestones",
    after.snapshot.protection.milestones,
    digest(expectedMilestones(before.milestoneRows)),
  );
}

async function writeJson(file: string, value: unknown): Promise<void> {
  const absolute = path.resolve(file);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function syncDirectory(directory: string): Promise<void> {
  const handle = await open(directory, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeJsonAtomic(
  file: string,
  value: unknown,
  exclusive: boolean,
): Promise<void> {
  const absolute = path.resolve(file);
  const directory = path.dirname(absolute);
  await mkdir(directory, { recursive: true });
  const temporary = `${absolute}.tmp-${process.pid}-${Date.now()}`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    if (exclusive) {
      await link(temporary, absolute);
      await unlink(temporary);
    } else {
      await rename(temporary, absolute);
    }
    await syncDirectory(directory);
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
}

async function assertNew(file: string): Promise<void> {
  try {
    await access(path.resolve(file), constants.F_OK);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  throw new Error("Receipt path already exists");
}

function rollbackRows(plan: StudentTransportationPlan): unknown {
  return plan.actions.map((action) => ({
    actionType: action.actionType,
    id: action.id,
    expectedApplied: action.proposed,
    restore: action.current,
  }));
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = hasFlag("apply");
  const parsedTarget = parseTarget(connectionString, apply);
  const planOutput = option("plan-output") ?? DEFAULT_PLAN_OUTPUT;
  const approvalHash = option("approval-hash");
  const receiptOutput = option("receipt-output");
  if (apply && !approvalHash) {
    throw new Error("Apply requires --approval-hash=<exact plan hash>");
  }
  if (apply && !receiptOutput) {
    throw new Error("Apply requires --receipt-output=<new path>");
  }
  if (!apply && receiptOutput) {
    throw new Error("--receipt-output is valid only with --apply");
  }
  if (apply && path.resolve(receiptOutput!) === path.resolve(planOutput)) {
    throw new Error("Receipt output and plan output must differ");
  }
  if (apply) await assertNew(receiptOutput!);

  const client = new Client({ connectionString });
  await client.connect();
  const target = await assertConnectedTarget(client, parsedTarget);
  let openTransaction = false;
  let pendingReceiptCreated = false;
  let commitAttempted = false;
  let committed = false;
  let pendingReceiptMaterial: Record<string, unknown> | null = null;
  try {
    await begin(client);
    openTransaction = true;
    const before = await loadState(client);
    const plan = buildStudentTransportationPlan(before.snapshot);
    if (
      plan.actionCount !== REVIEWED_STUDENT_TRANSPORTATION_ACTION_COUNT ||
      plan.actionSetSha256 !== REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256
    ) {
      throw new Error("Reviewed Student Transportation action scope drifted");
    }
    const hashMaterial = {
      schemaVersion: STUDENT_TRANSPORTATION_CORRECTION_SCHEMA_VERSION,
      scope: STUDENT_TRANSPORTATION_CORRECTION_SCOPE,
      databaseTarget: target,
      reviewedManifestSha256: REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
      seedSha256: REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
      actionSetSha256: plan.actionSetSha256,
      snapshotSha256: plan.snapshotSha256,
      actionCount: plan.actionCount,
    };
    const planSha256 = sha256(hashMaterial);
    if (apply && approvalHash !== planSha256) {
      throw new Error("--approval-hash does not match exact live plan");
    }

    await applyAction(client);
    await assertPostconditions(client, before);
    const artifact = {
      generatedAt: new Date().toISOString(),
      mode: apply ? "APPLY" : "DRY_RUN_ROLLBACK",
      planSha256,
      hashMaterial,
      plan,
      snapshot: before.snapshot,
      rollback: rollbackRows(plan),
    };

    if (!apply) {
      await client.query("ROLLBACK");
      openTransaction = false;
      const restored = await loadState(client);
      exact("Fresh rollback snapshot", restored.snapshot, before.snapshot);
      exact(
        "Fresh rollback ownership",
        restored.ownershipRows,
        before.ownershipRows,
      );
      exact(
        "Fresh rollback milestones",
        restored.milestoneRows,
        before.milestoneRows,
      );
      exact(
        "Fresh rollback citations",
        restored.citationRows,
        before.citationRows,
      );
      await writeJson(planOutput, artifact);
      console.log(
        JSON.stringify(
          {
            mode: "DRY_RUN_ROLLBACK",
            planSha256,
            actionSetSha256: plan.actionSetSha256,
            manifestSha256: REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
            seedSha256: REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
            actionCount: plan.actionCount,
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
      ...hashMaterial,
      state: "COMMIT_PENDING",
      preparedAt: new Date().toISOString(),
      planSha256,
      rollback: rollbackRows(plan),
    };
    await writeJsonAtomic(
      receiptOutput!,
      {
        ...pendingReceiptMaterial,
        receiptSha256: sha256(pendingReceiptMaterial),
      },
      true,
    );
    pendingReceiptCreated = true;
    await writeJson(planOutput, artifact);
    commitAttempted = true;
    await client.query("COMMIT");
    openTransaction = false;
    committed = true;
    const receiptMaterial = {
      ...pendingReceiptMaterial,
      state: "APPLIED",
      appliedAt: new Date().toISOString(),
    };
    const receipt = {
      ...receiptMaterial,
      receiptSha256: sha256(receiptMaterial),
    };
    await writeJsonAtomic(receiptOutput!, receipt, false);
    console.log(
      JSON.stringify(
        {
          mode: "APPLY",
          planSha256,
          receiptSha256: receipt.receiptSha256,
          receiptOutput: path.resolve(receiptOutput!),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (openTransaction) await client.query("ROLLBACK").catch(() => undefined);
    if (
      pendingReceiptCreated &&
      pendingReceiptMaterial &&
      receiptOutput &&
      !commitAttempted
    ) {
      const notAppliedMaterial = {
        ...pendingReceiptMaterial,
        state: "NOT_APPLIED",
        failedAt: new Date().toISOString(),
      };
      await writeJsonAtomic(
        receiptOutput,
        {
          ...notAppliedMaterial,
          receiptSha256: sha256(notAppliedMaterial),
        },
        false,
      ).catch(() => undefined);
    }
    if (commitAttempted && pendingReceiptMaterial && receiptOutput) {
      throw new Error(
        `${committed ? "Database commit succeeded" : "Database commit outcome is ambiguous"}; COMMIT_PENDING receipt remains at ${path.resolve(receiptOutput)}: ${error instanceof Error ? error.message : String(error)}`,
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
