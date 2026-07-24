import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  path.join(process.cwd(), ".github/workflows/bootstrap-preview-dashboard.yml"),
  "utf8",
);

function jobBody(name: string): string {
  const marker = `\n  ${name}:\n`;
  const start = workflow.indexOf(marker);
  if (start < 0) throw new Error(`Missing workflow job: ${name}`);
  const contentStart = start + marker.length;
  const next = workflow
    .slice(contentStart)
    .search(/\n  [a-z][a-z0-9_]*:\n/);
  return workflow.slice(
    start,
    next < 0 ? workflow.length : contentStart + next,
  );
}

function expectOrdered(body: string, labels: string[]): void {
  let prior = -1;
  for (const label of labels) {
    const current = body.indexOf(label);
    expect(current, label).toBeGreaterThan(prior);
    prior = current;
  }
}

const trustedMain = jobBody("trusted_main");
const runtimeBefore = jobBody("preview_runtime_before");
const bootstrap = jobBody("bootstrap");
const runtimeAfter = jobBody("preview_runtime_after");

describe("protected Preview dashboard bootstrap workflow", () => {
  it("accepts only an exact protected-main repository dispatch", () => {
    expect(workflow).toContain("repository_dispatch:");
    expect(workflow).toContain("types: [bootstrap-preview-dashboard]");
    expect(workflow).not.toContain("workflow_dispatch:");
    expect(workflow).not.toContain("schedule:");
    expect(workflow).toContain("group: preview-dashboard-bootstrap");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain(
      'CONFIRMATION: ${{ github.event.client_payload.confirmation }}',
    );
    expect(workflow).toContain(
      'REQUESTED_RELEASE_SHA: ${{ github.event.client_payload.release_sha }}',
    );
    expect(workflow).toContain(
      '"$REQUESTED_RELEASE_SHA" != "$GITHUB_SHA"',
    );
    expect(workflow).toContain(
      '"$(git rev-parse "$PREVIEW_GIT_SHA^{tree}")" != "$(git rev-parse "$GITHUB_SHA^{tree}")"',
    );
    expect(trustedMain).toContain(
      '"$GITHUB_REF" != "refs/heads/main"',
    );
    expect(trustedMain).toContain("Protected main release SHA");
    expect(trustedMain).toContain("Immutable Preview Git SHA");
    expect(trustedMain).toContain("Immutable Preview URL");
    expect(workflow.match(/ref: refs\/heads\/main/g)).toHaveLength(4);
    expect(workflow.match(/persist-credentials: false/g)).toHaveLength(4);
    expect(workflow.match(/environment: preview-bootstrap/g)).toHaveLength(3);
  });

  it("isolates OIDC authority from package installation and database access", () => {
    for (const runtimeJob of [runtimeBefore, runtimeAfter]) {
      expect(runtimeJob).toContain("id-token: write");
      expect(runtimeJob).toContain('node-version: "24"');
      expect(runtimeJob).not.toContain("npm ci");
      expect(runtimeJob).not.toContain("node_modules");
      expect(runtimeJob).not.toContain("PREVIEW_DATABASE_URL");
      expect(runtimeJob).not.toContain("PREVIEW_MIGRATION_DATABASE_URL");
      expect(runtimeJob).not.toContain("PREVIEW_FRED_API_KEY");
      expect(runtimeJob).not.toContain("PREVIEW_NEON_API_KEY");
      expectOrdered(runtimeJob, [
        "scripts/verify-vercel-deployment.ts",
        "scripts/verify-vercel-protected-health.ts",
        "core.getIDToken",
        "x-vercel-trusted-oidc-idp-token",
      ]);
    }

    expect(bootstrap).toContain("permissions:\n      contents: read");
    expect(bootstrap).not.toContain("id-token: write");
    expect(bootstrap).not.toContain("core.getIDToken");
    expect(bootstrap).not.toContain("VERCEL_TRUSTED_OIDC_TOKEN");
    expectOrdered(bootstrap, [
      "- name: Install locked dependencies",
      "npm ci",
      "- name: Register derived Preview database credential masks",
      "scripts/register-github-database-secret-masks.ts",
      "- name: Require protected Preview provider credentials",
      "- name: Prove the exact non-production Preview database target",
    ]);
    expect(bootstrap).toContain(
      "--database-url-env=PREVIEW_DATABASE_URL",
    );
    expect(bootstrap).toContain(
      "--database-url-env=PREVIEW_MIGRATION_DATABASE_URL",
    );
    expect(
      workflow.match(
        /core\.getIDToken\("https:\/\/vercel\.com\/infrasight-preview-bootstrap"\)/g,
      ),
    ).toHaveLength(2);
  });

  it("proves protection before OIDC and permits only bounded retry states", () => {
    expect(
      workflow.match(/scripts\/verify-vercel-protected-health\.ts/g),
    ).toHaveLength(2);
    expect(workflow.match(/--max-redirs 0/g)).toHaveLength(4);
    expect(workflow.match(/--dump-header "\$header_capture"/g)).toHaveLength(2);
    expect(workflow).toContain("healthPathProtected");
    expect(workflow).not.toContain("standardDeploymentProtection");
    expect(runtimeBefore).toContain(
      'if [ "$health_status" != "200" ] && [ "$health_status" != "503" ]',
    );
    expect(runtimeBefore).toContain("def valid_success_binding:");
    expect(runtimeBefore).toContain('.status == "never-run"');
    expect(runtimeBefore).toContain('.status == "failed"');
    expect(runtimeBefore).toContain('.status == "stale"');
    expect(runtimeBefore).toContain('.status == "stalled"');
    expect(runtimeBefore).toContain(
      "else\n                        (.lastAttemptAt | iso)",
    );
    expect(runtimeBefore).toContain(
      '.name == "NEWS_SCAN" and passing',
    );
    expect(runtimeBefore).toContain(
      '.name == "DASHBOARD_SYNC"',
    );
    expect(runtimeBefore).toContain(
      'echo "dashboard_last_successful_at=$dashboard_last_successful_at" >> "$GITHUB_OUTPUT"',
    );
    expect(runtimeBefore).not.toMatch(
      /\.name == "DASHBOARD_SYNC"[\s\S]{0,180}\.status == "running"/,
    );
  });

  it("guards the exact non-production database before dry-run and live synchronization", () => {
    expect(bootstrap).toContain(
      "DATABASE_URL: ${{ secrets.PREVIEW_DATABASE_URL }}",
    );
    expect(bootstrap).toContain(
      "DATABASE_URL: ${{ secrets.PREVIEW_MIGRATION_DATABASE_URL }}",
    );
    expect(bootstrap).not.toContain("secrets.DATABASE_URL");
    expect(bootstrap).not.toContain("secrets.MIGRATION_DATABASE_URL");
    expect(bootstrap).not.toContain("secrets.PRODUCTION_DATABASE_URL");
    expect(bootstrap).toContain(
      "EXPECTED_DATABASE_HOST: ${{ vars.PREVIEW_DATABASE_HOST }}",
    );
    expect(bootstrap).toContain(
      "EXPECTED_DATABASE_NAME: ${{ vars.PREVIEW_DATABASE_NAME }}",
    );
    expect(bootstrap).toContain(
      "PRODUCTION_DATABASE_HOST: ${{ vars.PRODUCTION_DATABASE_HOST }}",
    );
    expect(bootstrap).toContain(
      "PRODUCTION_MIGRATION_DATABASE_HOST: ${{ vars.PRODUCTION_MIGRATION_DATABASE_HOST }}",
    );
    expect(bootstrap).toContain(
      "MIGRATION_DATABASE_HOST: ${{ vars.MIGRATION_DATABASE_HOST }}",
    );
    expect(bootstrap).toContain(
      "DASHBOARD_MIGRATION_DATABASE_HOST: ${{ vars.DASHBOARD_MIGRATION_DATABASE_HOST }}",
    );
    expect(bootstrap.match(/TARGET_DATABASE: validation/g)).toHaveLength(2);
    expect(bootstrap.match(/DASHBOARD_WRITES_ENABLED: "false"/g)).toHaveLength(2);

    expectOrdered(bootstrap, [
      "scripts/register-github-database-secret-masks.ts",
      "scripts/assert-database-target.ts",
      "scripts/preview-database-pair.ts",
      "scripts/verify-preview-neon-target.ts",
      "./node_modules/.bin/prisma migrate status",
      "- name: Dry-run all Preview dashboard providers",
      "- name: Synchronize all dashboard providers with bounded retries",
      "- name: Verify complete Preview dashboard persistence",
    ]);
    expect(bootstrap).toContain("--to-config-datasource");
    expect(bootstrap).toContain(
      "node scripts/run-with-retry.mjs --attempts=3 -- npm run dashboard:sync:dry-run",
    );
    expect(bootstrap).toContain(
      "node scripts/run-with-retry.mjs --attempts=3 -- npm run dashboard:sync",
    );
    expect(bootstrap).toContain('.pipelineRunStatus == "SUCCEEDED"');
    expect(bootstrap).toContain(
      'echo "pipeline_run_proof=$pipeline_run_proof" >> "$GITHUB_OUTPUT"',
    );
    expect(bootstrap).toContain(
      'echo "pipeline_run_ended_at=$pipeline_run_ended_at" >> "$GITHUB_OUTPUT"',
    );
  });

  it("binds the exact successful write to a freshly attested immutable runtime", () => {
    expect(runtimeAfter).toContain(
      "BOOTSTRAP_STARTED_AT: ${{ needs.bootstrap.outputs.bootstrap_started_at }}",
    );
    expect(runtimeAfter).toContain(
      "DASHBOARD_LAST_SUCCESSFUL_BEFORE: ${{ needs.preview_runtime_before.outputs.dashboard_last_successful_at }}",
    );
    expect(runtimeAfter).toContain(
      "EXPECTED_PIPELINE_RUN_PROOF: ${{ needs.bootstrap.outputs.pipeline_run_proof }}",
    );
    expect(runtimeAfter).toContain(
      "EXPECTED_PIPELINE_RUN_ENDED_AT: ${{ needs.bootstrap.outputs.pipeline_run_ended_at }}",
    );
    expect(runtimeAfter).toContain(
      ".lastSuccessfulAt == $expectedPipelineRunEndedAt",
    );
    expect(runtimeAfter).toContain(
      ".lastSuccessfulRunProof == $expectedPipelineRunProof",
    );
    expect(runtimeAfter).toContain(">= $started");
    expect(runtimeAfter).toContain('$previousSuccessfulAt == "none"');
    expect(runtimeAfter).toContain(
      'if [ "$health_status" != "200" ]; then',
    );
    expect(runtimeAfter).toContain('.status == "healthy"');
    expect(runtimeAfter).toContain(
      '([.pipelines[].name] | sort == ["DASHBOARD_SYNC", "NEWS_SCAN"])',
    );
  });

  it("writes outcomes before final scans and never mutates uploaded evidence afterward", () => {
    const packets = [
      {
        body: runtimeBefore,
        outcome: "- name: Record fixed-schema pre-runtime outcome",
        scan: "- name: Final secret scan of immutable pre-runtime evidence",
        upload: "- name: Upload sanitized pre-runtime evidence",
        enforce: "- name: Enforce successful pre-runtime attestation",
        root: "tmp/preview-dashboard-runtime-before/",
        artifact: "preview-dashboard-runtime-before-${{ github.run_id }}-${{ github.run_attempt }}",
      },
      {
        body: bootstrap,
        outcome: "- name: Record fixed-schema bootstrap outcome",
        scan: "- name: Final secret scan of immutable bootstrap evidence",
        upload: "- name: Upload sanitized bootstrap evidence",
        enforce: "- name: Enforce successful dashboard synchronization",
        root: "tmp/preview-dashboard-bootstrap/",
        artifact: "preview-dashboard-bootstrap-${{ github.run_id }}-${{ github.run_attempt }}",
      },
      {
        body: runtimeAfter,
        outcome: "- name: Record fixed-schema post-runtime outcome",
        scan: "- name: Final secret scan of immutable post-runtime evidence",
        upload: "- name: Upload sanitized post-runtime evidence",
        enforce: "- name: Enforce successful post-runtime binding",
        root: "tmp/preview-dashboard-runtime-after/",
        artifact: "preview-dashboard-runtime-after-${{ github.run_id }}-${{ github.run_attempt }}",
      },
    ];

    for (const packet of packets) {
      expectOrdered(packet.body, [
        packet.outcome,
        packet.scan,
        packet.upload,
        packet.enforce,
      ]);
      expect(packet.body).toContain(
        'and (.result == "success" or .result == "failed")',
      );
      expect(packet.body).toContain(
        "if ([.steps[]] | all(. == \"success\"))",
      );
      expect(packet.body).toContain(`name: ${packet.artifact}`);
      expect(packet.body).toContain(`path: ${packet.root}`);
      expect(packet.body).not.toMatch(/path:\s+tmp\/[^\n]*-scans/);
      const afterScan = packet.body.slice(packet.body.indexOf(packet.scan));
      const upload = afterScan.indexOf(packet.upload);
      expect(afterScan.slice(0, upload)).not.toContain(
        `${packet.root}outcome.json`,
      );
    }

    expect(workflow).toContain('--database-url-secret-env="$name"');
    expect(workflow).toContain('--secret-env="$name"');
    expect(workflow).not.toMatch(/\btee\b/);
  });
});
