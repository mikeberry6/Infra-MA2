/**
 * Read-only report for OwnershipPeriod -> Fund link remediation.
 *
 * The generated JSON is reviewer-neutral: it reports only issues returned by
 * findOwnershipFundIssues, orders candidates by opaque Fund ID, and leaves
 * action and selectedFundId null. Output is restricted to the ignored tmp/
 * tree and is created without overwriting an existing file.
 *
 * Usage:
 *   npm run db:ownership-funds:report
 *   npm run db:ownership-funds:report -- --output=tmp/ownership-fund-link-approval-template.json
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { prepareReviewerNeutralJsonOutput } from "../src/lib/reviewer-neutral-output";
import { withServerTask } from "../src/lib/server-log";
import {
  buildOwnershipFundLinkApprovalTemplate,
  loadOwnershipFundLinkReportInput,
  ownershipFundLinkSha256,
} from "../src/modules/operations/ownership-fund-link-remediation";

const DEFAULT_OUTPUT = "tmp/ownership-fund-link-approval-template.json";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for the read-only ownership-fund report");

  const destination = await prepareReviewerNeutralJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const input = await loadOwnershipFundLinkReportInput(prisma);
    const template = buildOwnershipFundLinkApprovalTemplate(input);
    const json = `${JSON.stringify(template, null, 2)}\n`;
    await destination.write(json);
    const digest = ownershipFundLinkSha256(json);
    console.log(JSON.stringify({
      reportWritten: true,
      output: destination.outputPath,
      issues: template.items.length,
      templateSha256: digest,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

withServerTask({ task: "ownership_fund_report", operation: "report_ownership_fund_links" }, main).catch(() => {
  process.exitCode = 1;
});
