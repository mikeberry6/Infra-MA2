import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import { SafeOperationalError } from "../src/lib/safe-error";
import { deals } from "./seed-data/deals";
import { weeklyBriefingDeals } from "./seed-data/weekly-briefing-deals";
import { funds } from "./seed-data/funds";
import { companies as portcos } from "./seed-data/companies";
import {
  companyPublicationIntegritySelect,
  findOwnershipFundIssues,
  missingCompanyPublicationFields,
  missingDealPublicationFields,
  missingFundPublicationFields,
} from "../src/modules/operations/publication-integrity";
import { weeklyDealIdentitiesMatch } from "../src/modules/operations/weekly-deal-identity";
import { isHttpUrl } from "../src/lib/source-utils";

const connectionString = process.env.DATABASE_URL;
const requireFreshSeedWithoutUsers = process.argv.includes("--fresh-seed");
let prismaToDisconnect: PrismaClient | null = null;

async function main() {
  if (!connectionString) throw new SafeOperationalError("database_url_missing");

  const adapter = new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true });
  const prisma = new PrismaClient({ adapter });
  prismaToDisconnect = prisma;

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
    prisma.deal.count({ where: { status: "PUBLISHED" } }),
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
  // Deal curation has moved to the Prisma-backed database. Seed-data snapshots
  // can include retired references, so verify broad coverage plus integrity.
  check("Deals", Math.floor(deals.length * 0.9), dealCount);
  check("Deal participants", dealCount, participantCount);
  // The shared verifier also runs against established validation and production
  // databases, where legitimate users can exist. Only a caller explicitly
  // verifying a freshly seeded database may require the table to remain empty.
  if (requireFreshSeedWithoutUsers) {
    exact("Users created by ordinary seed", 0, userCount);
  }

  console.log(`\n  Aliases: ${aliasCount}`);
  console.log(`  Ownership Periods: ${ownershipCount}`);
  console.log(`  Milestones: ${milestoneCount}`);
  console.log(`  Persons: ${personCount}`);
  console.log(`  Management Roles: ${roleCount}`);
  console.log(`  Sources: ${sourceCount}`);
  console.log(`  Citations: ${citationCount}`);
  if (!requireFreshSeedWithoutUsers) console.log(`  Users: ${userCount}`);

  console.log("\nIntegrity checks:");

  const [
    dealsWithBuyer,
    publishedDealsMissingCitation,
    publishedCompaniesMissingCitation,
    companiesWithOwnership,
    companiesWithMilestones,
    ownershipsWithoutInvestor,
    duplicateCompanyKeys,
    duplicateDealLegacyIds,
    duplicateFundLegacyIds,
    sourceUrlRows,
  ] = await Promise.all([
    prisma.deal.count({ where: { participants: { some: { role: "BUYER" } } } }),
    prisma.deal.findMany({
      where: { status: "PUBLISHED", citations: { none: { isPrimary: true } } },
      select: { legacyId: true, target: true },
      orderBy: { date: "desc" },
    }),
    prisma.company.findMany({
      where: { status: "PUBLISHED", citations: { none: { isPrimary: true } } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
    prisma.source.findMany({ select: { id: true, url: true }, orderBy: { id: "asc" } }),
  ]);

  const invalidSourceUrls = sourceUrlRows.filter((source) => !isHttpUrl(source.url));

  check("Deals with buyer", Math.floor(dealCount * 0.95), dealsWithBuyer);
  exact("Published deals missing a primary citation", 0, publishedDealsMissingCitation.length);
  if (publishedDealsMissingCitation.length > 0) {
    console.log(`    Missing primary citations: ${publishedDealsMissingCitation.map((deal) => `${deal.legacyId} (${deal.target})`).join(", ")}`);
  }
  exact("Published companies missing a primary citation", 0, publishedCompaniesMissingCitation.length);
  if (publishedCompaniesMissingCitation.length > 0) {
    console.log(`    Missing primary citations: ${publishedCompaniesMissingCitation.map((company) => `${company.id} (${company.name})`).join(", ")}`);
  }
  check("Companies with ownership", Math.floor(companyCount * 0.95), companiesWithOwnership);
  check("Companies with milestones", Math.floor(companyCount * 0.95), companiesWithMilestones);
  exact("Ownerships without fund or organization", 0, ownershipsWithoutInvestor);
  exact("Duplicate company name/country keys", 0, Number(duplicateCompanyKeys[0]?.count ?? 0));
  exact("Duplicate deal legacy IDs", 0, Number(duplicateDealLegacyIds[0]?.count ?? 0));
  exact("Duplicate fund legacy IDs", 0, Number(duplicateFundLegacyIds[0]?.count ?? 0));
  exact("Non-HTTP(S) source URLs", 0, invalidSourceUrls.length);
  if (invalidSourceUrls.length > 0) {
    console.log(`    Invalid source URLs: ${invalidSourceUrls.map((source) => source.id).join(", ")}`);
  }

  const [
    publishedDealIntegrityRows,
    publishedFundIntegrityRows,
    publishedCompanyIntegrityRows,
    ownershipFundRows,
    fundLookupRows,
  ] = await Promise.all([
    prisma.deal.findMany({
      where: { status: "PUBLISHED" },
      select: {
        legacyId: true,
        target: true,
        country: true,
        date: true,
        dealStatus: true,
        sellerDisclosureStatus: true,
        sellerDisclosureReason: true,
        categories: true,
        participants: { select: { role: true } },
        citations: { where: { isPrimary: true }, select: { id: true } },
      },
    }),
    prisma.fund.findMany({
      where: { status: "PUBLISHED" },
      select: {
        legacyId: true,
        fundName: true,
        managerId: true,
        strategies: true,
        fundStatus: true,
        size: true,
        primarySourceUrl: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    }),
    prisma.company.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        ...companyPublicationIntegritySelect,
      },
    }),
    prisma.ownershipPeriod.findMany({
      where: { company: { status: "PUBLISHED" } },
      select: {
        id: true,
        companyId: true,
        vehicleName: true,
        fundId: true,
        fund: { select: { id: true, fundName: true, status: true } },
      },
    }),
    prisma.fund.findMany({ select: { id: true, fundName: true, status: true } }),
  ]);

  const incompleteDeals = publishedDealIntegrityRows.flatMap((deal) => {
    const missing = missingDealPublicationFields(deal);
    return missing.length > 0 ? [{ label: `${deal.legacyId} (${deal.target})`, missing }] : [];
  });
  const incompleteFunds = publishedFundIntegrityRows.flatMap((fund) => {
    const missing = missingFundPublicationFields(fund);
    return missing.length > 0 ? [{ label: `${fund.legacyId} (${fund.fundName})`, missing }] : [];
  });
  const incompleteCompanies = publishedCompanyIntegrityRows.flatMap((company) => {
    const missing = missingCompanyPublicationFields(company);
    return missing.length > 0 ? [{ label: `${company.id} (${company.name})`, missing }] : [];
  });
  const ownershipFundIssues = findOwnershipFundIssues(ownershipFundRows, fundLookupRows);

  exact("Published deals failing the complete publication contract", 0, incompleteDeals.length);
  for (const issue of incompleteDeals.slice(0, 20)) {
    console.log(`    ${issue.label}: ${issue.missing.join(", ")}`);
  }
  exact("Published funds failing the complete publication contract", 0, incompleteFunds.length);
  for (const issue of incompleteFunds.slice(0, 20)) {
    console.log(`    ${issue.label}: ${issue.missing.join(", ")}`);
  }
  exact("Published companies failing the complete publication contract", 0, incompleteCompanies.length);
  for (const issue of incompleteCompanies.slice(0, 20)) {
    console.log(`    ${issue.label}: ${issue.missing.join(", ")}`);
  }
  exact("Ownership-to-fund linkage issues", 0, ownershipFundIssues.length);
  for (const issue of ownershipFundIssues.slice(0, 20)) {
    console.log(`    ${issue.ownershipId} (${issue.companyId}) ${issue.code}: ${issue.message}`);
  }

  const publishedDeals = await prisma.deal.findMany({
    where: { status: "PUBLISHED" },
    select: {
      legacyId: true,
      target: true,
      date: true,
      citations: { select: { source: { select: { url: true } } } },
    },
  });
  const missingWeeklyDeals = weeklyBriefingDeals.filter((weeklyDeal) =>
    !publishedDeals.some((deal) =>
      weeklyDealIdentitiesMatch(weeklyDeal, {
        target: deal.target,
        date: deal.date,
        sourceUrls: deal.citations.map((citation) => citation.source.url),
      }),
    ),
  );
  exact("Missing published weekly briefing deals", 0, missingWeeklyDeals.length);
  if (missingWeeklyDeals.length > 0) {
    const missingByIssue = missingWeeklyDeals.reduce<Record<string, number>>((counts, deal) => {
      const issue = deal.id.slice(3, 13);
      counts[issue] = (counts[issue] ?? 0) + 1;
      return counts;
    }, {});
    console.log(`    Missing by issue: ${JSON.stringify(missingByIssue)}`);
  }

  console.log("\n" + (allPassed ? "All checks passed." : "Some checks failed."));
  if (!allPassed) throw new Error("Database seed validation failed.");
}

async function runTask() {
  await runWithPreservedCleanup({
    run: main,
    cleanup: async () => {
      await prismaToDisconnect?.$disconnect();
    },
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "database_verification_cleanup",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask({ task: "database_verification", operation: "verify_seed_data" }, runTask)
  .catch(() => {
    process.exitCode = 1;
  });
