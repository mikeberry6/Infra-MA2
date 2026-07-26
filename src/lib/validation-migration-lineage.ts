export type MigrationHistoryRow = {
  id: string;
  migrationName: string;
  checksum: string;
  finished: boolean;
  rolledBack: boolean;
  appliedStepsCount: number;
};

type LegacyMigration = {
  migrationName: string;
  checksum: string;
};

export type ValidationLineageResolution =
  | { status: "not_present" }
  | { status: "schema_equivalence_required" }
  | {
      status: "resolve_failed_alias";
      failedRowId: string;
      migrationName: typeof FAILED_RESTAGED_ALIAS.migrationName;
    };

export const LEGACY_VALIDATION_MIGRATIONS: readonly LegacyMigration[] = [
  {
    migrationName: "20260722030000_platform_trust_foundations",
    checksum: "baa35ee29aa1a4138b7027004dccb55d6f6e8f22960096c9693e492f7785ab3b",
  },
  {
    migrationName: "20260722031500_enforce_deal_citation_gate",
    checksum: "e2abc0f39178042b45d7c1762bf1af958d993ce4e9c07acd841390184b2ddb87",
  },
  {
    migrationName: "20260722033000_primary_citations",
    checksum: "eef581fa0e462f75377862295e38ab5c973e27761fff943a6edb32cd2859c771",
  },
  {
    migrationName: "20260722200000_import_preview_tokens",
    checksum: "7ab57362445cb0251680bd5651d69e97d64a2419a184b17a38178ef8bbbc513a",
  },
  {
    migrationName: "20260722203000_deal_seller_disclosure",
    checksum: "a7307749e6bae879051c2fdc63ab516a386597589ae7cdf14f5c8cd0ed7b7e56",
  },
  {
    migrationName: "20260722210000_fund_primary_source",
    checksum: "bf51f75cd324663d1c5e5d54b6c6731d3d827fdee711f2a341a05af0f9554ea2",
  },
] as const;

export const FAILED_RESTAGED_ALIAS = {
  migrationName: "20260722220000_auth_throttle",
  checksum: "493c7c74d0dbffb0673c5c0ee2adf15bcc9389730fc343aa0a03d703193ad60c",
} as const;

function validateRows(rows: MigrationHistoryRow[]): void {
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.id || ids.has(row.id)) {
      throw new Error("Validation migration history contains a missing or duplicate row ID.");
    }
    ids.add(row.id);
    if (!/^[A-Za-z0-9_-]+$/.test(row.migrationName)) {
      throw new Error("Validation migration history contains an invalid migration name.");
    }
    if (!/^[0-9a-f]{64}$/i.test(row.checksum)) {
      throw new Error(`Validation migration ${row.migrationName} has an invalid checksum.`);
    }
    if (!Number.isInteger(row.appliedStepsCount) || row.appliedStepsCount < 0) {
      throw new Error(`Validation migration ${row.migrationName} has an invalid step count.`);
    }
  }
}

/**
 * Recognizes only the exact retired validation lineage and its one known
 * zero-step failed alias. Schema equivalence is deliberately proved by the
 * caller with Prisma before any supported `migrate resolve` operation.
 */
export function classifyValidationMigrationLineage(
  rows: MigrationHistoryRow[],
): ValidationLineageResolution {
  validateRows(rows);
  const presentLegacy = LEGACY_VALIDATION_MIGRATIONS.filter((legacy) =>
    rows.some((row) => row.migrationName === legacy.migrationName)
  );
  if (presentLegacy.length === 0) {
    const activeFailures = rows.filter((row) => !row.finished && !row.rolledBack);
    if (activeFailures.length > 0) {
      throw new Error("Validation contains an active failed migration outside the retired lineage.");
    }
    return { status: "not_present" };
  }
  if (presentLegacy.length !== LEGACY_VALIDATION_MIGRATIONS.length) {
    throw new Error("Validation contains only part of the reviewed retired migration lineage.");
  }

  for (const legacy of LEGACY_VALIDATION_MIGRATIONS) {
    const active = rows.filter(
      (row) => row.migrationName === legacy.migrationName && !row.rolledBack,
    );
    if (
      active.length !== 1
      || !active[0].finished
      || active[0].checksum.toLowerCase() !== legacy.checksum
    ) {
      throw new Error(
        `Retired validation migration ${legacy.migrationName} is not uniquely applied with its reviewed checksum.`,
      );
    }
  }

  const activeFailures = rows.filter((row) => !row.finished && !row.rolledBack);
  if (activeFailures.length === 0) {
    return { status: "schema_equivalence_required" };
  }
  if (activeFailures.length !== 1) {
    throw new Error("Validation contains more than one active failed migration.");
  }

  const failed = activeFailures[0];
  if (
    failed.migrationName !== FAILED_RESTAGED_ALIAS.migrationName
    || failed.checksum.toLowerCase() !== FAILED_RESTAGED_ALIAS.checksum
    || failed.appliedStepsCount !== 0
  ) {
    throw new Error("Validation contains an unrecognized active failed migration.");
  }
  return {
    status: "resolve_failed_alias",
    failedRowId: failed.id,
    migrationName: FAILED_RESTAGED_ALIAS.migrationName,
  };
}

export function verifyFailedAliasWasRolledBack(
  rows: MigrationHistoryRow[],
  failedRowId: string,
): void {
  validateRows(rows);
  const row = rows.find((candidate) => candidate.id === failedRowId);
  if (!row || !row.rolledBack || row.finished) {
    throw new Error("Prisma did not mark the exact failed alias as rolled back.");
  }
}
