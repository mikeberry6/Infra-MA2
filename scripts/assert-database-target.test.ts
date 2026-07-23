import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repository = process.cwd();
const script = path.join(repository, "scripts", "assert-database-target.ts");
const approved =
  "postgresql://runtime-user:runtime-secret@validation.invalid:5432/infrasight_validation?sslmode=require";

function run(connectionString: string) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", script],
    {
      cwd: repository,
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
        DATABASE_URL: connectionString,
        EXPECTED_DATABASE_HOST: "validation.invalid",
        EXPECTED_DATABASE_NAME: "infrasight_validation",
        FORBIDDEN_DATABASE_HOST: "production.invalid",
        FORBIDDEN_DATABASE_HOST_2: "",
      },
      shell: false,
    },
  );
}

describe("native database target guard query safety", () => {
  it("preserves reviewed TLS and channel-binding parameters", () => {
    const result = run(`${approved}&channel_binding=require`);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("Database target guard passed");
  });

  it.each([
    "host",
    "hostaddr",
    "port",
    "user",
    "username",
    "password",
    "db",
    "database",
    "dbname",
    "service",
    "servicefile",
    "passfile",
    "options",
    "schema",
  ])("rejects query identity override %s without leaking it", (name) => {
    const result = run(
      `${approved}&${name}=${encodeURIComponent("private-override")}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "DATABASE_URL contains unsupported or unsafe connection parameters.",
    );
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("private-override");
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("runtime-secret");
  });

  it("rejects a recursive connectionString override without logging it", () => {
    const recursive =
      "postgresql://other:private-secret@production.invalid/db?sslmode=require";
    const result = run(
      `${approved}&connectionString=${encodeURIComponent(recursive)}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "DATABASE_URL contains unsupported or unsafe connection parameters.",
    );
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("private-secret");
    expect(`${result.stdout}\n${result.stderr}`).not.toContain("postgresql://");
  });
});
