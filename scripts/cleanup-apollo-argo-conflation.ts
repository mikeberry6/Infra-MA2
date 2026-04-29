/**
 * Audit + cleanup for misattributed Apollo OwnershipPeriod rows.
 *
 * Background. The user surfaced a UI bug: filtering the portfolio by
 * "Apollo Global Management" returns 38 companies, many of which Apollo
 * does not actually own — Carville Energy Center, Corning Natural Gas,
 * Cross-Sound Cable, Duquesne Light, Brightspeed, etc. The drawers on
 * those companies show an Apollo OwnershipPeriod whose vehicleName is a
 * malformed "Argo via Apollo" / "X (Apollo)" annotation, not a real
 * vehicle. The seed file (`prisma/seed-data/companies.ts`) is clean — these
 * Apollo rows were added to the live DB later, presumably by a parser that
 * promoted parenthetical "(Apollo)" notes into stand-alone Organization
 * links.
 *
 * Detection (an Apollo OwnershipPeriod is flagged as suspect if ANY apply):
 *   1. The vehicleName contains "Apollo" parenthetically (e.g.
 *      "Argo Infrastructure Partners (Apollo)") — a clear annotation, not
 *      a real Apollo vehicle.
 *   2. The vehicleName starts with another known firm's name (e.g.
 *      "Argo Infrastructure Partners ..."). The Apollo row is supposed
 *      to be Apollo-the-firm with its own vehicle, not someone else's.
 *   3. The vehicleName contains an Argo-vehicle hint ("AIA ",
 *      "Argo Managed Funds", "Managed by Argo").
 *   4. The company has another non-Apollo OwnershipPeriod whose firm
 *      name appears verbatim in the Apollo row's vehicleName.
 *   5. With `--duquesne-only` or `--list-all`, scope is overridden.
 *
 * Modes:
 *
 *   Audit suspects (default — read-only, prints the flagged set):
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts
 *
 *   List every Apollo OwnershipPeriod (read-only, helpful for eyeballing):
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --list-all
 *
 *   Audit just the user's first-flagged row:
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --duquesne-only
 *
 *   Apply (transactional, removes the flagged Apollo OwnershipPeriods):
 *     npx tsx scripts/cleanup-apollo-argo-conflation.ts --apply
 *
 * Pattern follows scripts/manual-merges.ts: --apply opt-in, single
 * transaction, exhaustive logging.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const APPLY = process.argv.includes("--apply");
const DUQUESNE_ONLY = process.argv.includes("--duquesne-only");
const LIST_ALL = process.argv.includes("--list-all");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Apollo Organization name variants — matched case-insensitively against
// the live DB.
const APOLLO_NAMES = ["Apollo Global Management", "Apollo"];

// Vehicle-name substrings that indicate an Argo-managed vehicle.
const ARGO_VEHICLE_HINTS = ["AIA ", "Argo Managed Funds", "Managed by Argo"];

interface ApolloOpRow {
  opId: string;
  companyId: string;
  companyName: string;
  vehicleName: string | null;
  isActive: boolean;
  stake: string | null;
  siblingOwnerNames: string[]; // every other firm on the same company
}

interface SuspectFinding extends ApolloOpRow {
  reason: string;
}

async function main() {
  if (LIST_ALL && APPLY) {
    console.error("--list-all is read-only and incompatible with --apply.");
    process.exit(1);
  }

  console.log(
    APPLY
      ? "⚠️  APPLY MODE — will remove rows"
      : LIST_ALL
        ? "📋 LIST-ALL — every Apollo OwnershipPeriod, no detection filter"
        : "🔍 AUDIT — read-only, suspect-only",
  );
  if (DUQUESNE_ONLY) console.log("   scope: Duquesne Light Company only");
  console.log();

  // Find every Apollo Organization row.
  const apolloOrgs = await prisma.organization.findMany({
    where: { name: { in: APOLLO_NAMES, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (apolloOrgs.length === 0) {
    console.log("No Apollo Organization rows found in DB. Nothing to do.");
    return;
  }
  const apolloIds = new Set(apolloOrgs.map((o) => o.id));
  console.log(
    `Found ${apolloOrgs.length} Apollo Organization row(s): ${apolloOrgs.map((o) => o.name).join(", ")}`,
  );

  // Pull every Apollo OwnershipPeriod with the company + sibling owners.
  const where: Parameters<typeof prisma.ownershipPeriod.findMany>[0]["where"] = {
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

  // Reshape into a flat list keyed off the Apollo OP, with every sibling
  // owner name attached for downstream detection.
  const rows: ApolloOpRow[] = apolloOps.map((op) => ({
    opId: op.id,
    companyId: op.company.id,
    companyName: op.company.name,
    vehicleName: op.vehicleName,
    isActive: op.isActive,
    stake: op.stake,
    siblingOwnerNames: op.company.ownershipPeriods
      .filter((p) => p.id !== op.id)
      .map((p) => p.organization?.name ?? "")
      .filter(Boolean),
  }));

  console.log(`Found ${rows.length} Apollo OwnershipPeriod(s) to inspect`);
  console.log();

  // ── Mode 1: --list-all just dumps every Apollo OP, sorted by company. ──
  if (LIST_ALL) {
    const sorted = [...rows].sort((a, b) => a.companyName.localeCompare(b.companyName));
    for (const r of sorted) {
      console.log(`  ${r.companyName}`);
      console.log(`    opId:        ${r.opId}`);
      console.log(`    vehicle:     ${r.vehicleName ?? "(none)"}`);
      console.log(`    isActive:    ${r.isActive}${r.stake ? `  stake=${r.stake}` : ""}`);
      console.log(`    siblings:    ${r.siblingOwnerNames.join(", ") || "(none)"}`);
      console.log();
    }
    console.log(`Listed ${sorted.length} Apollo OwnershipPeriod(s).`);
    return;
  }

  // ── Mode 2: detection. ──
  const suspects: SuspectFinding[] = [];
  for (const r of rows) {
    const v = r.vehicleName ?? "";
    const vLower = v.toLowerCase();
    const reasons: string[] = [];

    // (1) parenthetical "(Apollo)" annotation
    if (/\(apollo[^)]*\)/i.test(v)) {
      reasons.push(`vehicle "${v}" contains parenthetical "(Apollo)" annotation — malformed`);
    }

    // (2) Argo vehicle hint
    if (ARGO_VEHICLE_HINTS.some((h) => vLower.includes(h.toLowerCase()))) {
      reasons.push(`vehicle "${v}" looks Argo-managed`);
    }

    // (3) vehicle name contains a sibling firm's name (i.e. "X" — where X
    // is another owner on the same company — appears in the Apollo row's
    // vehicleName). This catches "Argo Infrastructure Partners (Apollo)"
    // and the Mubadala / GIC variants.
    const siblingInVehicle = r.siblingOwnerNames.find(
      (sib) => sib.length >= 4 && vLower.includes(sib.toLowerCase()),
    );
    if (siblingInVehicle) {
      reasons.push(
        `vehicle "${v}" contains another owner's firm name "${siblingInVehicle}" — likely a "via X" annotation, not a real Apollo vehicle`,
      );
    }

    // (4) DUQUESNE_ONLY override — flag everything in scope.
    if (DUQUESNE_ONLY && reasons.length === 0) {
      reasons.push("company is Duquesne Light Company (user-flagged)");
    }

    if (reasons.length > 0) {
      suspects.push({ ...r, reason: reasons.join("; ") });
    }
  }

  if (suspects.length === 0) {
    console.log("No suspect Apollo OwnershipPeriods detected. Nothing to remove.");
    return;
  }

  console.log(`⚠ ${suspects.length} suspect Apollo OwnershipPeriod(s) flagged:`);
  console.log();
  const sorted = [...suspects].sort((a, b) => a.companyName.localeCompare(b.companyName));
  for (const s of sorted) {
    console.log(`  ${s.companyName}`);
    console.log(`    opId:        ${s.opId}`);
    console.log(`    vehicle:     ${s.vehicleName ?? "(none)"}`);
    console.log(`    reason:      ${s.reason}`);
    console.log(`    siblings:    ${s.siblingOwnerNames.join(", ") || "(none)"}`);
    console.log();
  }

  if (!APPLY) {
    const survivors = rows.length - suspects.length;
    console.log(
      `Audit complete. ${suspects.length} flagged for removal; ${survivors} Apollo OwnershipPeriod(s) would remain.`,
    );
    console.log(`Re-run with --apply to remove the ${suspects.length} flagged row(s).`);
    console.log(`Or re-run with --list-all to see EVERY Apollo OwnershipPeriod (incl. real ones).`);
    return;
  }

  console.log("⚠️  Removing flagged Apollo OwnershipPeriods...");
  let removed = 0;
  await prisma.$transaction(async (tx) => {
    for (const s of suspects) {
      await tx.ownershipPeriod.delete({ where: { id: s.opId } });
      removed++;
    }
  });
  console.log(`Removed ${removed} OwnershipPeriod row(s).`);
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
