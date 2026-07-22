import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import {
  coveragePercentage,
  fundHasSource,
  PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
  PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
  PUBLISHED_FUND_SOURCE_REVIEW_WHERE,
  sourceCoverageIsComplete,
} from "../src/modules/operations/source-coverage.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
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
        where: PUBLISHED_FUND_SOURCE_REVIEW_WHERE,
        select: { legacyId: true, fundName: true, sourceUrls: true, strategyUrl: true },
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
    const fundsMissingSource = publishedFundSourceRows
      .filter((fund) => !fundHasSource(fund))
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
          withSource: publishedFunds - fundsMissingSource.length,
          coveragePercent: coveragePercentage(publishedFunds - fundsMissingSource.length, publishedFunds),
          missing: fundsMissingSource,
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
      methodology: "Deals and companies require an explicit primary citation. Funds require at least one source URL or a strategy URL.",
    };

    const outputPath = option("output") ?? path.join("tmp", "source-coverage.json");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

    console.log(
      `Published source coverage: deals ${report.publicationCoverage.deals.coveragePercent}%, funds ${report.publicationCoverage.funds.coveragePercent}%, companies ${report.publicationCoverage.companies.coveragePercent}%.`,
    );
    console.log(
      `Unverified published records: deals ${dealsMissingVerification}, funds ${fundsMissingVerification}, companies ${companiesMissingVerification}.`,
    );

    if (
      requireComplete
      && !sourceCoverageIsComplete({
        dealsMissingPrimary: dealsMissingCitation.length,
        fundsMissingSource: fundsMissingSource.length,
        companiesMissingPrimary: companiesMissingCitation.length,
      })
    ) {
      throw new Error("Published source coverage is incomplete; review the generated report.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
