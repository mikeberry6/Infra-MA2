import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import {
  applyReviewedOwnershipFundLinkApproval,
  buildOwnershipFundLinkApprovalTemplate,
  loadOwnershipFundLinkReportInput,
  OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH,
  parseReviewedOwnershipFundLinkApproval,
  verifyExactOwnershipFundLinkSha256,
  type OwnershipFundLinkApprovalTemplate,
  type OwnershipFundLinkRemediationTransaction,
  type OwnershipFundLinkReportClient,
  type OwnershipFundLinkReportInput,
  type ReviewedOwnershipFundLinkApproval,
} from "@/modules/operations/ownership-fund-link-remediation";

const generatedAt = new Date("2026-07-22T12:00:00.000Z");
const reviewedAt = "2026-07-22T13:00:00.000Z";
const approvalHash = "a".repeat(64);
const context: MaintenanceMutationContext = {
  targetDatabase: "validation",
  releaseSha: "b".repeat(40),
  reviewedBy: "Research Reviewer",
  reason: "Apply the exact reviewed ownership-fund approval",
};

const funds = [
  { id: "fund-alpha", fundName: "Alpha Infrastructure Fund", status: "PUBLISHED" },
  { id: "fund-beta", fundName: "Beta Infrastructure Fund, L.P.", status: "PUBLISHED" },
];

function ownership(overrides: Record<string, unknown> = {}) {
  return {
    id: "ownership-1",
    companyId: "company-1",
    fundId: "fund-alpha",
    fund: funds[0],
    organizationId: "organization-1",
    vehicleName: "Beta Infrastructure Fund L.P.",
    stake: "40%",
    investmentYear: 2021,
    exitYear: null,
    isActive: true,
    createdAt: generatedAt,
    company: {
      id: "company-1",
      name: "Example Networks",
      status: "PUBLISHED",
      updatedAt: generatedAt,
    },
    ...overrides,
  };
}

function reportInput(
  ownerships = [ownership()],
  reportFunds = funds,
): OwnershipFundLinkReportInput {
  return {
    generatedAt,
    ownerships,
    funds: reportFunds,
  } as unknown as OwnershipFundLinkReportInput;
}

function template(input = reportInput()): OwnershipFundLinkApprovalTemplate {
  return buildOwnershipFundLinkApprovalTemplate(input);
}

function reviewedLink(base = template()): ReviewedOwnershipFundLinkApproval {
  return parseReviewedOwnershipFundLinkApproval({
    ...base,
    reviewedBy: context.reviewedBy,
    reviewedAt,
    items: base.items.map((item) => ({
      ...item,
      action: "LINK",
      selectedFundId: "fund-beta",
    })),
  }, new Date("2026-07-22T14:00:00.000Z"));
}

function unlinkTemplate(): OwnershipFundLinkApprovalTemplate {
  return template(reportInput([
    ownership({ vehicleName: "Undisclosed Vehicle" }),
  ]));
}

function reviewedUnlink(): ReviewedOwnershipFundLinkApproval {
  const base = unlinkTemplate();
  return parseReviewedOwnershipFundLinkApproval({
    ...base,
    reviewedBy: context.reviewedBy,
    reviewedAt,
    items: base.items.map((item) => ({ ...item, action: "UNLINK", selectedFundId: null })),
  }, new Date("2026-07-22T14:00:00.000Z"));
}

function mockTransaction(input: {
  initial: ReturnType<typeof ownership>[];
  final: ReturnType<typeof ownership>[];
  afterUpdate?: ReturnType<typeof ownership>;
  audits?: Array<{ changes: unknown; metadata: unknown }>;
  reportFunds?: typeof funds;
  ownershipsWithoutInvestor?: number;
}) {
  const ownershipFindMany = vi.fn()
    .mockResolvedValueOnce(input.initial)
    .mockResolvedValueOnce(input.final);
  const fundFindMany = vi.fn().mockResolvedValue(input.reportFunds ?? funds);
  const ownershipUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
  const ownershipCount = vi.fn().mockResolvedValue(input.ownershipsWithoutInvestor ?? 0);
  const ownershipFindUnique = vi.fn().mockResolvedValue(input.afterUpdate ?? input.final[0]);
  const auditCreate = vi.fn().mockResolvedValue({ id: "audit-1" });
  const auditFindMany = vi.fn().mockResolvedValue(input.audits ?? []);
  const tx = {
    ownershipPeriod: {
      findMany: ownershipFindMany,
      findUnique: ownershipFindUnique,
      updateMany: ownershipUpdateMany,
      count: ownershipCount,
    },
    fund: { findMany: fundFindMany },
    auditEvent: { create: auditCreate, findMany: auditFindMany },
  } as unknown as OwnershipFundLinkRemediationTransaction;
  return {
    tx,
    ownershipFindMany,
    fundFindMany,
    ownershipUpdateMany,
    ownershipCount,
    ownershipFindUnique,
    auditCreate,
    auditFindMany,
  };
}

describe("ownership-fund link report", () => {
  it("queries the same published-company scope with complete remediation state", async () => {
    const ownershipFindMany = vi.fn().mockResolvedValue([]);
    const fundFindMany = vi.fn().mockResolvedValue([]);
    await loadOwnershipFundLinkReportInput({
      ownershipPeriod: { findMany: ownershipFindMany },
      fund: { findMany: fundFindMany },
    } as unknown as OwnershipFundLinkReportClient, generatedAt);

    expect(ownershipFindMany).toHaveBeenCalledWith({
      where: { company: { status: "PUBLISHED" } },
      select: expect.objectContaining({
        fundId: true,
        fund: { select: { id: true, fundName: true, status: true } },
        vehicleName: true,
        organizationId: true,
        stake: true,
        investmentYear: true,
        exitYear: true,
        isActive: true,
        createdAt: true,
        company: expect.any(Object),
      }),
      orderBy: { id: "asc" },
    });
    expect(fundFindMany).toHaveBeenCalledWith({
      select: { id: true, fundName: true, status: true },
      orderBy: { id: "asc" },
    });
  });

  it("reports only findOwnershipFundIssues results without choosing an action", () => {
    const clean = ownership({
      id: "ownership-clean",
      companyId: "company-clean",
      fundId: "fund-alpha",
      fund: funds[0],
      vehicleName: "Alpha Infrastructure Fund",
      company: {
        id: "company-clean",
        name: "Clean Company",
        status: "PUBLISHED",
        updatedAt: generatedAt,
      },
    });
    const report = template(reportInput([clean, ownership()]));
    expect(report.reviewedBy).toBeNull();
    expect(report.reviewedAt).toBeNull();
    expect(report.items).toHaveLength(1);
    expect(report.items[0]).toMatchObject({
      ownershipId: "ownership-1",
      issueCode: "LINKED_FUND_NAME_MISMATCH",
      normalizedVehicleName: "beta infrastructure fund l p",
      action: null,
      selectedFundId: null,
      candidates: [{
        fundId: "fund-beta",
        fundName: "Beta Infrastructure Fund, L.P.",
        normalizedFundName: "beta infrastructure fund l p",
        fundStatus: "PUBLISHED",
      }],
    });
    expect(report.items[0].snapshot).toMatchObject({
      vehicleName: "Beta Infrastructure Fund L.P.",
      fundId: "fund-alpha",
      linkedFund: {
        fundId: "fund-alpha",
        fundName: "Alpha Infrastructure Fund",
        fundStatus: "PUBLISHED",
      },
      stake: "40%",
    });
    expect(report.items[0].snapshotSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("offers only PUBLISHED exact-name Fund candidates and snapshots their status", () => {
    const report = template(reportInput([ownership()], [
      ...funds,
      { id: "fund-beta-draft", fundName: "Beta Infrastructure Fund L.P.", status: "DRAFT" },
      { id: "fund-beta-archived", fundName: "Beta Infrastructure Fund L.P.!", status: "ARCHIVED" },
    ]));
    expect(report.items[0].candidates).toEqual([{
      fundId: "fund-beta",
      fundName: "Beta Infrastructure Fund, L.P.",
      normalizedFundName: "beta infrastructure fund l p",
      fundStatus: "PUBLISHED",
    }]);
  });

  it("reports a linked nonpublished Fund but does not offer it as a candidate", () => {
    const draftFund = {
      id: "fund-beta-draft",
      fundName: "Beta Infrastructure Fund L.P.",
      status: "DRAFT",
    };
    const report = template(reportInput([
      ownership({
        fundId: draftFund.id,
        fund: draftFund,
        vehicleName: draftFund.fundName,
      }),
    ], [draftFund]));

    expect(report.items).toHaveLength(1);
    expect(report.items[0]).toMatchObject({
      issueCode: "BROKEN_FUND_LINK",
      candidates: [],
      snapshot: {
        fundId: draftFund.id,
        linkedFund: {
          fundId: draftFund.id,
          fundStatus: "DRAFT",
        },
      },
    });
  });

  it("does not create an impossible missing-link item for an unpublished-only match", () => {
    const draftFund = {
      id: "fund-beta-draft",
      fundName: "Beta Infrastructure Fund L.P.",
      status: "DRAFT",
    };
    const report = template(reportInput([
      ownership({
        fundId: null,
        fund: null,
        vehicleName: draftFund.fundName,
      }),
    ], [draftFund]));

    expect(report.items).toEqual([]);
  });

  it("hashes exact bytes and rejects changed or non-lowercase digests", () => {
    const raw = `${JSON.stringify(template(), null, 2)}\n`;
    const digest = createHash("sha256").update(raw).digest("hex");
    expect(verifyExactOwnershipFundLinkSha256(raw, digest)).toBe(digest);
    expect(() => verifyExactOwnershipFundLinkSha256(`${raw} `, digest)).toThrow("mismatch");
    expect(() => verifyExactOwnershipFundLinkSha256(raw, digest.toUpperCase())).toThrow("exact lowercase");
  });
});

describe("ownership-fund link approval validation", () => {
  it("requires reviewer identity and an exact listed normalized LINK target", () => {
    const base = template();
    expect(() => parseReviewedOwnershipFundLinkApproval(base)).toThrow("reviewedBy");
    expect(() => parseReviewedOwnershipFundLinkApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({ ...item, action: "LINK", selectedFundId: "fund-alpha" })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("listed exact normalized candidate");
    expect(reviewedLink().items[0]).toMatchObject({ action: "LINK", selectedFundId: "fund-beta" });
  });

  it("allows UNLINK only when it changes fundId and does not create a unique missing link", () => {
    expect(reviewedUnlink().items[0]).toMatchObject({ action: "UNLINK", selectedFundId: null });
    const base = template();
    expect(() => parseReviewedOwnershipFundLinkApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({ ...item, action: "UNLINK", selectedFundId: null })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("select LINK instead");
  });

  it("rejects UNLINK when it would leave the ownership without any investor", () => {
    const base = unlinkTemplate();
    const item = base.items[0];
    const evidence = {
      ownershipId: item.ownershipId,
      issueCode: item.issueCode,
      issueMessage: item.issueMessage,
      normalizedVehicleName: item.normalizedVehicleName,
      snapshot: { ...item.snapshot, organizationId: null },
      candidates: item.candidates,
    };
    const snapshotSha256 = createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
    expect(() => parseReviewedOwnershipFundLinkApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: [{
        ...item,
        snapshot: evidence.snapshot,
        snapshotSha256,
        action: "UNLINK",
        selectedFundId: null,
      }],
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("both fundId and organizationId null");
  });

  it("rejects reviewer edits to snapshots or normalized candidates", () => {
    const base = template();
    expect(() => parseReviewedOwnershipFundLinkApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        snapshot: { ...item.snapshot, stake: "50%" },
        action: "LINK",
        selectedFundId: "fund-beta",
      })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("snapshotSha256");
  });

  it("rejects an unpublished Fund even if its normalized name matches", () => {
    const base = template();
    expect(() => parseReviewedOwnershipFundLinkApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        candidates: item.candidates.map((candidate) => ({ ...candidate, fundStatus: "DRAFT" })),
        action: "LINK",
        selectedFundId: "fund-beta",
      })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("fundStatus must remain PUBLISHED");
  });
});

describe("ownership-fund link transactional apply", () => {
  it("rejects an execution reviewer mismatch before reading state", async () => {
    const after = ownership({ fundId: "fund-beta", fund: funds[1] });
    const mocks = mockTransaction({ initial: [ownership()], final: [after], afterUpdate: after });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedLink(),
      approvalHash,
      { ...context, reviewedBy: "Different Reviewer" },
    )).rejects.toThrow("exactly match the committed approval reviewer");
    expect(mocks.ownershipFindMany).not.toHaveBeenCalled();
    expect(mocks.ownershipUpdateMany).not.toHaveBeenCalled();
  });

  it("LINK changes only fundId and records complete approval provenance", async () => {
    const after = ownership({ fundId: "fund-beta", fund: funds[1] });
    const mocks = mockTransaction({ initial: [ownership()], final: [after], afterUpdate: after });
    const approval = reviewedLink();
    const result = await applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      approval,
      approvalHash,
      context,
    );

    expect(result).toEqual({
      updated: 1,
      unchanged: 0,
      auditEvents: 1,
      remainingOwnershipFundIssues: 0,
      remainingOwnershipsWithoutInvestor: 0,
    });
    expect(mocks.ownershipUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "ownership-1",
        fundId: "fund-alpha",
        vehicleName: "Beta Infrastructure Fund L.P.",
        stake: "40%",
      }),
      data: { fundId: "fund-beta" },
    });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: null,
        entityType: "OwnershipPeriod",
        entityId: "ownership-1",
        action: "OWNERSHIP_FUND_LINK_REMEDIATION",
        changes: {
          changedFields: ["fundId"],
          beforeFundId: "fund-alpha",
          afterFundId: "fund-beta",
        },
        metadata: expect.objectContaining({
          approvalFile: OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH,
          approvalSha256: approvalHash,
          reviewedBy: context.reviewedBy,
          reviewedAt,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          remediationAction: "LINK",
          selectedFundId: "fund-beta",
          snapshotSha256: approval.items[0].snapshotSha256,
        }),
      }),
    });
  });

  it("UNLINK sets fundId to null without rewriting vehicle or editorial fields", async () => {
    const before = ownership({ vehicleName: "Undisclosed Vehicle" });
    const after = ownership({ vehicleName: "Undisclosed Vehicle", fundId: null, fund: null });
    const mocks = mockTransaction({ initial: [before], final: [after], afterUpdate: after });
    const result = await applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedUnlink(),
      approvalHash,
      context,
    );
    expect(result.updated).toBe(1);
    expect(mocks.ownershipUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { fundId: null },
      where: expect.objectContaining({ vehicleName: "Undisclosed Vehicle", stake: "40%" }),
    }));
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changes: expect.objectContaining({ afterFundId: null }),
        metadata: expect.objectContaining({ remediationAction: "UNLINK", selectedFundId: null }),
      }),
    });
  });

  it("rejects snapshot drift before any write", async () => {
    const drifted = ownership({ stake: "50%" });
    const after = ownership({ fundId: "fund-beta", fund: funds[1], stake: "50%" });
    const mocks = mockTransaction({ initial: [drifted], final: [after], afterUpdate: after });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedLink(),
      approvalHash,
      context,
    )).rejects.toThrow("snapshot or normalized Fund candidates changed");
    expect(mocks.ownershipUpdateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it("rejects a LINK candidate whose Fund status changed after review", async () => {
    const after = ownership({
      fundId: "fund-beta",
      fund: { ...funds[1], status: "DRAFT" },
    });
    const mocks = mockTransaction({
      initial: [ownership()],
      final: [after],
      afterUpdate: after,
      reportFunds: [funds[0], { ...funds[1], status: "DRAFT" }],
    });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedLink(),
      approvalHash,
      context,
    )).rejects.toThrow("snapshot or normalized Fund candidates changed");
    expect(mocks.ownershipUpdateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it("is idempotent for the exact reviewed after-state and approval audit across release descendants", async () => {
    const approval = reviewedLink();
    const after = ownership({ fundId: "fund-beta", fund: funds[1] });
    const item = approval.items[0];
    const audit = {
      changes: {
        changedFields: ["fundId"],
        beforeFundId: "fund-alpha",
        afterFundId: "fund-beta",
      },
      metadata: {
        approvalFile: OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH,
        approvalSha256: approvalHash,
        approvalSchemaVersion: approval.schemaVersion,
        approvalScope: approval.scope,
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
        executedBy: context.reviewedBy,
        mutationReason: context.reason,
        releaseSha: context.releaseSha,
        targetDatabase: context.targetDatabase,
        remediationAction: "LINK",
        issueCode: item.issueCode,
        normalizedVehicleName: item.normalizedVehicleName,
        snapshotSha256: item.snapshotSha256,
        selectedFundId: "fund-beta",
        candidateFundIds: ["fund-beta"],
      },
    };
    const mocks = mockTransaction({ initial: [after], final: [after], audits: [audit] });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      approval,
      approvalHash,
      context,
    )).resolves.toEqual({
      updated: 0,
      unchanged: 1,
      auditEvents: 0,
      remainingOwnershipFundIssues: 0,
      remainingOwnershipsWithoutInvestor: 0,
    });
    expect(mocks.ownershipUpdateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();

    const descendantReplay = mockTransaction({ initial: [after], final: [after], audits: [audit] });
    await expect(applyReviewedOwnershipFundLinkApproval(
      descendantReplay.tx,
      approval,
      approvalHash,
      {
        ...context,
        releaseSha: "c".repeat(40),
        reason: "Revalidate the retained approval on a descendant release",
      },
    )).resolves.toMatchObject({ updated: 0, unchanged: 1, auditEvents: 0 });
    expect(descendantReplay.ownershipUpdateMany).not.toHaveBeenCalled();
    expect(descendantReplay.auditCreate).not.toHaveBeenCalled();

    const noAudit = mockTransaction({ initial: [after], final: [after], audits: [] });
    await expect(applyReviewedOwnershipFundLinkApproval(
      noAudit.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound ownership-fund remediation audit");

    const wrongTarget = mockTransaction({
      initial: [after],
      final: [after],
      audits: [{
        ...audit,
        metadata: { ...audit.metadata, targetDatabase: "production" },
      }],
    });
    await expect(applyReviewedOwnershipFundLinkApproval(
      wrongTarget.tx,
      approval,
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound ownership-fund remediation audit");
  });

  it("rejects approvals that omit a current integrity issue", async () => {
    const extra = ownership({
      id: "ownership-2",
      companyId: "company-2",
      fundId: null,
      fund: null,
      company: {
        id: "company-2",
        name: "Second Company",
        status: "PUBLISHED",
        updatedAt: generatedAt,
      },
    });
    const after = ownership({ fundId: "fund-beta", fund: funds[1] });
    const mocks = mockTransaction({ initial: [ownership(), extra], final: [after, extra], afterUpdate: after });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedLink(),
      approvalHash,
      context,
    )).rejects.toThrow("incomplete for current ownership-fund issues");
    expect(mocks.ownershipUpdateMany).not.toHaveBeenCalled();
  });

  it("rolls back when any ownership would remain without a fund or organization", async () => {
    const after = ownership({ fundId: "fund-beta", fund: funds[1] });
    const mocks = mockTransaction({
      initial: [ownership()],
      final: [after],
      afterUpdate: after,
      ownershipsWithoutInvestor: 1,
    });
    await expect(applyReviewedOwnershipFundLinkApproval(
      mocks.tx,
      reviewedLink(),
      approvalHash,
      context,
    )).rejects.toThrow("ownership(s) without an investor");
    expect(mocks.ownershipCount).toHaveBeenCalledWith({
      where: { fundId: null, organizationId: null },
    });
    expect(mocks.auditCreate).toHaveBeenCalledOnce();
  });
});
