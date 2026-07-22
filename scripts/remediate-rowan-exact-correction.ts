/**
 * Exact-ID, fail-closed Rowan Digital Infrastructure correction. Dry-run is
 * the default and always rolls back. Apply requires explicit database target
 * guards, the exact current plan hash, a serializable transaction, an
 * advisory lock, and a new receipt path.
 *
 * PostgreSQL `timestamp without time zone` values are serialized as raw wall
 * clocks with `to_char`; they never pass through JavaScript Date.
 *
 * Dry run:
 *   npx tsx scripts/remediate-rowan-exact-correction.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/rowan-exact-correction-plan.json
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npx tsx scripts/remediate-rowan-exact-correction.ts \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=<new JSON path>
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT,
  REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256,
  REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST,
  REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
  ROWAN_EXACT_CORRECTION_SCHEMA_VERSION,
  ROWAN_EXACT_CORRECTION_SCOPE,
  buildRowanExactCorrectionPlan,
  expectedPostMilestoneRows,
  expectedPostOwnershipRows,
  type CitationSnapshot,
  type CompanySnapshot,
  type DealSnapshot,
  type ManagementSnapshot,
  type MilestoneSnapshot,
  type OrganizationGuard,
  type OwnershipSnapshot,
  type ParticipantSnapshot,
  type RowanExactCorrectionPlan,
  type RowanExactCorrectionSnapshot,
  type TableCounts,
} from "./portfolio-review/rowan-exact-correction";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:rowan-exact-correction:v1";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: RowanExactCorrectionSnapshot;
  plan: RowanExactCorrectionPlan;
  hashMaterial: ReturnType<typeof planHashMaterial>;
  planSha256: string;
}

interface MutationIds {
  ownershipUpdates: string[];
  milestoneUpdates: string[];
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
  const id = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.companyGuard.id;
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

async function loadDeal(client: Client): Promise<DealSnapshot | null> {
  const id = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.dealGuard.id;
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

async function loadParticipants(
  client: Client,
): Promise<ParticipantSnapshot[]> {
  const dealId = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.dealGuard.id;
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

async function loadOrganizations(client: Client): Promise<OrganizationGuard[]> {
  const ids = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.organizationGuards.map(
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
  const companyId = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.companyGuard.id;
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
  const companyId = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.companyGuard.id;
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
  const companyId = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.companyGuard.id;
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
  const companyId = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.companyGuard.id;
  const result = await client.query<CitationSnapshot>(
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
  return result.rows;
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
  if (!row) throw new Error("Could not load Rowan table counts");
  return row;
}

async function loadSnapshot(
  client: Client,
): Promise<RowanExactCorrectionSnapshot> {
  return {
    company: await loadCompany(client),
    deal: await loadDeal(client),
    participants: await loadParticipants(client),
    organizations: await loadOrganizations(client),
    ownershipRows: await loadOwnershipRows(client),
    milestoneRows: await loadMilestoneRows(client),
    managementRows: await loadManagementRows(client),
    citationRows: await loadCitationRows(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(
  target: DatabaseTarget,
  snapshot: RowanExactCorrectionSnapshot,
) {
  const plan = buildRowanExactCorrectionPlan(snapshot);
  return {
    schemaVersion: ROWAN_EXACT_CORRECTION_SCHEMA_VERSION,
    scope: ROWAN_EXACT_CORRECTION_SCOPE,
    database: target,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT,
      actionSetSha256: REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    seedExpectation: REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.seedExpectation,
    quarantinedFields: plan.quarantinedFields,
  };
}

function buildPlan(
  target: DatabaseTarget,
  snapshot: RowanExactCorrectionSnapshot,
): BuiltPlan {
  const plan = buildRowanExactCorrectionPlan(snapshot);
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
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  await client.query(
    `LOCK TABLE "Company", "Deal", "DealParticipant", "Organization", "OwnershipPeriod", "Milestone", "ManagementRole", "Source", "Citation" IN SHARE ROW EXCLUSIVE MODE`,
  );
  await client.query(`SELECT id FROM "Company" WHERE id = $1 FOR UPDATE`, [
    manifest.companyGuard.id,
  ]);
  await client.query(`SELECT id FROM "Deal" WHERE id = $1 FOR UPDATE`, [
    manifest.dealGuard.id,
  ]);
  await client.query(
    `SELECT id FROM "DealParticipant" WHERE "dealId" = $1 FOR UPDATE`,
    [manifest.dealGuard.id],
  );
  await client.query(
    `SELECT id FROM "Organization" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [manifest.organizationGuards.map((row) => row.id)],
  );
  await client.query(
    `SELECT id FROM "OwnershipPeriod" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.companyGuard.id],
  );
  await client.query(
    `SELECT id FROM "Milestone" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.companyGuard.id],
  );
  await client.query(
    `SELECT id FROM "ManagementRole" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.companyGuard.id],
  );
  await client.query(
    `SELECT id FROM "Citation" WHERE "companyId" = $1 FOR UPDATE`,
    [manifest.companyGuard.id],
  );
  await client.query(
    `SELECT id FROM "Source" WHERE id = ANY($1::text[]) FOR UPDATE`,
    [[...new Set(manifest.citationRows.map((row) => row.sourceId))]],
  );
}

async function applyOwnershipUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.ownershipUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "OwnershipPeriod" op
      SET "vehicleName" = $11
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
      proposed.vehicleName,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`OwnershipPeriod ${action.id} failed its exact update`);
  }
  return [result.rows[0].id];
}

async function applyMilestoneUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.milestoneUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Milestone" m
      SET event = $7
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
      proposed.event,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Milestone ${action.id} failed its exact update`);
  }
  return [result.rows[0].id];
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: RowanExactCorrectionSnapshot;
  mutations: MutationIds;
}): void {
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  exact("Ownership mutation IDs", input.mutations.ownershipUpdates, [
    manifest.ownershipUpdate.id,
  ]);
  exact("Milestone mutation IDs", input.mutations.milestoneUpdates, [
    manifest.milestoneUpdate.id,
  ]);
  exact("Rowan Company", input.after.company, manifest.companyGuard);
  exact("INF-2026-161", input.after.deal, manifest.dealGuard);
  exact(
    "Rowan deal participants",
    sorted(input.after.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "Rowan organizations",
    sorted(input.after.organizations),
    sorted(manifest.organizationGuards),
  );
  exact(
    "Rowan post-update ownership rows",
    sorted(input.after.ownershipRows),
    expectedPostOwnershipRows(),
  );
  exact(
    "Rowan post-update milestones",
    sorted(input.after.milestoneRows),
    expectedPostMilestoneRows(),
  );
  exact(
    "Rowan management rows",
    sorted(input.after.managementRows),
    sorted(manifest.managementRows),
  );
  exact(
    "Rowan citations",
    sorted(input.after.citationRows),
    sorted(manifest.citationRows),
  );
  exact(
    "Table counts",
    input.after.tableCounts,
    input.before.snapshot.tableCounts,
  );
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
          reviewedManifestSha256:
            REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
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
      ownershipUpdates: await applyOwnershipUpdate(client),
      milestoneUpdates: await applyMilestoneUpdate(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: ROWAN_EXACT_CORRECTION_SCHEMA_VERSION,
      scope: ROWAN_EXACT_CORRECTION_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      reviewedManifestSha256: REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
      actionSetSha256: before.plan.actionSetSha256,
      actions: before.plan.actions,
      mutations,
      rollbackRows: {
        ownershipPeriod:
          REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.ownershipUpdate.current,
        milestone:
          REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.milestoneUpdate.current,
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
        companyFieldsUnchanged: true,
        dealAndParticipantsUnchanged: true,
        blackstoneOwnershipUnchanged: true,
        quinbrookOwnershipOnlyVehicleChanged: true,
        targetMilestoneOnlyEventChanged: true,
        allOtherMilestonesUnchanged: true,
        allCitationsUnchanged: true,
        managementRowsUnchanged: true,
        tableCountsUnchanged: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} Rowan exact corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
