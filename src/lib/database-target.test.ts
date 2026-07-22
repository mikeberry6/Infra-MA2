import { describe, expect, it } from "vitest";
import { assertMutationDatabaseTarget } from "@/lib/database-target";

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
    expect(() => assertMutationDatabaseTarget({
      ...approved,
      forbiddenHosts: ["production.example"],
    })).toThrow(/explicitly forbidden/);
    expect(() => assertMutationDatabaseTarget({
      ...approved,
      connectionString: "https://production.example/db_name",
    })).toThrow(/postgres protocol/);
  });
});
