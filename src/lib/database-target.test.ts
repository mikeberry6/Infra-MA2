import { describe, expect, it } from "vitest";
import {
  assertMutationDatabaseTarget,
  assertMutationDatabaseTargetFromEnv,
  assertNonProductionSeedTarget,
} from "@/lib/database-target";

describe("mutation database target guard", () => {
  const approved = {
    connectionString: "postgresql://user:secret@production.example/db_name?sslmode=require",
    expectedHost: "production.example",
    expectedDatabase: "db_name",
    forbiddenHosts: ["validation.example"],
  };

  it("requires an exact host and database plus an opposite-environment host", () => {
    expect(() => assertMutationDatabaseTarget(approved)).not.toThrow();
    expect(() => assertMutationDatabaseTarget({ ...approved, expectedDatabase: "other" })).toThrow(/does not match/);
    expect(() => assertMutationDatabaseTarget({ ...approved, expectedHost: "other.example" })).toThrow(/does not match/);
    expect(() => assertMutationDatabaseTarget({ ...approved, forbiddenHosts: [] })).toThrow(/forbidden host/);
  });

  it("rejects an explicitly forbidden target and non-Postgres URLs", () => {
    expect(() => assertMutationDatabaseTarget({ ...approved, forbiddenHosts: ["production.example"] })).toThrow(/forbidden/);
    expect(() => assertMutationDatabaseTarget({ ...approved, connectionString: "https://production.example/db_name" })).toThrow(/postgres protocol/);
  });

  it("loads the guarded target from environment-shaped input", () => {
    expect(() => assertMutationDatabaseTargetFromEnv({
      DATABASE_URL: approved.connectionString,
      EXPECTED_DATABASE_HOST: approved.expectedHost,
      EXPECTED_DATABASE_NAME: approved.expectedDatabase,
      FORBIDDEN_DATABASE_HOST: approved.forbiddenHosts[0],
    })).not.toThrow();
  });

  it("forbids ordinary seeding against production", () => {
    const environment = {
      DATABASE_URL: approved.connectionString,
      EXPECTED_DATABASE_HOST: approved.expectedHost,
      EXPECTED_DATABASE_NAME: approved.expectedDatabase,
      FORBIDDEN_DATABASE_HOST: approved.forbiddenHosts[0],
      TARGET_DATABASE: "validation",
    };
    expect(assertNonProductionSeedTarget(environment)).toBe("validation");
    expect(() => assertNonProductionSeedTarget({
      ...environment,
      TARGET_DATABASE: "production",
    })).toThrow(/production seeding is forbidden/);
  });
});
