import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const repository = process.cwd();
const tsx = path.join(repository, "node_modules", ".bin", "tsx");
const clearedMutationMetadata = {
  EXPECTED_DATABASE_HOST: "",
  EXPECTED_DATABASE_NAME: "",
  FORBIDDEN_DATABASE_HOST: "",
  FORBIDDEN_DATABASE_HOST_2: "",
  TARGET_DATABASE: "",
  DASHBOARD_WRITES_ENABLED: "",
};

describe("pipeline mutation target entry guards", () => {
  it("wires an explicit forbidden endpoint into every scheduled production pipeline", () => {
    const workflow = readFileSync(
      path.join(repository, ".github", "workflows", "data-pipelines.yml"),
      "utf8",
    );

    expect(workflow).toContain(
      "FORBIDDEN_DATABASE_HOST: ${{ vars.PRODUCTION_MIGRATION_DATABASE_HOST }}",
    );
    expect(workflow).toContain(
      "for name in EXPECTED_DATABASE_HOST EXPECTED_DATABASE_NAME FORBIDDEN_DATABASE_HOST; do",
    );
  });

  it("keeps the dashboard dry run usable without mutation-target metadata", () => {
    const result = runScript("dashboard-sync.ts", ["--dry-run"], {
      DATABASE_URL: "",
      DASHBOARD_REFRESH_WINDOW: "invalid-test-window",
    });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("DASHBOARD_REFRESH_WINDOW must use YYYY-MM-DD");
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("required for a database mutation");
  });

  it("keeps the news dry run usable without mutation-target metadata", () => {
    const result = runScript("news-scan.ts", ["--dry-run"], { DATABASE_URL: "" });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("DATABASE_URL is not set");
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("required for a database mutation");
  });

  it("rejects dashboard persistence validation before database access outside validation", () => {
    const result = runScript(
      "verify-dashboard-persistence-validation.ts",
      [],
      {
        DATABASE_URL:
          "postgresql://user:private-secret@unreachable.invalid/app?sslmode=require",
        TARGET_DATABASE: "production",
      },
    );
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain('"verifier":"dashboard_persistence_validation"');
    expect(output).toContain('"status":"failed"');
    expect(output).toContain('"targetGuard":false');
    expect(output).toContain('"errorClassification":"configuration_error"');
    expect(output).not.toContain("private-secret");
    expect(output).not.toMatch(/ECONN|ENOTFOUND|connect ETIMEDOUT/i);
  });

  it.each(["dashboard-sync.ts", "news-scan.ts"])(
    "fails %s mutation mode through the exact-target guard before database access",
    (fileName) => {
      const result = runScript(fileName, [], {
        DATABASE_URL: "postgresql://user:secret@unreachable.invalid/app",
      });
      const output = `${result.stdout}${result.stderr}`;

      expect(result.status).toBe(1);
      expect(output).toContain(
        "EXPECTED_DATABASE_HOST, EXPECTED_DATABASE_NAME, and at least one forbidden host are required for a database mutation",
      );
      expect(output).toContain('"errorClassification":"configuration_error"');
      expect(output).not.toContain("postgresql://user:secret");
      expect(output).not.toMatch(/ECONN|ENOTFOUND|connect ETIMEDOUT/i);
    },
  );

  it("rejects disabled production dashboard writes before database access", () => {
    const result = runScript("dashboard-sync.ts", [], {
      DATABASE_URL:
        "postgresql://user:private-secret@unreachable.invalid/app?sslmode=require",
      EXPECTED_DATABASE_HOST: "unreachable.invalid",
      EXPECTED_DATABASE_NAME: "app",
      FORBIDDEN_DATABASE_HOST: "validation.invalid",
      TARGET_DATABASE: "production",
      DASHBOARD_WRITES_ENABLED: "false",
      DASHBOARD_REFRESH_WINDOW: "2026-07-23",
    });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain(
      "DASHBOARD_WRITES_ENABLED must exactly equal true for production dashboard synchronization.",
    );
    expect(output).not.toContain("private-secret");
    expect(output).not.toMatch(/ECONN|ENOTFOUND|connect ETIMEDOUT/i);
  });

  it.each([
    ["dashboard-sync.ts", "if (!dryRun) assertDashboardSyncWriteAuthorization();"],
    ["news-scan.ts", "if (!options.dryRun) assertMutationDatabaseTargetFromEnv();"],
  ])("places the guard before client creation and PipelineRun persistence in %s", (fileName, guardCall) => {
    const source = readFileSync(path.join(repository, "scripts", fileName), "utf8");
    const mainStart = source.indexOf("async function main()");
    const guardIndex = source.indexOf(guardCall, mainStart);
    const clientIndex = source.indexOf("const prisma =", mainStart);
    const pipelineRunIndex = source.indexOf("startPipelineRun(", mainStart);

    expect(mainStart).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(mainStart);
    expect(guardIndex).toBeLessThan(clientIndex);
    expect(guardIndex).toBeLessThan(pipelineRunIndex);
  });

  it("preserves sanitized GitHub provenance through dashboard run completion and failure", () => {
    const source = readFileSync(
      path.join(repository, "scripts", "dashboard-sync.ts"),
      "utf8",
    );

    expect(source).toContain("const execution = pipelineExecutionProvenanceFromEnv();");
    expect(source.match(/pipelineMetadata\(/g)).toHaveLength(4);
    expect(source).toMatch(
      /startPipelineRun\([\s\S]*?pipelineMetadata\(\{ refreshWindow \}, execution\)/,
    );
    expect(source).toMatch(
      /completePipelineRun\([\s\S]*?pipelineMetadata\(\{[\s\S]*?\}, execution\)\)/,
    );
    expect(source).toContain("failureEvidence?.metadata");
  });
});

function runScript(
  fileName: string,
  args: string[],
  environment: Record<string, string>,
) {
  return spawnSync(tsx, [path.join(repository, "scripts", fileName), ...args], {
    cwd: repository,
    encoding: "utf8",
    env: {
      ...process.env,
      ...clearedMutationMetadata,
      ...environment,
      DOTENV_CONFIG_QUIET: "true",
    },
    timeout: 10_000,
  });
}
