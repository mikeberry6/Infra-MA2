import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import {
  applyReviewedFundPrimarySourceApproval,
  buildFundPrimarySourceApprovalTemplate,
  buildFundPrimarySourceCandidates,
  FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
  loadFundPrimarySourceReportInput,
  parseReviewedFundPrimarySourceApproval,
  verifyExactFundPrimarySourceSha256,
  type FundPrimarySourceApprovalTemplate,
  type FundPrimarySourceRemediationTransaction,
  type FundPrimarySourceReportClient,
  type FundPrimarySourceReportInput,
  type ReviewedFundPrimarySourceApproval,
} from "@/modules/operations/fund-primary-source-remediation";

const generatedAt = new Date("2026-07-22T12:00:00.000Z");
const reviewedAt = "2026-07-22T13:00:00.000Z";
const resultingUpdatedAt = new Date("2026-07-22T13:10:00.000Z");
const approvalHash = "a".repeat(64);
const selectedUrl = "https://manager.example.com/fund/alpha";
const context: MaintenanceMutationContext = {
  targetDatabase: "validation",
  releaseSha: "b".repeat(40),
  reviewedBy: "Research Reviewer",
  reason: "Apply the exact reviewed Fund primary-source approval",
};

function fund(overrides: Record<string, unknown> = {}) {
  return {
    id: "fund-alpha-id",
    legacyId: "FUND-001",
    fundName: "Alpha Infrastructure Fund",
    status: "PUBLISHED",
    updatedAt: generatedAt,
    sourceUrls: [
      "https://support.example.com/alpha",
      selectedUrl,
    ],
    strategyUrl: selectedUrl,
    primarySourceUrl: null,
    ...overrides,
  };
}

function reportInput(funds = [fund()]): FundPrimarySourceReportInput {
  return { generatedAt, funds } as unknown as FundPrimarySourceReportInput;
}

function template(
  input = reportInput(),
): FundPrimarySourceApprovalTemplate {
  return buildFundPrimarySourceApprovalTemplate(input);
}

function reviewed(
  base = template(),
): ReviewedFundPrimarySourceApproval {
  return parseReviewedFundPrimarySourceApproval({
    ...base,
    reviewedBy: context.reviewedBy,
    reviewedAt,
    items: base.items.map((item) => ({
      ...item,
      selectedPrimarySourceUrl: selectedUrl,
    })),
  }, new Date("2026-07-22T14:00:00.000Z"));
}

function exactReplayAudit(approval = reviewed()) {
  const item = approval.items[0];
  return {
    changes: {
      changedFields: ["primarySourceUrl"],
      beforePrimarySourceUrl: item.currentPrimarySourceUrl,
      afterPrimarySourceUrl: item.selectedPrimarySourceUrl,
    },
    metadata: {
      approvalFile: FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
      approvalSha256: approvalHash,
      approvalSchemaVersion: approval.schemaVersion,
      approvalScope: approval.scope,
      reviewedBy: approval.reviewedBy,
      reviewedAt: approval.reviewedAt,
      executedBy: context.reviewedBy,
      mutationReason: context.reason,
      releaseSha: context.releaseSha,
      targetDatabase: context.targetDatabase,
      targetFundLegacyId: item.legacyId,
      targetFundName: item.fundName,
      templateFundUpdatedAt: item.fundUpdatedAt,
      resultingFundUpdatedAt: resultingUpdatedAt.toISOString(),
      selectedPrimarySourceUrl: item.selectedPrimarySourceUrl,
      candidatePrimarySourceUrls: item.candidates.map((candidate) => candidate.sourceUrl),
    },
  };
}

function mockTransaction(input: {
  initial?: ReturnType<typeof fund>[];
  final?: Array<{ legacyId: string; primarySourceUrl: string | null }>;
  resulting?: { primarySourceUrl: string | null; updatedAt: Date } | null;
  audits?: Array<{ changes: unknown; metadata: unknown }>;
  updateCount?: number;
}) {
  const initial = input.initial ?? [fund()];
  const final = input.final ?? [{ legacyId: "FUND-001", primarySourceUrl: selectedUrl }];
  const findMany = vi.fn()
    .mockResolvedValueOnce(initial)
    .mockResolvedValueOnce(final);
  const updateMany = vi.fn().mockResolvedValue({ count: input.updateCount ?? 1 });
  const findUnique = vi.fn().mockResolvedValue(
    input.resulting === undefined
      ? { primarySourceUrl: selectedUrl, updatedAt: resultingUpdatedAt }
      : input.resulting,
  );
  const auditCreate = vi.fn().mockResolvedValue({ id: "audit-1" });
  const auditFindMany = vi.fn().mockResolvedValue(input.audits ?? []);
  const tx = {
    fund: { findMany, updateMany, findUnique },
    auditEvent: { create: auditCreate, findMany: auditFindMany },
  } as unknown as FundPrimarySourceRemediationTransaction;
  return { tx, findMany, updateMany, findUnique, auditCreate, auditFindMany };
}

describe("Fund primary-source neutral report", () => {
  it("queries all published funds and retains every missing or invalid primary designation", async () => {
    const findMany = vi.fn().mockResolvedValue([
      fund(),
      fund({ id: "blank", legacyId: "FUND-002", primarySourceUrl: "   " }),
      fund({ id: "unsafe", legacyId: "FUND-003", primarySourceUrl: "javascript:alert(1)" }),
      fund({ id: "covered", legacyId: "FUND-004", primarySourceUrl: selectedUrl }),
    ]);
    const input = await loadFundPrimarySourceReportInput({
      fund: { findMany },
    } as unknown as FundPrimarySourceReportClient, generatedAt);

    expect(findMany).toHaveBeenCalledWith({
      where: { status: "PUBLISHED" },
      select: expect.objectContaining({
        id: true,
        legacyId: true,
        status: true,
        updatedAt: true,
        sourceUrls: true,
        strategyUrl: true,
        primarySourceUrl: true,
      }),
      orderBy: [{ legacyId: "asc" }, { id: "asc" }],
    });
    expect(input.funds.map((item) => item.legacyId)).toEqual([
      "FUND-001",
      "FUND-002",
      "FUND-003",
    ]);
  });

  it("deduplicates candidates, records provenance, sorts by URL, and excludes unsafe schemes", () => {
    expect(buildFundPrimarySourceCandidates({
      sourceUrls: [
        " https://z.example.com/source ",
        "javascript:alert(1)",
        "https://a.example.com/source",
        "https://z.example.com/source",
        "https://user:secret@example.com/source",
      ],
      strategyUrl: "https://z.example.com/source",
    })).toEqual([
      { sourceUrl: "https://a.example.com/source", origins: ["SOURCE_URLS"] },
      {
        sourceUrl: "https://z.example.com/source",
        origins: ["SOURCE_URLS", "STRATEGY_URL"],
      },
    ]);
  });

  it("leaves every selection and reviewer field null and orders funds by stable identifiers", () => {
    const report = template(reportInput([
      fund({ id: "z", legacyId: "FUND-002" }),
      fund({ id: "a", legacyId: "FUND-001" }),
    ]));
    expect(report.reviewedBy).toBeNull();
    expect(report.reviewedAt).toBeNull();
    expect(report.items.map((item) => item.legacyId)).toEqual(["FUND-001", "FUND-002"]);
    expect(report.items.every((item) => item.selectedPrimarySourceUrl === null)).toBe(true);
    expect(report.items[0]).toMatchObject({
      fundStatus: "PUBLISHED",
      fundUpdatedAt: generatedAt.toISOString(),
      currentPrimarySourceUrl: null,
    });
  });

  it("hashes exact bytes and rejects changed or non-lowercase digests", () => {
    const raw = `${JSON.stringify(template(), null, 2)}\n`;
    const digest = createHash("sha256").update(raw).digest("hex");
    expect(verifyExactFundPrimarySourceSha256(raw, digest)).toBe(digest);
    expect(() => verifyExactFundPrimarySourceSha256(`${raw} `, digest)).toThrow("mismatch");
    expect(() => verifyExactFundPrimarySourceSha256(raw, digest.toUpperCase())).toThrow("exact lowercase");
  });
});

describe("Fund primary-source reviewed approval validation", () => {
  it("requires reviewer identity, review time, and an exact listed selection", () => {
    const base = template();
    expect(() => parseReviewedFundPrimarySourceApproval(base)).toThrow("reviewedBy");
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        selectedPrimarySourceUrl: "https://unlisted.example.com/source",
      })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("listed candidate");
    expect(reviewed().items[0].selectedPrimarySourceUrl).toBe(selectedUrl);
  });

  it("rejects unsafe selected URLs and unsafe candidate tampering", () => {
    const base = template();
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        candidates: [{ sourceUrl: "javascript:alert(1)", origins: ["SOURCE_URLS"] }],
        selectedPrimarySourceUrl: "javascript:alert(1)",
      })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("absolute HTTP(S)");
  });

  it("rejects edits to instructions, status, candidates, or deterministic ordering", () => {
    const base = template(reportInput([
      fund({ id: "a", legacyId: "FUND-001" }),
      fund({ id: "b", legacyId: "FUND-002" }),
    ]));
    const complete = {
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({ ...item, selectedPrimarySourceUrl: selectedUrl })),
    };
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...complete,
      instructions: ["Choose the first candidate"],
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("exactly as generated");
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...complete,
      items: complete.items.map((item, index) => index === 0
        ? { ...item, fundStatus: "DRAFT" }
        : item),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("must remain PUBLISHED");
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...complete,
      items: complete.items.map((item, index) => index === 0
        ? { ...item, candidates: [...item.candidates].reverse() }
        : item),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("deterministic URL order");
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...complete,
      items: [...complete.items].reverse(),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("deterministic legacyId order");
  });

  it("rejects stale temporal provenance and duplicate identifiers", () => {
    const base = template(reportInput([
      fund({ id: "a", legacyId: "FUND-001" }),
      fund({ id: "b", legacyId: "FUND-002" }),
    ]));
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt: "2026-07-22T11:00:00.000Z",
      items: base.items.map((item) => ({ ...item, selectedPrimarySourceUrl: selectedUrl })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("cannot predate");
    expect(() => parseReviewedFundPrimarySourceApproval({
      ...base,
      reviewedBy: context.reviewedBy,
      reviewedAt,
      items: base.items.map((item) => ({
        ...item,
        fundId: "duplicate-id",
        selectedPrimarySourceUrl: selectedUrl,
      })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("duplicate fundId");
  });
});

describe("Fund primary-source transactional apply", () => {
  it("rejects an execution reviewer mismatch before reading live state", async () => {
    const mocks = mockTransaction({});
    await expect(applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      reviewed(),
      approvalHash,
      { ...context, reviewedBy: "Different Reviewer" },
    )).rejects.toThrow("exactly match the committed approval reviewer");
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("changes only the reviewed URL with optimistic preconditions and records full provenance", async () => {
    const mocks = mockTransaction({});
    const approval = reviewed();
    const result = await applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      approval,
      approvalHash,
      context,
    );

    expect(result).toEqual({
      updated: 1,
      unchanged: 0,
      auditEvents: 1,
      remainingPublishedFundsMissingPrimarySource: 0,
    });
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "fund-alpha-id",
        legacyId: "FUND-001",
        status: "PUBLISHED",
        updatedAt: generatedAt,
        primarySourceUrl: null,
      },
      data: { primarySourceUrl: selectedUrl },
    });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: null,
        entityType: "Fund",
        entityId: "fund-alpha-id",
        action: "FUND_PRIMARY_SOURCE_REMEDIATION",
        changes: {
          changedFields: ["primarySourceUrl"],
          beforePrimarySourceUrl: null,
          afterPrimarySourceUrl: selectedUrl,
        },
        metadata: expect.objectContaining({
          approvalFile: FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
          approvalSha256: approvalHash,
          reviewedBy: context.reviewedBy,
          reviewedAt,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          targetFundLegacyId: "FUND-001",
          targetFundName: "Alpha Infrastructure Fund",
          templateFundUpdatedAt: generatedAt.toISOString(),
          resultingFundUpdatedAt: resultingUpdatedAt.toISOString(),
          selectedPrimarySourceUrl: selectedUrl,
        }),
      }),
    });
  });

  it("replaces an exact snapshotted unsafe designation through the same reviewed path", async () => {
    const unsafe = "javascript:alert(1)";
    const unsafeFund = fund({ primarySourceUrl: unsafe });
    const approval = reviewed(template(reportInput([unsafeFund])));
    const mocks = mockTransaction({ initial: [unsafeFund] });
    const result = await applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      approval,
      approvalHash,
      context,
    );

    expect(result.updated).toBe(1);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ primarySourceUrl: unsafe }),
      data: { primarySourceUrl: selectedUrl },
    });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changes: {
          changedFields: ["primarySourceUrl"],
          beforePrimarySourceUrl: unsafe,
          afterPrimarySourceUrl: selectedUrl,
        },
      }),
    });
  });

  it("fails closed for incomplete mappings before any write", async () => {
    const second = fund({ id: "fund-beta-id", legacyId: "FUND-002" });
    const mocks = mockTransaction({ initial: [fund(), second] });
    await expect(applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      reviewed(),
      approvalHash,
      context,
    )).rejects.toThrow("incomplete for current published funds: FUND-002");
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("rejects stale timestamps and changed live candidates", async () => {
    const stale = mockTransaction({
      initial: [fund({ updatedAt: new Date("2026-07-22T12:01:00.000Z") })],
    });
    await expect(applyReviewedFundPrimarySourceApproval(
      stale.tx,
      reviewed(),
      approvalHash,
      context,
    )).rejects.toThrow("changed after the approval template");
    expect(stale.updateMany).not.toHaveBeenCalled();

    const changedCandidate = mockTransaction({
      initial: [fund({ sourceUrls: [selectedUrl, "https://new.example.com/evidence"] })],
    });
    await expect(applyReviewedFundPrimarySourceApproval(
      changedCandidate.tx,
      reviewed(),
      approvalHash,
      context,
    )).rejects.toThrow("supporting source candidates changed");
    expect(changedCandidate.updateMany).not.toHaveBeenCalled();
  });

  it("permits only an exact audit-bound replay after the Fund updatedAt changes", async () => {
    const approval = reviewed();
    const current = fund({
      primarySourceUrl: selectedUrl,
      updatedAt: resultingUpdatedAt,
    });
    const mocks = mockTransaction({
      initial: [current],
      final: [{ legacyId: "FUND-001", primarySourceUrl: selectedUrl }],
      audits: [exactReplayAudit(approval)],
    });
    const result = await applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      approval,
      approvalHash,
      context,
    );
    expect(result).toEqual({
      updated: 0,
      unchanged: 1,
      auditEvents: 0,
      remainingPublishedFundsMissingPrimarySource: 0,
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it("rejects same-value state without the exact approval audit", async () => {
    const mocks = mockTransaction({
      initial: [fund({ primarySourceUrl: selectedUrl, updatedAt: resultingUpdatedAt })],
      audits: [],
    });
    await expect(applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      reviewed(),
      approvalHash,
      context,
    )).rejects.toThrow("no exact hash-bound fund primary-source audit");
  });

  it("rolls back when the strict published Fund gate remains incomplete", async () => {
    const mocks = mockTransaction({
      final: [{ legacyId: "FUND-002", primarySourceUrl: null }],
    });
    await expect(applyReviewedFundPrimarySourceApproval(
      mocks.tx,
      reviewed(),
      approvalHash,
      context,
    )).rejects.toThrow("gate remains incomplete (FUND-002)");
  });
});
