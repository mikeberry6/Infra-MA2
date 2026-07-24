import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FAILED_RESTAGED_ALIAS,
  LEGACY_VALIDATION_MIGRATIONS,
} from "../src/lib/validation-migration-lineage";

const migrationRoot = path.join(process.cwd(), "prisma", "migrations");
const aliases = [
  "20260722220000_auth_throttle",
  "20260722221000_data_trust_foundations",
  "20260722221500_enforce_deal_citation_gate",
  "20260722222000_primary_citations",
  "20260722223000_deal_seller_disclosure",
  "20260722224000_fund_primary_source",
  "20260722225000_import_preview_tokens",
];

function migrationSql(migrationName: string): string {
  return readFileSync(path.join(migrationRoot, migrationName, "migration.sql"), "utf8");
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function uncommentedSql(value: string): string {
  return value.replace(/--[^\n]*(?:\n|$)/g, "").trim();
}

describe("restaged migration lineage", () => {
  it("retains every retired migration byte-for-byte", () => {
    for (const migration of LEGACY_VALIDATION_MIGRATIONS) {
      expect(sha256(migrationSql(migration.migrationName)), migration.migrationName)
        .toBe(migration.checksum);
    }
  });

  it("keeps every restaged duplicate as an explicit non-DDL compatibility alias", () => {
    for (const migrationName of aliases) {
      const sql = migrationSql(migrationName);
      expect(uncommentedSql(sql), migrationName).toBe("SELECT 1;");
      expect(sql, migrationName).not.toMatch(
        /\b(?:ALTER|CREATE|DELETE|DROP|INSERT|TRUNCATE|UPDATE)\b/i,
      );
      expect(sql, migrationName).toContain("Compatibility alias");
    }
  });

  it("recognizes the exact checksum of the known pre-alias failed attempt", () => {
    expect(FAILED_RESTAGED_ALIAS).toEqual({
      migrationName: "20260722220000_auth_throttle",
      checksum: "493c7c74d0dbffb0673c5c0ee2adf15bcc9389730fc343aa0a03d703193ad60c",
    });
    expect(sha256(migrationSql(FAILED_RESTAGED_ALIAS.migrationName)))
      .not.toBe(FAILED_RESTAGED_ALIAS.checksum);
  });
});
