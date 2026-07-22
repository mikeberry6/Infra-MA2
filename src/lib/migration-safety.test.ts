import { describe, expect, it } from "vitest";
import { auditAdditiveMigrationSql } from "./migration-safety";

describe("additive migration safety", () => {
  it("allows additive tables, columns, constraints, indexes, and enum creation", () => {
    const sql = `
      CREATE TYPE "State" AS ENUM ('OPEN', 'CLOSED');
      ALTER TABLE "Deal" ADD COLUMN "verifiedAt" TIMESTAMP(3);
      CREATE TABLE "Run" ("id" TEXT NOT NULL);
      CREATE UNIQUE INDEX "Run_id_key" ON "Run"("id");
      ALTER TABLE "Run" ADD CONSTRAINT "Run_pkey" PRIMARY KEY ("id");
      ALTER TABLE "Run"
        ADD CONSTRAINT "Run_parent_fkey"
        FOREIGN KEY ("id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      COMMENT ON COLUMN "Run"."id" IS 'UPDATE and DELETE are documentation; semicolons; are safe';
    `;
    expect(auditAdditiveMigrationSql(sql)).toEqual([]);
  });

  it("ignores policy keywords and semicolons in comments and quoted values", () => {
    const sql = `
      -- UPDATE and DROP are mentioned only as documentation.
      CREATE TYPE "Action" AS ENUM ('UPDATE;SAFE', 'DROP');
      /* nested comments are valid: /* DELETE */ still explanatory */
      ALTER TABLE "Audit" ADD COLUMN "description" TEXT DEFAULT 'do not DELETE; this text';
    `;
    expect(auditAdditiveMigrationSql(sql)).toEqual([]);
  });

  it.each([
    'DROP TABLE "Deal";',
    'ALTER TABLE "Deal" DROP COLUMN "title";',
    'ALTER TABLE "Deal" ALTER COLUMN "title" SET NOT NULL;',
    'UPDATE "Deal" SET "status" = \'DRAFT\';',
    'DELETE FROM "Deal";',
    'TRUNCATE TABLE "Deal";',
    'ALTER TABLE "Deal" RENAME COLUMN "title" TO "name";',
    'ALTER TABLE "Deal" ADD COLUMN "safe" TEXT, DROP COLUMN "title";',
    'ALTER TABLE "Deal" ADD COLUMN "safe" TEXT, ALTER COLUMN "title" SET NOT NULL;',
    'ALTER TABLE "Deal" ADD COLUMN "safe" TEXT DROP COLUMN "title";',
    'CREATE TABLE "DealCopy" AS SELECT * FROM "Deal";',
    'CREATE INDEX "unsafe_idx" ON "Deal" UPDATE "Deal" SET "status" = \'DRAFT\';',
    'INSERT INTO "Deal" ("id") VALUES (\'unsafe\');',
    'WITH changed AS (SELECT 1) UPDATE "Deal" SET "status" = \'DRAFT\';',
  ])("rejects non-additive SQL: %s", (sql) => {
    expect(auditAdditiveMigrationSql(sql)).toHaveLength(1);
  });

  it("rejects malformed SQL instead of guessing", () => {
    expect(auditAdditiveMigrationSql("CREATE TABLE \"Run\" (\"id\" TEXT;")[0]?.reason).toMatch(/parenthesized|permitted/i);
    expect(auditAdditiveMigrationSql("CREATE TABLE \"Run\" ('unterminated")[0]?.reason).toMatch(/unterminated/i);
  });
});
