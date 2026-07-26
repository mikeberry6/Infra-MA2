import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    citation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    company: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    fund: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    organization: { upsert: vi.fn() },
    ownershipPeriod: { create: vi.fn() },
    source: { upsert: vi.fn() },
  };
  return {
    tx,
    companyFindUnique: vi.fn(),
    fundFindFirst: vi.fn(),
    fundFindMany: vi.fn(),
    fundFindUnique: vi.fn(),
    recordAuditEvent: vi.fn(),
    requireAdmin: vi.fn(),
    revalidate: vi.fn(),
    transaction: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: { findUnique: mocks.companyFindUnique },
    fund: {
      findFirst: mocks.fundFindFirst,
      findMany: mocks.fundFindMany,
      findUnique: mocks.fundFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({
  recordAuditEvent: mocks.recordAuditEvent,
}));
vi.mock("@/lib/revalidation", () => ({
  revalidateAppData: mocks.revalidate,
}));

import {
  archiveCompany,
  archiveFund,
  createCompany,
  createFund,
  publishCompany,
  publishFund,
  submitCompanyForReview,
  submitFundForReview,
  updateCompany,
  updateFund,
  verifyCompany,
  verifyFund,
} from "@/modules/admin/actions";

const updatedAt = new Date("2026-07-22T12:00:00.000Z");

function fundForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const values = {
    managerName: "Infrastructure Partners",
    fundName: "Infrastructure Fund II",
    investmentStrategy: "Essential infrastructure",
    size: "TBD",
    vintage: "2026",
    strategies: "Core",
    structure: "Closed-End",
    status: "Raising",
    sectors: "Utilities",
    regions: "North America",
    primarySourceUrl: "https://example.com/fund-primary",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return form;
}

function companyForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const values = {
    name: "GridCo",
    country: "United States",
    sector: "Utilities",
    region: "North America",
    description: "A regulated electric utility platform.",
    status: "Active",
    investmentFirm: "Infrastructure Partners",
    investmentYear: "2024",
    sourceName: "GridCo announcement",
    sourceUrl: "https://example.com/company-primary",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return form;
}

const completeFund = {
  status: "IN_REVIEW",
  updatedAt,
  fundName: "Infrastructure Fund II",
  managerId: "manager-1",
  strategies: ["CORE"],
  fundStatus: "RAISING",
  size: "TBD",
  primarySourceUrl: "https://example.com/fund-primary",
  sourceUrls: [],
  strategyUrl: "",
};

const completeCompany = {
  status: "IN_REVIEW",
  updatedAt,
  name: "GridCo",
  country: "United States",
  sector: "UTILITIES",
  description: "A regulated electric utility platform.",
  website: null,
  ownershipPeriods: [{
    id: "ownership-1",
    organizationId: "manager-1",
    fundId: null,
    fund: null,
  }],
  citations: [{ id: "citation-1" }],
};

function expectExactAuditChangedFields(
  entityType: string,
  entityId: string,
  action: string,
  expectedFields: string[],
) {
  const auditCall = mocks.recordAuditEvent.mock.calls.find(
    ([input]) =>
      input.entityType === entityType
      && input.entityId === entityId
      && input.action === action,
  );
  expect(auditCall?.[1]).toBe(mocks.tx);
  const changedFields = auditCall?.[0].changes?.changedFields;
  expect(changedFields).toEqual(expect.any(Array));
  expect([...(changedFields as string[])].sort()).toEqual([...expectedFields].sort());
}

describe("fund and company admin action matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
    mocks.transaction.mockImplementation(
      async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx),
    );
    mocks.tx.organization.upsert.mockResolvedValue({ id: "manager-1" });
    mocks.tx.source.upsert.mockResolvedValue({ id: "source-1" });
    mocks.tx.citation.findFirst.mockResolvedValue(null);
    mocks.tx.citation.create.mockResolvedValue({ id: "citation-1" });
    mocks.tx.citation.update.mockResolvedValue({ id: "citation-1" });
    mocks.tx.citation.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.fund.create.mockResolvedValue({ id: "fund-1" });
    mocks.tx.fund.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.company.create.mockResolvedValue({ id: "company-1" });
    mocks.tx.company.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.ownershipPeriod.create.mockResolvedValue({ id: "ownership-1" });
    mocks.fundFindFirst.mockResolvedValue(null);
    mocks.fundFindMany.mockResolvedValue([]);
  });

  it("creates a draft Fund and its AuditEvent atomically", async () => {
    await expect(createFund(fundForm())).resolves.toEqual({
      success: true,
      id: "fund-1",
    });

    expect(mocks.tx.fund.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        managerId: "manager-1",
        fundName: "Infrastructure Fund II",
        strategies: ["CORE"],
        status: "DRAFT",
      }),
    });
    expectExactAuditChangedFields("Fund", "fund-1", "CREATE", [
      "legacyId",
      "managerId",
      "fundName",
      "ticker",
      "investmentStrategy",
      "sourceUrls",
      "primarySourceUrl",
      "size",
      "sizeUsdMm",
      "vintage",
      "strategies",
      "structure",
      "fundStatus",
      "sectors",
      "regions",
      "strategyUrl",
      "status",
    ]);
    expect(mocks.revalidate).toHaveBeenCalledOnce();
  });

  it("updates a published Fund, returns it to review, and audits the exact changed fields", async () => {
    mocks.tx.fund.findUnique.mockResolvedValue({
      status: "PUBLISHED",
      updatedAt,
      manager: { name: "Legacy Manager" },
      fundName: "Infrastructure Fund I",
      ticker: null,
      investmentStrategy: "",
      sourceUrls: [],
      primarySourceUrl: null,
      size: "TBD",
      sizeUsdMm: null,
      vintage: "2025",
      strategies: ["CORE"],
      structure: "CLOSED_END",
      fundStatus: "RAISING",
      sectors: ["UTILITIES"],
      regions: ["NORTH_AMERICA"],
      strategyUrl: "",
    });

    await expect(updateFund("fund-1", fundForm())).resolves.toEqual({ success: true });

    expect(mocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    );
    expect(mocks.tx.fund.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "fund-1", status: "PUBLISHED", updatedAt },
      data: expect.objectContaining({
        managerId: "manager-1",
        fundName: "Infrastructure Fund II",
        status: "IN_REVIEW",
      }),
    }));
    expectExactAuditChangedFields("Fund", "fund-1", "UPDATE", [
      "fundName",
      "investmentStrategy",
      "managerName",
      "primarySourceUrl",
      "status",
      "vintage",
    ]);
  });

  it("creates a draft Company, ownership period, citation, and AuditEvent atomically", async () => {
    await expect(createCompany(companyForm())).resolves.toEqual({
      success: true,
      id: "company-1",
    });

    expect(mocks.tx.company.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "GridCo",
        sector: "UTILITIES",
        region: "NORTH_AMERICA",
        status: "DRAFT",
      }),
    });
    expect(mocks.tx.ownershipPeriod.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: "company-1",
        organizationId: "manager-1",
        investmentYear: 2024,
      }),
    });
    expectExactAuditChangedFields("Company", "company-1", "CREATE", [
      "name",
      "country",
      "sector",
      "subsector",
      "region",
      "description",
      "companyStatus",
      "website",
      "yearFounded",
      "headquarters",
      "countryTags",
      "status",
      "ownershipPeriods",
      "primarySourceName",
      "primarySourceUrl",
    ]);
    expect(mocks.revalidate).toHaveBeenCalledOnce();
  });

  it("updates a published Company, returns it to review, and audits citation changes", async () => {
    mocks.tx.company.findUnique.mockResolvedValue({
      status: "PUBLISHED",
      updatedAt,
      name: "Legacy GridCo",
      country: "United States",
      sector: "UTILITIES",
      subsector: "",
      region: "NORTH_AMERICA",
      description: "Legacy description.",
      companyStatus: "ACTIVE",
      website: null,
      yearFounded: null,
      headquarters: null,
      countryTags: [],
      citations: [],
    });

    await expect(updateCompany("company-1", companyForm())).resolves.toEqual({
      success: true,
    });

    expect(mocks.transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" },
    );
    expect(mocks.tx.company.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "company-1", status: "PUBLISHED", updatedAt },
      data: expect.objectContaining({
        name: "GridCo",
        description: "A regulated electric utility platform.",
        status: "IN_REVIEW",
      }),
    }));
    expectExactAuditChangedFields("Company", "company-1", "UPDATE", [
      "citations",
      "description",
      "name",
      "primarySourceName",
      "primarySourceUrl",
      "status",
    ]);
  });

  it.each([
    {
      label: "publishes a Fund",
      entityType: "Fund",
      id: "fund-1",
      finder: mocks.fundFindUnique,
      row: completeFund,
      invoke: () => publishFund("fund-1"),
      action: "PUBLISH",
      changedFields: ["status", "lastVerifiedAt"],
      updateMany: mocks.tx.fund.updateMany,
    },
    {
      label: "verifies a published Fund",
      entityType: "Fund",
      id: "fund-1",
      finder: mocks.fundFindUnique,
      row: { ...completeFund, status: "PUBLISHED" },
      invoke: () => verifyFund("fund-1"),
      action: "VERIFY",
      changedFields: ["lastVerifiedAt"],
      updateMany: mocks.tx.fund.updateMany,
    },
    {
      label: "submits a Fund for review",
      entityType: "Fund",
      id: "fund-1",
      finder: mocks.fundFindUnique,
      row: { status: "DRAFT" },
      invoke: () => submitFundForReview("fund-1"),
      action: "SUBMIT_FOR_REVIEW",
      changedFields: ["status"],
      updateMany: mocks.tx.fund.updateMany,
    },
    {
      label: "archives a Fund",
      entityType: "Fund",
      id: "fund-1",
      finder: mocks.fundFindUnique,
      row: { status: "PUBLISHED" },
      invoke: () => archiveFund("fund-1"),
      action: "ARCHIVE",
      changedFields: ["status"],
      updateMany: mocks.tx.fund.updateMany,
    },
    {
      label: "publishes a Company",
      entityType: "Company",
      id: "company-1",
      finder: mocks.companyFindUnique,
      row: completeCompany,
      invoke: () => publishCompany("company-1"),
      action: "PUBLISH",
      changedFields: ["status", "lastVerifiedAt"],
      updateMany: mocks.tx.company.updateMany,
    },
    {
      label: "verifies a published Company",
      entityType: "Company",
      id: "company-1",
      finder: mocks.companyFindUnique,
      row: { ...completeCompany, status: "PUBLISHED" },
      invoke: () => verifyCompany("company-1"),
      action: "VERIFY",
      changedFields: ["lastVerifiedAt"],
      updateMany: mocks.tx.company.updateMany,
    },
    {
      label: "submits a Company for review",
      entityType: "Company",
      id: "company-1",
      finder: mocks.companyFindUnique,
      row: { status: "DRAFT" },
      invoke: () => submitCompanyForReview("company-1"),
      action: "SUBMIT_FOR_REVIEW",
      changedFields: ["status"],
      updateMany: mocks.tx.company.updateMany,
    },
    {
      label: "archives a Company",
      entityType: "Company",
      id: "company-1",
      finder: mocks.companyFindUnique,
      row: { status: "PUBLISHED" },
      invoke: () => archiveCompany("company-1"),
      action: "ARCHIVE",
      changedFields: ["status"],
      updateMany: mocks.tx.company.updateMany,
    },
  ])("$label and records the workflow audit", async ({
    entityType,
    id,
    finder,
    row,
    invoke,
    action,
    changedFields,
    updateMany,
  }) => {
    finder.mockResolvedValue(row);

    await expect(invoke()).resolves.toEqual({ success: true });

    expect(updateMany).toHaveBeenCalledOnce();
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      entityType,
      entityId: id,
      action,
      changes: { changedFields },
    }, mocks.tx);
    expect(mocks.revalidate).toHaveBeenCalledOnce();
  });
});
