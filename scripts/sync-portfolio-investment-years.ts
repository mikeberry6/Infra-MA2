import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { companies } from "../prisma/seed-data/companies";
import type { PortCo, PortCoOwner } from "../prisma/seed-data/portco-types";
import { resolveOrgName } from "../prisma/entity-resolution";
import { assertMaintenanceMutationContext } from "../src/lib/database-target";
import { ACTIVE_COMPANY_WHERE } from "../src/modules/companies/retirement";

type DesiredOwnership = {
  companyName: string;
  country: string;
  firm: string;
  canonicalFirm: string;
  vehicle: string;
  investmentYear: number | null;
};

type PlannedUpdate = DesiredOwnership & {
  ownershipPeriodId: string;
  currentInvestmentYear: number | null;
};

const apply = process.argv.includes("--apply");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const mutationContext = apply ? assertMaintenanceMutationContext() : undefined;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function ownersFor(company: PortCo): PortCoOwner[] {
  if (company.owners?.length) return company.owners;
  return [
    {
      investmentFirm: company.investmentFirm,
      ownershipVehicle: company.ownershipVehicle,
      investmentYear: company.investmentYear,
      status: company.status,
    },
  ];
}

function companyKey(name: string, country: string): string {
  return `${name}||${country}`;
}

function buildDesiredOwnerships() {
  const desired = new Map<string, Map<string, DesiredOwnership>>();
  const duplicates: DesiredOwnership[] = [];
  const conflicts: Array<{ existing: DesiredOwnership; duplicate: DesiredOwnership }> = [];

  for (const company of companies) {
    const key = companyKey(company.name, company.country);
    let ownersByFirm = desired.get(key);
    if (!ownersByFirm) {
      ownersByFirm = new Map();
      desired.set(key, ownersByFirm);
    }

    for (const owner of ownersFor(company)) {
      const canonicalFirm = resolveOrgName(owner.investmentFirm);
      const row: DesiredOwnership = {
        companyName: company.name,
        country: company.country,
        firm: owner.investmentFirm,
        canonicalFirm,
        vehicle: owner.ownershipVehicle,
        investmentYear: owner.investmentYear ?? null,
      };

      const existing = ownersByFirm.get(canonicalFirm);
      if (existing) {
        duplicates.push(row);
        if (existing.investmentYear !== row.investmentYear) {
          conflicts.push({ existing, duplicate: row });
        }
        continue;
      }

      ownersByFirm.set(canonicalFirm, row);
    }
  }

  return { desired, duplicates, conflicts };
}

async function main() {
  const { desired, duplicates, conflicts } = buildDesiredOwnerships();

  if (conflicts.length) {
    console.error("Conflicting desired investment years for the same company/firm:");
    for (const conflict of conflicts.slice(0, 25)) {
      console.error(
        `- ${conflict.existing.companyName} / ${conflict.existing.canonicalFirm}: ` +
          `${conflict.existing.investmentYear ?? "N/A"} vs ${conflict.duplicate.investmentYear ?? "N/A"}`,
      );
    }
    if (conflicts.length > 25) console.error(`...and ${conflicts.length - 25} more`);
    process.exit(1);
  }

  const dbCompanies = await prisma.company.findMany({
    where: ACTIVE_COMPANY_WHERE,
    select: {
      id: true,
      name: true,
      country: true,
      ownershipPeriods: {
        select: {
          id: true,
          investmentYear: true,
          vehicleName: true,
          organization: { select: { name: true } },
        },
      },
    },
  });

  const dbCompanyByKey = new Map(dbCompanies.map((company) => [companyKey(company.name, company.country), company]));
  const planned: PlannedUpdate[] = [];
  const missingCompanies: DesiredOwnership[] = [];
  const missingOwnerships: DesiredOwnership[] = [];

  for (const [key, ownersByFirm] of desired) {
    const dbCompany = dbCompanyByKey.get(key);
    for (const desiredOwner of ownersByFirm.values()) {
      if (!dbCompany) {
        missingCompanies.push(desiredOwner);
        continue;
      }

      const ownership = dbCompany.ownershipPeriods.find((period) => {
        const orgName = period.organization?.name;
        return orgName ? resolveOrgName(orgName) === desiredOwner.canonicalFirm : false;
      });

      if (!ownership) {
        missingOwnerships.push(desiredOwner);
        continue;
      }

      const currentInvestmentYear = ownership.investmentYear ?? null;
      if (currentInvestmentYear !== desiredOwner.investmentYear) {
        planned.push({
          ...desiredOwner,
          ownershipPeriodId: ownership.id,
          currentInvestmentYear,
        });
      }
    }
  }

  console.log("Portfolio investment-year DB sync");
  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Seed company/firm rows: ${Array.from(desired.values()).reduce((sum, map) => sum + map.size, 0)}`);
  console.log(`Duplicate same-company/same-firm seed rows ignored: ${duplicates.length}`);
  console.log(`Missing DB companies: ${missingCompanies.length}`);
  console.log(`Missing DB ownership periods: ${missingOwnerships.length}`);
  console.log(`Ownership periods needing investment-year update: ${planned.length}`);

  for (const update of planned.slice(0, 40)) {
    console.log(
      `- ${update.companyName} / ${update.firm}: ${update.currentInvestmentYear ?? "N/A"} -> ` +
        `${update.investmentYear ?? "N/A"}`,
    );
  }
  if (planned.length > 40) console.log(`...and ${planned.length - 40} more updates`);

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const update of planned) {
      await tx.ownershipPeriod.update({
        where: { id: update.ownershipPeriodId },
        data: { investmentYear: update.investmentYear },
      });
    }
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "OwnershipPeriod",
        action: "INVESTMENT_YEAR_RECONCILIATION",
        changes: {
          updatedCount: planned.length,
          ownershipPeriodIds: planned.map((update) => update.ownershipPeriodId),
        },
        metadata: {
          source: "scripts/sync-portfolio-investment-years.ts",
          ...mutationContext!,
        },
      },
    });
  }, { maxWait: 10_000, timeout: 120_000 });

  console.log(`Applied ${planned.length} investment-year updates.`);
}

main()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
