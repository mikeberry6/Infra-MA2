import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/build-production-candidate.yml", "utf8");

describe("protected production candidate workflow", () => {
  it("builds only the exact protected-main release that passed the stable gate", () => {
    expect(workflow).toContain('if [ "$GITHUB_REF" != "refs/heads/main" ]');
    expect(workflow).toContain('if [ "$CONFIRMATION" != "BUILD_CANDIDATE" ]');
    expect(workflow).toContain('if [ "$(git rev-parse HEAD)" != "$RELEASE_SHA" ]');
    expect(workflow).toContain('if ! [[ "$PRODUCTION_APP_SHA" =~ ^[0-9a-f]{40}$ ]]');
    expect(workflow).toContain("--required-check=build");
    expect(workflow).toContain("environment: production");
    expect(workflow).toContain("group: production-release");
  });

  it("creates a production-target build without moving a domain", () => {
    expect(workflow).toContain("vercel@51.7.0 deploy");
    expect(workflow).toContain("--prod");
    expect(workflow).toContain("--skip-domain");
    expect(workflow).toContain('--meta githubCommitSha="$RELEASE_SHA"');
    expect(workflow).not.toMatch(/\bpromote\b/);
    expect(workflow).not.toMatch(/\brollback\b/);
  });

  it("fails closed unless immutable project, team, repository, SHA, and smoke checks pass", () => {
    expect(workflow).toContain("VERCEL_TEAM_ID: ${{ vars.VERCEL_TEAM_ID }}");
    expect(workflow).toContain("EXPECTED_GITHUB_REPOSITORY_ID: ${{ github.repository_id }}");
    expect(workflow).toContain('if [ "$PHASE2_PIPELINES_ENABLED" != "true" ]');
    expect(workflow).toContain("verify-vercel-deployment.ts");
    expect(workflow).toContain('--team-id="$VERCEL_TEAM_ID"');
    expect(workflow).toContain("--require-immutable-url");
    expect(workflow).toContain("--transport=vercel-cli");
    expect(workflow).toContain("tmp/candidate/candidate-inspect.json");
    expect(workflow).toContain("tmp/candidate/candidate-smoke.json");
    expect(workflow).toContain("tmp/candidate/canonical-before-build.json");
    expect(workflow).toContain("tmp/candidate/canonical-after-build.json");
    expect(workflow.match(/--expected-sha=\"\$PRODUCTION_APP_SHA\"/g)).toHaveLength(2);
  });
});
