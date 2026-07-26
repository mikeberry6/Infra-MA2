import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import {
  applyReviewedDealSellerDisclosureApproval,
  buildDealSellerDisclosureApprovalTemplate,
  dealSellerDisclosureSha256,
  DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
  loadDealSellerDisclosureReportInput,
  parseReviewedDealSellerDisclosureApproval,
  verifyExactDealSellerDisclosureSha256,
  type DealSellerDisclosureApprovalTemplate,
  type DealSellerDisclosureRemediationTransaction,
  type DealSellerDisclosureReportClient,
  type DealSellerDisclosureReportInput,
  type ReviewedDealSellerDisclosureApproval,
} from "@/modules/operations/deal-seller-disclosure-remediation";

const generatedAt = new Date("2026-07-22T12:00:00.000Z");
const reviewedAt = "2026-07-22T13:00:00.000Z";
const approvalHash = "a".repeat(64);
const context: MaintenanceMutationContext = {
  targetDatabase: "validation",
  releaseSha: "b".repeat(40),
  reviewedBy: "Research Reviewer",
  reason: "Apply exact reviewed seller-disclosure decisions",
};

function deal(overrides: Record<string, unknown> = {}) {
  return {
    id: "deal-1",
    legacyId: "deal-2026-001",
    title: "Example Networks acquisition",
    target: "Example Networks",
    status: "PUBLISHED",
    updatedAt: generatedAt,
    date: new Date("2026-07-01T00:00:00.000Z"),
    dealStatus: "ANNOUNCED",
    country: "United States",
    categories: ["ACQUISITION"],
    sellerDisclosureStatus: "LEGACY_UNREVIEWED",
    sellerDisclosureReason: null,
    participants: [{
      id: "participant-buyer",
      organizationId: "organization-buyer",
      role: "BUYER",
      displayName: "Example Infra",
      organization: { name: "Example Infrastructure" },
    }],
    citations: [{
      id: "citation-1",
      sourceId: "source-1",
      purpose: "SUPPORTING_CONTEXT",
      evidenceLabel: "Transaction announcement",
      isPrimary: true,
      source: {
        label: "Example announcement",
        url: "https://example.com/announcement",
        type: "PRESS_RELEASE",
      },
    }],
    ...overrides,
  };
}

function reportInput(deals = [deal()]): DealSellerDisclosureReportInput {
  return { generatedAt, deals } as unknown as DealSellerDisclosureReportInput;
}

function template(
  input = reportInput(),
): DealSellerDisclosureApprovalTemplate {
  return buildDealSellerDisclosureApprovalTemplate(input);
}

function reviewed(
  base = template(),
  status: "NOT_DISCLOSED" | "NOT_APPLICABLE" = "NOT_DISCLOSED",
): ReviewedDealSellerDisclosureApproval {
  return parseReviewedDealSellerDisclosureApproval({
    ...base,
    reviewedBy: context.reviewedBy,
    reviewedAt,
    items: base.items.map((item) => ({
      ...item,
      decisionStatus: status,
      decisionReason: "The cited announcement does not identify a selling party.",
    })),
  }, new Date("2026-07-22T14:00:00.000Z"));
}

function afterDeal(
  approval = reviewed(),
  overrides: Record<string, unknown> = {},
) {
  const item = approval.items[0];
  return deal({
    updatedAt: new Date("2026-07-22T13:30:00.000Z"),
    sellerDisclosureStatus: item.decisionStatus,
    sellerDisclosureReason: item.decisionReason,
    ...overrides,
  });
}

function exactAudit(approval = reviewed()) {
  const item = approval.items[0];
  const changedFields = [
    item.snapshot.currentSellerDisclosureStatus !== item.decisionStatus
      ? "sellerDisclosureStatus"
      : null,
    item.snapshot.currentSellerDisclosureReason !== item.decisionReason
      ? "sellerDisclosureReason"
      : null,
  ].filter((field): field is string => field !== null);
  return {
    changes: {
      changedFields,
      beforeSellerDisclosureStatus: item.snapshot.currentSellerDisclosureStatus,
      beforeSellerDisclosureReason: item.snapshot.currentSellerDisclosureReason,
      afterSellerDisclosureStatus: item.decisionStatus,
      afterSellerDisclosureReason: item.decisionReason,
      beforeEntityUpdatedAt: item.snapshot.entityUpdatedAt,
      afterEntityUpdatedAt: "2026-07-22T13:30:00.000Z",
    },
    metadata: {
      approvalFile: DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
      approvalSha256: approvalHash,
      approvalSchemaVersion: approval.schemaVersion,
      approvalScope: approval.scope,
      reviewedBy: approval.reviewedBy,
      reviewedAt: approval.reviewedAt,
      executedBy: approval.reviewedBy,
      targetDatabase: context.targetDatabase,
      snapshotSha256: item.snapshotSha256,
      decisionStatus: item.decisionStatus,
      decisionReason: item.decisionReason,
    },
  };
}

function mockTransaction(input: {
  initial: ReturnType<typeof deal>[];
  final: ReturnType<typeof deal>[];
  current?: ReturnType<typeof deal>;
  after?: ReturnType<typeof deal>;
  audits?: ReturnType<typeof exactAudit>[];
}) {
  const dealFindMany = vi.fn()
    .mockResolvedValueOnce(input.initial)
    .mockResolvedValueOnce(input.final);
  const dealFindUnique = vi.fn()
    .mockResolvedValueOnce(input.current ?? input.initial[0])
    .mockResolvedValueOnce(input.after ?? input.final[0]);
  const dealUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
  const auditCreate = vi.fn().mockResolvedValue({ id: "audit-1" });
  const auditFindMany = vi.fn().mockResolvedValue(input.audits ?? []);
  const tx = {
    deal: {
      findMany: dealFindMany,
      findUnique: dealFindUnique,
      updateMany: dealUpdateMany,
    },
    auditEvent: { create: auditCreate, findMany: auditFindMany },
  } as unknown as DealSellerDisclosureRemediationTransaction;
  return {
    tx,
    dealFindMany,
    dealFindUnique,
    dealUpdateMany,
    auditCreate,
    auditFindMany,
  };
}

describe("deal seller-disclosure report", () => {
  it("queries seller-free published deals with complete review evidence", async () => {
    const findMany = vi.fn().mockResolvedValue([deal()]);
    const input = await loadDealSellerDisclosureReportInput({
      deal: { findMany },
    } as unknown as DealSellerDisclosureReportClient, generatedAt);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        status: "PUBLISHED",
        participants: { none: { role: "SELLER" } },
      },
      select: expect.objectContaining({
        sellerDisclosureStatus: true,
        sellerDisclosureReason: true,
        updatedAt: true,
        participants: expect.objectContaining({ orderBy: { id: "asc" } }),
        citations: expect.objectContaining({ orderBy: { id: "asc" } }),
      }),
      orderBy: [{ legacyId: "asc" }, { id: "asc" }],
    });
    expect(input.deals).toHaveLength(1);
  });

  it("filters already reviewed seller-free records without inferring anything", async () => {
    const reviewedDeal = deal({
      id: "deal-reviewed",
      sellerDisclosureStatus: "NOT_APPLICABLE",
      sellerDisclosureReason: "This platform formation does not involve a seller.",
    });
    const findMany = vi.fn().mockResolvedValue([deal(), reviewedDeal]);
    const input = await loadDealSellerDisclosureReportInput({
      deal: { findMany },
    } as unknown as DealSellerDisclosureReportClient, generatedAt);
    expect(input.deals.map((item) => item.id)).toEqual(["deal-1"]);
  });

  it("emits immutable evidence with null decisions and a deterministic hash", () => {
    const report = template();
    expect(report.reviewedBy).toBeNull();
    expect(report.reviewedAt).toBeNull();
    expect(report.items).toHaveLength(1);
    expect(report.items[0]).toMatchObject({
      dealId: "deal-1",
      legacyId: "deal-2026-001",
      target: "Example Networks",
      decisionStatus: null,
      decisionReason: null,
      snapshot: {
        entityStatus: "PUBLISHED",
        currentSellerDisclosureStatus: "LEGACY_UNREVIEWED",
        currentSellerDisclosureReason: null,
        participants: [{ role: "BUYER" }],
        sources: [{ citationId: "citation-1", isPrimary: true }],
      },
    });
    expect(report.items[0].snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("deal seller-disclosure approval validation", () => {
  it.each(["NOT_DISCLOSED", "NOT_APPLICABLE"] as const)(
    "accepts a complete reviewed %s decision",
    (status) => {
      expect(reviewed(template(), status).items[0].decisionStatus).toBe(status);
    },
  );

  it("rejects a template that still contains null decisions", () => {
    expect(() => parseReviewedDealSellerDisclosureApproval(template()))
      .toThrow("reviewedBy must be a non-empty string");
  });

  it("rejects unsupported states and short reasons", () => {
    const base = template();
    const approval = {
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        decisionStatus: "DISCLOSED",
        decisionReason: "short",
      })),
    };
    expect(() => parseReviewedDealSellerDisclosureApproval(
      approval,
      new Date("2026-07-22T14:00:00.000Z"),
    )).toThrow("must be NOT_DISCLOSED or NOT_APPLICABLE");

    approval.items[0].decisionStatus = "NOT_DISCLOSED";
    expect(() => parseReviewedDealSellerDisclosureApproval(
      approval,
      new Date("2026-07-22T14:00:00.000Z"),
    )).toThrow("at least 10 non-whitespace characters");
  });

  it("rejects changed identity or evidence even when the decision is valid", () => {
    const base = template();
    const value = {
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        target: "Changed Target",
        decisionStatus: "NOT_DISCLOSED",
        decisionReason: "The cited announcement does not identify a selling party.",
      })),
    };
    expect(() => parseReviewedDealSellerDisclosureApproval(
      value,
      new Date("2026-07-22T14:00:00.000Z"),
    )).toThrow("identity fields must exactly match");

    value.items[0].target = base.items[0].target;
    value.items[0].snapshot.sources[0].sourceUrl = "https://example.com/changed";
    expect(() => parseReviewedDealSellerDisclosureApproval(
      value,
      new Date("2026-07-22T14:00:00.000Z"),
    )).toThrow("snapshotSha256 does not match");
  });

  it("rejects a missing-seller decision if retained evidence names a seller", () => {
    const base = template();
    const changedItem = {
      ...base.items[0],
      snapshot: {
        ...base.items[0].snapshot,
        participants: [{
          participantId: "seller-1",
          organizationId: "seller-org",
          organizationName: "Named Seller",
          role: "SELLER",
          displayName: null,
        }],
      },
    };
    changedItem.snapshotSha256 = dealSellerDisclosureSha256(JSON.stringify({
      dealId: changedItem.dealId,
      legacyId: changedItem.legacyId,
      target: changedItem.target,
      snapshot: changedItem.snapshot,
    }));
    const value = {
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: [{
        ...changedItem,
        decisionStatus: "NOT_DISCLOSED",
        decisionReason: "The cited announcement does not identify a selling party.",
      }],
    };
    expect(() => parseReviewedDealSellerDisclosureApproval(
      value,
      new Date("2026-07-22T14:00:00.000Z"),
    )).toThrow("already contains a named seller");
  });

  it("requires an exact lowercase approval digest", () => {
    const bytes = Buffer.from("reviewed approval");
    const digest = createHash("sha256").update(bytes).digest("hex");
    expect(verifyExactDealSellerDisclosureSha256(bytes, digest)).toBe(digest);
    expect(() => verifyExactDealSellerDisclosureSha256(bytes, digest.toUpperCase()))
      .toThrow("exact lowercase");
    expect(() => verifyExactDealSellerDisclosureSha256(bytes, "0".repeat(64)))
      .toThrow("SHA-256 mismatch");
  });
});

describe("deal seller-disclosure transactional apply", () => {
  it("updates only the two reviewed fields and records complete provenance", async () => {
    const approval = reviewed();
    const after = afterDeal(approval);
    const mock = mockTransaction({ initial: [deal()], final: [], after });
    const result = await applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    );

    expect(result).toEqual({
      updated: 1,
      unchanged: 0,
      auditEvents: 1,
      remainingPublishedDealsMissingReviewedSellerTreatment: 0,
    });
    expect(mock.dealUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: "deal-1",
        status: "PUBLISHED",
        sellerDisclosureStatus: "LEGACY_UNREVIEWED",
        sellerDisclosureReason: null,
        participants: { none: { role: "SELLER" } },
      }),
      data: {
        sellerDisclosureStatus: "NOT_DISCLOSED",
        sellerDisclosureReason: approval.items[0].decisionReason,
      },
    }));
    expect(Object.keys(mock.dealUpdateMany.mock.calls[0][0].data).sort()).toEqual([
      "sellerDisclosureReason",
      "sellerDisclosureStatus",
    ]);
    expect(mock.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: null,
        entityType: "Deal",
        entityId: "deal-1",
        action: "DEAL_SELLER_DISCLOSURE_REMEDIATION",
        changes: {
          changedFields: ["sellerDisclosureStatus", "sellerDisclosureReason"],
          beforeSellerDisclosureStatus: "LEGACY_UNREVIEWED",
          beforeSellerDisclosureReason: null,
          afterSellerDisclosureStatus: "NOT_DISCLOSED",
          afterSellerDisclosureReason: approval.items[0].decisionReason,
          beforeEntityUpdatedAt: approval.items[0].snapshot.entityUpdatedAt,
          afterEntityUpdatedAt: "2026-07-22T13:30:00.000Z",
        },
        metadata: expect.objectContaining({
          approvalFile: DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
          approvalSha256: approvalHash,
          reviewedBy: context.reviewedBy,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          snapshotSha256: approval.items[0].snapshotSha256,
        }),
      }),
    });
  });

  it("records only the reason when a reviewed state already exists with an inadequate reason", async () => {
    const before = deal({
      sellerDisclosureStatus: "NOT_DISCLOSED",
      sellerDisclosureReason: "too short",
    });
    const approval = reviewed(template(reportInput([before])));
    const after = afterDeal(approval);
    const mock = mockTransaction({ initial: [before], final: [], current: before, after });

    await applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    );

    expect(mock.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changes: expect.objectContaining({
          changedFields: ["sellerDisclosureReason"],
        }),
      }),
    });
  });

  it("permits an exact audited no-op replay from a later release SHA on the same target", async () => {
    const approval = reviewed();
    const current = afterDeal(approval);
    const mock = mockTransaction({
      initial: [],
      final: [],
      current,
      audits: [exactAudit(approval)],
    });
    const result = await applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      { ...context, releaseSha: "c".repeat(40), reason: "Revalidate exact prior decision" },
    );
    expect(result).toMatchObject({ updated: 0, unchanged: 1, auditEvents: 0 });
    expect(mock.dealUpdateMany).not.toHaveBeenCalled();
    expect(mock.auditCreate).not.toHaveBeenCalled();
  });

  it("permits an exact audited replay when the reviewed mutation changed only the reason", async () => {
    const before = deal({
      sellerDisclosureStatus: "NOT_DISCLOSED",
      sellerDisclosureReason: "too short",
    });
    const approval = reviewed(template(reportInput([before])));
    const mock = mockTransaction({
      initial: [],
      final: [],
      current: afterDeal(approval),
      audits: [exactAudit(approval)],
    });

    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).resolves.toMatchObject({ updated: 0, unchanged: 1, auditEvents: 0 });
  });

  it("rejects an apparent replay without the exact prior audit", async () => {
    const approval = reviewed();
    const mock = mockTransaction({ initial: [], final: [], current: afterDeal(approval) });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound seller-disclosure remediation audit");
  });

  it("rejects a malformed audit whose changed-field encoding only collides after joining", async () => {
    const approval = reviewed();
    const malformedAudit = exactAudit(approval);
    malformedAudit.changes.changedFields = [
      "sellerDisclosureReason\0sellerDisclosureStatus",
    ];
    const mock = mockTransaction({
      initial: [],
      final: [],
      current: afterDeal(approval),
      audits: [malformedAudit],
    });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound seller-disclosure remediation audit");
  });

  it("rejects replay after any later Deal-row update changes updatedAt", async () => {
    const approval = reviewed();
    const current = afterDeal(approval, {
      updatedAt: new Date("2026-07-22T14:30:00.000Z"),
    });
    const mock = mockTransaction({
      initial: [],
      final: [],
      current,
      audits: [exactAudit(approval)],
    });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound seller-disclosure remediation audit");
  });

  it("rejects drift in the deal, participants, or source evidence", async () => {
    const approval = reviewed();
    const drifted = deal({ country: "Canada" });
    const mock = mockTransaction({ initial: [drifted], final: [], current: drifted });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("changed after the approval template was generated");
    expect(mock.dealUpdateMany).not.toHaveBeenCalled();
  });

  it("fails before writes when a current seller-treatment issue is not approved", async () => {
    const approval = reviewed();
    const extra = deal({ id: "deal-2", legacyId: "deal-2026-002", target: "Other Deal" });
    const mock = mockTransaction({ initial: [deal(), extra], final: [] });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("incomplete for current seller-disclosure issues");
    expect(mock.dealUpdateMany).not.toHaveBeenCalled();
  });

  it("rolls back when the final published seller-treatment gate is not clean", async () => {
    const approval = reviewed();
    const after = afterDeal(approval);
    const remaining = deal({ id: "deal-2", legacyId: "deal-2026-002" });
    const mock = mockTransaction({ initial: [deal()], final: [remaining], after });
    await expect(applyReviewedDealSellerDisclosureApproval(
      mock.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("Published seller-treatment gate remains incomplete");
  });
});
