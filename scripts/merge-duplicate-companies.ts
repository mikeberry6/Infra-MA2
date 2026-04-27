/**
 * One-time PRODUCTION migration: consolidate duplicate Company rows in the
 * database into single rows that carry every original OwnershipPeriod.
 *
 * This complements scripts/consolidate-portfolio-duplicates.ts (which fixes
 * the static seed-data file). Run this once against the live DB after the
 * code changes have shipped, so existing data matches the new model.
 *
 *   Dry run (default — prints what it would do, no writes):
 *     npx tsx scripts/merge-duplicate-companies.ts
 *
 *   Apply for real:
 *     npx tsx scripts/merge-duplicate-companies.ts --apply
 *
 * Cluster strategy mirrors the seed-data audit:
 *   - normalize names (lowercase, strip punctuation, drop entity suffixes)
 *   - group by (normalized name, country) — same name in different countries
 *     is allowed by the schema and is NOT a duplicate
 *
 * For each cluster of size ≥ 2:
 *   1. Pick a canonical Company (most milestones → longest description →
 *      shortest name).
 *   2. Move every duplicate's OwnershipPeriod to the canonical company,
 *      respecting the @@unique([companyId, organizationId]) constraint
 *      (skip if the canonical already has that org).
 *   3. Move milestones (dedup by date+event), managementRoles, citations,
 *      countryTags onto the canonical row.
 *   4. Backfill canonical fields (description, headquarters, yearFounded,
 *      website) from a duplicate when canonical is missing them.
 *   5. Delete the duplicate Company rows. Cascades clean up any leftover
 *      relations.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { canonicalCompanyKey } from "../src/lib/company-key";

const APPLY = process.argv.includes("--apply");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Use the same `canonicalCompanyKey` helper that the view layer uses, so the
// DB cleanup catches exactly the clusters the UI was already collapsing
// (and now also catches name variants like "(ASTP)" and ", LLC").
const normalize = canonicalCompanyKey;

async function main() {
  console.log(APPLY ? "⚠️  APPLY MODE — writing changes" : "🔍 DRY RUN — no changes will be made");
  console.log();

  const companies = await prisma.company.findMany({
    include: {
      ownershipPeriods: true,
      milestones: true,
      managementRoles: true,
      citations: true,
    },
  });

  console.log(`Loaded ${companies.length} companies from DB.`);

  const byKey = new Map<string, typeof companies>();
  for (const c of companies) {
    const key = `${normalize(c.name)}|${c.country}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(c);
  }

  const clusters = Array.from(byKey.entries()).filter(([, list]) => list.length >= 2);
  console.log(`Found ${clusters.length} duplicate clusters covering ${clusters.reduce((n, [, l]) => n + l.length, 0)} rows.\n`);

  if (clusters.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let mergedClusters = 0;
  let movedOwnerships = 0;
  let movedMilestones = 0;
  let movedRoles = 0;
  let movedCitations = 0;
  let deletedCompanies = 0;

  for (const [key, group] of clusters) {
    // Pick canonical: most milestones → longest description → shortest name
    const sorted = [...group].sort((a, b) => {
      if (b.milestones.length !== a.milestones.length) return b.milestones.length - a.milestones.length;
      if ((b.description?.length ?? 0) !== (a.description?.length ?? 0)) {
        return (b.description?.length ?? 0) - (a.description?.length ?? 0);
      }
      return a.name.length - b.name.length;
    });
    const canonical = sorted[0];
    const duplicates = sorted.slice(1);

    console.log(`[${group.length}x] ${key}`);
    console.log(`   canonical: ${canonical.name} (${canonical.id})`);
    for (const d of duplicates) console.log(`   merge:     ${d.name} (${d.id})`);

    if (!APPLY) {
      mergedClusters++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      for (const dup of duplicates) {
        // Move ownership periods (skip if canonical already has that org)
        const canonicalOrgIds = new Set(
          (
            await tx.ownershipPeriod.findMany({
              where: { companyId: canonical.id },
              select: { organizationId: true },
            })
          ).map((p) => p.organizationId).filter((x): x is string => !!x),
        );
        for (const op of dup.ownershipPeriods) {
          if (op.organizationId && canonicalOrgIds.has(op.organizationId)) continue;
          await tx.ownershipPeriod.update({
            where: { id: op.id },
            data: { companyId: canonical.id },
          });
          movedOwnerships++;
        }

        // Move milestones (dedup by date + event)
        const canonicalMilestoneKeys = new Set(
          (await tx.milestone.findMany({ where: { companyId: canonical.id } }))
            .map((m) => `${m.date}|${m.event}`),
        );
        for (const m of dup.milestones) {
          const k = `${m.date}|${m.event}`;
          if (canonicalMilestoneKeys.has(k)) continue;
          await tx.milestone.update({
            where: { id: m.id },
            data: { companyId: canonical.id },
          });
          canonicalMilestoneKeys.add(k);
          movedMilestones++;
        }

        // Move management roles (dedup by personId)
        const canonicalPersonIds = new Set(
          (
            await tx.managementRole.findMany({
              where: { companyId: canonical.id },
              select: { personId: true },
            })
          ).map((r) => r.personId),
        );
        for (const r of dup.managementRoles) {
          if (canonicalPersonIds.has(r.personId)) continue;
          await tx.managementRole.update({
            where: { id: r.id },
            data: { companyId: canonical.id },
          });
          canonicalPersonIds.add(r.personId);
          movedRoles++;
        }

        // Move citations (dedup by sourceId)
        const canonicalSourceIds = new Set(
          (
            await tx.citation.findMany({
              where: { companyId: canonical.id },
              select: { sourceId: true },
            })
          ).map((c) => c.sourceId),
        );
        for (const c of dup.citations) {
          if (canonicalSourceIds.has(c.sourceId)) continue;
          await tx.citation.update({
            where: { id: c.id },
            data: { companyId: canonical.id },
          });
          canonicalSourceIds.add(c.sourceId);
          movedCitations++;
        }

        // Backfill canonical scalar fields if blank
        const updates: Record<string, unknown> = {};
        if (!canonical.description && dup.description) updates.description = dup.description;
        if (!canonical.headquarters && dup.headquarters) updates.headquarters = dup.headquarters;
        if (!canonical.yearFounded && dup.yearFounded) updates.yearFounded = dup.yearFounded;
        if (!canonical.website && dup.website) updates.website = dup.website;
        const mergedTags = new Set([...(canonical.countryTags || []), ...(dup.countryTags || [])]);
        if (mergedTags.size !== (canonical.countryTags || []).length) {
          updates.countryTags = Array.from(mergedTags);
        }
        if (Object.keys(updates).length > 0) {
          await tx.company.update({ where: { id: canonical.id }, data: updates });
        }

        // Delete the duplicate row (cascades clean up any leftover relations)
        await tx.company.delete({ where: { id: dup.id } });
        deletedCompanies++;
      }
    });

    mergedClusters++;
  }

  console.log();
  console.log(`Clusters merged:        ${mergedClusters}`);
  console.log(`Ownership periods moved: ${movedOwnerships}`);
  console.log(`Milestones moved:       ${movedMilestones}`);
  console.log(`Management roles moved: ${movedRoles}`);
  console.log(`Citations moved:        ${movedCitations}`);
  console.log(`Companies deleted:      ${deletedCompanies}`);
  if (!APPLY) {
    console.log("\nThis was a dry run. Re-run with --apply to write changes.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Merge failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
