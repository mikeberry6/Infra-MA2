/**
 * Legacy, hand-curated merge-candidate list retained for review history.
 *
 *   Dry run (default — prints what it would do, no writes):
 *     npx tsx scripts/manual-merges.ts
 *
 * Apply mode is intentionally disabled. Approved ID-level decisions must use
 * `merge-duplicate-companies.ts --apply --approval-file=<reviewed JSON>` so
 * the reviewer and exact retired IDs are persisted in the AuditEvent.
 *
 * Each entry pairs a historical `keep` suggestion with a `mergeFrom` name.
 * Names are matched exactly and reported only. This file has no write path;
 * current ID-level decisions use the reviewed approval workflow.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ACTIVE_COMPANY_WHERE } from "../src/modules/companies/retirement";

const APPLY = process.argv.includes("--apply");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface MergePair {
  keep: string;
  mergeFrom: string;
  rationale: string;
}

const MERGES: MergePair[] = [
  {
    keep: "Southern Star Central Gas Pipeline",
    mergeFrom: "Southern Star",
    rationale: "Same FERC-regulated interstate gas transmission and storage system; identical sector + subsector.",
  },
  {
    keep: "Caturus Energy",
    mergeFrom: "Caturus",
    rationale: "Same Kimmeridge integrated gas/LNG platform; descriptions and sector match.",
  },
  {
    keep: "CSV Midstream Solutions Corp.",
    mergeFrom: "CSV Midstream",
    rationale: "Same Northleaf-owned Alberta gas processor; descriptions and sector match.",
  },
  {
    keep: "Oryx Midstream Services",
    mergeFrom: "Oryx Midstream",
    rationale: "Same Permian crude gathering operator; descriptions and sector match.",
  },
  {
    keep: "Cleco Corporate Holdings LLC",
    mergeFrom: "Cleco Corporation",
    rationale: "Cleco Corp was renamed Cleco Corporate Holdings post-Macquarie acquisition. Same Louisiana regulated electric utility.",
  },
  {
    keep: "Student Transportation of America and Canada",
    mergeFrom: "Student Transportation Inc.",
    rationale: "Same school-transportation business; STI is the corporate entity name, the longer name is the operating description.",
  },
  {
    keep: "Southern Power solar portfolio",
    mergeFrom: "Southern Power",
    rationale: "The 'Southern Power' row is the same APG-owned Southern Power solar/storage portfolio described in the longer row.",
  },
];

async function main() {
  if (APPLY) {
    throw new Error(
      "Direct apply is disabled. Record ID-level approvals and use merge-duplicate-companies.ts --apply --approval-file=<file>.",
    );
  }
  console.log("🔍 LEGACY REVIEW LIST — no changes will be made");
  console.log();

  let found = 0;
  let skipped = 0;

  for (const pair of MERGES) {
    const keep = await prisma.company.findFirst({
      where: { name: pair.keep, ...ACTIVE_COMPANY_WHERE },
      select: { id: true, _count: { select: { ownershipPeriods: true, milestones: true } } },
    });
    const dup = await prisma.company.findFirst({
      where: { name: pair.mergeFrom, ...ACTIVE_COMPANY_WHERE },
      select: { id: true, _count: { select: { ownershipPeriods: true, milestones: true } } },
    });

    if (!keep || !dup) {
      console.log(`⚠️  SKIP "${pair.mergeFrom}" → "${pair.keep}" (one or both not found in DB)`);
      skipped++;
      continue;
    }

    console.log(`[merge] "${pair.mergeFrom}" → "${pair.keep}"`);
    console.log(`        ${pair.rationale}`);
    console.log(`        keep: id=${keep.id} owners=${keep._count.ownershipPeriods} milestones=${keep._count.milestones}`);
    console.log(`        dup:  id=${dup.id}  owners=${dup._count.ownershipPeriods}  milestones=${dup._count.milestones}`);
    found++;
  }

  console.log();
  console.log(`Legacy pairs found: ${found}   Skipped: ${skipped}`);
  console.log("\nGenerate a current approval template; this legacy list cannot mutate data.");
}

main()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
