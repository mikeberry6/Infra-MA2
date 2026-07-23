/**
 * Read-only report for published funds without an explicitly reviewed primary
 * source. Candidate HTTP(S) URLs are drawn from supporting sourceUrls and
 * strategyUrl, sorted lexically, and never selected by this script.
 *
 * Output is confined to a new ignored tmp/*.json path.
 *
 * Usage:
 *   npm run db:fund-primary-sources:report
 *   npm run db:fund-primary-sources:report -- --output=tmp/fund-primary-source-approval-template.json
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { prepareReviewerNeutralJsonOutput } from "../src/lib/reviewer-neutral-output";
import { reportSafeScriptError } from "../src/lib/safe-error";
import {
  buildFundPrimarySourceApprovalTemplate,
  fundPrimarySourceSha256,
  loadFundPrimarySourceReportInput,
} from "../src/modules/operations/fund-primary-source-remediation";

const DEFAULT_OUTPUT = "tmp/fund-primary-source-approval-template.json";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for the read-only fund primary-source report");
  }
  const destination = await prepareReviewerNeutralJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const input = await loadFundPrimarySourceReportInput(prisma);
    const template = buildFundPrimarySourceApprovalTemplate(input);
    const json = `${JSON.stringify(template, null, 2)}\n`;
    await destination.write(json);
    console.log(JSON.stringify({
      reportWritten: true,
      output: destination.outputPath,
      publishedFundsMissingPrimarySource: template.items.length,
      fundsWithoutSelectableHttpCandidates: template.items.filter(
        (item) => item.candidates.length === 0,
      ).length,
      templateSha256: fundPrimarySourceSha256(json),
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  reportSafeScriptError("fund_primary_source_report", error);
  process.exitCode = 1;
});
