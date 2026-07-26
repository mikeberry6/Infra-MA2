/**
 * Read-only report for published deals that lack reviewed seller treatment.
 *
 * The generated JSON is reviewer-neutral: decisionStatus and decisionReason
 * are always null, and participant/source evidence is ordered only by opaque
 * record ID. Output is confined to ignored tmp/ JSON files and never
 * overwrites an existing path.
 *
 * Usage:
 *   npm run db:seller-disclosures:report
 *   npm run db:seller-disclosures:report -- --output=tmp/deal-seller-disclosure-approval-template.json
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { prepareReviewerNeutralJsonOutput } from "../src/lib/reviewer-neutral-output";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import {
  buildDealSellerDisclosureApprovalTemplate,
  dealSellerDisclosureSha256,
  loadDealSellerDisclosureReportInput,
} from "../src/modules/operations/deal-seller-disclosure-remediation";

const DEFAULT_OUTPUT = "tmp/deal-seller-disclosure-approval-template.json";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for the read-only deal seller-disclosure report");
  }
  const destination = await prepareReviewerNeutralJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const run = async () => {
    const input = await loadDealSellerDisclosureReportInput(prisma);
    const template = buildDealSellerDisclosureApprovalTemplate(input);
    const json = `${JSON.stringify(template, null, 2)}\n`;
    await destination.write(json);
    console.log(JSON.stringify({
      reportWritten: true,
      output: destination.outputPath,
      dealsMissingReviewedSellerTreatment: template.items.length,
      templateSha256: dealSellerDisclosureSha256(json),
    }, null, 2));
  };
  await runWithPreservedCleanup({
    run,
    cleanup: () => prisma.$disconnect(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "deal_seller_disclosure_report",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask(
  { task: "deal_seller_disclosure_report", operation: "report_deal_seller_disclosures" },
  main,
).catch(() => {
  process.exitCode = 1;
});
