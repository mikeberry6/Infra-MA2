/**
 * Applies an explicitly reviewed, committed, hash-bound Fund primary-source
 * approval. No invocation can write without --apply, the canonical repository
 * path, exact lowercase SHA-256, and complete maintenance mutation guards.
 *
 * Usage:
 *   npm run db:fund-primary-sources:apply -- --apply \
 *     --approval-file=audits/approvals/fund-primary-sources.json \
 *     --expected-sha256=<lowercase-sha256>
 */
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  assertApprovalReviewerMatchesMutationContext,
  assertMaintenanceMutationContext,
  type MaintenanceMutationContext,
} from "../src/lib/database-target";
import { withSafeTask } from "../src/lib/safe-task";
import {
  applyReviewedFundPrimarySourceApproval,
  FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
  parseReviewedFundPrimarySourceApproval,
  verifyExactFundPrimarySourceSha256,
} from "../src/modules/operations/fund-primary-source-remediation";

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

async function loadCommittedApproval(input: {
  approvalFile: string;
  expectedSha256: string;
  context: MaintenanceMutationContext;
}): Promise<{ value: unknown; repositoryRoot: string }> {
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
    throw new Error("Fund primary-source remediation must run from a Git worktree");
  }
  const expectedPath = path.join(
    repositoryRoot,
    FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
  );
  const approvalPath = path.resolve(process.cwd(), input.approvalFile);
  if (approvalPath !== expectedPath) {
    throw new Error(`Approval file must be ${FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH}`);
  }
  if ((await lstat(approvalPath)).isSymbolicLink()) {
    throw new Error("Approval file cannot be a symbolic link");
  }
  const raw = await readFile(approvalPath);
  verifyExactFundPrimarySourceSha256(raw, input.expectedSha256);

  let committed: Buffer;
  try {
    committed = execFileSync(
      "git",
      ["show", `${input.context.releaseSha}:${FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH}`],
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
  return { value, repositoryRoot };
}

async function main() {
  if (!process.argv.slice(2).includes("--apply")) {
    throw new Error("Refusing to write without the explicit --apply flag");
  }
  const approvalFile = option("approval-file");
  if (!approvalFile) {
    throw new Error(
      `--apply requires --approval-file=${FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH}`,
    );
  }
  const expectedSha256 = option("expected-sha256");
  if (!expectedSha256) {
    throw new Error("--apply requires --expected-sha256=<exact lowercase SHA-256>");
  }

  // Fail closed on database target, release, reviewer, and reason before file
  // or database access.
  const context = assertMaintenanceMutationContext();
  const committed = await loadCommittedApproval({
    approvalFile,
    expectedSha256,
    context,
  });
  const approval = parseReviewedFundPrimarySourceApproval(committed.value);
  assertApprovalReviewerMatchesMutationContext(approval.reviewedBy, context);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for fund primary-source remediation");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const result = await prisma.$transaction(
      (tx) => applyReviewedFundPrimarySourceApproval(
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
        FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
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

withSafeTask(
  { task: "fund_primary_source_remediation", operation: "apply_fund_primary_sources" },
  main,
).catch(() => {
  process.exitCode = 1;
});
