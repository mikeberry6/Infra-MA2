/**
 * Hash-gated cleanup for exact duplicate ownership and management facts.
 * Dry-run is the default. Apply deletes only the row IDs approved by the
 * current snapshot hash and verifies that no exact groups remain.
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  planExactCompanyFactDeduplication,
  snapshotSha256,
  type ManagementFactSnapshot,
  type OwnershipFactSnapshot,
} from "./portfolio-review/exact-fact-duplicates";

const SCHEMA_VERSION = 1 as const;
const SCOPE = "EXACT_DUPLICATE_PUBLISHED_COMPANY_FACTS" as const;
const LOCK_KEY = "infra-ma2:portfolio-company-fact-dedupe:v1";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function databaseTarget(connectionString: string, requireExplicit: boolean) {
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
    throw new Error("Apply requires EXPECTED_DATABASE_HOST and EXPECTED_DATABASE_NAME");
  }
  if (expectedHost && expectedHost !== target.host) throw new Error("Database host does not match EXPECTED_DATABASE_HOST");
  if (expectedDatabase && expectedDatabase !== target.database) throw new Error("Database name does not match EXPECTED_DATABASE_NAME");
  return target;
}

async function loadSnapshot(client: Client): Promise<{
  ownership: OwnershipFactSnapshot[];
  management: ManagementFactSnapshot[];
}> {
  const ownership = await client.query<OwnershipFactSnapshot>(`
    SELECT op.id,
           op."companyId",
           c.name AS "companyName",
           op."organizationId",
           direct_org.name AS "organizationName",
           op."fundId",
           f."fundName",
           fund_manager.name AS "fundManagerName",
           op."vehicleName",
           op.stake,
           op."investmentYear",
           op."exitYear",
           op."isActive",
           op."createdAt"::text AS "createdAt"
    FROM "OwnershipPeriod" op
    JOIN "Company" c ON c.id = op."companyId" AND c.status = 'PUBLISHED'
    LEFT JOIN "Organization" direct_org ON direct_org.id = op."organizationId"
    LEFT JOIN "Fund" f ON f.id = op."fundId"
    LEFT JOIN "Organization" fund_manager ON fund_manager.id = f."managerId"
    ORDER BY op.id
  `);
  const management = await client.query<ManagementFactSnapshot>(`
    SELECT mr.id,
           mr."companyId",
           c.name AS "companyName",
           mr."personId",
           p.name AS "personName",
           mr.title,
           mr."startDate"::text AS "startDate",
           mr."endDate"::text AS "endDate"
    FROM "ManagementRole" mr
    JOIN "Company" c ON c.id = mr."companyId" AND c.status = 'PUBLISHED'
    JOIN "Person" p ON p.id = mr."personId"
    ORDER BY mr.id
  `);
  return { ownership: ownership.rows, management: management.rows };
}

function hashMaterial(snapshot: Awaited<ReturnType<typeof loadSnapshot>>) {
  const plan = planExactCompanyFactDeduplication(snapshot);
  const material = {
    schemaVersion: SCHEMA_VERSION,
    scope: SCOPE,
    ownershipSnapshotSha256: snapshotSha256(snapshot.ownership),
    managementSnapshotSha256: snapshotSha256(snapshot.management),
    ownershipGroups: plan.ownershipGroups,
    dominatedOwnershipGroups: plan.dominatedOwnershipGroups,
    managementGroups: plan.managementGroups,
  };
  return { plan, material, planSha256: snapshotSha256(material) };
}

async function writeJson(outputPath: string, value: unknown, exclusive = false): Promise<void> {
  const resolved = path.resolve(outputPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(value, null, 2)}\n`, exclusive ? { flag: "wx" } : undefined);
}

async function assertPathAbsent(outputPath: string): Promise<void> {
  try {
    await access(path.resolve(outputPath));
    throw new Error(`Receipt output already exists: ${path.resolve(outputPath)}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Receipt output already exists:")) throw error;
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = process.argv.includes("--apply");
  const approvalHash = option("approval-hash");
  const manifestOutput = option("manifest-output");
  const receiptOutput = option("receipt-output");
  const target = databaseTarget(connectionString, apply);
  if (apply && (!approvalHash || !/^[0-9a-f]{64}$/.test(approvalHash))) {
    throw new Error("Apply requires --approval-hash=<exact lowercase SHA-256 from dry-run>");
  }
  if (apply && !receiptOutput) throw new Error("Apply requires --receipt-output=<new JSON path>");
  if (receiptOutput) await assertPathAbsent(receiptOutput);

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(apply
      ? "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      : "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    if (apply) await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [LOCK_KEY]);
    const beforeSnapshot = await loadSnapshot(client);
    const before = hashMaterial(beforeSnapshot);
    const artifact = {
      schemaVersion: SCHEMA_VERSION,
      scope: SCOPE,
      generatedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      counts: {
        ownershipRows: beforeSnapshot.ownership.length,
        managementRows: beforeSnapshot.management.length,
        duplicateOwnershipGroups: before.plan.ownershipGroups.length,
        dominatedOwnershipGroups: before.plan.dominatedOwnershipGroups.length,
        duplicateManagementGroups: before.plan.managementGroups.length,
        deleteOwnershipRows: before.plan.deleteOwnershipIds.length,
        deleteManagementRows: before.plan.deleteManagementRoleIds.length,
      },
      ...before.material,
    };
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(JSON.stringify({ planSha256: before.planSha256, ...artifact.counts }, null, 2));
    if (!apply) {
      await client.query("ROLLBACK");
      console.log("Dry-run complete; no database rows changed.");
      return;
    }
    if (approvalHash !== before.planSha256) {
      throw new Error(`Approval hash does not match current plan SHA-256 ${before.planSha256}`);
    }

    const deletedOwnership = before.plan.deleteOwnershipIds.length > 0
      ? await client.query<{ id: string }>(`
          DELETE FROM "OwnershipPeriod"
          WHERE id = ANY($1::text[])
          RETURNING id
        `, [before.plan.deleteOwnershipIds])
      : { rows: [] as Array<{ id: string }> };
    const deletedManagement = before.plan.deleteManagementRoleIds.length > 0
      ? await client.query<{ id: string }>(`
          DELETE FROM "ManagementRole"
          WHERE id = ANY($1::text[])
          RETURNING id
        `, [before.plan.deleteManagementRoleIds])
      : { rows: [] as Array<{ id: string }> };
    const actualOwnership = deletedOwnership.rows.map((row) => row.id).sort();
    const actualManagement = deletedManagement.rows.map((row) => row.id).sort();
    if (JSON.stringify(actualOwnership) !== JSON.stringify(before.plan.deleteOwnershipIds)) {
      throw new Error("Deleted ownership IDs do not match the approved plan");
    }
    if (JSON.stringify(actualManagement) !== JSON.stringify(before.plan.deleteManagementRoleIds)) {
      throw new Error("Deleted management IDs do not match the approved plan");
    }

    const afterSnapshot = await loadSnapshot(client);
    const after = hashMaterial(afterSnapshot);
    if (after.plan.deleteOwnershipIds.length > 0 || after.plan.deleteManagementRoleIds.length > 0) {
      throw new Error("Postcondition failed: exact duplicate company facts remain");
    }
    if (afterSnapshot.ownership.length !== beforeSnapshot.ownership.length - actualOwnership.length
        || afterSnapshot.management.length !== beforeSnapshot.management.length - actualManagement.length) {
      throw new Error("Postcondition failed: company fact counts changed outside the approved plan");
    }
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: SCHEMA_VERSION,
      scope: SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: before.planSha256,
      deletedOwnershipIds: actualOwnership,
      deletedManagementRoleIds: actualManagement,
      before: artifact.counts,
      after: {
        ownershipRows: afterSnapshot.ownership.length,
        managementRows: afterSnapshot.management.length,
        duplicateOwnershipGroups: after.plan.ownershipGroups.length,
        dominatedOwnershipGroups: after.plan.dominatedOwnershipGroups.length,
        duplicateManagementGroups: after.plan.managementGroups.length,
      },
      afterSnapshotSha256: snapshotSha256(afterSnapshot),
    };
    await writeJson(receiptOutput!, { ...receipt, receiptSha256: snapshotSha256(receipt) }, true);
    console.log(`Applied exact company-fact cleanup and wrote ${path.resolve(receiptOutput!)}.`);
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
