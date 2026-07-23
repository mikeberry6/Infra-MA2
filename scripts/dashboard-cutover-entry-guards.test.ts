import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repository = process.cwd();
const tsx = path.join(repository, "node_modules", ".bin", "tsx");

describe("dashboard cutover entry guards", () => {
  it.each([
    "backfill-dashboard-signal-approvals.ts",
    "quarantine-dashboard-methodology-history.ts",
  ])("rejects %s apply before client creation while dashboard writes are enabled", (script) => {
    const result = spawnSync(tsx, [path.join(repository, "scripts", script), "--apply"], {
      cwd: repository,
      encoding: "utf8",
      timeout: 10_000,
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://user:secret@unreachable.invalid/app",
        EXPECTED_DATABASE_HOST: "unreachable.invalid",
        EXPECTED_DATABASE_NAME: "app",
        FORBIDDEN_DATABASE_HOST: "production.invalid",
        TARGET_DATABASE: "production",
        RELEASE_SHA: "a".repeat(40),
        MUTATION_REVIEWED_BY: "Research Owner",
        MUTATION_REASON: "Reviewed dashboard cutover",
        DASHBOARD_WRITES_ENABLED: "true",
        DOTENV_CONFIG_QUIET: "true",
      },
    });
    const output = `${result.stdout}${result.stderr}`;
    expect(result.status).toBe(1);
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("postgresql://user:secret");
    expect(output).not.toMatch(/ECONN|ENOTFOUND|ETIMEDOUT/i);
  });

  it.each([
    "backfill-dashboard-signal-approvals.ts",
    "quarantine-dashboard-methodology-history.ts",
  ])("rejects %s apply before client creation when target metadata is incomplete", (script) => {
    const result = spawnSync(tsx, [path.join(repository, "scripts", script), "--apply"], {
      cwd: repository,
      encoding: "utf8",
      timeout: 10_000,
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://user:secret@unreachable.invalid/app",
        EXPECTED_DATABASE_HOST: "",
        EXPECTED_DATABASE_NAME: "",
        FORBIDDEN_DATABASE_HOST: "",
        FORBIDDEN_DATABASE_HOST_2: "",
        TARGET_DATABASE: "production",
        RELEASE_SHA: "a".repeat(40),
        MUTATION_REVIEWED_BY: "Research Owner",
        MUTATION_REASON: "Reviewed dashboard cutover",
        DASHBOARD_WRITES_ENABLED: "false",
        DOTENV_CONFIG_QUIET: "true",
      },
    });
    const output = `${result.stdout}${result.stderr}`;
    expect(result.status).toBe(1);
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("postgresql://user:secret");
    expect(output).not.toMatch(/ECONN|ENOTFOUND|ETIMEDOUT/i);
  });
});
