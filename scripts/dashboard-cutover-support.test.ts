import { describe, expect, it } from "vitest";
import {
  assertApprovalContext,
  assertDashboardWritesFrozen,
  buildApproval,
  exactAuditExists,
  parseReviewedApproval,
  snapshotSha256,
  stableJson,
} from "./dashboard-cutover-support";

const migrationStartedAt = new Date("2026-07-22T19:00:00.000Z");

describe("dashboard cutover approval support", () => {
  it("requires an explicit dashboard write freeze for mutations", () => {
    expect(() => assertDashboardWritesFrozen({ DASHBOARD_WRITES_ENABLED: "true" }))
      .toThrow("must exactly equal false");
    expect(() => assertDashboardWritesFrozen({ DASHBOARD_WRITES_ENABLED: undefined }))
      .toThrow("must exactly equal false");
    expect(() => assertDashboardWritesFrozen({ DASHBOARD_WRITES_ENABLED: "false" }))
      .not.toThrow();
  });

  it("canonicalizes nested JSON before hashing", () => {
    expect(stableJson({ z: 1, a: { y: 2, x: 3 } }))
      .toBe(stableJson({ a: { x: 3, y: 2 }, z: 1 }));
    expect(snapshotSha256({ z: 1, a: 2 })).toMatch(/^[a-f0-9]{64}$/);
  });

  it("builds deterministic reviewer-neutral evidence bound to the migration", () => {
    const first = buildApproval({
      scope: "TEST_SCOPE",
      migrationName: "migration",
      migrationStartedAt,
      instructions: ["Review."],
      items: [{ id: "row-1" }],
    });
    const second = buildApproval({
      scope: "TEST_SCOPE",
      migrationName: "migration",
      migrationStartedAt,
      instructions: ["Review."],
      items: [{ id: "row-1" }],
    });
    expect(first).toEqual(second);
    expect(first).toMatchObject({ reviewedBy: null, reviewedAt: null, generatedAt: migrationStartedAt.toISOString() });
  });

  it("requires reviewed identity and matching execution context", () => {
    const template = buildApproval({
      scope: "TEST_SCOPE",
      migrationName: "migration",
      migrationStartedAt,
      instructions: ["Review."],
      items: [{ id: "row-1" }],
    });
    const approval = parseReviewedApproval(
      { ...template, reviewedBy: "Research Owner", reviewedAt: "2026-07-22T20:00:00.000Z" },
      "TEST_SCOPE",
      "migration",
      (items) => items as Array<{ id: string }>,
      new Date("2026-07-22T21:00:00.000Z"),
    );
    expect(() => assertApprovalContext(approval, {
      targetDatabase: "production",
      releaseSha: "a".repeat(40),
      reviewedBy: "Different Reviewer",
      reason: "Reviewed cutover",
    })).toThrow("exactly match");
  });

  it("recognizes idempotency only from the exact approval digest", () => {
    expect(exactAuditExists([
      { metadata: { approvalSha256: "a".repeat(64) } },
      { metadata: { approvalSha256: "b".repeat(64) } },
    ], "b".repeat(64))).toBe(true);
    expect(exactAuditExists([{ metadata: { approvalSha256: "a".repeat(64) } }], "c".repeat(64))).toBe(false);
  });
});
