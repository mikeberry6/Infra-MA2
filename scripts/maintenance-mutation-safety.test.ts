import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("legacy maintenance mutation safety", () => {
  const source = readFileSync(
    path.join(process.cwd(), "scripts", "reconcile-portfolio-milestones.ts"),
    "utf8",
  );

  it("guards apply mode before constructing a database client", () => {
    const guard = source.indexOf("assertMaintenanceMutationContext()");
    const adapter = source.indexOf("new PrismaPg(");

    expect(guard).toBeGreaterThan(-1);
    expect(adapter).toBeGreaterThan(guard);
  });

  it("keeps every milestone rewrite and its completion audit atomic", () => {
    const transaction = source.indexOf("await database().$transaction(async (tx)");
    const deleteWrite = source.indexOf("tx.milestone.deleteMany", transaction);
    const insertWrite = source.indexOf("tx.milestone.createMany", transaction);
    const completionAudit = source.indexOf(
      'action: "MILESTONE_RECONCILIATION_COMPLETED"',
      transaction,
    );
    const transactionEnd = source.indexOf(
      '}, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });',
      transaction,
    );

    expect(transaction).toBeGreaterThan(-1);
    expect(deleteWrite).toBeGreaterThan(transaction);
    expect(insertWrite).toBeGreaterThan(deleteWrite);
    expect(completionAudit).toBeGreaterThan(insertWrite);
    expect(transactionEnd).toBeGreaterThan(completionAudit);
    expect(source).not.toContain("prisma.milestone.deleteMany");
    expect(source).not.toContain("prisma.milestone.createMany");
  });
});

describe("reviewed remediation mutation safety", () => {
  for (const fileName of [
    "apply-primary-citation-remediation.ts",
    "apply-fund-primary-source-remediation.ts",
    "apply-ownership-fund-link-remediation.ts",
    "apply-deal-seller-disclosure-remediation.ts",
    "merge-duplicate-companies.ts",
  ]) {
    it(`${fileName} binds maintenance and approval context before constructing Prisma`, () => {
      const source = readFileSync(path.join(process.cwd(), "scripts", fileName), "utf8");
      const maintenance = source.indexOf("assertMaintenanceMutationContext()");
      const reviewer = source.indexOf("assertApprovalReviewerMatchesMutationContext(");
      const client = source.indexOf("new PrismaClient(");

      expect(maintenance).toBeGreaterThan(-1);
      expect(reviewer).toBeGreaterThan(maintenance);
      expect(client).toBeGreaterThan(reviewer);
    });

    it(`${fileName} persists the complete execution context in audit metadata`, () => {
      const metadataFile = fileName === "apply-primary-citation-remediation.ts"
        ? path.join(process.cwd(), "src/modules/operations/primary-citation-remediation.ts")
        : fileName === "apply-fund-primary-source-remediation.ts"
          ? path.join(process.cwd(), "src/modules/operations/fund-primary-source-remediation.ts")
        : fileName === "apply-ownership-fund-link-remediation.ts"
          ? path.join(process.cwd(), "src/modules/operations/ownership-fund-link-remediation.ts")
        : fileName === "apply-deal-seller-disclosure-remediation.ts"
          ? path.join(process.cwd(), "src/modules/operations/deal-seller-disclosure-remediation.ts")
        : path.join(process.cwd(), "scripts", fileName);
      const source = readFileSync(metadataFile, "utf8");
      expect(source).toContain("executedBy: context.reviewedBy");
      expect(source).toContain("mutationReason: context.reason");
      expect(source).toContain("releaseSha: context.releaseSha");
      expect(source).toContain("targetDatabase: context.targetDatabase");
    });
  }

  it.each([
    [
      "apply-primary-citation-remediation.ts",
      [
        "--apply",
        "--approval-file=does-not-exist.json",
        `--expected-sha256=${"a".repeat(64)}`,
      ],
    ],
    [
      "apply-fund-primary-source-remediation.ts",
      [
        "--apply",
        "--approval-file=does-not-exist.json",
        `--expected-sha256=${"a".repeat(64)}`,
      ],
    ],
    [
      "apply-ownership-fund-link-remediation.ts",
      [
        "--apply",
        "--approval-file=does-not-exist.json",
        `--expected-sha256=${"a".repeat(64)}`,
      ],
    ],
    [
      "apply-deal-seller-disclosure-remediation.ts",
      [
        "--apply",
        "--approval-file=does-not-exist.json",
        `--expected-sha256=${"a".repeat(64)}`,
      ],
    ],
    [
      "merge-duplicate-companies.ts",
      [
        "--apply",
        "--approval-file=does-not-exist.json",
        `--approval-sha256=${"a".repeat(64)}`,
      ],
    ],
  ])("%s fails missing maintenance context before file or database access", (fileName, args) => {
    const result = spawnSync(
      path.join(process.cwd(), "node_modules/.bin/tsx"),
      [path.join(process.cwd(), "scripts", fileName), ...args],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          DOTENV_CONFIG_QUIET: "true",
          DATABASE_URL: "postgresql://runtime:unused@validation.invalid/infrasight_validation",
          EXPECTED_DATABASE_HOST: "validation.invalid",
          EXPECTED_DATABASE_NAME: "infrasight_validation",
          FORBIDDEN_DATABASE_HOST: "production.invalid",
          FORBIDDEN_DATABASE_HOST_2: "",
          TARGET_DATABASE: "validation",
          RELEASE_SHA: "a".repeat(40),
          MUTATION_REVIEWED_BY: "",
          MUTATION_REASON: "",
        },
      },
    );
    const output = `${result.stdout}${result.stderr}`;
    expect(result.status).toBe(1);
    expect(output).toContain("MUTATION_REVIEWED_BY and MUTATION_REASON are required");
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("does-not-exist.json");
    expect(output).not.toMatch(/ECONN|ENOTFOUND|ETIMEDOUT/i);
  });
});
