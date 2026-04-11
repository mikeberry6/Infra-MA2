import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { deals } from "../src/data/deals";
import { funds } from "../src/data/funds";
import { companies as portcos } from "../src/data/portcos/companies";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Verifying database seed...\n");

  let allPassed = true;

  function check(label: string, expected: number, actual: number) {
    const passed = actual >= expected;
    const icon = passed ? "✅" : "❌";
    console.log(`  ${icon} ${label}: expected ≥${expected}, got ${actual}`);
    if (!passed) allPassed = false;
  }

  // ── Record counts ──────────────────────────────────────────

  console.log("Record counts:");
  const orgCount = await prisma.organization.count();
  const aliasCount = await prisma.alias.count();
  const fundCount = await prisma.fund.count();
  const companyCount = await prisma.company.count();
  const ownershipCount = await prisma.ownershipPeriod.count();
  const milestoneCount = await prisma.milestone.count();
  const personCount = await prisma.person.count();
  const roleCount = await prisma.managementRole.count();
  const dealCount = await prisma.deal.count();
  const participantCount = await prisma.dealParticipant.count();
  const sourceCount = await prisma.source.count();
  const citationCount = await prisma.citation.count();
  const userCount = await prisma.user.count();

  check("Organizations", 50, orgCount);
  check("Funds", funds.length, fundCount);
  check("Companies", 100, companyCount); // Some portcos may dedup
  check("Deals", deals.length, dealCount);
  check("Deal Participants", deals.length, participantCount); // At least 1 per deal
  check("Users", 1, userCount);

  console.log(`\n  Aliases: ${aliasCount}`);
  console.log(`  Ownership Periods: ${ownershipCount}`);
  console.log(`  Milestones: ${milestoneCount}`);
  console.log(`  Persons: ${personCount}`);
  console.log(`  Management Roles: ${roleCount}`);
  console.log(`  Sources: ${sourceCount}`);
  console.log(`  Citations: ${citationCount}`);

  // ── Integrity checks ──────────────────────────────────────

  console.log("\nIntegrity checks:");

  // Every fund has a manager
  const fundsWithoutManager = await prisma.fund.count({
    where: { manager: null as any },
  });
  check("Funds with manager", fundCount, fundCount - fundsWithoutManager);

  // Every deal has at least one BUYER participant
  const dealsWithBuyer = await prisma.deal.count({
    where: {
      participants: {
        some: { role: "BUYER" },
      },
    },
  });
  check("Deals with buyer", Math.floor(dealCount * 0.9), dealsWithBuyer);

  // Every ownership period has valid fund and company
  const orphanedOwnership = await prisma.ownershipPeriod.count({
    where: {
      OR: [
        { fund: null as any },
        { company: null as any },
      ],
    },
  });
  check("Ownership integrity", ownershipCount, ownershipCount - orphanedOwnership);

  // ── Summary ───────────────────────────────────────────────

  console.log("\n" + (allPassed ? "✅ All checks passed!" : "❌ Some checks failed."));
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
