/**
 * Applies an explicitly reviewed, hash-bound primary-citation approval file.
 * No dry-run invocation can write; --apply, --approval-file, and the exact
 * SHA-256 of the reviewed file bytes are all mandatory.
 *
 * Usage:
 *   npm run db:citations:apply -- --apply \
 *     --approval-file=audits/primary-citation-approval.json \
 *     --expected-sha256=<lowercase-sha256>
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { logServerFailure, withServerTask } from "../src/lib/server-log";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  assertApprovalReviewerMatchesMutationContext,
  assertMaintenanceMutationContext,
} from "../src/lib/database-target";
import {
  applyReviewedPrimaryCitationApproval,
  parseReviewedPrimaryCitationApprovalBytes,
  verifyExactSha256,
} from "../src/modules/operations/primary-citation-remediation";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function main() {
  if (!process.argv.slice(2).includes("--apply")) {
    throw new Error("Refusing to write without the explicit --apply flag");
  }
  const approvalFile = option("approval-file");
  if (!approvalFile) throw new Error("--apply requires --approval-file=<reviewed JSON file>");
  const expectedSha256 = option("expected-sha256");
  if (!expectedSha256) throw new Error("--apply requires --expected-sha256=<exact lowercase SHA-256>");
  const context = assertMaintenanceMutationContext();

  const approvalPath = path.resolve(approvalFile);
  const raw = await readFile(approvalPath);
  const approvalSha256 = verifyExactSha256(raw, expectedSha256);
  const approval = parseReviewedPrimaryCitationApprovalBytes(raw);
  assertApprovalReviewerMatchesMutationContext(approval.reviewedBy, context);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for citation remediation");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const run = async () => {
    const result = await prisma.$transaction(
      (tx) => applyReviewedPrimaryCitationApproval(tx, approval, approvalSha256, context),
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 60_000 },
    );
    console.log(JSON.stringify({
      applied: result.updated > 0,
      idempotent: result.updated === 0,
      approvalFile: approvalPath,
      approvalSha256,
      reviewedBy: approval.reviewedBy,
      reviewedAt: approval.reviewedAt,
      executedBy: context.reviewedBy,
      mutationReason: context.reason,
      releaseSha: context.releaseSha,
      targetDatabase: context.targetDatabase,
      ...result,
    }, null, 2));
  };
  await runWithPreservedCleanup({
    run,
    cleanup: () => prisma.$disconnect(),
    onSuppressedCleanupError: (error) => logServerFailure({
      task: "citation_remediation",
      operation: "disconnect_database",
    }, error),
  });
}

withServerTask({ task: "citation_remediation", operation: "apply_primary_citations" }, main).catch(() => {
  process.exitCode = 1;
});
