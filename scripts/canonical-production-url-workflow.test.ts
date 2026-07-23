import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readWorkflow = (name: string) => readFileSync(
  path.join(process.cwd(), ".github", "workflows", name),
  "utf8",
);

describe("canonical production URL workflow contract", () => {
  it.each([
    "stage-production-schema.yml",
    "release-production.yml",
    "rollback-production.yml",
  ])("pins schema, promotion, and rollback operations in %s", (name) => {
    const workflow = readWorkflow(name);

    expect(workflow).toContain(
      "CANONICAL_PRODUCTION_URL: https://infra-ma-2.vercel.app",
    );
    expect(workflow).toContain(
      'if [ "$PRODUCTION_URL" != "$CANONICAL_PRODUCTION_URL" ]',
    );
    expect(workflow).toContain(
      "The protected PRODUCTION_URL does not match the canonical InfraSight production alias.",
    );
    expect(workflow).toContain("VERCEL_TEAM_ID: ${{ vars.VERCEL_TEAM_ID }}");
    expect(workflow).toContain("--team-id=\"$VERCEL_TEAM_ID\"");
  });

  it("re-inspects the canonical production alias after rollback", () => {
    const workflow = readWorkflow("rollback-production.yml");

    expect(workflow.match(/--team-id=\"\$VERCEL_TEAM_ID\"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(workflow).toContain("--deployment-url=\"$PRODUCTION_URL\"");
    expect(workflow).toContain("--expected-sha=\"$ROLLBACK_SHA\"");
    expect(workflow).toContain("--output=tmp/rollback/canonical-production-inspect.json");
  });
});
