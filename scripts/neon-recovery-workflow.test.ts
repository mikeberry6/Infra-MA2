import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/recovery-exercise.yml"),
  "utf8",
);
const runner = readFileSync(
  path.join(process.cwd(), "scripts/run-neon-recovery-exercise.ts"),
  "utf8",
);
const control = readFileSync(
  path.join(process.cwd(), "scripts/neon-recovery-control.ts"),
  "utf8",
);
const janitorWorkflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/recovery-janitor.yml"),
  "utf8",
);
const janitor = readFileSync(
  path.join(process.cwd(), "scripts/neon-recovery-janitor.ts"),
  "utf8",
);

describe("protected Neon PITR exercise workflow", () => {
  it("is manual, protected-main only, and independently environment gated", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("pull_request:");
    expect(workflow).not.toContain("schedule:");
    expect(workflow).toContain("environment: Recovery");
    expect(workflow).toContain('if [ "$GITHUB_REF" != "refs/heads/main" ]');
    expect(workflow).toContain('if [ "$RECOVERY_CONFIRMATION" != "EXERCISE" ]');
    expect(workflow).toContain("ref: refs/heads/main");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("--required-check=build");
    expect(workflow).toContain(
      "group: neon-migration-validation-${{ github.repository_id }}",
    );
    expect(workflow).toContain("cancel-in-progress: false");
  });

  it("requires independent recovery control-plane and source-branch identity", () => {
    for (const name of [
      "NEON_RECOVERY_API_KEY",
      "NEON_RECOVERY_PROJECT_ID",
      "NEON_PRODUCTION_PROJECT_ID",
      "NEON_VALIDATION_BRANCH_ID",
      "MIGRATION_DATABASE_URL",
      "MIGRATION_DATABASE_HOST",
      "MIGRATION_DATABASE_NAME",
      "PRODUCTION_DATABASE_HOST",
      "PRODUCTION_MIGRATION_DATABASE_HOST",
      "DASHBOARD_MIGRATION_DATABASE_HOST",
    ]) {
      expect(workflow).toContain(name);
    }
    expect(runner).toContain("assertValidationSourceBranch");
    expect(runner).toContain(
      "assertDistinctNeonProjectIds(projectId, productionProjectId)",
    );
    expect(runner).toContain("endpoints[0].host !== configuration.validationTarget.host");
    expect(runner).toContain("pg_current_wal_lsn()");
    expect(runner).toContain('"status" = \'MUTATED\'');
    expect(runner).toContain("validateRestoredDatabase");
  });

  it("never migrates, seeds, deploys, or publicly exposes the restored branch", () => {
    expect(workflow).toContain("prisma migrate status");
    expect(workflow).toContain("prisma migrate diff");
    expect(workflow).toContain("verify-migration-baseline.ts");
    expect(workflow).toContain("tmp/recovery/private/migrate-status.log");
    expect(workflow).toContain("tmp/recovery/private/schema-drift.log");
    expect(workflow).toContain("tmp/recovery/public/migration-checks.json");
    expect(workflow).toContain("npm run db:verify");
    expect(workflow).toContain("scripts/source-coverage-report.ts");
    expect(workflow).toContain("npm run db:duplicates:verify");
    expect(workflow).toContain("tmp/recovery/public/data-integrity-checks.json");
    expect(workflow).toContain("tmp/recovery/private/database-verification.log");
    expect(workflow).toContain("tmp/recovery/private/source-coverage.json");
    expect(workflow).toContain("tmp/recovery/private/company-canonical.log");
    expect(workflow).not.toContain("tmp/recovery/public/migrate-status.log");
    expect(workflow).not.toContain("tmp/recovery/public/schema-drift.log");
    expect(workflow).not.toContain("tmp/recovery/public/source-coverage.json");
    expect(workflow).not.toContain("tmp/recovery/public/database-verification.log");
    expect(workflow).not.toContain("tmp/recovery/public/company-canonical.log");
    expect(workflow).not.toContain("prisma migrate deploy");
    expect(workflow).not.toContain("prisma db seed");
    expect(workflow).not.toContain("npm run db:seed");
    expect(workflow).not.toContain("VERCEL_TOKEN");
    expect(workflow).not.toContain("vercel deploy");
    expect(workflow).not.toContain("mutate-vercel");
    expect(workflow).toContain("http://127.0.0.1:3110");
    expect(workflow).toContain("--skip-health");
    expect(workflow).toContain('.database == "connected"');
    expect(workflow).toContain("Prove public smoke did not alter restored fidelity");
    const generatedSecret = workflow.indexOf(
      'recovery_auth_secret="$(openssl rand -hex 32)"',
    );
    const exportedSecret = workflow.indexOf(
      'export NEXTAUTH_SECRET="$recovery_auth_secret"',
      generatedSecret,
    );
    const build = workflow.indexOf("npm run build", exportedSecret);
    expect(generatedSecret).toBeGreaterThanOrEqual(0);
    expect(exportedSecret).toBeGreaterThan(generatedSecret);
    expect(build).toBeGreaterThan(exportedSecret);
  });

  it("always performs guarded cleanup and uploads only scanned public evidence", () => {
    expect(workflow).toMatch(
      /name: Delete only exact branches created by this run[\s\S]*?\n\s+if: always\(\)/,
    );
    expect(control).toContain("deleteCreatedBranch");
    expect(runner).toContain("deleteReconciledBranch(state.restoredRequest)");
    expect(runner).toContain("deleteReconciledBranch(state.sourceRequest)");
    expect(control).toContain("assertCreatedBranchGuard(detail, guard)");
    expect(workflow).toContain("test ! -e tmp/recovery/private/state.json");
    expect(workflow).toContain("--secret-env=NEON_RECOVERY_API_KEY");
    expect(workflow).toContain("--secret-env=VALIDATION_DATABASE_URL");
    expect(workflow).toContain("--secret-env=VALIDATION_DATABASE_HOST");
    expect(workflow).toContain("--secret-env=DATABASE_URL");
    expect(workflow).toContain("--secret-env=EXPECTED_DATABASE_HOST");
    expect(workflow).toContain("--secret-env=RECOVERY_NEXTAUTH_SECRET");
    expect(workflow).toContain(
      "if: always() && steps.cleanup.outcome == 'success'",
    );
    expect(workflow).toContain(
      "Clear restored runtime credentials before artifact actions",
    );
    expect(workflow).toContain("DATABASE_URL=");
    expect(workflow).toContain(
      "if: always() && steps.clear_runtime_credentials.outcome == 'success'",
    );
    expect(workflow).toContain("tmp/recovery/public/");
    expect(workflow).toContain("tmp/recovery/scans/");
    expect(workflow).not.toMatch(
      /^\s+tmp\/recovery\/private\/\s*$/m,
    );
  });

  it("persists exact requests before each non-idempotent create for cancellation cleanup", () => {
    const sourceRequest = runner.indexOf("state.sourceRequest = sourceRequest;");
    const sourcePersist = runner.indexOf(
      "await persistState(statePath, state);",
      sourceRequest,
    );
    const sourceCreate = runner.indexOf(
      "client.createBranchReconciled(sourceRequest)",
      sourcePersist,
    );
    const restoreRequest = runner.indexOf("state.restoredRequest = restoreRequest;");
    const restorePersist = runner.indexOf(
      "await persistState(statePath, state);",
      restoreRequest,
    );
    const restoreCreate = runner.indexOf(
      "client.createBranchReconciled(restoreRequest)",
      restorePersist,
    );

    expect(sourceRequest).toBeGreaterThanOrEqual(0);
    expect(sourcePersist).toBeGreaterThan(sourceRequest);
    expect(sourceCreate).toBeGreaterThan(sourcePersist);
    expect(restoreRequest).toBeGreaterThan(sourceCreate);
    expect(restorePersist).toBeGreaterThan(restoreRequest);
    expect(restoreCreate).toBeGreaterThan(restorePersist);
    expect(workflow).toContain("if: always()");
  });

  it("keeps control-plane and validation credentials out of job-wide scope", () => {
    const jobEnvironment = workflow.match(
      /jobs:\n[\s\S]*?\n    env:\n([\s\S]*?)\n    steps:/,
    )?.[1] ?? "";
    expect(jobEnvironment).not.toContain("NEON_RECOVERY_API_KEY");
    expect(jobEnvironment).not.toContain("VALIDATION_DATABASE_URL");
    const installStep = workflow.match(
      /- name: Install locked dependencies and validate Prisma([\s\S]*?)(?=\n      - name:)/,
    )?.[1] ?? "";
    expect(installStep).not.toContain("NEON_RECOVERY_API_KEY");
    expect(installStep).not.toContain("MIGRATION_DATABASE_URL");
  });
});

describe("durable Neon recovery cleanup workflow", () => {
  it("runs hourly from protected main in a separate least-privilege environment", () => {
    expect(janitorWorkflow).toContain('cron: "17 * * * *"');
    expect(janitorWorkflow).toContain("workflow_dispatch:");
    expect(janitorWorkflow).toContain("environment: RecoveryCleanup");
    expect(janitorWorkflow).toContain(
      "group: neon-migration-validation-${{ github.repository_id }}",
    );
    expect(janitorWorkflow).toContain(
      'if [ "$GITHUB_REF" != "refs/heads/main" ]',
    );
    expect(janitorWorkflow).toContain("persist-credentials: false");
    expect(janitorWorkflow).toContain("NEON_PRODUCTION_PROJECT_ID");
    expect(janitor).toContain(
      "assertDistinctNeonProjectIds(recoveryProjectId, productionProjectId)",
    );
  });

  it("deletes only stale exact annotations, restored children first", () => {
    expect(janitor).toContain("STALE_AFTER_MS = 2 * 60 * 60 * 1_000");
    expect(janitor).toContain("assertCreatedBranchGuard(detail, guard)");
    expect(janitor).toContain("annotation[RECOVERY_ANNOTATION_RUN] !== runKey");
    expect(janitor).toContain(
      'candidate.guard.kind === "restored"',
    );
    const restoredLoop = janitor.indexOf("for (const candidate of staleRestored)");
    const sourceLoop = janitor.indexOf("for (const candidate of staleSource)");
    expect(restoredLoop).toBeGreaterThanOrEqual(0);
    expect(sourceLoop).toBeGreaterThan(restoredLoop);
    expect(janitor).toContain("remainingChild");
  });

  it("scopes the cleanup key to mutation and scanning steps only", () => {
    const jobBlock = janitorWorkflow.match(
      /jobs:\n[\s\S]*?\n    steps:\n/,
    )?.[0] ?? "";
    expect(jobBlock).not.toContain("NEON_RECOVERY_API_KEY");
    expect(janitorWorkflow).toContain(
      "--secret-env=NEON_RECOVERY_API_KEY",
    );
    expect(janitorWorkflow).toContain("retention-days: 90");
  });
});
