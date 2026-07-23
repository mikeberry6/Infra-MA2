/**
 * Applies an explicitly reviewed, committed, hash-bound deal seller-
 * disclosure approval. No invocation can write without --apply, the canonical
 * repository path, exact lowercase SHA-256, and maintenance mutation guards.
 *
 * Usage:
 *   npm run db:seller-disclosures:apply -- --apply \
 *     --approval-file=audits/approvals/deal-seller-disclosures.json \
 *     --expected-sha256=<lowercase-sha256>
 */
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { reportSafeScriptError } from "../src/lib/safe-error";
import {
  assertApprovalReviewerMatchesMutationContext,
  assertMaintenanceMutationContext,
  type MaintenanceMutationContext,
} from "../src/lib/database-target";
import {
  applyReviewedDealSellerDisclosureApproval,
  DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
  parseReviewedDealSellerDisclosureApproval,
  verifyExactDealSellerDisclosureSha256,
} from "../src/modules/operations/deal-seller-disclosure-remediation";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function loadCommittedApproval(input: {
  approvalFile: string;
  expectedSha256: string;
  context: MaintenanceMutationContext;
}): Promise<{ raw: Buffer; value: unknown; repositoryRoot: string }> {
  if (!/^[a-f0-9]{64}$/.test(input.expectedSha256)) {
    throw new Error("--expected-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  let repositoryRoot: string;
  try {
    repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    throw new Error("Deal seller-disclosure remediation must run from a Git worktree");
  }
  const expectedPath = path.join(
    repositoryRoot,
    DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
  );
  const approvalPath = path.resolve(process.cwd(), input.approvalFile);
  if (approvalPath !== expectedPath) {
    throw new Error(`Approval file must be ${DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH}`);
  }
  if ((await lstat(approvalPath)).isSymbolicLink()) {
    throw new Error("Approval file cannot be a symbolic link");
  }
  const raw = await readFile(approvalPath);
  verifyExactDealSellerDisclosureSha256(raw, input.expectedSha256);

  let committed: Buffer;
  try {
    committed = execFileSync(
      "git",
      ["show", `${input.context.releaseSha}:${DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH}`],
      {
        cwd: repositoryRoot,
        encoding: "buffer",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
  } catch {
    throw new Error("Approval file is not committed at RELEASE_SHA");
  }
  if (!raw.equals(committed)) {
    throw new Error("Approval file bytes differ from the committed RELEASE_SHA version");
  }
  let value: unknown;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new Error("Approval file is not valid JSON");
  }
  return { raw, value, repositoryRoot };
}

async function main() {
  if (!process.argv.slice(2).includes("--apply")) {
    throw new Error("Refusing to write without the explicit --apply flag");
  }
  const approvalFile = option("approval-file");
  if (!approvalFile) {
    throw new Error(
      `--apply requires --approval-file=${DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH}`,
    );
  }
  const expectedSha256 = option("expected-sha256");
  if (!expectedSha256) {
    throw new Error("--apply requires --expected-sha256=<exact lowercase SHA-256>");
  }

  // Fail closed on target, release, reviewer, and reason before file or DB access.
  const context = assertMaintenanceMutationContext();
  const committed = await loadCommittedApproval({ approvalFile, expectedSha256, context });
  const approval = parseReviewedDealSellerDisclosureApproval(committed.value);
  assertApprovalReviewerMatchesMutationContext(approval.reviewedBy, context);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for deal seller-disclosure remediation");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const result = await prisma.$transaction(
      (tx) => applyReviewedDealSellerDisclosureApproval(
        tx,
        approval,
        expectedSha256,
        context,
      ),
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 60_000 },
    );
    console.log(JSON.stringify({
      applied: result.updated > 0,
      idempotent: result.updated === 0,
      approvalFile: path.join(
        committed.repositoryRoot,
        DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
      ),
      approvalSha256: expectedSha256,
      reviewedBy: approval.reviewedBy,
      reviewedAt: approval.reviewedAt,
      executedBy: context.reviewedBy,
      mutationReason: context.reason,
      releaseSha: context.releaseSha,
      targetDatabase: context.targetDatabase,
      ...result,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  reportSafeScriptError("deal_seller_disclosure_remediation", error);
  process.exitCode = 1;
});
