import { describe, expect, it } from "vitest";
import {
  classifyValidationMigrationLineage,
  FAILED_RESTAGED_ALIAS,
  LEGACY_VALIDATION_MIGRATIONS,
  verifyFailedAliasWasRolledBack,
  type MigrationHistoryRow,
} from "./validation-migration-lineage";

function row(
  migrationName: string,
  checksum: string,
  overrides: Partial<MigrationHistoryRow> = {},
): MigrationHistoryRow {
  return {
    id: `${migrationName}-${overrides.id ?? "id"}`,
    migrationName,
    checksum,
    finished: true,
    rolledBack: false,
    appliedStepsCount: 1,
    ...overrides,
  };
}

function legacyRows(): MigrationHistoryRow[] {
  return LEGACY_VALIDATION_MIGRATIONS.map((migration, index) =>
    row(migration.migrationName, migration.checksum, { id: `legacy-${index}` })
  );
}

describe("validation migration lineage classifier", () => {
  it("does not interfere with fresh or canonical-only migration history", () => {
    expect(classifyValidationMigrationLineage([])).toEqual({ status: "not_present" });
    expect(classifyValidationMigrationLineage([
      row("20260722190000_dashboard_recurring_sources", "1".repeat(64)),
    ])).toEqual({ status: "not_present" });
  });

  it("requires schema equivalence when the complete lineage is already healthy", () => {
    expect(classifyValidationMigrationLineage(legacyRows()))
      .toEqual({ status: "schema_equivalence_required" });
  });

  it("recognizes only the exact zero-step failed restaged alias", () => {
    const failed = row(
      FAILED_RESTAGED_ALIAS.migrationName,
      FAILED_RESTAGED_ALIAS.checksum,
      {
        id: "failed-alias",
        finished: false,
        appliedStepsCount: 0,
      },
    );
    expect(classifyValidationMigrationLineage([...legacyRows(), failed])).toEqual({
      status: "resolve_failed_alias",
      failedRowId: failed.id,
      migrationName: FAILED_RESTAGED_ALIAS.migrationName,
    });
  });

  it("rejects partial, checksum-mismatched, and ambiguous legacy history", () => {
    expect(() => classifyValidationMigrationLineage([legacyRows()[0]]))
      .toThrow("only part");

    const wrongChecksum = legacyRows();
    wrongChecksum[0] = { ...wrongChecksum[0], checksum: "f".repeat(64) };
    expect(() => classifyValidationMigrationLineage(wrongChecksum))
      .toThrow("reviewed checksum");

    const duplicate = legacyRows();
    duplicate.push({ ...duplicate[0], id: "duplicate-active" });
    expect(() => classifyValidationMigrationLineage(duplicate))
      .toThrow("uniquely applied");
  });

  it("rejects unknown failures and any failed alias with applied steps", () => {
    expect(() => classifyValidationMigrationLineage([
      ...legacyRows(),
      row("20260722999999_unknown", "a".repeat(64), {
        finished: false,
        appliedStepsCount: 0,
      }),
    ])).toThrow("unrecognized");

    expect(() => classifyValidationMigrationLineage([
      ...legacyRows(),
      row(FAILED_RESTAGED_ALIAS.migrationName, FAILED_RESTAGED_ALIAS.checksum, {
        finished: false,
        appliedStepsCount: 1,
      }),
    ])).toThrow("unrecognized");
  });

  it("proves Prisma rolled back the exact failed row", () => {
    const failed = row(FAILED_RESTAGED_ALIAS.migrationName, FAILED_RESTAGED_ALIAS.checksum, {
      id: "failed-alias",
      finished: false,
      rolledBack: true,
      appliedStepsCount: 0,
    });
    expect(() => verifyFailedAliasWasRolledBack([failed], failed.id)).not.toThrow();
    expect(() => verifyFailedAliasWasRolledBack([
      { ...failed, rolledBack: false },
    ], failed.id)).toThrow("did not mark");
  });
});
