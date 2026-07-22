import { describe, expect, it, vi } from "vitest";
import {
  applyReviewedPrimaryCitationApproval,
  buildPrimaryCitationApprovalTemplate,
  loadPrimaryCitationReportInput,
  parseReviewedPrimaryCitationApproval,
  sha256Hex,
  verifyExactSha256,
  type PrimaryCitationApprovalTemplate,
  type PrimaryCitationReportClient,
  type PrimaryCitationRemediationTransaction,
  type ReviewedPrimaryCitationApproval,
} from "@/modules/operations/primary-citation-remediation";

const generatedAt = new Date("2026-07-22T12:00:00.000Z");
const reviewedAt = "2026-07-22T13:00:00.000Z";
const approvalHash = "a".repeat(64);

function citation(id: string, url = `https://example.com/${id}`) {
  return {
    id,
    sourceId: `source-${id}`,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    isPrimary: false,
    source: { label: `Source ${id}`, url, type: "PRESS_RELEASE" },
  };
}

function template(): PrimaryCitationApprovalTemplate {
  return buildPrimaryCitationApprovalTemplate({
    generatedAt,
    deals: [{
      id: "deal-1",
      legacyId: "DEAL-001",
      target: "Example Grid",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [citation("citation-b"), citation("citation-a")],
    }],
    companies: [{
      id: "company-1",
      name: "Example Networks",
      country: "United States",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [citation("citation-company")],
    }],
  });
}

function reviewed(items = template().items): ReviewedPrimaryCitationApproval {
  return parseReviewedPrimaryCitationApproval({
    ...template(),
    reviewedBy: "Research Reviewer",
    reviewedAt,
    items: items.map((item) => ({
      ...item,
      selectedCitationId: item.candidates[0]?.citationId ?? null,
    })),
  }, new Date("2026-07-22T14:00:00.000Z"));
}

function mockTransaction() {
  const dealFindMany = vi.fn().mockResolvedValue([{ id: "deal-1" }]);
  const companyFindMany = vi.fn().mockResolvedValue([]);
  const dealFindUnique = vi.fn().mockResolvedValue({
    id: "deal-1",
    status: "PUBLISHED",
    updatedAt: generatedAt,
    citations: [
      citation("citation-a"),
      citation("citation-b"),
    ],
  });
  const companyFindUnique = vi.fn();
  const citationUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
  const citationCount = vi.fn().mockResolvedValue(1);
  const auditCreate = vi.fn().mockResolvedValue({ id: "audit-1" });
  const dealCount = vi.fn().mockResolvedValue(0);
  const companyCount = vi.fn().mockResolvedValue(0);
  const tx = {
    deal: { findMany: dealFindMany, findUnique: dealFindUnique, count: dealCount },
    company: { findMany: companyFindMany, findUnique: companyFindUnique, count: companyCount },
    citation: { updateMany: citationUpdateMany, count: citationCount },
    auditEvent: { create: auditCreate },
  } as unknown as PrimaryCitationRemediationTransaction;
  return {
    tx,
    dealFindMany,
    companyFindMany,
    dealFindUnique,
    companyFindUnique,
    citationUpdateMany,
    citationCount,
    auditCreate,
    dealCount,
    companyCount,
  };
}

describe("primary-citation approval report", () => {
  it("queries every published deal and company missing an explicit primary", async () => {
    const dealFindMany = vi.fn().mockResolvedValue([]);
    const companyFindMany = vi.fn().mockResolvedValue([]);
    await loadPrimaryCitationReportInput({
      deal: { findMany: dealFindMany },
      company: { findMany: companyFindMany },
    } as unknown as PrimaryCitationReportClient, generatedAt);
    expect(dealFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED", citations: { none: { isPrimary: true } } },
      select: expect.objectContaining({ citations: expect.any(Object) }),
    }));
    expect(companyFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED", citations: { none: { isPrimary: true } } },
      select: expect.objectContaining({ citations: expect.any(Object) }),
    }));
  });

  it("lists every candidate without choosing or ranking one", () => {
    const report = template();
    expect(report.reviewedBy).toBeNull();
    expect(report.reviewedAt).toBeNull();
    expect(report.items).toHaveLength(2);
    expect(report.items.every((item) => item.selectedCitationId === null)).toBe(true);
    const deal = report.items.find((item) => item.entityType === "Deal");
    expect(deal?.candidates.map((candidate) => candidate.citationId)).toEqual(["citation-a", "citation-b"]);
    expect(deal?.candidates.every((candidate) => candidate.currentlyPrimary === false)).toBe(true);
    expect(Object.keys(deal?.candidates[0] ?? {})).not.toContain("recommended");
  });

  it("hashes exact bytes and rejects a different or noncanonical digest", () => {
    const raw = `${JSON.stringify(template(), null, 2)}\n`;
    const digest = sha256Hex(raw);
    expect(verifyExactSha256(raw, digest)).toBe(digest);
    expect(() => verifyExactSha256(`${raw} `, digest)).toThrow("mismatch");
    expect(() => verifyExactSha256(raw, digest.toUpperCase())).toThrow("exact lowercase");
  });
});

describe("primary-citation approval validation", () => {
  it("requires reviewer identity, timestamp, and a complete listed selection", () => {
    const base = template();
    expect(() => parseReviewedPrimaryCitationApproval(base)).toThrow("reviewedBy");
    expect(() => parseReviewedPrimaryCitationApproval({
      ...base,
      reviewedBy: "Reviewer",
      reviewedAt,
      items: base.items.map((item) => ({ ...item, selectedCitationId: null })),
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("selectedCitationId");
    expect(() => parseReviewedPrimaryCitationApproval({
      ...base,
      reviewedBy: "Reviewer",
      reviewedAt: "not-a-date",
      items: base.items.map((item) => ({ ...item, selectedCitationId: item.candidates[0]?.citationId })),
    })).toThrow("UTC ISO-8601");
    expect(() => parseReviewedPrimaryCitationApproval({
      ...base,
      reviewedBy: "Reviewer",
      reviewedAt: "2026-02-31T13:00:00.000Z",
      items: base.items.map((item) => ({ ...item, selectedCitationId: item.candidates[0]?.citationId })),
    })).toThrow("UTC ISO-8601");
  });

  it("rejects selections outside the reviewed candidates and duplicate entity mappings", () => {
    const base = template();
    const selected = base.items.map((item) => ({
      ...item,
      selectedCitationId: item.candidates[0]?.citationId,
    }));
    expect(() => parseReviewedPrimaryCitationApproval({
      ...base,
      reviewedBy: "Reviewer",
      reviewedAt,
      items: [{ ...selected[0], selectedCitationId: "not-listed" }, selected[1]],
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("one listed candidate");
    expect(() => parseReviewedPrimaryCitationApproval({
      ...base,
      reviewedBy: "Reviewer",
      reviewedAt,
      items: [selected[0], selected[0]],
    }, new Date("2026-07-22T14:00:00.000Z"))).toThrow("duplicate mapping");
  });
});

describe("primary-citation transactional apply", () => {
  it("sets exactly one primary and records reviewer/hash provenance", async () => {
    const mocks = mockTransaction();
    const approval = reviewed().items.filter((item) => item.entityType === "Deal");
    const result = await applyReviewedPrimaryCitationApproval(
      mocks.tx,
      { ...reviewed(), items: approval },
      approvalHash,
    );

    expect(result).toEqual({
      updated: 1,
      unchanged: 0,
      auditEvents: 1,
      remainingPublishedDealsMissingPrimary: 0,
      remainingPublishedCompaniesMissingPrimary: 0,
    });
    expect(mocks.citationUpdateMany).toHaveBeenNthCalledWith(1, {
      where: { dealId: "deal-1", isPrimary: true },
      data: { isPrimary: false },
    });
    expect(mocks.citationUpdateMany).toHaveBeenNthCalledWith(2, {
      where: { dealId: "deal-1", id: "citation-a" },
      data: { isPrimary: true },
    });
    expect(mocks.citationCount).toHaveBeenCalledWith({ where: { dealId: "deal-1", isPrimary: true } });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: "Deal",
        entityId: "deal-1",
        action: "PRIMARY_CITATION_REMEDIATION",
        metadata: expect.objectContaining({
          reviewedBy: "Research Reviewer",
          reviewedAt,
          approvalSha256: approvalHash,
        }),
      }),
    });
  });

  it("verifies and applies a company selection through the company relation", async () => {
    const mocks = mockTransaction();
    mocks.dealFindMany.mockResolvedValue([]);
    mocks.companyFindMany.mockResolvedValue([{ id: "company-1" }]);
    mocks.companyFindUnique.mockResolvedValue({
      id: "company-1",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [citation("citation-company")],
    });
    const companyItems = reviewed().items.filter((item) => item.entityType === "Company");
    const result = await applyReviewedPrimaryCitationApproval(
      mocks.tx,
      { ...reviewed(), items: companyItems },
      approvalHash,
    );
    expect(result.updated).toBe(1);
    expect(mocks.citationUpdateMany).toHaveBeenNthCalledWith(2, {
      where: { companyId: "company-1", id: "citation-company" },
      data: { isPrimary: true },
    });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ entityType: "Company", entityId: "company-1" }),
    });
  });

  it("is idempotent when the reviewed selection is already the sole primary", async () => {
    const mocks = mockTransaction();
    mocks.dealFindMany.mockResolvedValue([]);
    mocks.dealFindUnique.mockResolvedValue({
      id: "deal-1",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [
        { ...citation("citation-a"), isPrimary: true },
        citation("citation-b"),
      ],
    });
    const dealItems = reviewed().items.filter((item) => item.entityType === "Deal");
    const result = await applyReviewedPrimaryCitationApproval(mocks.tx, { ...reviewed(), items: dealItems }, approvalHash);
    expect(result.updated).toBe(0);
    expect(result.unchanged).toBe(1);
    expect(mocks.citationUpdateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it("rejects an incomplete approval before writes", async () => {
    const mocks = mockTransaction();
    mocks.companyFindMany.mockResolvedValue([{ id: "unmapped-company" }]);
    const dealItems = reviewed().items.filter((item) => item.entityType === "Deal");
    await expect(applyReviewedPrimaryCitationApproval(
      mocks.tx,
      { ...reviewed(), items: dealItems },
      approvalHash,
    )).rejects.toThrow("Company:unmapped-company");
    expect(mocks.citationUpdateMany).not.toHaveBeenCalled();
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it("throws after attempted remediation if the complete published gate still fails", async () => {
    const mocks = mockTransaction();
    mocks.dealCount.mockResolvedValue(1);
    const dealItems = reviewed().items.filter((item) => item.entityType === "Deal");
    await expect(applyReviewedPrimaryCitationApproval(
      mocks.tx,
      { ...reviewed(), items: dealItems },
      approvalHash,
    )).rejects.toThrow("rolling back all remediation changes");
    expect(mocks.auditCreate).toHaveBeenCalledOnce();
  });

  it("rejects candidate-set drift or a different live primary", async () => {
    const dealItems = reviewed().items.filter((item) => item.entityType === "Deal");
    const drift = mockTransaction();
    drift.dealFindUnique.mockResolvedValue({
      id: "deal-1",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [
        citation("citation-a", "https://example.com/changed-after-review"),
        citation("citation-b"),
      ],
    });
    await expect(applyReviewedPrimaryCitationApproval(
      drift.tx,
      { ...reviewed(), items: dealItems },
      approvalHash,
    )).rejects.toThrow("source evidence changed");

    const conflict = mockTransaction();
    conflict.dealFindUnique.mockResolvedValue({
      id: "deal-1",
      status: "PUBLISHED",
      updatedAt: generatedAt,
      citations: [
        citation("citation-a"),
        { ...citation("citation-b"), isPrimary: true },
      ],
    });
    await expect(applyReviewedPrimaryCitationApproval(
      conflict.tx,
      { ...reviewed(), items: dealItems },
      approvalHash,
    )).rejects.toThrow("different primary citation");
  });
});
