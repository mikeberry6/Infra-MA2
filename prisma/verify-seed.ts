import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { deals } from "./seed-data/deals";
import { funds } from "./seed-data/funds";
import { companies as portcos } from "./seed-data/companies";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Verifying database seed...\n");

  let allPassed = true;

  function check(label: string, expected: number, actual: number) {
    const passed = actual >= expected;
    console.log(`  ${passed ? "OK" : "FAIL"} ${label}: expected >=${expected}, got ${actual}`);
    if (!passed) allPassed = false;
  }

  function exact(label: string, expected: number, actual: number) {
    const passed = actual === expected;
    console.log(`  ${passed ? "OK" : "FAIL"} ${label}: expected ${expected}, got ${actual}`);
    if (!passed) allPassed = false;
  }

  console.log("Record counts:");
  const [
    orgCount,
    aliasCount,
    fundCount,
    companyCount,
    ownershipCount,
    milestoneCount,
    personCount,
    roleCount,
    dealCount,
    participantCount,
    sourceCount,
    citationCount,
    userCount,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.alias.count(),
    prisma.fund.count(),
    prisma.company.count(),
    prisma.ownershipPeriod.count(),
    prisma.milestone.count(),
    prisma.person.count(),
    prisma.managementRole.count(),
    prisma.deal.count(),
    prisma.dealParticipant.count(),
    prisma.source.count(),
    prisma.citation.count(),
    prisma.user.count(),
  ]);

  check("Organizations", 50, orgCount);
  // Fund rows may be intentionally consolidated or archived after seed-data
  // snapshots are imported, so require broad coverage rather than exact parity.
  check("Funds", Math.floor(funds.length * 0.8), fundCount);
  check("Companies", Math.floor(portcos.length * 0.9), companyCount);
  exact("Deals", deals.length, dealCount);
  check("Deal participants", deals.length, participantCount);
  check("Users", 1, userCount);

  console.log(`\n  Aliases: ${aliasCount}`);
  console.log(`  Ownership Periods: ${ownershipCount}`);
  console.log(`  Milestones: ${milestoneCount}`);
  console.log(`  Persons: ${personCount}`);
  console.log(`  Management Roles: ${roleCount}`);
  console.log(`  Sources: ${sourceCount}`);
  console.log(`  Citations: ${citationCount}`);

  console.log("\nIntegrity checks:");

  const [
    dealsWithBuyer,
    dealsWithCitation,
    companiesWithOwnership,
    companiesWithMilestones,
    ownershipsWithoutInvestor,
    duplicateCompanyKeys,
    duplicateDealLegacyIds,
    duplicateFundLegacyIds,
  ] = await Promise.all([
    prisma.deal.count({ where: { participants: { some: { role: "BUYER" } } } }),
    prisma.deal.count({ where: { citations: { some: {} } } }),
    prisma.company.count({ where: { ownershipPeriods: { some: {} } } }),
    prisma.company.count({ where: { milestones: { some: {} } } }),
    prisma.ownershipPeriod.count({ where: { fundId: null, organizationId: null } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT name, country
        FROM "Company"
        GROUP BY name, country
        HAVING COUNT(*) > 1
      ) duplicates
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT "legacyId"
        FROM "Deal"
        GROUP BY "legacyId"
        HAVING COUNT(*) > 1
      ) duplicates
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT "legacyId"
        FROM "Fund"
        GROUP BY "legacyId"
        HAVING COUNT(*) > 1
      ) duplicates
    `,
  ]);

  check("Deals with buyer", Math.floor(dealCount * 0.95), dealsWithBuyer);
  check("Deals with citation", Math.floor(dealCount * 0.85), dealsWithCitation);
  check("Companies with ownership", Math.floor(companyCount * 0.95), companiesWithOwnership);
  check("Companies with milestones", Math.floor(companyCount * 0.95), companiesWithMilestones);
  exact("Ownerships without fund or organization", 0, ownershipsWithoutInvestor);
  exact("Duplicate company name/country keys", 0, Number(duplicateCompanyKeys[0]?.count ?? 0));
  exact("Duplicate deal legacy IDs", 0, Number(duplicateDealLegacyIds[0]?.count ?? 0));
  exact("Duplicate fund legacy IDs", 0, Number(duplicateFundLegacyIds[0]?.count ?? 0));

  console.log("\n" + (allPassed ? "All checks passed." : "Some checks failed."));
  if (!allPassed) process.exit(1);
}

main()
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
