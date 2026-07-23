import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function workflow(name: string): string {
  return readFileSync(path.join(process.cwd(), ".github", "workflows", name), "utf8");
}

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1;
}

describe("Phase 4 release workflow contract", () => {
  it("enforces the bundle budget after a production build", () => {
    const releaseGate = workflow("deploy.yml");
    const build = releaseGate.indexOf("run: npm run build");
    const budget = releaseGate.indexOf("run: npm run check:bundle-budget");

    expect(build).toBeGreaterThanOrEqual(0);
    expect(budget).toBeGreaterThan(build);
    expect(releaseGate).toContain(
      "DATA_CACHE_NAMESPACE: e2e-${{ github.run_id }}-${{ github.run_attempt }}",
    );
    expect(releaseGate).toContain('- "codex/infra-90-day-phase-3-restaged"');
    const playwright = readFileSync(path.join(process.cwd(), "playwright.config.ts"), "utf8");
    expect(playwright).toContain("DATA_CACHE_NAMESPACE: dataCacheNamespace");
    expect(playwright).toContain("resolvePlaywrightCacheNamespace(process.env, port)");
    const namespaceResolver = readFileSync(
      path.join(process.cwd(), "scripts/playwright-cache-namespace.ts"),
      "utf8",
    );
    expect(namespaceResolver).toContain("randomUUID()");
    expect(namespaceResolver).toContain("`e2e-local-${port}-${localNonce}`");
    const prismaRuntime = readFileSync(path.join(process.cwd(), "src/lib/prisma.ts"), "utf8");
    expect(prismaRuntime).toContain(
      'process.env.NEXT_PHASE !== "phase-production-build"',
    );
  });

  it("requires full health and exact release identity for candidate and production smoke", () => {
    const release = workflow("release-production.yml");
    const smokeCommands = release.match(/node scripts\/release-smoke\.mjs/g) ?? [];
    const expectedVersions = release.match(/--expected-version="\$RELEASE_SHA"/g) ?? [];

    expect(smokeCommands).toHaveLength(2);
    expect(expectedVersions).toHaveLength(2);
    expect(release).not.toContain("--skip-health");
  });

  it("recomputes full or break-glass rollback smoke arguments in both shell steps", () => {
    const rollback = workflow("rollback-production.yml");

    expect(rollback).toContain("smoke_policy:");
    expect(rollback).toMatch(/smoke_policy:\n[\s\S]*?required: true\n\s+default: full\n\s+type: choice/);
    expect(rollback).toContain("options:\n          - full\n          - public-only");
    expect(rollback.match(/smoke_args=\(--expected-version="\$ROLLBACK_SHA"\)/g) ?? [])
      .toHaveLength(2);
    expect(
      rollback.match(/smoke_args=\(--skip-health --allow-legacy-root\)/g) ?? [],
    ).toHaveLength(2);
    expect(rollback.match(
      /if \[ "\$SMOKE_POLICY" = "public-only" \]; then smoke_args=\(--skip-health --allow-legacy-root\); fi/g,
    ) ?? []).toHaveLength(2);
    expect(rollback.match(/"\$\{smoke_args\[@\]\}"/g) ?? []).toHaveLength(2);
  });

  it("pins immutable Vercel identity and exact-main provenance around release mutations", () => {
    const release = workflow("release-production.yml");
    const rollback = workflow("rollback-production.yml");

    for (const source of [release, rollback]) {
      expect(source).toContain("CANONICAL_PRODUCTION_URL: https://infra-ma-2.vercel.app");
      expect(source).toContain('if [ "$PRODUCTION_URL" != "$CANONICAL_PRODUCTION_URL" ]');
      expect(source).toContain('if [ "$GITHUB_REF" != "refs/heads/main" ]');
      expect(source).toContain("ref: refs/heads/main");
      expect(source).toContain("VERCEL_TEAM_ID");

      const inspectionCount = occurrences(source, "scripts/verify-vercel-deployment.ts");
      expect(inspectionCount).toBeGreaterThanOrEqual(3);
      for (const contract of [
        '--expected-project-id="$EXPECTED_VERCEL_PROJECT_ID"',
        '--expected-github-repository-id="$EXPECTED_GITHUB_REPOSITORY_ID"',
        '--team-id="$VERCEL_TEAM_ID"',
      ]) {
        expect(occurrences(source, contract)).toBe(inspectionCount);
      }
    }

    expect(occurrences(release, '--expected-sha="$RELEASE_SHA"'))
      .toBe(occurrences(release, "scripts/verify-vercel-deployment.ts"));
    expect(occurrences(rollback, '--expected-sha="$ROLLBACK_SHA"'))
      .toBe(occurrences(rollback, "scripts/verify-vercel-deployment.ts"));

    const releaseProvenance = release.indexOf(
      "Reverify exact main head immediately before promotion",
    );
    const promotion = release.indexOf("vercel@51.7.0 promote");
    expect(releaseProvenance).toBeGreaterThanOrEqual(0);
    expect(promotion).toBeGreaterThan(releaseProvenance);

    const rollbackSmoke = rollback.indexOf("candidate-smoke.json");
    const rollbackReverify = rollback.indexOf(
      "candidate-inspect-before-rollback.json",
    );
    const rollbackMutation = rollback.indexOf("vercel@51.7.0 rollback");
    expect(rollbackReverify).toBeGreaterThan(rollbackSmoke);
    expect(rollbackMutation).toBeGreaterThan(rollbackReverify);
  });
});
