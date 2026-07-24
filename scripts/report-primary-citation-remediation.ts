/**
 * Read-only report for explicit primary-citation remediation.
 *
 * The generated JSON is deliberately reviewer-neutral: every candidate is
 * listed in opaque citation-ID order and every selectedCitationId is null.
 * This script never mutates data and never recommends or infers a selection.
 *
 * Usage:
 *   npm run db:citations:report
 *   npm run db:citations:report -- --output=tmp/primary-citation-approval-template.json
 */
import "dotenv/config";
import { prepareReviewerNeutralJsonOutput } from "../src/lib/reviewer-neutral-output";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  buildPrimaryCitationApprovalTemplate,
  loadPrimaryCitationReportInput,
  sha256Hex,
} from "../src/modules/operations/primary-citation-remediation";

const DEFAULT_OUTPUT = "tmp/primary-citation-approval-template.json";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for the read-only citation report");

  const destination = await prepareReviewerNeutralJsonOutput({
    repositoryRoot: process.cwd(),
    output: option("output") ?? DEFAULT_OUTPUT,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const run = async () => {
    const input = await loadPrimaryCitationReportInput(prisma);
    const template = buildPrimaryCitationApprovalTemplate(input);
    const json = `${JSON.stringify(template, null, 2)}\n`;
    await destination.write(json);
    console.log(JSON.stringify({
      reportWritten: true,
      output: destination.outputPath,
      publishedRecordsMissingPrimaryCitation: template.items.length,
      recordsWithoutSelectableCandidates: template.items.filter(
        (item) => item.candidates.length === 0,
      ).length,
      templateSha256: sha256Hex(json),
    }, null, 2));
  };
  await runWithPreservedCleanup({
    run,
    cleanup: () => prisma.$disconnect(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "citation_report",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask({ task: "citation_report", operation: "report_primary_citations" }, main).catch(() => {
  process.exitCode = 1;
});
