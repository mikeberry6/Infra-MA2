/**
 * Audit + cleanup for Apollo / Argo ownership conflation.
 *
 * The user surfaced a specific bug: Duquesne Light Company appears in the
 * portfolio with **Apollo Global Management** listed as a current owner,
 * even though Apollo has no ownership in Duquesne. The actual ownership
 * involves Argo Infrastructure Partners' AIA Montana vehicle (alongside
 * APG and CalSTRS as LPs in that vehicle), plus GIC, Manulife, and
 * Macquarie. Apollo is not in that cap table.
 *
 * The seed file is clean. The conflation lives in the live DB, presumably
 * from an earlier hand-edit or a stale ingest run that mistook an
 * "Argo-managed" vehicle for an Apollo entity (both names start with the
 * same letter and have similar prose patterns; an aggressive substring
 * match against the Organization table can cause this).
 *
 * This script:
 *   1. Always runs as audit first — lists every Company that has Apollo
 *      as an OwnershipPeriod where the prose / known cap table doesn't
 *      support it. Specifically it looks for Apollo OwnershipPeriods on
 *      companies whose other owners include Argo OR whose ownership
 *      vehicle name contains "AIA " (Argo's vehicle prefix).
 *   2. With --duquesne-only, narrows to just Duquesne Light Company —
 *      the specific row the user flagged.
 *   3. With --apply, removes the matching Apollo OwnershipPeriod rows.
 *
 *   Audit (default — read-only):
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts
 *
 *   Audit just Duquesne:
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --duquesne-only
 *
 *   Apply (transactional, removes rows):
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --apply
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --duquesne-only --apply
 *
 * Pattern follows scripts/manual-merges.ts: --apply opt-in, transactional
 * per company, exhaustive logging in audit mode.
 */
import "dotenv/config";
import { withSafeTask } from "../src/lib/safe-task";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertMaintenanceMutationContext } from "../src/lib/database-target";

const APPLY = process.argv.includes("--apply");
const DUQUESNE_ONLY = process.argv.includes("--duquesne-only");
const mutationContext = APPLY ? assertMaintenanceMutationContext() : undefined;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Names we treat as "Apollo" for purposes of detection (in case the
// Organization table has variants). Matched case-insensitively.
const APOLLO_NAMES = ["Apollo Global Management", "Apollo"];

// Names we treat as "Argo" for purposes of detection.
const ARGO_NAMES = ["Argo Infrastructure Partners", "Argo"];

// Vehicle-name substrings that strongly indicate an Argo-managed vehicle.
// "AIA " covers AIA Montana LLC, AIA Energy North America, etc.
const ARGO_VEHICLE_HINTS = ["AIA ", "Argo Managed Funds", "Managed by Argo"];

interface SuspectFinding {
  companyId: string;
  companyName: string;
  apolloOpId: string;
  apolloVehicleName: string | null;
  reason: string;
  otherOwners: string[];
}

async function main() {
  console.log(APPLY ? "⚠️  APPLY MODE — will remove rows" : "🔍 AUDIT — read-only");
  if (DUQUESNE_ONLY) console.log("   scope: Duquesne Light Company only");
  console.log();

  // Find every Apollo Organization row (there should be one, but be defensive).
  const apolloOrgs = await prisma.organization.findMany({
    where: { name: { in: APOLLO_NAMES, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (apolloOrgs.length === 0) {
    console.log("No Apollo Organization rows found in DB. Nothing to do.");
    return;
  }
  const apolloIds = new Set(apolloOrgs.map((o) => o.id));
  console.log(`Found ${apolloOrgs.length} Apollo Organization row(s): ${apolloOrgs.map((o) => o.name).join(", ")}`);

  // Find every OwnershipPeriod whose org is Apollo, with the company and
  // sibling ownerships included so we can detect the Argo / AIA pattern.
  const where: NonNullable<Parameters<typeof prisma.ownershipPeriod.findMany>[0]>["where"] = {
    organizationId: { in: Array.from(apolloIds) },
  };
  if (DUQUESNE_ONLY) {
    where.company = { name: "Duquesne Light Company" };
  }

  const apolloOps = await prisma.ownershipPeriod.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          ownershipPeriods: {
            include: { organization: { select: { name: true } } },
          },
        },
      },
    },
  });

  console.log(`Found ${apolloOps.length} Apollo OwnershipPeriod(s) to inspect`);
  console.log();

  const suspects: SuspectFinding[] = [];

  for (const op of apolloOps) {
    const otherOwners = op.company.ownershipPeriods
      .filter((p) => p.id !== op.id)
      .map((p) => p.organization?.name ?? "(unknown)")
      .filter(Boolean);

    const hasArgoSibling = op.company.ownershipPeriods.some((p) =>
      ARGO_NAMES.some((a) => p.organization?.name?.toLowerCase() === a.toLowerCase()),
    );
    const looksLikeArgoVehicle =
      op.vehicleName != null &&
      ARGO_VEHICLE_HINTS.some((h) => op.vehicleName!.toLowerCase().includes(h.toLowerCase()));

    let reason: string | null = null;
    if (DUQUESNE_ONLY) {
      reason = "company is Duquesne Light Company (user-flagged)";
    } else if (hasArgoSibling && looksLikeArgoVehicle) {
      reason = `vehicle "${op.vehicleName}" looks Argo-managed AND Argo is also an owner of the company`;
    } else if (hasArgoSibling) {
      reason = "Argo is an owner of the same company — likely conflation";
    } else if (looksLikeArgoVehicle) {
      reason = `vehicle "${op.vehicleName}" looks Argo-managed`;
    }

    if (reason) {
      suspects.push({
        companyId: op.company.id,
        companyName: op.company.name,
        apolloOpId: op.id,
        apolloVehicleName: op.vehicleName,
        reason,
        otherOwners,
      });
    }
  }

  if (suspects.length === 0) {
    console.log("No suspect Apollo→Argo conflations detected. Nothing to remove.");
    return;
  }

  console.log(`⚠ ${suspects.length} suspect Apollo OwnershipPeriod(s) flagged:`);
  console.log();
  for (const s of suspects) {
    console.log(`  ${s.companyName}`);
    console.log(`    apolloOpId:    ${s.apolloOpId}`);
    console.log(`    vehicleName:   ${s.apolloVehicleName ?? "(none)"}`);
    console.log(`    reason:        ${s.reason}`);
    console.log(`    other owners:  ${s.otherOwners.join(", ") || "(none)"}`);
    console.log();
  }

  if (!APPLY) {
    console.log(`Audit complete. Re-run with --apply to remove the ${suspects.length} flagged row(s).`);
    return;
  }

  console.log("⚠️  Removing flagged Apollo OwnershipPeriods...");
  let removed = 0;
  await prisma.$transaction(async (tx) => {
    for (const s of suspects) {
      await tx.ownershipPeriod.delete({ where: { id: s.apolloOpId } });
      removed++;
    }
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "OwnershipPeriod",
        action: "APOLLO_ARGO_CONFLATION_CLEANUP",
        changes: {
          changedFields: [
            "OwnershipPeriod.companyId",
            "OwnershipPeriod.createdAt",
            "OwnershipPeriod.exitYear",
            "OwnershipPeriod.fundId",
            "OwnershipPeriod.id",
            "OwnershipPeriod.investmentYear",
            "OwnershipPeriod.isActive",
            "OwnershipPeriod.organizationId",
            "OwnershipPeriod.stake",
            "OwnershipPeriod.vehicleName",
          ],
          removedOwnershipPeriodIds: suspects.map((suspect) => suspect.apolloOpId),
          companyIds: [...new Set(suspects.map((suspect) => suspect.companyId))],
        },
        metadata: {
          source: "scripts/cleanup-apollo-argo-conflation.ts",
          duquesneOnly: DUQUESNE_ONLY,
          ...mutationContext!,
        },
      },
    });
  });
  console.log(`Removed ${removed} OwnershipPeriod row(s).`);
}

withSafeTask({ task: "ownership_cleanup", operation: "cleanup_apollo_argo_conflation" }, main)
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
