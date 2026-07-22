import "dotenv/config";
import { PrismaClient, type MilestoneCategory } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { companies } from "../prisma/seed-data/companies";
import type { PortCoMilestone } from "../prisma/seed-data/portco-types";
import { MILESTONE_CATEGORY_MAP } from "../src/modules/shared/enum-maps";
import { assertMaintenanceMutationContext } from "../src/lib/database-target";
import { withServerTask } from "../src/lib/server-log";

type SeedCompany = (typeof companies)[number];
type DbCompany = Awaited<ReturnType<typeof getPublishedCompanies>>[number];

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const isApply = args.has("--apply");
const preserveDbOnly = args.has("--preserve-db-only");

if (isDryRun === isApply) {
  console.error("Use exactly one mode: --dry-run or --apply.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const mutationContext = isApply ? assertMaintenanceMutationContext() : undefined;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function companyKey(name: string, country: string): string {
  return `${name}||${country}`;
}

function parseMilestoneDateForSort(dateStr: string): Date | null {
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) return direct;

  const monthYear = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) return new Date(`${yearOnly[1]}-01-01`);

  const quarter = dateStr.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarter) {
    const month = (Number(quarter[1]) - 1) * 3 + 1;
    return new Date(`${quarter[2]}-${String(month).padStart(2, "0")}-01`);
  }

  return null;
}

function categoryFor(milestone: PortCoMilestone): MilestoneCategory {
  return MILESTONE_CATEGORY_MAP[milestone.category] ?? "OTHER";
}

function exactDuplicateExtraRows(
  companiesWithMilestones: Array<{
    milestones: Array<{ date: string; event: string }>;
  }>,
): number {
  let extraRows = 0;
  for (const company of companiesWithMilestones) {
    const seen = new Set<string>();
    for (const milestone of company.milestones) {
      const key = `${milestone.date.trim().toLowerCase()}|${milestone.event.trim().toLowerCase()}`;
      if (seen.has(key)) extraRows++;
      else seen.add(key);
    }
  }
  return extraRows;
}

async function getPublishedCompanies() {
  return prisma.company.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      country: true,
      milestones: {
        orderBy: { sortDate: "desc" },
        select: { date: true, event: true, category: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function summarizeLive(label: string) {
  const liveCompanies = await getPublishedCompanies();
  const totalMilestones = liveCompanies.reduce((sum, company) => sum + company.milestones.length, 0);
  const exactDuplicateRows = exactDuplicateExtraRows(liveCompanies);
  const alSandersville = liveCompanies.find(
    (company) => company.name === "AL Sandersville Holdings" && company.country === "United States",
  );

  console.log(`${label}:`);
  console.log(`  published companies: ${liveCompanies.length}`);
  console.log(`  live milestones: ${totalMilestones}`);
  console.log(`  exact duplicate extra rows: ${exactDuplicateRows}`);
  console.log(`  AL Sandersville milestones: ${alSandersville?.milestones.length ?? "not found"}`);
  if (alSandersville) {
    for (const milestone of alSandersville.milestones) {
      console.log(`    - ${milestone.date} | ${milestone.category} | ${milestone.event}`);
    }
  }
  return { liveCompanies, totalMilestones, exactDuplicateRows };
}

async function main() {
  const seedByKey = new Map(companies.map((company) => [companyKey(company.name, company.country), company]));
  const seedMilestoneCount = companies.reduce((sum, company) => sum + (company.milestones?.length ?? 0), 0);

  const before = await summarizeLive("Before reconciliation");
  const dbByKey = new Map(before.liveCompanies.map((company) => [companyKey(company.name, company.country), company]));
  const matched: Array<{ seedCompany: SeedCompany; dbCompany: DbCompany }> = [];
  for (const seedCompany of companies) {
    const dbCompany = dbByKey.get(companyKey(seedCompany.name, seedCompany.country));
    if (dbCompany) matched.push({ seedCompany, dbCompany });
  }
  const unmatchedSeed = companies.filter((company) => !dbByKey.has(companyKey(company.name, company.country)));
  const dbOnly = before.liveCompanies.filter((company) => !seedByKey.has(companyKey(company.name, company.country)));
  const dbOnlyMilestones = dbOnly.reduce((sum, company) => sum + company.milestones.length, 0);

  console.log("Seed comparison:");
  console.log(`  seed companies: ${companies.length}`);
  console.log(`  seed milestones: ${seedMilestoneCount}`);
  console.log(`  matched companies: ${matched.length}`);
  console.log(`  seed-only companies: ${unmatchedSeed.length}`);
  console.log(`  db-only published companies: ${dbOnly.length}`);
  console.log(`  db-only milestone rows to prune: ${preserveDbOnly ? 0 : dbOnlyMilestones}`);
  for (const company of unmatchedSeed.slice(0, 20)) {
    console.log(`    seed only: ${company.name} | ${company.country}`);
  }
  for (const company of dbOnly.slice(0, 20)) {
    console.log(`    db only: ${company.name} | ${company.country} | milestones=${company.milestones.length}`);
  }

  if (isDryRun) {
    console.log("Dry run complete. No database rows were changed.");
    return;
  }

  const auditStart = await prisma.auditEvent.create({
    data: {
      actorId: null,
      entityType: "MaintenanceRun",
      action: "MILESTONE_RECONCILIATION_STARTED",
      changes: {
        matchedCompanies: matched.length,
        dbOnlyCompanies: dbOnly.length,
        preserveDbOnly,
      },
      metadata: {
        source: "scripts/reconcile-portfolio-milestones.ts",
        ...mutationContext!,
      },
    },
    select: { id: true },
  });

  const { deletedRows, insertedRows } = await prisma.$transaction(async (tx) => {
    let deletedRows = 0;
    let insertedRows = 0;

    for (const { seedCompany, dbCompany } of matched) {
      const deleted = await tx.milestone.deleteMany({ where: { companyId: dbCompany.id } });
      deletedRows += deleted.count;

      const milestones = seedCompany.milestones ?? [];
      if (!milestones.length) continue;
      const created = await tx.milestone.createMany({
        data: milestones.map((milestone) => ({
          companyId: dbCompany.id,
          date: milestone.date,
          event: milestone.event,
          category: categoryFor(milestone),
          sortDate: parseMilestoneDateForSort(milestone.date),
        })),
      });
      insertedRows += created.count;
    }

    if (!preserveDbOnly) {
      for (const company of dbOnly) {
        const deleted = await tx.milestone.deleteMany({ where: { companyId: company.id } });
        deletedRows += deleted.count;
      }
    }

    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "MaintenanceRun",
        entityId: auditStart.id,
        action: "MILESTONE_RECONCILIATION_COMPLETED",
        changes: { deletedRows, insertedRows },
        metadata: {
          source: "scripts/reconcile-portfolio-milestones.ts",
          startedAuditEventId: auditStart.id,
          ...mutationContext!,
        },
      },
    });

    return { deletedRows, insertedRows };
  }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });

  console.log("Applied reconciliation:");
  console.log(`  deleted milestone rows: ${deletedRows}`);
  console.log(`  inserted milestone rows: ${insertedRows}`);

  const after = await summarizeLive("After reconciliation");
  if (after.totalMilestones !== seedMilestoneCount) {
    console.warn(`  warning: live milestone count ${after.totalMilestones} does not equal seed count ${seedMilestoneCount}`);
  }
  if (after.exactDuplicateRows !== 0) {
    console.warn(`  warning: live database still has ${after.exactDuplicateRows} exact duplicate milestone rows`);
  }
}

withServerTask({ task: "portfolio_milestones", operation: "reconcile_milestones" }, main)
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
