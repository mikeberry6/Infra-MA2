import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("hosted top-level failure E2E contract", () => {
  const workflow = readFileSync(
    path.join(process.cwd(), ".github", "workflows", "deploy.yml"),
    "utf8",
  );

  it("uses an unreachable loopback database without the validation write URL", () => {
    expect(workflow).toContain("Prove top-level database failure and retry journeys");
    expect(workflow).toMatch(/E2E_DATABASE_URL:\s*""/);
    expect(workflow).toContain("@127.0.0.1:1/failure_fixture?connect_timeout=1");
    expect(workflow).toContain("E2E_TOP_LEVEL_FAILURE_FIXTURE=1");
    expect(workflow).toContain('PLAYWRIGHT_BASE_URL="$failure_url"');
    expect(workflow).toContain('--grep "distinguishes a database failure"');
  });
});
