import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertIsolatedBrowserTarget,
  assertIsolatedE2EDatabase,
  requireFullReleaseSha,
} from "../tests/e2e/isolation-guard";

const RELEASE_SHA = "a".repeat(40);
const playwrightConfig = readFileSync("playwright.config.ts", "utf8");
const releaseWorkflow = readFileSync(".github/workflows/deploy.yml", "utf8");
const SAFE_ENV = {
  E2E_DATABASE_URL: "postgresql://user:password@validation.example.test/infra_validation?sslmode=require",
  EXPECTED_DATABASE_HOST: "validation.example.test",
  EXPECTED_DATABASE_NAME: "infra_validation",
  FORBIDDEN_DATABASE_HOST: "production.example.test",
  RELEASE_SHA,
};

describe("browser validation isolation guard", () => {
  it("accepts the exact allow-listed non-production target", () => {
    expect(() => assertIsolatedBrowserTarget(SAFE_ENV)).not.toThrow();
  });

  it("rejects a host mismatch and every configured production host", () => {
    expect(() => assertIsolatedE2EDatabase({
      ...SAFE_ENV,
      E2E_DATABASE_URL: "postgresql://user:password@other.example.test/infra_validation",
    })).toThrow(/host does not match/i);
    expect(() => assertIsolatedE2EDatabase({
      ...SAFE_ENV,
      E2E_DATABASE_URL: "postgresql://user:password@production.example.test/infra_validation",
      EXPECTED_DATABASE_HOST: "production.example.test",
    })).toThrow(/forbidden production host/i);
  });

  it("rejects a database-name mismatch and remote application target", () => {
    expect(() => assertIsolatedE2EDatabase({
      ...SAFE_ENV,
      E2E_DATABASE_URL: "postgresql://user:password@validation.example.test/wrong_database",
    })).toThrow(/database name does not match/i);
    expect(() => assertIsolatedBrowserTarget({
      ...SAFE_ENV,
      PLAYWRIGHT_BASE_URL: "https://preview.example.test",
    })).toThrow(/local server/i);
  });

  it("fails closed when required isolation metadata is absent", () => {
    expect(() => assertIsolatedE2EDatabase({})).toThrow(/E2E_DATABASE_URL/);
    expect(() => assertIsolatedE2EDatabase({ E2E_DATABASE_URL: SAFE_ENV.E2E_DATABASE_URL }))
      .toThrow(/EXPECTED_DATABASE_HOST/);
  });

  it("requires and returns the exact full lowercase release identity", () => {
    expect(requireFullReleaseSha(SAFE_ENV)).toBe(RELEASE_SHA);
    for (const candidate of [
      undefined,
      "a".repeat(39),
      "A".repeat(40),
      ` ${"a".repeat(40)}`,
    ]) {
      expect(() => requireFullReleaseSha({ ...SAFE_ENV, RELEASE_SHA: candidate }))
        .toThrow(/full lowercase Git SHA/i);
    }
  });

  it("carries the checked CI release identity into the local application server", () => {
    expect(playwrightConfig).toContain("RELEASE_SHA: releaseSha");
    const browserStep = releaseWorkflow.slice(
      releaseWorkflow.indexOf(
        "- name: Run responsive, accessibility, and public-journey browser tests",
      ),
      releaseWorkflow.indexOf("- name: Upload migration and data evidence"),
    );
    expect(browserStep).toContain("RELEASE_SHA: ${{ github.sha }}");
    expect(browserStep).toContain("npm run test:e2e");
  });
});
