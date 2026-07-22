import { describe, expect, it } from "vitest";
import { verifyMigrationBaseline } from "./migration-baseline";

const checksumA = "a".repeat(64);
const checksumB = "b".repeat(64);

describe("verifyMigrationBaseline", () => {
  it("accepts the exact applied migration set and checksums", () => {
    expect(verifyMigrationBaseline(
      [
        { migrationName: "20260101000000_first", checksum: checksumA },
        { migrationName: "20260201000000_second", checksum: checksumB },
      ],
      [
        { migrationName: "20260201000000_second", checksum: checksumB, finished: true },
        { migrationName: "20260101000000_first", checksum: checksumA, finished: true },
      ],
    )).toMatchObject({ expectedCount: 2, appliedCount: 2 });
  });

  it.each([
    {
      name: "missing migration",
      expected: [{ migrationName: "20260101000000_first", checksum: checksumA }],
      applied: [],
      message: "missing",
    },
    {
      name: "unexpected migration",
      expected: [],
      applied: [{ migrationName: "20260101000000_first", checksum: checksumA, finished: true }],
      message: "unexpected",
    },
    {
      name: "checksum mismatch",
      expected: [{ migrationName: "20260101000000_first", checksum: checksumA }],
      applied: [{ migrationName: "20260101000000_first", checksum: checksumB, finished: true }],
      message: "checksum mismatch",
    },
  ])("rejects a $name", ({ expected, applied, message }) => {
    expect(() => verifyMigrationBaseline(expected, applied)).toThrow(message);
  });

  it("rejects duplicate migration rows", () => {
    const duplicate = [
      { migrationName: "20260101000000_first", checksum: checksumA },
      { migrationName: "20260101000000_first", checksum: checksumA },
    ];
    expect(() => verifyMigrationBaseline(duplicate, [])).toThrow("duplicate migration");
  });

  it("rejects an unfinished non-rolled-back migration", () => {
    expect(() => verifyMigrationBaseline([], [
      { migrationName: "20260101000000_first", checksum: checksumA, finished: false },
    ])).toThrow("unfinished migrations");
  });
});
