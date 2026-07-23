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
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
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
  const run = async () => {
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
  };
  await runWithPreservedCleanup({
    run,
    cleanup: () => prisma.$disconnect(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "fund_primary_source_report",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask(
  { task: "fund_primary_source_report", operation: "report_fund_primary_sources" },
  main,
).catch(() => {
  process.exitCode = 1;
});
