import { describe, expect, it } from "vitest";
import { draftDeletionBlockReason, toAuditSnapshot } from "@/modules/admin/deletion";

describe("hard-delete policy", () => {
  const cleanDraft = {
    status: "DRAFT" as const,
    lastVerifiedAt: null,
    publicationAuditCount: 0,
    blockingDependencies: {},
  };

  it("allows only a never-published, dependency-free draft", () => {
    expect(draftDeletionBlockReason(cleanDraft)).toBeNull();
    for (const status of ["IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const) {
      expect(draftDeletionBlockReason({ ...cleanDraft, status })).toContain("Use Archive");
    }
  });

  it("preserves records with publication evidence or dependent links", () => {
    expect(draftDeletionBlockReason({ ...cleanDraft, lastVerifiedAt: new Date() })).toContain("publication history");
    expect(draftDeletionBlockReason({ ...cleanDraft, publicationAuditCount: 1 })).toContain("publication history");
    expect(draftDeletionBlockReason({
      ...cleanDraft,
      blockingDependencies: { redirects: 2, "news mentions": 1, empty: 0 },
    })).toBe("Delete blocked by dependent records: redirects (2), news mentions (1). Remove or reconcile those links first.");
  });

  it("creates a durable JSON-compatible before snapshot", () => {
    expect(toAuditSnapshot({ id: "draft-1", updatedAt: new Date("2026-07-22T12:00:00Z") })).toEqual({
      id: "draft-1",
      updatedAt: "2026-07-22T12:00:00.000Z",
    });
  });
});
