/**
 * Exact-ID, hash-gated remediation for Ridgewood Infrastructure's completed
 * controlling-interest acquisition of Sierra Railroad Company.
 *
 * Dry run (default, always rolled back):
 *   npm run db:portfolio:sierra-railroad-close -- \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/sierra-railroad-close-plan.json
 *
 * Reviewed apply (not performed by this implementation task):
 *   EXPECTED_DATABASE_HOST=... EXPECTED_DATABASE_NAME=... \
 *   npm run db:portfolio:sierra-railroad-close -- \
 *     --apply --approval-hash=<exact dry-run plan SHA-256> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/sierra-railroad-close-receipt.json
 *
 * The reviewed timestamps are PostgreSQL `timestamp without time zone` wall
 * clocks. They are serialized with `to_char`, never through JavaScript Date.
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  REVIEWED_SIERRA_RAILROAD_ACTION_COUNT,
  REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256,
  REVIEWED_SIERRA_RAILROAD_MANIFEST,
  REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256,
  SIERRA_RAILROAD_CLOSE_SCHEMA_VERSION,
  SIERRA_RAILROAD_CLOSE_SCOPE,
  buildSierraRailroadClosePlan,
  type CitationSnapshot,
  type CompanyGuard,
  type DealSnapshot,
  type MilestoneSnapshot,
  type OwnershipGuard,
  type ParticipantGuard,
  type SierraRailroadPlan,
  type SierraRailroadSnapshot,
  type SierraTableCounts,
} from "./portfolio-review/sierra-railroad-close";
import { sha256 } from "./portfolio-review/lib";

const LOCK_KEY = "infra-ma2:sierra-railroad-close:v1";
const NAIVE_MILLIS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.MS';
const NAIVE_MICROS_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US';

interface DatabaseTarget {
  host: string;
  database: string;
}

interface BuiltPlan {
  snapshot: SierraRailroadSnapshot;
  plan: SierraRailroadPlan;
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

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} does not match the reviewed postcondition`);
  }
}

async function loadDeal(client: Client, id: string): Promise<DealSnapshot | null> {
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

async function loadMilestone(
  client: Client,
  id: string,
): Promise<MilestoneSnapshot | null> {
  const result = await client.query<MilestoneSnapshot>(
    `
      SELECT m.id, m."companyId", c.name AS "companyName", m.date, m.event,
             m.category::text,
             CASE WHEN m."sortDate" IS NULL THEN NULL
                  ELSE to_char(m."sortDate", $2) END AS "sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId"
      WHERE m.id = $1
    `,
    [id, NAIVE_MILLIS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadCitation(
  client: Client,
  id: string,
): Promise<CitationSnapshot | null> {
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

async function loadCompanyGuard(client: Client): Promise<CompanyGuard | null> {
  const id = REVIEWED_SIERRA_RAILROAD_MANIFEST.companyGuard.id;
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

async function loadOwnershipGuard(
  client: Client,
): Promise<OwnershipGuard | null> {
  const id = REVIEWED_SIERRA_RAILROAD_MANIFEST.ownershipGuard.id;
  const result = await client.query<OwnershipGuard>(
    `
      SELECT op.id, op."companyId", op."fundId", op."organizationId",
             o.name AS "organizationName", op."vehicleName", op.stake,
             op."investmentYear", op."exitYear", op."isActive",
             to_char(op."createdAt", $2) AS "createdAt"
      FROM "OwnershipPeriod" op
      LEFT JOIN "Organization" o ON o.id = op."organizationId"
      WHERE op.id = $1
    `,
    [id, NAIVE_MICROS_FORMAT],
  );
  return result.rows[0] ?? null;
}

async function loadParticipantGuard(
  client: Client,
): Promise<ParticipantGuard | null> {
  const id = REVIEWED_SIERRA_RAILROAD_MANIFEST.participantGuard.id;
  const result = await client.query<ParticipantGuard>(
    `
      SELECT dp.id, dp."dealId", dp."organizationId",
             o.name AS "organizationName", dp.role::text, dp."displayName"
      FROM "DealParticipant" dp
      JOIN "Organization" o ON o.id = dp."organizationId"
      WHERE dp.id = $1
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

async function loadProposedCitationConflicts(
  client: Client,
): Promise<CitationSnapshot[]> {
  const proposed = REVIEWED_SIERRA_RAILROAD_MANIFEST.citationUpdate.proposed;
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
  return result.rows;
}

async function loadTableCounts(client: Client): Promise<SierraTableCounts> {
  const result = await client.query<SierraTableCounts>(`
    SELECT (SELECT count(*)::int FROM "Deal") AS deals,
           (SELECT count(*)::int FROM "Company") AS companies,
           (SELECT count(*)::int FROM "OwnershipPeriod") AS "ownershipPeriods",
           (SELECT count(*)::int FROM "Milestone") AS milestones,
           (SELECT count(*)::int FROM "Citation") AS citations
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Could not load Sierra remediation table counts");
  return row;
}

async function loadSnapshot(client: Client): Promise<SierraRailroadSnapshot> {
  const manifest = REVIEWED_SIERRA_RAILROAD_MANIFEST;
  return {
    deal: await loadDeal(client, manifest.dealUpdate.id),
    milestone: await loadMilestone(client, manifest.milestoneUpdate.id),
    citation: await loadCitation(client, manifest.citationUpdate.id),
    companyGuard: await loadCompanyGuard(client),
    ownershipGuard: await loadOwnershipGuard(client),
    participantGuard: await loadParticipantGuard(client),
    protectedCvatMilestone: await loadMilestone(
      client,
      manifest.protectedCvatMilestone.id,
    ),
    unrelatedLegacyIdGuard: await loadDeal(
      client,
      manifest.unrelatedLegacyIdGuard.id,
    ),
    proposedCitationConflicts: await loadProposedCitationConflicts(client),
    tableCounts: await loadTableCounts(client),
  };
}

function planHashMaterial(snapshot: SierraRailroadSnapshot) {
  const plan = buildSierraRailroadClosePlan(snapshot);
  return {
    schemaVersion: SIERRA_RAILROAD_CLOSE_SCHEMA_VERSION,
    scope: SIERRA_RAILROAD_CLOSE_SCOPE,
    timestampRepresentation: {
      databaseType: "timestamp without time zone",
      serialization:
        "raw PostgreSQL wall-clock value via to_char; no JavaScript Date conversion and no timezone suffix",
      millisecondsFormat: NAIVE_MILLIS_FORMAT,
      microsecondsFormat: NAIVE_MICROS_FORMAT,
    },
    reviewedBasis: {
      actionCount: REVIEWED_SIERRA_RAILROAD_ACTION_COUNT,
      actionSetSha256: REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256,
      manifestSha256: REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256,
    },
    snapshotSha256: plan.snapshotSha256,
    tableCounts: snapshot.tableCounts,
    counts: plan.counts,
    actions: plan.actions,
    quarantinedFields: plan.quarantinedFields,
  };
}

function buildPlan(snapshot: SierraRailroadSnapshot): BuiltPlan {
  const plan = buildSierraRailroadClosePlan(snapshot);
  const hashMaterial = planHashMaterial(snapshot);
  return {
    snapshot,
    plan,
    hashMaterial,
    planSha256: sha256(hashMaterial),
  };
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

async function applyDealUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Deal" d
      SET date = $25::timestamp,
          description = $26,
          stake = $27,
          "dealStatus" = $28::"DealStatusEnum",
          "closingDate" = $29::timestamp,
          "keyHighlights" = $30::text[],
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
      proposed.description,
      proposed.stake,
      proposed.dealStatus,
      proposed.closingDate,
      proposed.keyHighlights,
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Deal ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyMilestoneUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_SIERRA_RAILROAD_MANIFEST.milestoneUpdate;
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
    throw new Error(`Milestone ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

async function applyCitationUpdate(client: Client): Promise<string[]> {
  const action = REVIEWED_SIERRA_RAILROAD_MANIFEST.citationUpdate;
  const current = action.current;
  const proposed = action.proposed;
  const result = await client.query<{ id: string }>(
    `
      UPDATE "Citation" ci
      SET "dealId" = $10
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
    ],
  );
  if (result.rows.length !== 1) {
    throw new Error(`Citation ${action.id} failed its exact update predicate`);
  }
  return [result.rows[0].id];
}

function withoutUpdatedAt(
  row: DealSnapshot,
): Omit<DealSnapshot, "updatedAt"> {
  const { updatedAt, ...rest } = row;
  void updatedAt;
  return rest;
}

function assertPostconditions(input: {
  before: BuiltPlan;
  after: SierraRailroadSnapshot;
  mutations: {
    dealUpdates: string[];
    milestoneUpdates: string[];
    citationUpdates: string[];
  };
}): void {
  const manifest = REVIEWED_SIERRA_RAILROAD_MANIFEST;
  exact("Updated Deal IDs", input.mutations.dealUpdates, [manifest.dealUpdate.id]);
  exact("Updated Milestone IDs", input.mutations.milestoneUpdates, [
    manifest.milestoneUpdate.id,
  ]);
  exact("Updated Citation IDs", input.mutations.citationUpdates, [
    manifest.citationUpdate.id,
  ]);

  if (!input.after.deal) throw new Error("Postcondition failed: Sierra Deal missing");
  exact(
    "Sierra Deal state",
    withoutUpdatedAt(input.after.deal),
    manifest.dealUpdate.proposed,
  );
  if (input.after.deal.updatedAt === manifest.dealUpdate.current.updatedAt) {
    throw new Error("Postcondition failed: Sierra Deal updatedAt did not change");
  }
  exact("Sierra Milestone state", input.after.milestone, manifest.milestoneUpdate.proposed);
  exact("Sierra Citation state", input.after.citation, manifest.citationUpdate.proposed);
  exact("Sierra Company guard", input.after.companyGuard, manifest.companyGuard);
  exact("Sierra Ownership guard", input.after.ownershipGuard, manifest.ownershipGuard);
  exact("Sierra Participant guard", input.after.participantGuard, manifest.participantGuard);
  exact(
    "Protected CVAT Milestone",
    input.after.protectedCvatMilestone,
    manifest.protectedCvatMilestone,
  );
  exact(
    "Unrelated INF-2026-152 Deal guard",
    input.after.unrelatedLegacyIdGuard,
    manifest.unrelatedLegacyIdGuard,
  );
  if (input.after.proposedCitationConflicts.length > 0) {
    throw new Error("Postcondition failed: Sierra citation identity conflicts");
  }
  exact(
    "Table counts",
    input.after.tableCounts,
    input.before.snapshot.tableCounts,
  );
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
    }

    const before = buildPlan(await loadSnapshot(client));
    const artifact = {
      ...before.hashMaterial,
      generatedAt: new Date().toISOString(),
      database: target,
      dryRun: !apply,
      planSha256: before.planSha256,
    };
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(
      JSON.stringify(
        {
          planSha256: before.planSha256,
          actionSetSha256: before.plan.actionSetSha256,
          actionCount: before.plan.actionCount,
          ...before.plan.counts,
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

    const mutations = {
      dealUpdates: await applyDealUpdate(client),
      milestoneUpdates: await applyMilestoneUpdate(client),
      citationUpdates: await applyCitationUpdate(client),
    };
    const after = await loadSnapshot(client);
    assertPostconditions({ before, after, mutations });
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: SIERRA_RAILROAD_CLOSE_SCHEMA_VERSION,
      scope: SIERRA_RAILROAD_CLOSE_SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      actionSetSha256: before.plan.actionSetSha256,
      mutations,
      rollbackRows: {
        deal: REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.current,
        milestone: REVIEWED_SIERRA_RAILROAD_MANIFEST.milestoneUpdate.current,
        citation: REVIEWED_SIERRA_RAILROAD_MANIFEST.citationUpdate.current,
      },
      actions: before.plan.actions,
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
        closingDateRemainedNull: true,
        companyOwnershipAndParticipantUnchanged: true,
        cvatMilestoneUnchanged: true,
        unrelatedInf2026152DealUnchanged: true,
        tableCountsUnchanged: true,
      },
    };
    await writeJson(
      receiptOutput!,
      { ...receipt, receiptSha256: sha256(receipt) },
      true,
    );
    console.log(
      `Applied ${before.plan.actionCount} exact Sierra Railroad corrections and wrote ${path.resolve(receiptOutput!)}.`,
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
