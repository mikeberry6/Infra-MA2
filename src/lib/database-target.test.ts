import { describe, expect, it } from "vitest";
import {
  assertApprovalReviewerMatchesMutationContext,
  assertMaintenanceMutationContext,
  assertMutationDatabaseTarget,
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
    expect(() => assertMutationDatabaseTarget({
      ...approved,
      forbiddenHosts: ["production.example"],
    })).toThrow(/explicitly forbidden/);
    expect(() => assertMutationDatabaseTarget({
      ...approved,
      connectionString: "https://production.example/db_name",
    })).toThrow(/postgres protocol/);
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
    })).toThrow(/production is forbidden/);
  });

  it("requires reviewed release provenance for maintenance writes", () => {
    const environment = {
      DATABASE_URL: approved.connectionString,
      EXPECTED_DATABASE_HOST: approved.expectedHost,
      EXPECTED_DATABASE_NAME: approved.expectedDatabase,
      FORBIDDEN_DATABASE_HOST: approved.forbiddenHosts[0],
      TARGET_DATABASE: "production",
      RELEASE_SHA: "a".repeat(40),
      MUTATION_REVIEWED_BY: "Research Owner",
      MUTATION_REASON: "Approved correction",
    };
    expect(assertMaintenanceMutationContext(environment)).toMatchObject({
      targetDatabase: "production",
      reviewedBy: "Research Owner",
    });
    expect(() => assertMaintenanceMutationContext({
      ...environment,
      MUTATION_REASON: "",
    })).toThrow(/MUTATION_REVIEWED_BY and MUTATION_REASON/);
  });

  it("binds the execution reviewer to the committed approval reviewer", () => {
    const context = {
      targetDatabase: "production" as const,
      releaseSha: "a".repeat(40),
      reviewedBy: "Research Owner",
      reason: "Approved correction",
    };
    expect(() => assertApprovalReviewerMatchesMutationContext("Research Owner", context)).not.toThrow();
    expect(() => assertApprovalReviewerMatchesMutationContext("Different Reviewer", context))
      .toThrow(/exactly match the committed approval reviewer/);
  });
});
