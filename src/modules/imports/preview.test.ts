import { beforeEach, describe, expect, it } from "vitest";
import {
  assertImportStateHash,
  duplicateImportIdentityIndexes,
  hashImportValue,
  IMPORT_PREVIEW_TTL_MS,
  issueImportPreviewToken,
  StaleImportPreviewError,
  summarizeImportClassifications,
  verifyImportPreviewToken,
} from "./preview";

describe("signed import previews", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-only-import-preview-secret-with-context";
  });

  it("binds a short-lived token to actor, entity, rows, and current state", () => {
    const token = issueImportPreviewToken({
      actorId: "admin-1",
      entityType: "deals",
      rowsHash: "rows-1",
      stateHash: "state-1",
      now: 1_000,
    });

    expect(verifyImportPreviewToken({
      token,
      actorId: "admin-1",
      entityType: "deals",
      rowsHash: "rows-1",
      now: 2_000,
    })).toMatchObject({ stateHash: "state-1" });

    expect(() => verifyImportPreviewToken({
      token,
      actorId: "admin-2",
      entityType: "deals",
      rowsHash: "rows-1",
      now: 2_000,
    })).toThrow("invalid or expired");
    expect(() => verifyImportPreviewToken({
      token,
      actorId: "admin-1",
      entityType: "funds",
      rowsHash: "rows-1",
      now: 2_000,
    })).toThrow("invalid or expired");
    expect(() => verifyImportPreviewToken({
      token,
      actorId: "admin-1",
      entityType: "deals",
      rowsHash: "different-rows",
      now: 2_000,
    })).toThrow("invalid or expired");
  });

  it("rejects tampering and expiry", () => {
    const token = issueImportPreviewToken({
      actorId: "admin-1",
      entityType: "portfolio",
      rowsHash: "rows-1",
      stateHash: "state-1",
      now: 10_000,
    });
    expect(() => verifyImportPreviewToken({
      token: `${token.slice(0, -1)}x`,
      actorId: "admin-1",
      entityType: "portfolio",
      rowsHash: "rows-1",
      now: 11_000,
    })).toThrow("invalid or expired");
    expect(() => verifyImportPreviewToken({
      token,
      actorId: "admin-1",
      entityType: "portfolio",
      rowsHash: "rows-1",
      now: 10_000 + IMPORT_PREVIEW_TTL_MS + 1,
    })).toThrow("invalid or expired");
  });

  it("detects a database state change independently of property order", () => {
    const hash = hashImportValue({ rows: [{ id: "1", status: "DRAFT" }] });
    expect(() => assertImportStateHash(hash, { rows: [{ status: "DRAFT", id: "1" }] })).not.toThrow();
    expect(() => assertImportStateHash(hash, { rows: [{ id: "1", status: "PUBLISHED" }] }))
      .toThrow(StaleImportPreviewError);
  });
});

describe("import preview classifications", () => {
  it("rejects every occurrence of a duplicate upload identity", () => {
    expect(Array.from(duplicateImportIdentityIndexes(
      [{ id: "Deal-1" }, { id: "deal-1" }, { id: "deal-2" }],
      (row) => row.id,
    ))).toEqual([0, 1]);
  });

  it("summarizes every row exactly once", () => {
    expect(summarizeImportClassifications([
      "create",
      "update",
      "unchanged",
      "quarantine",
      "error",
    ])).toEqual({
      total: 5,
      valid: 4,
      creates: 1,
      updates: 1,
      unchanged: 1,
      quarantined: 1,
    });
  });
});
