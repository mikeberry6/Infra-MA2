import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    company: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  };
  return {
    tx,
    companyFindFirst: vi.fn(),
    transaction: vi.fn(),
    requireAdmin: vi.fn(),
    recordAuditEvent: vi.fn(),
    revalidate: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: { findFirst: mocks.companyFindFirst },
    fund: { findFirst: vi.fn(), findMany: vi.fn() },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/modules/auth/guards", () => ({
  requireAdmin: mocks.requireAdmin,
  isAuthorizationError: () => false,
}));
vi.mock("@/modules/operations/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));
vi.mock("@/lib/revalidation", () => ({ revalidateAppData: mocks.revalidate }));

import { createCompany, publishCompany } from "./actions";

function companyForm(name: string): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name,
    country: "United States",
    sector: "Digital",
    region: "North America",
    status: "Active",
  })) form.set(key, value);
  return form;
}

describe("admin canonical company identity gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => unknown) => callback(mocks.tx));
  });

  it("blocks draft creation when the name overlaps an active canonical company", async () => {
    mocks.tx.company.findMany.mockResolvedValue([{
      id: "canonical",
      name: "Example Data Holdings, LLC",
      retirement: null,
    }]);

    await expect(createCompany(companyForm("Example Data Holdings, Inc."))).resolves.toEqual({
      success: false,
      error: "Company identity matches an existing company and requires reviewed merge/disambiguation.",
    });
    expect(mocks.tx.company.create).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("blocks publication when a retained retired alias conflicts", async () => {
    mocks.companyFindFirst.mockResolvedValue({
      status: "IN_REVIEW",
      updatedAt: new Date("2026-07-22T12:00:00.000Z"),
      name: "Retired Alias Inc.",
      country: "United States",
      sector: "DIGITAL",
      description: "A reviewed digital infrastructure company.",
      website: "https://example.com",
      ownershipPeriods: [{
        id: "ownership-1",
        fundId: null,
        organizationId: "organization-1",
        fund: null,
      }],
      citations: [{ id: "citation-1" }],
    });
    mocks.tx.company.findMany.mockResolvedValue([{
      id: "retired",
      name: "Retired Alias, LLC",
      retirement: { companyId: "canonical" },
    }]);

    await expect(publishCompany("draft-1")).resolves.toEqual({
      success: false,
      error: "Company identity matches a retired canonical alias and requires reviewed merge/disambiguation.",
    });
    expect(mocks.tx.company.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });
});
