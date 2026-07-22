/**
 * One-shot, hand-curated merges. Used when an automated normalizer can't
 * tell two rows apart from a parent/subsidiary or numbered-SPV pair, but a
 * human has confirmed they refer to the same entity.
 *
 *   Dry run (default — prints what it would do, no writes):
 *     npx tsx scripts/manual-merges.ts
 *
 * Apply mode is intentionally disabled. Approved ID-level decisions must use
 * `merge-duplicate-companies.ts --apply --approval-file=<reviewed JSON>` so
 * the reviewer and exact retired IDs are persisted in the AuditEvent.
 *
 * Each entry pairs a `keep` (canonical, surviving) name with a `mergeFrom`
 * (the row whose ownership/milestone/management/citation rows are
 * relocated, and whose Company row is then deleted). Names are matched
 * exactly — if the DB row has been renamed since this script was written,
 * the entry is skipped (logged) rather than merged into the wrong row.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { rehomeCompanyRedirects } from "../src/modules/companies/redirects";

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
  console.log(APPLY ? "⚠️  APPLY MODE — writing changes" : "🔍 DRY RUN — no changes will be made");
  console.log();

  let totalOpsMoved = 0;
  let totalMilestonesMoved = 0;
  let totalRolesMoved = 0;
  let totalCitationsMoved = 0;
  let merged = 0;
  let skipped = 0;

  for (const pair of MERGES) {
    const keep = await prisma.company.findFirst({
      where: { name: pair.keep },
      include: { ownershipPeriods: true, milestones: true, managementRoles: true, citations: true, _count: { select: { ownershipPeriods: true, milestones: true } } },
    });
    const dup = await prisma.company.findFirst({
      where: { name: pair.mergeFrom },
      include: { ownershipPeriods: true, milestones: true, managementRoles: true, citations: true, _count: { select: { ownershipPeriods: true, milestones: true } } },
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

    if (!APPLY) {
      merged++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      // Move ownership periods (skip exact org+vehicle pairs the keep row
      // already has; one org can own through multiple vehicles).
      const keepOwnershipKeys = new Set(
        (await tx.ownershipPeriod.findMany({
          where: { companyId: keep.id },
          select: { organizationId: true, vehicleName: true },
        }))
          .map((p) => `${p.organizationId ?? ""}|${p.vehicleName ?? ""}`),
      );
      for (const op of dup.ownershipPeriods) {
        const key = `${op.organizationId ?? ""}|${op.vehicleName ?? ""}`;
        if (keepOwnershipKeys.has(key)) continue;
        await tx.ownershipPeriod.update({ where: { id: op.id }, data: { companyId: keep.id } });
        keepOwnershipKeys.add(key);
        totalOpsMoved++;
      }

      // Move milestones (dedup by date+event).
      const keepMilestoneKeys = new Set(
        (await tx.milestone.findMany({ where: { companyId: keep.id } })).map((m) => `${m.date}|${m.event}`),
      );
      for (const m of dup.milestones) {
        const k = `${m.date}|${m.event}`;
        if (keepMilestoneKeys.has(k)) continue;
        await tx.milestone.update({ where: { id: m.id }, data: { companyId: keep.id } });
        keepMilestoneKeys.add(k);
        totalMilestonesMoved++;
      }

      // Move management roles (dedup by personId).
      const keepPersonIds = new Set(
        (await tx.managementRole.findMany({ where: { companyId: keep.id }, select: { personId: true } })).map((r) => r.personId),
      );
      for (const r of dup.managementRoles) {
        if (keepPersonIds.has(r.personId)) continue;
        await tx.managementRole.update({ where: { id: r.id }, data: { companyId: keep.id } });
        keepPersonIds.add(r.personId);
        totalRolesMoved++;
      }

      // Move citations (dedup by sourceId).
      const keepCitations = await tx.citation.findMany({
        where: { companyId: keep.id },
        select: { id: true, sourceId: true, isPrimary: true },
      });
      const keepCitationsBySource = new Map(keepCitations.map((citation) => [citation.sourceId, citation]));
      let keepHasPrimary = keepCitations.some((citation) => citation.isPrimary);
      for (const c of dup.citations) {
        const existingCitation = keepCitationsBySource.get(c.sourceId);
        if (existingCitation) {
          if (!keepHasPrimary && c.isPrimary) {
            await tx.citation.update({ where: { id: existingCitation.id }, data: { isPrimary: true } });
            keepHasPrimary = true;
          }
          continue;
        }
        const retainPrimary = c.isPrimary && !keepHasPrimary;
        await tx.citation.update({
          where: { id: c.id },
          data: { companyId: keep.id, isPrimary: retainPrimary },
        });
        keepCitationsBySource.set(c.sourceId, {
          id: c.id,
          sourceId: c.sourceId,
          isPrimary: retainPrimary,
        });
        if (retainPrimary) keepHasPrimary = true;
        totalCitationsMoved++;
      }

      // Backfill any blank scalar fields on the keep row.
      const updates: Record<string, unknown> = {};
      if (!keep.description && dup.description) updates.description = dup.description;
      if (!keep.headquarters && dup.headquarters) updates.headquarters = dup.headquarters;
      if (!keep.yearFounded && dup.yearFounded) updates.yearFounded = dup.yearFounded;
      if (!keep.website && dup.website) updates.website = dup.website;
      const mergedTags = new Set([...(keep.countryTags || []), ...(dup.countryTags || [])]);
      if (mergedTags.size !== (keep.countryTags || []).length) {
        updates.countryTags = Array.from(mergedTags);
      }
      if (Object.keys(updates).length > 0) {
        await tx.company.update({ where: { id: keep.id }, data: updates });
      }

      // Wipe any leftover child rows still pointing at the dup row before
      // we delete it (schema has no ON DELETE CASCADE on these FKs).
      await tx.milestone.deleteMany({ where: { companyId: dup.id } });
      await tx.managementRole.deleteMany({ where: { companyId: dup.id } });
      await tx.citation.deleteMany({ where: { companyId: dup.id } });
      await tx.ownershipPeriod.deleteMany({ where: { companyId: dup.id } });
      await rehomeCompanyRedirects(tx, dup.id, keep.id);
      await tx.company.delete({ where: { id: dup.id } });
      await tx.auditEvent.create({
        data: {
          entityType: "Company",
          entityId: keep.id,
          action: "CANONICAL_MERGE",
          changes: { retiredId: dup.id, retiredName: dup.name },
          metadata: { source: "scripts/manual-merges.ts", rationale: pair.rationale },
        },
      });
    });

    merged++;
  }

  console.log();
  console.log(`Merged: ${merged}   Skipped: ${skipped}`);
  console.log(`Ownership periods moved: ${totalOpsMoved}`);
  console.log(`Milestones moved:        ${totalMilestonesMoved}`);
  console.log(`Management roles moved:  ${totalRolesMoved}`);
  console.log(`Citations moved:         ${totalCitationsMoved}`);
  if (!APPLY) console.log("\nThis was a dry run. Re-run with --apply to write changes.");
}

main()
  .catch((e) => {
    console.error("❌ Manual merges failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
