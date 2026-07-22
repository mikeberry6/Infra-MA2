export type MigrationChecksum = {
  migrationName: string;
  checksum: string;
};

export type AppliedMigrationChecksum = MigrationChecksum & {
  finished: boolean;
};

export type MigrationBaselineReport = {
  expectedCount: number;
  appliedCount: number;
  migrations: MigrationChecksum[];
};

function indexMigrations(rows: MigrationChecksum[], label: string): Map<string, string> {
  const index = new Map<string, string>();
  for (const row of rows) {
    if (!row.migrationName || !/^[A-Za-z0-9_-]+$/.test(row.migrationName)) {
      throw new Error(`${label} contains an invalid migration name.`);
    }
    if (!/^[0-9a-f]{64}$/i.test(row.checksum)) {
      throw new Error(`${label} migration ${row.migrationName} has an invalid checksum.`);
    }
    if (index.has(row.migrationName)) {
      throw new Error(`${label} contains duplicate migration ${row.migrationName}.`);
    }
    index.set(row.migrationName, row.checksum.toLowerCase());
  }
  return index;
}

export function verifyMigrationBaseline(
  expectedRows: MigrationChecksum[],
  appliedRows: AppliedMigrationChecksum[],
): MigrationBaselineReport {
  const unfinished = appliedRows.filter((row) => !row.finished).map((row) => row.migrationName);
  if (unfinished.length > 0) {
    throw new Error(`Production contains unfinished migrations: ${unfinished.join(", ")}.`);
  }
  const expected = indexMigrations(expectedRows, "The migration baseline");
  const applied = indexMigrations(appliedRows, "Production");
  const missing = [...expected.keys()].filter((name) => !applied.has(name));
  const unexpected = [...applied.keys()].filter((name) => !expected.has(name));
  const checksumMismatches = [...expected.entries()]
    .filter(([name, checksum]) => applied.get(name) !== undefined && applied.get(name) !== checksum)
    .map(([name]) => name);

  const problems = [
    missing.length ? `missing: ${missing.join(", ")}` : "",
    unexpected.length ? `unexpected: ${unexpected.join(", ")}` : "",
    checksumMismatches.length ? `checksum mismatch: ${checksumMismatches.join(", ")}` : "",
  ].filter(Boolean);
  if (problems.length > 0) {
    throw new Error(`Production migrations do not match the reviewed baseline (${problems.join("; ")}).`);
  }

  return {
    expectedCount: expected.size,
    appliedCount: applied.size,
    migrations: [...expected.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([migrationName, checksum]) => ({ migrationName, checksum })),
  };
}
