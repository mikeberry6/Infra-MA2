import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getSessionIdentity: vi.fn(),
  isAuthorizationError: vi.fn(),
  createImportPreviewToken: vi.fn(),
  consumeImportPreviewToken: vi.fn(),
  hashImportPreviewState: vi.fn(),
  revalidateAppData: vi.fn(),
  recordAuditEvent: vi.fn(),
  dealFindMany: vi.fn(),
  fundFindMany: vi.fn(),
  companyFindMany: vi.fn(),
  transaction: vi.fn(),
  pipelineCreate: vi.fn(),
  pipelineUpdate: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  AuthorizationError: class AuthorizationError extends Error {},
  requireAdmin: mocks.requireAdmin,
  getSessionIdentity: mocks.getSessionIdentity,
  isAuthorizationError: mocks.isAuthorizationError,
}));
vi.mock("@/modules/imports/preview-token", () => ({
  ImportPreviewTokenError: class ImportPreviewTokenError extends Error {
    constructor(message = "Import preview is missing, expired, changed, or already used. Preview the file again.") {
      super(message);
    }
  },
  createImportPreviewToken: mocks.createImportPreviewToken,
  consumeImportPreviewToken: mocks.consumeImportPreviewToken,
  hashImportPreviewState: mocks.hashImportPreviewState,
}));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidateAppData }));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { findMany: mocks.dealFindMany },
    fund: { findMany: mocks.fundFindMany },
    company: { findMany: mocks.companyFindMany },
    $transaction: mocks.transaction,
    pipelineRun: { create: mocks.pipelineCreate, update: mocks.pipelineUpdate },
  },
}));

import { POST as importDeals } from "@/app/api/imports/deals/route";
import { POST as importFunds } from "@/app/api/imports/funds/route";
import { POST as importCompanies } from "@/app/api/imports/portfolio/route";
import { ImportPreviewTokenError } from "@/modules/imports/preview-token";

function jsonRequest(path: string, body: unknown, previewToken = "preview-token"): NextRequest {
  return {
    headers: new Headers({
      "content-type": "application/json",
      ...(previewToken ? { "x-import-preview-token": previewToken } : {}),
    }),
    json: vi.fn().mockResolvedValue(body),
    nextUrl: new URL(`http://localhost${path}`),
  } as unknown as NextRequest;
}

function deal(overrides: Record<string, unknown> = {}) {
  return {
    id: "DEAL-NEW",
    title: "Buyer acquires Target",
    target: "Target",
    buyer: "Buyer",
    seller: "Seller",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    category: ["Acquisition (Buyout)"],
    date: "2026-07-20",
    description: "A complete transaction description.",
    targetDescription: "A fiber platform.",
    country: "United States",
    status: "Announced",
    sourceName: "Company announcement",
    sourceUrl: "https://example.com/test/deal",
    ...overrides,
  };
}

function fund(overrides: Record<string, unknown> = {}) {
  return {
    id: "FUND-NEW",
    managerName: "Manager",
    fundName: "Infrastructure Fund V",
    investmentStrategy: "Core infrastructure",
    size: "$5 billion",
    sizeUsdMm: 5000,
    vintage: "2026",
    strategies: ["Core"],
    structure: "Closed-End",
    status: "Raising",
    sectors: ["Digital"],
    regions: ["North America"],
    sourceUrls: ["https://example.com/test/fund"],
    ...overrides,
  };
}

function company(overrides: Record<string, unknown> = {}) {
  return {
    name: "Portfolio Company",
    country: "United States",
    sector: "Digital",
    subsector: "Fiber",
    region: "North America",
    description: "A fiber platform.",
    status: "Active",
    website: "https://example.com/test/company",
    yearFounded: 2012,
    investmentYear: 2024,
    investmentFirm: "Manager",
    ownershipVehicle: "Infrastructure Fund V",
    ...overrides,
  };
}

function unchangedDealRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "database-deal-existing",
    legacyId: "DEAL-NEW",
    status: "DRAFT",
    title: "Buyer acquires Target",
    target: "Target",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    categories: ["ACQUISITION_BUYOUT"],
    date: new Date("2026-07-20T12:00:00.000Z"),
    description: "A complete transaction description.",
    targetDescription: "A fiber platform.",
    country: "United States",
    enterpriseValue: null,
    equityValue: null,
    stake: null,
    dealStatus: "ANNOUNCED",
    closingDate: null,
    sellerDisclosureStatus: "DISCLOSED",
    sellerDisclosureReason: null,
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: [],
    participants: [
      { role: "BUYER", displayName: "Buyer", organization: { name: "Buyer" } },
      { role: "SELLER", displayName: "Seller", organization: { name: "Seller" } },
    ],
    citations: [{
      source: {
        url: "https://example.com/test/deal",
        label: "Company announcement",
      },
    }],
    ...overrides,
  };
}

function unchangedFundRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "database-fund-existing",
    legacyId: "FUND-NEW",
    status: "DRAFT",
    managerId: "manager-1",
    manager: { name: "Manager" },
    fundName: "Infrastructure Fund V",
    ticker: null,
    investmentStrategy: "Core infrastructure",
    size: "$5 billion",
    sizeUsdMm: 5000,
    vintage: "2026",
    strategies: ["CORE"],
    structure: "CLOSED_END",
    fundStatus: "RAISING",
    sectors: ["DIGITAL"],
    regions: ["NORTH_AMERICA"],
    sourceUrls: ["https://example.com/test/fund"],
    primarySourceUrl: null,
    strategyUrl: "",
    ...overrides,
  };
}

function unchangedCompanyRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "database-company-existing",
    name: "Portfolio Company",
    country: "United States",
    status: "DRAFT",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    countryTags: [],
    description: "A fiber platform.",
    companyStatus: "ACTIVE",
    website: "https://example.com/test/company",
    yearFounded: 2012,
    headquarters: null,
    ownershipPeriods: [{
      id: "ownership-1",
      fundId: "fund-1",
      isActive: true,
      vehicleName: "Infrastructure Fund V",
      investmentYear: 2024,
      organization: { name: "Manager" },
    }],
    citations: [],
    ...overrides,
  };
}

describe("two-step import routes", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.getSessionIdentity.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mocks.isAuthorizationError.mockReturnValue(false);
    mocks.createImportPreviewToken.mockResolvedValue("preview-token");
    mocks.consumeImportPreviewToken.mockResolvedValue(undefined);
    mocks.hashImportPreviewState.mockReturnValue("state-hash");
    mocks.recordAuditEvent.mockResolvedValue("audit-1");
    mocks.pipelineCreate.mockResolvedValue({ id: "pipeline-1" });
    mocks.pipelineUpdate.mockResolvedValue({});
    mocks.dealFindMany.mockResolvedValue([]);
    mocks.fundFindMany.mockResolvedValue([]);
    mocks.companyFindMany.mockResolvedValue([]);
  });

  it("previews deal creates, updates, and row errors without writing", async () => {
    mocks.dealFindMany.mockResolvedValue([{ id: "database-deal-existing", legacyId: "DEAL-EXISTING", status: "DRAFT" }]);
    const response = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { deals: [deal(), deal({ id: "DEAL-EXISTING" }), { id: "DEAL-BAD" }] },
    ));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      preview: true,
      previewToken: "preview-token",
      items: expect.any(Array),
      total: 3,
      valid: 2,
      creates: 1,
      updates: 1,
      quarantined: 0,
      warnings: [],
    });
    expect(payload.errors).toEqual([expect.objectContaining({ row: 3, id: "DEAL-BAD" })]);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("classifies an identical deal replay as unchanged and commits it without writes, audit, or pipeline", async () => {
    mocks.dealFindMany.mockResolvedValue([unchangedDealRecord()]);

    const preview = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { deals: [deal()] },
    ));

    expect(preview.status).toBe(200);
    await expect(preview.json()).resolves.toMatchObject({
      preview: true,
      creates: 0,
      updates: 0,
      unchanged: 1,
      quarantined: 0,
      errors: [],
    });
    expect(mocks.hashImportPreviewState).toHaveBeenLastCalledWith({
      actions: [{ id: "DEAL-NEW", action: "unchanged" }],
      warnings: [],
    });

    const commit = await importDeals(jsonRequest(
      "/api/imports/deals",
      { deals: [deal()] },
    ));

    expect(commit.status).toBe(200);
    await expect(commit.json()).resolves.toMatchObject({
      imported: 0,
      unchanged: 1,
      quarantined: 0,
      auditEventId: null,
      results: [{ id: "DEAL-NEW", status: "unchanged" }],
    });
    expect(mocks.consumeImportPreviewToken).toHaveBeenCalledOnce();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("classifies an identical fund replay as unchanged and commits it without writes, audit, or pipeline", async () => {
    mocks.fundFindMany.mockResolvedValue([unchangedFundRecord()]);

    const preview = await importFunds(jsonRequest(
      "/api/imports/funds?preview=1",
      { funds: [fund()] },
    ));

    expect(preview.status).toBe(200);
    await expect(preview.json()).resolves.toMatchObject({
      preview: true,
      creates: 0,
      updates: 0,
      unchanged: 1,
      quarantined: 0,
      errors: [],
    });
    expect(mocks.hashImportPreviewState).toHaveBeenLastCalledWith({
      actions: [{ id: "FUND-NEW", action: "unchanged" }],
      warnings: [],
    });

    const commit = await importFunds(jsonRequest(
      "/api/imports/funds",
      { funds: [fund()] },
    ));

    expect(commit.status).toBe(200);
    await expect(commit.json()).resolves.toMatchObject({
      imported: 0,
      unchanged: 1,
      quarantined: 0,
      auditEventId: null,
      results: [{ fundId: "FUND-NEW", status: "unchanged" }],
    });
    expect(mocks.consumeImportPreviewToken).toHaveBeenCalledOnce();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("classifies an identical portfolio replay as unchanged and commits it without writes, audit, or pipeline", async () => {
    mocks.companyFindMany.mockResolvedValue([unchangedCompanyRecord()]);
    mocks.fundFindMany.mockResolvedValue([{ id: "fund-1", fundName: "Infrastructure Fund V" }]);

    const preview = await importCompanies(jsonRequest(
      "/api/imports/portfolio?preview=1",
      { companies: [company()] },
    ));

    expect(preview.status).toBe(200);
    await expect(preview.json()).resolves.toMatchObject({
      preview: true,
      creates: 0,
      updates: 0,
      unchanged: 1,
      quarantined: 0,
      errors: [],
      ownershipChanges: [],
    });
    expect(mocks.hashImportPreviewState).toHaveBeenLastCalledWith({
      actions: [{ key: "portfolio company|united states", action: "unchanged" }],
      warnings: [],
      ownershipChanges: [],
    });

    const commit = await importCompanies(jsonRequest(
      "/api/imports/portfolio",
      { companies: [company()] },
    ));

    expect(commit.status).toBe(200);
    await expect(commit.json()).resolves.toMatchObject({
      imported: 0,
      unchanged: 1,
      quarantined: 0,
      auditEventId: null,
      results: [{ name: "Portfolio Company", status: "unchanged" }],
    });
    expect(mocks.consumeImportPreviewToken).toHaveBeenCalledOnce();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("audits duplicate deal-primary normalization even when the selected source is unchanged", async () => {
    const existing = unchangedDealRecord({
      citations: [
        {
          source: {
            url: "https://example.com/test/deal",
            label: "Company announcement",
          },
        },
        {
          source: {
            url: "https://example.com/test/deal-duplicate",
            label: "Duplicate primary",
          },
        },
      ],
    });
    mocks.dealFindMany.mockResolvedValue([existing]);
    const tx = {
      deal: {
        findMany: vi.fn().mockResolvedValue([existing]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn(),
      },
      dealParticipant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
        create: vi.fn().mockResolvedValue({}),
      },
      organization: {
        upsert: vi.fn().mockImplementation(async ({ where }: { where: { name: string } }) => ({
          id: `organization-${where.name.toLowerCase()}`,
        })),
      },
      citation: {
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
        findFirst: vi.fn().mockResolvedValue({ id: "citation-selected" }),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn(),
      },
      source: { upsert: vi.fn().mockResolvedValue({ id: "source-selected" }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    const response = await importDeals(jsonRequest(
      "/api/imports/deals",
      { deals: [deal()] },
    ));

    expect(response.status).toBe(200);
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      entityType: "Deal",
      action: "BULK_IMPORT",
      changes: {
        changedFields: ["citations"],
        inserted: 0,
        updated: 1,
        errors: 0,
        quarantined: 0,
      },
    }, tx);
  });

  it("audits duplicate company-primary normalization even when the selected source is unchanged", async () => {
    const sourceUrl = "https://example.com/test/company-source";
    const sourceName = "Company announcement";
    const existing = unchangedCompanyRecord({
      citations: [
        { source: { url: sourceUrl, label: sourceName } },
        {
          source: {
            url: "https://example.com/test/company-source-duplicate",
            label: "Duplicate primary",
          },
        },
      ],
    });
    mocks.companyFindMany.mockResolvedValue([existing]);
    mocks.fundFindMany.mockResolvedValue([{ id: "fund-1", fundName: "Infrastructure Fund V" }]);
    const tx = {
      company: {
        findMany: vi.fn().mockResolvedValue([existing]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn(),
      },
      organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
      fund: { findFirst: vi.fn().mockResolvedValue({ id: "fund-1" }) },
      ownershipPeriod: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      citation: {
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
        findFirst: vi.fn().mockResolvedValue({ id: "citation-selected" }),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn(),
      },
      source: { upsert: vi.fn().mockResolvedValue({ id: "source-selected" }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    const response = await importCompanies(jsonRequest(
      "/api/imports/portfolio",
      { companies: [company({ sourceName, sourceUrl })] },
    ));

    expect(response.status).toBe(200);
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      entityType: "Company",
      action: "BULK_IMPORT",
      changes: {
        changedFields: ["citations"],
        inserted: 0,
        updated: 1,
        errors: 0,
        quarantined: 0,
      },
    }, tx);
  });

  it("skips an unchanged deal inside a mixed import while auditing only the real write", async () => {
    const unchanged = unchangedDealRecord();
    mocks.dealFindMany.mockResolvedValue([unchanged]);
    const tx = {
      deal: {
        findMany: vi.fn().mockResolvedValue([unchanged]),
        updateMany: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: "database-deal-created" }),
      },
      dealParticipant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({}),
      },
      organization: {
        upsert: vi.fn().mockImplementation(async ({ where }: { where: { name: string } }) => ({
          id: `organization-${where.name.toLowerCase()}`,
        })),
      },
      citation: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      source: { upsert: vi.fn().mockResolvedValue({ id: "source-created" }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    const response = await importDeals(jsonRequest("/api/imports/deals", {
      deals: [deal(), deal({ id: "DEAL-CREATE", title: "Buyer acquires another target" })],
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      imported: 1,
      unchanged: 1,
      auditEventId: "audit-1",
      results: [
        { id: "DEAL-NEW", status: "unchanged" },
        { id: "DEAL-CREATE", status: "ok" },
      ],
    });
    expect(tx.deal.updateMany).not.toHaveBeenCalled();
    expect(tx.deal.create).toHaveBeenCalledOnce();
    expect(tx.dealParticipant.deleteMany).toHaveBeenCalledOnce();
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      entityType: "Deal",
      action: "BULK_IMPORT",
      changes: expect.objectContaining({
        changedFields: expect.arrayContaining([
          "buyers",
          "legacyId",
          "primarySourceUrl",
          "status",
          "title",
        ]),
        inserted: 1,
        updated: 0,
        unchanged: 1,
        errors: 0,
        quarantined: 0,
      }),
    }, tx);
    expect(JSON.stringify(mocks.recordAuditEvent.mock.calls)).not.toContain(
      "Buyer acquires another target",
    );
    expect(tx.pipelineRun.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: "SUCCEEDED",
        inserted: 1,
        updated: 0,
        skipped: 1,
      }),
    }));
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
  });

  it("rejects a direct commit when its preview token is missing, changed, expired, or consumed", async () => {
    mocks.dealFindMany.mockResolvedValue([]);
    mocks.consumeImportPreviewToken.mockRejectedValueOnce(new ImportPreviewTokenError());

    const response = await importDeals(jsonRequest("/api/imports/deals", { deals: [deal()] }, ""));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Preview the file again") });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
  });

  it("previews fund and portfolio updates using their stable identity contracts", async () => {
    mocks.fundFindMany.mockResolvedValue([{
      id: "database-fund-existing",
      legacyId: "FUND-EXISTING",
      status: "DRAFT",
    }]);
    const fundResponse = await importFunds(jsonRequest(
      "/api/imports/funds?preview=1",
      { funds: [fund(), fund({ id: "FUND-EXISTING", fundName: "Existing Fund" })] },
    ));
    expect(await fundResponse.json()).toMatchObject({
      preview: true,
      total: 2,
      valid: 2,
      creates: 1,
      updates: 1,
      quarantined: 0,
      warnings: [],
      errors: [],
    });

    mocks.companyFindMany.mockResolvedValue([{
      id: "database-company-existing",
      name: "Portfolio Company",
      country: "United States",
      status: "DRAFT",
    }]);
    const companyResponse = await importCompanies(jsonRequest(
      "/api/imports/portfolio?preview=1",
      { companies: [company(), company({ name: "New Company" })] },
    ));
    expect(await companyResponse.json()).toMatchObject({
      preview: true,
      total: 2,
      valid: 2,
      creates: 1,
      updates: 1,
      errors: [],
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(mocks.pipelineCreate).not.toHaveBeenCalled();
  });

  it.each(["—", "N/A", "[TBU]", "unknown"])(
    "rejects an ambiguous fund size during import preview: %s",
    async (size) => {
      const response = await importFunds(jsonRequest(
        "/api/imports/funds?preview=1",
        { funds: [fund({ size })] },
      ));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        total: 1,
        valid: 0,
        creates: 0,
        updates: 0,
        errors: [{
          fundName: "Infrastructure Fund V",
          error: "Size must include a disclosed currency amount or be TBD",
        }],
      });
      expect(mocks.fundFindMany).not.toHaveBeenCalled();
      expect(mocks.transaction).not.toHaveBeenCalled();
      expect(mocks.pipelineCreate).not.toHaveBeenCalled();
    },
  );

  it("previews published fund updates as quarantined instead of writable updates", async () => {
    mocks.fundFindMany.mockResolvedValue([
      { id: "database-fund-published", legacyId: "FUND-PUBLISHED", status: "PUBLISHED" },
      { id: "database-fund-draft", legacyId: "FUND-DRAFT", status: "DRAFT" },
    ]);

    const response = await importFunds(jsonRequest(
      "/api/imports/funds?preview=1",
      {
        funds: [
          fund(),
          fund({ id: "FUND-PUBLISHED", fundName: "Published Fund" }),
          fund({ id: "FUND-DRAFT", fundName: "Draft Fund" }),
        ],
      },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      preview: true,
      total: 3,
      valid: 3,
      creates: 1,
      updates: 1,
      quarantined: 1,
      warnings: [{
        fundId: "FUND-PUBLISHED",
        fundName: "Published Fund",
        status: "quarantined",
        existingStatus: "PUBLISHED",
        code: "PUBLISHED_FUND_UPDATE_BLOCKED",
      }],
      errors: [],
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("also quarantines archived fund updates", async () => {
    mocks.fundFindMany.mockResolvedValue([
      { id: "database-fund-archived", legacyId: "FUND-ARCHIVED", status: "ARCHIVED" },
    ]);

    const response = await importFunds(jsonRequest(
      "/api/imports/funds?preview=1",
      { funds: [fund({ id: "FUND-ARCHIVED", fundName: "Archived Fund" })] },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      creates: 0,
      updates: 0,
      quarantined: 1,
      warnings: [{
        fundId: "FUND-ARCHIVED",
        existingStatus: "ARCHIVED",
        code: "IMMUTABLE_FUND_UPDATE_BLOCKED",
      }],
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("quarantines published deal and company updates with original input row numbers", async () => {
    mocks.dealFindMany.mockResolvedValue([{
      id: "database-deal-published",
      legacyId: "DEAL-PUBLISHED",
      status: "PUBLISHED",
    }]);
    const dealResponse = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { deals: [deal({ id: "DEAL-PUBLISHED" }), { id: "DEAL-BAD" }] },
    ));
    await expect(dealResponse.json()).resolves.toMatchObject({
      creates: 0,
      updates: 0,
      quarantined: 1,
      warnings: [{
        row: 1,
        id: "DEAL-PUBLISHED",
        status: "quarantined",
        code: "PUBLISHED_DEAL_UPDATE_BLOCKED",
      }],
      errors: [{ row: 2, id: "DEAL-BAD" }],
    });

    mocks.companyFindMany.mockResolvedValue([{
      id: "database-company-published",
      name: "Portfolio Company",
      country: "United States",
      status: "PUBLISHED",
    }]);
    const companyResponse = await importCompanies(jsonRequest(
      "/api/imports/portfolio?preview=1",
      { companies: [company(), company({ name: "Invalid Company", country: "" })] },
    ));
    await expect(companyResponse.json()).resolves.toMatchObject({
      creates: 0,
      updates: 0,
      quarantined: 1,
      warnings: [{
        row: 1,
        name: "Portfolio Company",
        country: "United States",
        status: "quarantined",
        code: "PUBLISHED_COMPANY_UPDATE_BLOCKED",
      }],
      errors: [{ row: 2, name: "Invalid Company" }],
    });
  });

  it("commits deal mutations, the audit event, and pipeline success in one transaction", async () => {
    mocks.dealFindMany.mockResolvedValue([{ id: "database-deal-1", legacyId: "DEAL-EXISTING", status: "DRAFT" }]);
    const tx = {
      deal: {
        findMany: vi.fn().mockResolvedValue([{ id: "database-deal-1", legacyId: "DEAL-EXISTING", status: "DRAFT" }]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({ id: "database-deal-1" }),
      },
      dealParticipant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
        create: vi.fn().mockResolvedValue({}),
      },
      organization: {
        upsert: vi.fn().mockImplementation(async ({ where }: { where: { name: string } }) => ({
          id: `organization-${where.name.toLowerCase()}`,
        })),
      },
      citation: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      source: { upsert: vi.fn().mockResolvedValue({ id: "source-1" }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    const response = await importDeals(jsonRequest(
      "/api/imports/deals",
      { deals: [deal({ id: "DEAL-EXISTING" }), { id: "DEAL-BAD" }] },
    ));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ imported: 1, auditEventId: "audit-1" });
    expect(payload.errors).toHaveLength(1);
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "Serializable",
      maxWait: 10_000,
      timeout: 120_000,
    });
    expect(tx.deal.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "database-deal-1", status: { in: ["DRAFT", "IN_REVIEW"] } },
      data: expect.objectContaining({ target: "Target" }),
    }));
    expect(tx.dealParticipant.deleteMany).toHaveBeenCalledWith({
      where: { dealId: "database-deal-1", role: { in: ["BUYER", "SELLER"] } },
    });
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      {
        entityType: "Deal",
        action: "BULK_IMPORT",
        changes: expect.objectContaining({
          changedFields: expect.arrayContaining(["target", "title"]),
          inserted: 0,
          updated: 1,
          errors: 1,
          quarantined: 0,
        }),
      },
      tx,
    );
    expect(mocks.pipelineCreate).toHaveBeenCalledWith({
      data: {
        pipeline: "BULK_IMPORT_DEALS",
        status: "RUNNING",
        metadata: { rowCount: 2 },
      },
      select: { id: true },
    });
    expect(tx.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: "pipeline-1" },
      data: expect.objectContaining({
        status: "SUCCEEDED",
        inserted: 0,
        updated: 1,
        skipped: 1,
        metadata: { auditEventId: "audit-1" },
      }),
    });
    expect(mocks.pipelineUpdate).not.toHaveBeenCalled();
  });

  it("rolls back the commit boundary when the audit fails and records a sanitized failed run", async () => {
    mocks.dealFindMany.mockResolvedValue([]);
    const tx = {
      deal: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: "database-deal-1" }),
      },
      dealParticipant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({}),
      },
      organization: {
        upsert: vi.fn().mockImplementation(async ({ where }: { where: { name: string } }) => ({
          id: `organization-${where.name.toLowerCase()}`,
        })),
      },
      citation: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      source: { upsert: vi.fn().mockResolvedValue({ id: "source-1" }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));
    mocks.recordAuditEvent.mockRejectedValue(new Error(
      "audit insert failed for password=do-not-store imported-row=Target",
    ));

    const response = await importDeals(jsonRequest("/api/imports/deals", { deals: [deal()] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to import deals" });
    expect(tx.deal.create).toHaveBeenCalledOnce();
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: "Deal", action: "BULK_IMPORT" }),
      tx,
    );
    expect(tx.pipelineRun.update).not.toHaveBeenCalled();
    expect(mocks.pipelineUpdate).toHaveBeenCalledWith({
      where: { id: "pipeline-1" },
      data: expect.objectContaining({
        status: "FAILED",
        errorSummary: "internal_error: Server operation failed.",
      }),
    });
    expect(JSON.stringify(mocks.pipelineUpdate.mock.calls)).not.toContain("do-not-store");
    expect(JSON.stringify(mocks.pipelineUpdate.mock.calls)).not.toContain("Target");
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("creates a pipeline run for every fund and company commit attempt", async () => {
    mocks.fundFindMany.mockResolvedValue([]);
    const fundTx = {
      organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
      fund: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: "fund-1" }),
        updateMany: vi.fn(),
      },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementationOnce(
      async (callback: (client: typeof fundTx) => unknown) => callback(fundTx),
    );

    const fundResponse = await importFunds(jsonRequest("/api/imports/funds", { funds: [fund()] }));
    expect(fundResponse.status).toBe(200);
    expect(mocks.pipelineCreate).toHaveBeenLastCalledWith({
      data: {
        pipeline: "BULK_IMPORT_FUNDS",
        status: "RUNNING",
        metadata: { rowCount: 1 },
      },
      select: { id: true },
    });
    expect(mocks.recordAuditEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        entityType: "Fund",
        action: "BULK_IMPORT",
        changes: expect.objectContaining({
          changedFields: expect.arrayContaining(["fundName", "managerName", "status"]),
        }),
      }),
      fundTx,
    );
    expect(fundTx.pipelineRun.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SUCCEEDED", inserted: 1 }),
    }));

    mocks.pipelineCreate.mockResolvedValueOnce({ id: "pipeline-2" });
    mocks.companyFindMany.mockResolvedValue([]);
    const companyTx = {
      company: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: "company-1" }),
        updateMany: vi.fn(),
      },
      organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
      fund: { findFirst: vi.fn().mockResolvedValue({ id: "fund-1" }) },
      ownershipPeriod: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      citation: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementationOnce(
      async (callback: (client: typeof companyTx) => unknown) => callback(companyTx),
    );

    const companyResponse = await importCompanies(jsonRequest(
      "/api/imports/portfolio",
      { companies: [company()] },
    ));
    expect(companyResponse.status).toBe(200);
    expect(mocks.pipelineCreate).toHaveBeenLastCalledWith({
      data: {
        pipeline: "BULK_IMPORT_COMPANIES",
        status: "RUNNING",
        metadata: { rowCount: 1 },
      },
      select: { id: true },
    });
    expect(mocks.recordAuditEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        entityType: "Company",
        action: "BULK_IMPORT",
        changes: expect.objectContaining({
          changedFields: expect.arrayContaining(["name", "ownershipPeriods", "status"]),
        }),
      }),
      companyTx,
    );
    expect(companyTx.pipelineRun.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "pipeline-2" },
      data: expect.objectContaining({ status: "SUCCEEDED", inserted: 1 }),
    }));
  });

  it("commits safe fund changes while quarantining published rows in the same audited transaction", async () => {
    mocks.fundFindMany.mockResolvedValue([
      { id: "database-fund-published", legacyId: "FUND-PUBLISHED", status: "PUBLISHED" },
      { id: "database-fund-draft", legacyId: "FUND-DRAFT", status: "DRAFT" },
    ]);
    const fundTx = {
      organization: {
        upsert: vi.fn().mockImplementation(async ({ where }: { where: { name: string } }) => ({
          id: `manager-${where.name.toLowerCase().replaceAll(" ", "-")}`,
        })),
      },
      fund: {
        findMany: vi.fn().mockResolvedValue([
          { id: "database-fund-published", legacyId: "FUND-PUBLISHED", status: "PUBLISHED" },
          { id: "database-fund-draft", legacyId: "FUND-DRAFT", status: "DRAFT" },
        ]),
        create: vi.fn().mockResolvedValue({ id: "database-fund-new" }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof fundTx) => unknown) => callback(fundTx),
    );

    const response = await importFunds(jsonRequest("/api/imports/funds", {
      funds: [
        fund({ id: "FUND-PUBLISHED", fundName: "Published Fund", managerName: "Published Manager" }),
        fund({ id: "FUND-DRAFT", fundName: "Draft Fund", managerName: "Draft Manager" }),
        fund({
          id: "FUND-NEW",
          fundName: "New Fund",
          managerName: "New Manager",
          primarySourceUrl: "https://example.com/test/fund-primary",
        }),
      ],
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      imported: 2,
      quarantined: 1,
      errors: [{
        fundId: "FUND-PUBLISHED",
        fundName: "Published Fund",
        status: "quarantined",
        existingStatus: "PUBLISHED",
        code: "PUBLISHED_FUND_UPDATE_BLOCKED",
      }],
      auditEventId: "audit-1",
    });
    expect(fundTx.organization.upsert).toHaveBeenCalledTimes(2);
    expect(fundTx.fund.updateMany).toHaveBeenCalledOnce();
    expect(fundTx.fund.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: "database-fund-draft",
        status: { in: ["DRAFT", "IN_REVIEW"] },
      },
    }));
    expect(fundTx.fund.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        legacyId: "FUND-NEW",
        primarySourceUrl: "https://example.com/test/fund-primary",
        status: "DRAFT",
      }),
    }));
    expect(fundTx.fund.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ primarySourceUrl: null }),
    }));
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      entityType: "Fund",
      action: "BULK_IMPORT",
      changes: expect.objectContaining({
        changedFields: expect.arrayContaining([
          "fundName",
          "legacyId",
          "managerName",
          "primarySourceUrl",
          "status",
        ]),
        inserted: 1,
        updated: 1,
        errors: 1,
        quarantined: 1,
      }),
    }, fundTx);
    expect(fundTx.pipelineRun.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: "SUCCEEDED",
        inserted: 1,
        updated: 1,
        skipped: 1,
      }),
    }));
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
  });

  it("previews a portfolio ownership replacement before any write", async () => {
    mocks.companyFindMany.mockResolvedValue([{
      id: "company-1",
      name: "Portfolio Company",
      country: "United States",
      status: "DRAFT",
      ownershipPeriods: [{
        id: "ownership-old",
        isActive: true,
        vehicleName: "Old Fund",
        organization: { name: "Old Manager" },
      }],
    }]);

    const response = await importCompanies(jsonRequest(
      "/api/imports/portfolio?preview=1",
      { companies: [company({ investmentFirm: "New Manager", ownershipVehicle: "New Fund" })] },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      creates: 0,
      updates: 1,
      ownershipChanges: [{
        row: 1,
        name: "Portfolio Company",
        action: "replace",
        from: ["Old Manager · Old Fund"],
        to: "New Manager · New Fund",
        code: "OWNERSHIP_REPLACE",
      }],
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("retires conflicting ownership and activates its replacement in the import transaction", async () => {
    const existing = {
      id: "company-1",
      name: "Portfolio Company",
      country: "United States",
      status: "DRAFT",
      ownershipPeriods: [{
        id: "ownership-old",
        isActive: true,
        vehicleName: "Old Fund",
        organization: { name: "Old Manager" },
      }],
    };
    const tx = {
      company: {
        findMany: vi.fn().mockResolvedValue([existing]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn(),
      },
      organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-new" }) },
      fund: { findFirst: vi.fn().mockResolvedValue({ id: "fund-new" }) },
      ownershipPeriod: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      citation: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.companyFindMany.mockResolvedValue([existing]);
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );

    const response = await importCompanies(jsonRequest(
      "/api/imports/portfolio",
      { companies: [company({ investmentFirm: "New Manager", ownershipVehicle: "New Fund" })] },
    ));

    expect(response.status).toBe(200);
    expect(tx.ownershipPeriod.updateMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", isActive: true },
      data: { isActive: false },
    });
    expect(tx.ownershipPeriod.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        companyId_organizationId_vehicleName: {
          companyId: "company-1",
          organizationId: "manager-new",
          vehicleName: "New Fund",
        },
      },
      update: expect.objectContaining({ fundId: "fund-new", isActive: true }),
    }));
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "Company",
        action: "BULK_IMPORT",
        changes: expect.objectContaining({
          changedFields: expect.arrayContaining(["ownershipPeriods"]),
        }),
      }),
      tx,
    );
  });

  it("previews and transactionally clears active ownership when the firm is removed", async () => {
    const existing = {
      id: "company-1",
      name: "Portfolio Company",
      country: "United States",
      status: "DRAFT",
      ownershipPeriods: [{
        id: "ownership-old",
        isActive: true,
        vehicleName: "Old Fund",
        organization: { name: "Old Manager" },
      }],
    };
    mocks.companyFindMany.mockResolvedValue([existing]);
    const preview = await importCompanies(jsonRequest(
      "/api/imports/portfolio?preview=1",
      { companies: [company({ investmentFirm: "", ownershipVehicle: "" })] },
    ));
    await expect(preview.json()).resolves.toMatchObject({
      ownershipChanges: [{
        action: "retire",
        from: ["Old Manager · Old Fund"],
        code: "OWNERSHIP_RETIRE",
      }],
    });

    const tx = {
      company: {
        findMany: vi.fn().mockResolvedValue([existing]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn(),
      },
      organization: { upsert: vi.fn() },
      fund: { findFirst: vi.fn() },
      ownershipPeriod: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        upsert: vi.fn(),
      },
      citation: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    mocks.pipelineCreate.mockResolvedValueOnce({ id: "pipeline-clear" });
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    const commit = await importCompanies(jsonRequest(
      "/api/imports/portfolio",
      { companies: [company({ investmentFirm: "", ownershipVehicle: "" })] },
    ));

    expect(commit.status).toBe(200);
    expect(tx.ownershipPeriod.updateMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", isActive: true },
      data: { isActive: false },
    });
    expect(tx.ownershipPeriod.upsert).not.toHaveBeenCalled();
    expect(tx.organization.upsert).not.toHaveBeenCalled();
  });

  it("rolls back a fund import if a draft becomes immutable during commit", async () => {
    mocks.fundFindMany.mockResolvedValue([
      { id: "database-fund-draft", legacyId: "FUND-DRAFT", status: "DRAFT" },
    ]);
    const fundTx = {
      organization: { upsert: vi.fn().mockResolvedValue({ id: "manager-1" }) },
      fund: {
        findMany: vi.fn().mockResolvedValue([
          { id: "database-fund-draft", legacyId: "FUND-DRAFT", status: "DRAFT" },
        ]),
        create: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      pipelineRun: { update: vi.fn() },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof fundTx) => unknown) => callback(fundTx),
    );

    const response = await importFunds(jsonRequest("/api/imports/funds", {
      funds: [fund({ id: "FUND-DRAFT", fundName: "Draft Fund" })],
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Fund import review state changed during commit. Preview the file again.",
    });
    expect(fundTx.fund.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: "database-fund-draft",
        status: { in: ["DRAFT", "IN_REVIEW"] },
      },
    }));
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
    expect(fundTx.pipelineRun.update).not.toHaveBeenCalled();
    expect(mocks.pipelineUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "pipeline-1" },
      data: expect.objectContaining({
        status: "FAILED",
        errorSummary: "internal_error: Server operation failed.",
      }),
    }));
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("caps requests at 500 rows before validation or database access", async () => {
    const response = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { deals: Array.from({ length: 501 }, (_, index) => ({ id: `DEAL-${index}` })) },
    ));

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Deal import is limited to 500 rows" });
    expect(mocks.dealFindMany).not.toHaveBeenCalled();
  });

  it("returns a safe validation message for a malformed import body", async () => {
    const response = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { records: [deal()] },
    ));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must contain a 'deals' array or be a JSON array",
    });
    expect(mocks.dealFindMany).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects duplicate stable identities within one preview instead of double-counting creates", async () => {
    mocks.dealFindMany.mockResolvedValue([]);
    const response = await importDeals(jsonRequest(
      "/api/imports/deals?preview=1",
      { deals: [deal(), deal()] },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      valid: 1,
      creates: 1,
      updates: 0,
      errors: [{ row: 2, id: "DEAL-NEW", error: "Duplicate deal identity in import" }],
    });
  });

  it("rejects unauthorized imports before parsing or database access", async () => {
    const authorizationError = new Error("Forbidden");
    mocks.requireAdmin.mockRejectedValue(authorizationError);
    mocks.isAuthorizationError.mockImplementation((error) => error === authorizationError);
    const request = jsonRequest("/api/imports/funds?preview=1", { funds: [fund()] });

    const response = await importFunds(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    expect(request.json).not.toHaveBeenCalled();
    expect(mocks.fundFindMany).not.toHaveBeenCalled();
  });
});
