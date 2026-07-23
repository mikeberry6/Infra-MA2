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
      "FORBIDDEN_DATABASE_HOST_2: ${{ vars.PHASE2_MIGRATION_DATABASE_HOST }}",
    );
    expect(workflow).toContain(
      "for name in EXPECTED_DATABASE_HOST EXPECTED_DATABASE_NAME FORBIDDEN_DATABASE_HOST FORBIDDEN_DATABASE_HOST_2; do",
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

  it.each([
    ["dashboard-sync.ts", "if (!dryRun) assertMutationDatabaseTargetFromEnv();"],
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
