/**
 * Reviewable, evidence-gated residual portfolio-card remediation.
 * Default mode applies every guarded mutation inside a SERIALIZABLE transaction,
 * validates postconditions, and rolls the transaction back. It never applies
 * without the exact live plan hash, explicit database target, and a new receipt.
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
  RESIDUAL_CORRECTIONS_SCHEMA_VERSION,
  RESIDUAL_CORRECTIONS_SCOPE,
  REVIEWED_RESIDUAL_ACTION_COUNT,
  REVIEWED_RESIDUAL_ACTION_SET_SHA256,
  REVIEWED_RESIDUAL_MANIFEST,
  REVIEWED_RESIDUAL_MANIFEST_SHA256,
  REVIEWED_RESIDUAL_SEED_SHA256,
  buildResidualPlan,
  expectedTargetRows,
  residualActionSetSha256,
  residualManifestSha256,
  residualSeedSha256,
  targetKey,
  type CitationIndexState,
  type CitationRow,
  type CompanyGuard,
  type CompanyProtection,
  type ExistingSourceGuard,
  type MilestoneRow,
  type ProtectedDigest,
  type ResidualAction,
  type ResidualPlan,
  type ResidualSnapshot,
  type SourceRow,
  type TableCounts,
} from "./portfolio-review/evidence-gated-residual-corrections";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:evidence-gated-residual-corrections:v1";
const INDEX_NAME = "Citation_company_identity_unique";
const NAIVE_MICROS = 'YYYY-MM-DD"T"HH24:MI:SS.US';
const DEFAULT_PLAN_OUTPUT =
  "audits/portfolio-company-review-2026-07-22/evidence-gated-residual-corrections-plan.json";

interface DatabaseTarget {
  host: string;
  database: string;
  port: string;
  schema: string;
}

interface CompanyCoreRow {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[];
  description: string;
  companyStatus: string;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface FullOwnershipRow {
  id: string;
  companyId: string;
  fundId: string | null;
  organizationId: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

interface FullCitationRow extends CitationRow {
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
}

interface FullState {
  snapshot: ResidualSnapshot;
  ownershipRows: FullOwnershipRow[];
  milestoneRows: MilestoneRow[];
  citationRows: FullCitationRow[];
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
): DatabaseTarget {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol))
    throw new Error("DATABASE_URL must use postgres");
  const target = {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    port: parsed.port || "5432",
    schema: parsed.searchParams.get("schema") ?? "public",
  };
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  const expectedPort = process.env.EXPECTED_DATABASE_PORT?.trim();
  const expectedSchema = process.env.EXPECTED_DATABASE_SCHEMA?.trim();
  if (
    requireExplicit &&
    (!expectedHost || !expectedDatabase || !expectedPort || !expectedSchema)
  ) {
    throw new Error(
      "Apply requires EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, EXPECTED_DATABASE_PORT, and EXPECTED_DATABASE_SCHEMA",
    );
  }
  if (expectedHost && expectedHost !== target.host)
    throw new Error("Database host mismatch");
  if (expectedDatabase && expectedDatabase !== target.database)
    throw new Error("Database name mismatch");
  if (expectedPort && expectedPort !== target.port)
    throw new Error("Database port mismatch");
  if (expectedSchema && expectedSchema !== target.schema)
    throw new Error("Database schema mismatch");
  if (target.schema !== "public")
    throw new Error("This remediation is pinned to the public schema");
  return target;
}

async function assertConnectedTarget(
  client: Client,
  target: DatabaseTarget,
): Promise<DatabaseTarget> {
  const result = await client.query<{
    database: string;
    port: string;
    schema: string | null;
  }>(
    `SELECT current_database() AS database,inet_server_port()::text AS port,current_schema() AS schema`,
  );
  const connected = result.rows[0];
  if (!connected)
    throw new Error("Could not resolve connected database target");
  if (connected.database !== target.database)
    throw new Error("Connected database mismatch");
  if (connected.port !== target.port)
    throw new Error("Connected database port mismatch");
  if (connected.schema !== target.schema)
    throw new Error("Connected database schema mismatch");
  return target;
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.id.localeCompare(b.id));
}

function exact(label: string, actual: unknown, expected: unknown): void {
  if (sha256(actual) !== sha256(expected))
    throw new Error(`${label} failed exact postcondition`);
}

function assertOne(result: QueryResult, label: string): void {
  if (result.rowCount !== 1)
    throw new Error(
      `${label} affected ${result.rowCount ?? 0} rows; expected 1`,
    );
}

function companyIds(): string[] {
  return REVIEWED_RESIDUAL_MANIFEST.companyGuards.map((row) => row.id);
}

async function loadCompanyGuards(client: Client): Promise<CompanyGuard[]> {
  const result = await client.query<CompanyCoreRow>(
    `SELECT id,name,sector::text AS sector,subsector,region::text AS region,country,"countryTags",description,"companyStatus"::text AS "companyStatus",website,"yearFounded",headquarters,status::text AS "recordStatus",to_char("createdAt",$2) AS "createdAt",to_char("updatedAt",$2) AS "updatedAt" FROM "Company" WHERE id=ANY($1::text[])`,
    [companyIds(), NAIVE_MICROS],
  );
  const byId = new Map(result.rows.map((row) => [row.id, row]));
  return REVIEWED_RESIDUAL_MANIFEST.companyGuards.map((guard) => {
    const row = byId.get(guard.id);
    if (!row) throw new Error(`Missing company guard ${guard.id}`);
    return {
      id: row.id,
      name: row.name,
      yearFounded: row.yearFounded,
      companyStatus: row.companyStatus,
      recordStatus: row.recordStatus,
      updatedAt: row.updatedAt,
      coreSha256: sha256(row),
    };
  });
}

async function loadOwnershipRows(client: Client): Promise<FullOwnershipRow[]> {
  const result = await client.query<FullOwnershipRow>(
    `SELECT id,"companyId","fundId","organizationId","vehicleName",stake,"investmentYear","exitYear","isActive",to_char("createdAt",$2) AS "createdAt" FROM "OwnershipPeriod" WHERE "companyId"=ANY($1::text[]) ORDER BY id`,
    [companyIds(), NAIVE_MICROS],
  );
  return result.rows;
}

async function loadMilestoneRows(client: Client): Promise<MilestoneRow[]> {
  const result = await client.query<MilestoneRow>(
    `SELECT id,"companyId",date,event,category::text AS category,CASE WHEN "sortDate" IS NULL THEN NULL ELSE to_char("sortDate",$2) END AS "sortDate" FROM "Milestone" WHERE "companyId"=ANY($1::text[]) ORDER BY id`,
    [companyIds(), NAIVE_MICROS],
  );
  return result.rows;
}

async function loadCitationRows(client: Client): Promise<FullCitationRow[]> {
  const result = await client.query<FullCitationRow>(
    `SELECT ci.id,ci."sourceId",ci."dealId",ci."companyId",ci.purpose::text AS purpose,ci."evidenceLabel",s.label AS "sourceLabel",s.url AS "sourceUrl",s.type::text AS "sourceType" FROM "Citation" ci JOIN "Source" s ON s.id=ci."sourceId" WHERE ci."companyId"=ANY($1::text[]) ORDER BY ci.id`,
    [companyIds()],
  );
  return result.rows;
}

function digest<T extends { id: string }>(rows: readonly T[]): ProtectedDigest {
  const ordered = sorted(rows);
  return { count: ordered.length, sha256: sha256(ordered) };
}

function protections(
  ownershipRows: FullOwnershipRow[],
  milestoneRows: MilestoneRow[],
  citationRows: FullCitationRow[],
): CompanyProtection[] {
  return REVIEWED_RESIDUAL_MANIFEST.companyGuards.map((company) => ({
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
  }));
}

async function loadCounts(client: Client): Promise<TableCounts> {
  const result = await client.query<TableCounts>(
    `SELECT (SELECT COUNT(*)::int FROM "Company") AS companies,(SELECT COUNT(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",(SELECT COUNT(*)::int FROM "Milestone") AS milestones,(SELECT COUNT(*)::int FROM "Citation") AS citations,(SELECT COUNT(*)::int FROM "Source") AS sources`,
  );
  if (!result.rows[0]) throw new Error("Could not load table counts");
  return result.rows[0];
}

async function loadIndex(client: Client): Promise<CitationIndexState> {
  const result = await client.query<CitationIndexState>(
    `SELECT EXISTS(SELECT 1 FROM pg_class WHERE relname=$1 AND relkind='i') AS exists,COALESCE(i.indisunique,false) AS "isUnique",COALESCE(i.indisvalid,false) AS "isValid",COALESCE(i.indisready,false) AS "isReady",COALESCE(i.indnullsnotdistinct,false) AS "nullsNotDistinct",EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Citation' AND column_name='isPrimary') AS "hasIsPrimary",EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Company' AND column_name='lastVerifiedAt') AS "companyHasLastVerifiedAt",pg_get_indexdef(i.indexrelid) AS definition FROM (SELECT to_regclass('public."Citation_company_identity_unique"')::oid AS oid) r LEFT JOIN pg_index i ON i.indexrelid=r.oid`,
    [INDEX_NAME],
  );
  if (!result.rows[0]) throw new Error("Could not load citation index");
  return result.rows[0];
}

async function loadSourceGuards(
  client: Client,
): Promise<ExistingSourceGuard[]> {
  const ids = REVIEWED_RESIDUAL_MANIFEST.existingSourceGuards.map(
    (row) => row.id,
  );
  const result = await client.query<ExistingSourceGuard>(
    `SELECT id,label,url,type::text AS type FROM "Source" WHERE id=ANY($1::text[]) ORDER BY id`,
    [ids],
  );
  return result.rows;
}

async function loadTargetRows(
  client: Client,
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const action of REVIEWED_RESIDUAL_MANIFEST.actions) {
    if (!("current" in action)) continue;
    let result: QueryResult;
    if (action.actionType === "COMPANY_UPDATE") {
      result = await client.query(
        `SELECT "yearFounded",description FROM "Company" WHERE id=$1`,
        [action.id],
      );
    } else if (action.actionType === "OWNERSHIP_UPDATE") {
      result = await client.query(
        `SELECT "investmentYear","vehicleName",stake FROM "OwnershipPeriod" WHERE id=$1 AND "companyId"=$2`,
        [action.id, action.companyId],
      );
    } else if (
      action.actionType === "MILESTONE_UPDATE" ||
      action.actionType === "MILESTONE_DELETE"
    ) {
      result = await client.query(
        `SELECT id,"companyId",date,event,category::text AS category,CASE WHEN "sortDate" IS NULL THEN NULL ELSE to_char("sortDate",$2) END AS "sortDate" FROM "Milestone" WHERE id=$1`,
        [action.id, NAIVE_MICROS],
      );
    } else {
      result = await client.query(
        `SELECT id,"sourceId","dealId","companyId",purpose::text AS purpose,"evidenceLabel" FROM "Citation" WHERE id=$1`,
        [action.id],
      );
    }
    if (result.rowCount !== 1)
      throw new Error(`Missing target ${targetKey(action)}`);
    out[targetKey(action)] = result.rows[0];
  }
  return out;
}

async function loadInsertConflicts(client: Client): Promise<string[]> {
  const conflicts: string[] = [];
  for (const action of REVIEWED_RESIDUAL_MANIFEST.actions) {
    let result: QueryResult | undefined;
    if (action.actionType === "SOURCE_INSERT") {
      result = await client.query(
        `SELECT id FROM "Source" WHERE id=$1 OR url=$2`,
        [action.id, action.proposed.url],
      );
    } else if (action.actionType === "MILESTONE_INSERT") {
      result = await client.query(
        `SELECT id FROM "Milestone" WHERE id=$1 OR ("companyId"=$2 AND date=$3 AND event=$4)`,
        [
          action.id,
          action.companyId,
          action.proposed.date,
          action.proposed.event,
        ],
      );
    } else if (action.actionType === "CITATION_INSERT") {
      const row = action.proposed;
      result = await client.query(
        `SELECT id FROM "Citation" WHERE id=$1 OR ("sourceId"=$2 AND "companyId" IS NOT DISTINCT FROM $3::text AND "dealId" IS NOT DISTINCT FROM $4::text AND purpose::text=$5 AND "evidenceLabel" IS NOT DISTINCT FROM $6::text)`,
        [
          row.id,
          row.sourceId,
          row.companyId,
          row.dealId,
          row.purpose,
          row.evidenceLabel,
        ],
      );
    }
    if (result && result.rowCount)
      conflicts.push(`${action.actionType}:${action.id}`);
  }
  return conflicts;
}

async function loadState(
  client: Client,
  includeConflicts: boolean,
): Promise<FullState> {
  // Keep reads ordered on a single pg client. This avoids implicit query
  // pipelining and makes the protected snapshot deterministic under the lock.
  const companyGuards = await loadCompanyGuards(client);
  const ownershipRows = await loadOwnershipRows(client);
  const milestoneRows = await loadMilestoneRows(client);
  const citationRows = await loadCitationRows(client);
  const targetRows = await loadTargetRows(client);
  const existingSourceGuards = await loadSourceGuards(client);
  const tableCounts = await loadCounts(client);
  const citationIndex = await loadIndex(client);
  const insertConflicts = includeConflicts
    ? await loadInsertConflicts(client)
    : [];
  return {
    ownershipRows,
    milestoneRows,
    citationRows,
    snapshot: {
      companyGuards,
      targetRows,
      existingSourceGuards,
      protectedSets: protections(ownershipRows, milestoneRows, citationRows),
      tableCounts,
      citationIndex,
      insertConflicts,
      seedSha256: residualSeedSha256(companies),
    },
  };
}

async function begin(client: Client): Promise<void> {
  await client.query("BEGIN");
  await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await client.query("SET LOCAL search_path TO public, pg_catalog");
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
    LOCK_KEY,
  ]);
  await client.query(
    `LOCK TABLE "Company","OwnershipPeriod","Milestone","Citation","Source" IN SHARE ROW EXCLUSIVE MODE`,
  );
}

async function applyAction(
  client: Client,
  action: ResidualAction,
): Promise<void> {
  let result: QueryResult;
  if (action.actionType === "COMPANY_UPDATE") {
    result = await client.query(
      `UPDATE "Company" SET "yearFounded"=$2,description=$3 WHERE id=$1 AND "yearFounded" IS NOT DISTINCT FROM $4::int AND description=$5 RETURNING id`,
      [
        action.id,
        action.proposed.yearFounded,
        action.proposed.description,
        action.current.yearFounded,
        action.current.description,
      ],
    );
  } else if (action.actionType === "OWNERSHIP_UPDATE") {
    result = await client.query(
      `UPDATE "OwnershipPeriod" SET "investmentYear"=$2,"vehicleName"=$3,stake=$4 WHERE id=$1 AND "companyId"=$5 AND "investmentYear" IS NOT DISTINCT FROM $6::int AND "vehicleName" IS NOT DISTINCT FROM $7::text AND stake IS NOT DISTINCT FROM $8::text RETURNING id`,
      [
        action.id,
        action.proposed.investmentYear,
        action.proposed.vehicleName,
        action.proposed.stake,
        action.companyId,
        action.current.investmentYear,
        action.current.vehicleName,
        action.current.stake,
      ],
    );
  } else if (action.actionType === "MILESTONE_UPDATE") {
    const row = action.current;
    result = await client.query(
      `UPDATE "Milestone" SET category=$2::"MilestoneCategory" WHERE id=$1 AND "companyId"=$3 AND date=$4 AND event=$5 AND category::text=$6 AND (($7::text IS NULL AND "sortDate" IS NULL) OR to_char("sortDate",$8)=$7) RETURNING id`,
      [
        action.id,
        action.proposed.category,
        row.companyId,
        row.date,
        row.event,
        row.category,
        row.sortDate,
        NAIVE_MICROS,
      ],
    );
  } else if (action.actionType === "MILESTONE_INSERT") {
    const row = action.proposed;
    result = await client.query(
      `INSERT INTO "Milestone" (id,"companyId",date,event,category,"sortDate") VALUES ($1,$2,$3,$4,$5::"MilestoneCategory",$6::timestamp) RETURNING id`,
      [row.id, row.companyId, row.date, row.event, row.category, row.sortDate],
    );
  } else if (action.actionType === "MILESTONE_DELETE") {
    const row = action.current;
    result = await client.query(
      `DELETE FROM "Milestone" WHERE id=$1 AND "companyId"=$2 AND date=$3 AND event=$4 AND category::text=$5 AND (($6::text IS NULL AND "sortDate" IS NULL) OR to_char("sortDate",$7)=$6) RETURNING id`,
      [
        row.id,
        row.companyId,
        row.date,
        row.event,
        row.category,
        row.sortDate,
        NAIVE_MICROS,
      ],
    );
  } else if (action.actionType === "CITATION_UPDATE") {
    const row = action.current;
    result = await client.query(
      `UPDATE "Citation" SET purpose=$2::"CitationPurpose","evidenceLabel"=$3 WHERE id=$1 AND "sourceId"=$4 AND "dealId" IS NOT DISTINCT FROM $5::text AND "companyId" IS NOT DISTINCT FROM $6::text AND purpose::text=$7 AND "evidenceLabel" IS NOT DISTINCT FROM $8::text RETURNING id`,
      [
        action.id,
        action.proposed.purpose,
        action.proposed.evidenceLabel,
        row.sourceId,
        row.dealId,
        row.companyId,
        row.purpose,
        row.evidenceLabel,
      ],
    );
  } else if (action.actionType === "SOURCE_INSERT") {
    const row = action.proposed;
    result = await client.query(
      `INSERT INTO "Source" (id,label,url,type) VALUES ($1,$2,$3,$4::"SourceType") RETURNING id`,
      [row.id, row.label, row.url, row.type],
    );
  } else {
    const row = action.proposed;
    result = await client.query(
      `INSERT INTO "Citation" (id,"sourceId","dealId","companyId",purpose,"evidenceLabel") VALUES ($1,$2,$3,$4,$5::"CitationPurpose",$6) RETURNING id`,
      [
        row.id,
        row.sourceId,
        row.dealId,
        row.companyId,
        row.purpose,
        row.evidenceLabel,
      ],
    );
  }
  assertOne(result, `${action.actionType}:${action.id}`);
}

function expectedProtectedAfter(before: FullState): CompanyProtection[] {
  const owners = new Map(
    before.ownershipRows.map((row) => [row.id, { ...row }]),
  );
  const milestones = new Map(
    before.milestoneRows.map((row) => [row.id, { ...row }]),
  );
  const citations = new Map(
    before.citationRows.map((row) => [row.id, { ...row }]),
  );
  const sources = new Map<string, SourceRow>([
    ...before.citationRows.map(
      (row) =>
        [
          row.sourceId,
          {
            id: row.sourceId,
            label: row.sourceLabel,
            url: row.sourceUrl,
            type: row.sourceType,
          },
        ] as const,
    ),
    ...REVIEWED_RESIDUAL_MANIFEST.existingSourceGuards.map(
      (row) => [row.id, row] as const,
    ),
  ]);
  for (const action of REVIEWED_RESIDUAL_MANIFEST.actions) {
    if (action.actionType === "OWNERSHIP_UPDATE")
      Object.assign(owners.get(action.id)!, action.proposed);
    else if (action.actionType === "MILESTONE_UPDATE")
      milestones.set(action.id, action.proposed);
    else if (action.actionType === "MILESTONE_INSERT")
      milestones.set(action.id, action.proposed);
    else if (action.actionType === "MILESTONE_DELETE")
      milestones.delete(action.id);
    else if (action.actionType === "SOURCE_INSERT")
      sources.set(action.id, action.proposed);
    else if (action.actionType === "CITATION_UPDATE")
      Object.assign(citations.get(action.id)!, action.proposed);
    else if (action.actionType === "CITATION_INSERT") {
      const source = sources.get(action.proposed.sourceId);
      if (!source)
        throw new Error(`Missing expected source ${action.proposed.sourceId}`);
      citations.set(action.id, {
        ...action.proposed,
        sourceLabel: source.label,
        sourceUrl: source.url,
        sourceType: source.type,
      });
    }
  }
  return protections(
    [...owners.values()],
    [...milestones.values()],
    [...citations.values()],
  );
}

async function assertPostconditions(
  client: Client,
  before: FullState,
): Promise<void> {
  for (const action of REVIEWED_RESIDUAL_MANIFEST.actions) {
    let result: QueryResult;
    if (action.actionType === "COMPANY_UPDATE") {
      result = await client.query(
        `SELECT "yearFounded",description FROM "Company" WHERE id=$1`,
        [action.id],
      );
      exact(targetKey(action), result.rows[0], action.proposed);
    } else if (action.actionType === "OWNERSHIP_UPDATE") {
      result = await client.query(
        `SELECT "investmentYear","vehicleName",stake FROM "OwnershipPeriod" WHERE id=$1`,
        [action.id],
      );
      exact(targetKey(action), result.rows[0], action.proposed);
    } else if (action.actionType === "MILESTONE_DELETE") {
      result = await client.query(`SELECT id FROM "Milestone" WHERE id=$1`, [
        action.id,
      ]);
      if (result.rowCount !== 0)
        throw new Error(`${targetKey(action)} was not deleted`);
    } else if (
      action.actionType === "MILESTONE_UPDATE" ||
      action.actionType === "MILESTONE_INSERT"
    ) {
      result = await client.query(
        `SELECT id,"companyId",date,event,category::text AS category,CASE WHEN "sortDate" IS NULL THEN NULL ELSE to_char("sortDate",$2) END AS "sortDate" FROM "Milestone" WHERE id=$1`,
        [action.id, NAIVE_MICROS],
      );
      exact(targetKey(action), result.rows[0], action.proposed);
    } else if (action.actionType === "SOURCE_INSERT") {
      result = await client.query(
        `SELECT id,label,url,type::text AS type FROM "Source" WHERE id=$1`,
        [action.id],
      );
      exact(targetKey(action), result.rows[0], action.proposed);
    } else {
      result = await client.query(
        `SELECT id,"sourceId","dealId","companyId",purpose::text AS purpose,"evidenceLabel" FROM "Citation" WHERE id=$1`,
        [action.id],
      );
      exact(targetKey(action), result.rows[0], action.proposed);
    }
  }
  const owners = await loadOwnershipRows(client);
  const milestones = await loadMilestoneRows(client);
  const citations = await loadCitationRows(client);
  const counts = await loadCounts(client);
  const index = await loadIndex(client);
  exact(
    "Protected sets after mutation",
    protections(owners, milestones, citations),
    expectedProtectedAfter(before),
  );
  exact("Counts after mutation", counts, {
    ...before.snapshot.tableCounts,
    milestones: before.snapshot.tableCounts.milestones + 5,
    citations: before.snapshot.tableCounts.citations + 4,
    sources: before.snapshot.tableCounts.sources + 3,
  });
  exact("Citation index after mutation", index, before.snapshot.citationIndex);
}

function rollbackRows(plan: ResidualPlan): unknown {
  return [...plan.actions].reverse().map((action) =>
    "current" in action
      ? {
          actionType: action.actionType,
          id: action.id,
          restore: action.current,
          expectedApplied:
            "proposed" in action ? action.proposed : { rowAbsent: true },
        }
      : {
          actionType: action.actionType,
          id: action.id,
          deleteInsertedRow: true,
          expectedApplied: action.proposed,
        },
  );
}

async function writeJson(
  file: string,
  value: unknown,
  exclusive = false,
): Promise<void> {
  const absolute = path.resolve(file);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    flag: exclusive ? "wx" : "w",
  });
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
    try {
      await unlink(temporary);
    } catch {
      // Preserve the original failure.
    }
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

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = hasFlag("apply");
  const refreshMaterial = hasFlag("refresh-material");
  if (apply && refreshMaterial)
    throw new Error("--refresh-material cannot be combined with --apply");
  const parsedTarget = parseTarget(connectionString, apply);
  const planOutput = option("plan-output") ?? DEFAULT_PLAN_OUTPUT;
  const approvalHash = option("approval-hash");
  const receiptOutput = option("receipt-output");
  if (apply && !approvalHash)
    throw new Error("Apply requires --approval-hash=<exact plan hash>");
  if (apply && !receiptOutput)
    throw new Error("Apply requires --receipt-output=<new path>");
  if (apply && path.resolve(receiptOutput!) === path.resolve(planOutput)) {
    throw new Error("Receipt output and plan output must be different paths");
  }
  if (apply) await assertNew(receiptOutput!);

  const client = new Client({ connectionString });
  await client.connect();
  const target = await assertConnectedTarget(client, parsedTarget);
  let open = false;
  let committed = false;
  let commitAttempted = false;
  let pendingReceiptMaterial: Record<string, unknown> | null = null;
  try {
    await begin(client);
    open = true;
    const before = await loadState(client, true);
    if (refreshMaterial) {
      await client.query("ROLLBACK");
      open = false;
      console.log(
        JSON.stringify(
          {
            companyGuards: before.snapshot.companyGuards,
            protectedSets: before.snapshot.protectedSets,
            citationIndex: before.snapshot.citationIndex,
            seedSha256: before.snapshot.seedSha256,
            tableCounts: before.snapshot.tableCounts,
            actionCount: REVIEWED_RESIDUAL_MANIFEST.actions.length,
            actionSetSha256: residualActionSetSha256(),
            manifestSha256: residualManifestSha256(),
          },
          null,
          2,
        ),
      );
      return;
    }
    const plan = buildResidualPlan(before.snapshot);
    if (
      plan.actionCount !== REVIEWED_RESIDUAL_ACTION_COUNT ||
      plan.actionSetSha256 !== REVIEWED_RESIDUAL_ACTION_SET_SHA256
    )
      throw new Error("Reviewed action scope drifted");
    const hashMaterial = {
      schemaVersion: RESIDUAL_CORRECTIONS_SCHEMA_VERSION,
      scope: RESIDUAL_CORRECTIONS_SCOPE,
      databaseTarget: target,
      reviewedManifestSha256: REVIEWED_RESIDUAL_MANIFEST_SHA256,
      seedSha256: REVIEWED_RESIDUAL_SEED_SHA256,
      actionSetSha256: plan.actionSetSha256,
      executionSha256: plan.executionSha256,
      snapshotSha256: plan.snapshotSha256,
      actionCount: plan.actionCount,
    };
    const planSha256 = sha256(hashMaterial);
    if (apply && approvalHash !== planSha256)
      throw new Error("--approval-hash does not match exact live plan");
    for (const action of plan.actions) await applyAction(client, action);
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
      open = false;
      const restored = await loadState(client, true);
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
            manifestSha256: REVIEWED_RESIDUAL_MANIFEST_SHA256,
            seedSha256: REVIEWED_RESIDUAL_SEED_SHA256,
            counts: plan.counts,
            quarantines: plan.quarantinedFields.length,
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
      quarantinedFields: plan.quarantinedFields,
    };
    await writeJsonAtomic(
      receiptOutput!,
      {
        ...pendingReceiptMaterial,
        receiptSha256: sha256(pendingReceiptMaterial),
      },
      true,
    );
    await writeJson(planOutput, artifact);
    commitAttempted = true;
    await client.query("COMMIT");
    open = false;
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
    if (open) await client.query("ROLLBACK");
    if (pendingReceiptMaterial && receiptOutput && !commitAttempted) {
      const notAppliedMaterial = {
        ...pendingReceiptMaterial,
        state: "NOT_APPLIED",
        failedAt: new Date().toISOString(),
      };
      try {
        await writeJsonAtomic(
          receiptOutput,
          {
            ...notAppliedMaterial,
            receiptSha256: sha256(notAppliedMaterial),
          },
          false,
        );
      } catch {
        // Preserve the original database or filesystem failure.
      }
    }
    if (commitAttempted && pendingReceiptMaterial && receiptOutput) {
      throw new Error(
        `${committed ? "Database commit succeeded" : "Database commit outcome is ambiguous"}, but receipt finalization failed; COMMIT_PENDING receipt remains at ${path.resolve(receiptOutput)}: ${error instanceof Error ? error.message : String(error)}`,
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
