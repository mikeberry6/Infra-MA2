import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { SafeOperationalError } from "../src/lib/safe-error.ts";
import { withSafeTask } from "../src/lib/safe-task";
import {
  coveragePercentage,
  fundHasPrimarySource,
  PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
  PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
  PUBLISHED_FUND_PRIMARY_SOURCE_REVIEW_WHERE,
  sourceCoverageIsComplete,
} from "../src/modules/operations/source-coverage.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new SafeOperationalError("database_url_required");
  const requireComplete = process.argv.includes("--require-complete");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const [
      publishedDeals,
      dealsMissingCitation,
      publishedFunds,
      publishedFundSourceRows,
      publishedCompanies,
      companiesMissingCitation,
      dealsMissingVerification,
      fundsMissingVerification,
      companiesMissingVerification,
    ] = await Promise.all([
      prisma.deal.count({ where: { status: "PUBLISHED" } }),
      prisma.deal.findMany({
        where: PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
        select: { legacyId: true, target: true },
        orderBy: { legacyId: "asc" },
      }),
      prisma.fund.count({ where: { status: "PUBLISHED" } }),
      prisma.fund.findMany({
        where: PUBLISHED_FUND_PRIMARY_SOURCE_REVIEW_WHERE,
        select: { legacyId: true, fundName: true, primarySourceUrl: true },
        orderBy: { legacyId: "asc" },
      }),
      prisma.company.count({ where: { status: "PUBLISHED" } }),
      prisma.company.findMany({
        where: PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
        select: { id: true, name: true, country: true },
        orderBy: [{ name: "asc" }, { country: "asc" }],
      }),
      prisma.deal.count({ where: { status: "PUBLISHED", lastVerifiedAt: null } }),
      prisma.fund.count({ where: { status: "PUBLISHED", lastVerifiedAt: null } }),
      prisma.company.count({ where: { status: "PUBLISHED", lastVerifiedAt: null } }),
    ]);
    const fundsMissingPrimary = publishedFundSourceRows
      .filter((fund) => !fundHasPrimarySource(fund))
      .map(({ legacyId, fundName }) => ({ legacyId, fundName }));

    const report = {
      generatedAt: new Date().toISOString(),
      publicationCoverage: {
        deals: {
          published: publishedDeals,
          withPrimaryCitation: publishedDeals - dealsMissingCitation.length,
          coveragePercent: coveragePercentage(publishedDeals - dealsMissingCitation.length, publishedDeals),
          missing: dealsMissingCitation,
        },
        funds: {
          published: publishedFunds,
          withPrimarySource: publishedFunds - fundsMissingPrimary.length,
          coveragePercent: coveragePercentage(publishedFunds - fundsMissingPrimary.length, publishedFunds),
          missing: fundsMissingPrimary,
        },
        companies: {
          published: publishedCompanies,
          withPrimaryCitation: publishedCompanies - companiesMissingCitation.length,
          coveragePercent: coveragePercentage(publishedCompanies - companiesMissingCitation.length, publishedCompanies),
          missing: companiesMissingCitation,
        },
      },
      verificationBacklog: {
        deals: dealsMissingVerification,
        funds: fundsMissingVerification,
        companies: companiesMissingVerification,
      },
      methodology: "Deals and companies require an explicit primary citation. Funds require an explicitly reviewed primarySourceUrl; supporting sourceUrls and strategyUrl do not satisfy this gate.",
    };

    const outputPath = option("output") ?? path.join("tmp", "source-coverage.json");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

    console.log("Source coverage verification completed; review the configured output artifact.");
    if (
      requireComplete
      && !sourceCoverageIsComplete({
        dealsMissingPrimary: dealsMissingCitation.length,
        fundsMissingPrimary: fundsMissingPrimary.length,
        companiesMissingPrimary: companiesMissingCitation.length,
      })
    ) {
      throw new Error("Published source coverage is incomplete; review the generated report.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

withSafeTask({
  task: "source_coverage",
  operation: "verify_source_coverage",
}, main).catch(() => {
  process.exitCode = 1;
});
