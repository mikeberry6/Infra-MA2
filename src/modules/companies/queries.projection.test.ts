import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const companyFindFirst = vi.fn();
  const companyFindMany = vi.fn();
  const redirectFindUnique = vi.fn();
  const transactionClient = {
    company: { findFirst: companyFindFirst, findMany: companyFindMany },
    companyRedirect: { findUnique: redirectFindUnique },
  };
  return {
    companyFindFirst,
    companyFindMany,
    redirectFindUnique,
    companyCount: vi.fn(),
    transaction: vi.fn((callback: (client: typeof transactionClient) => unknown) => callback(transactionClient)),
  };
});

vi.mock("next/cache", () => ({
  unstable_cache: (callback: (...args: never[]) => unknown) => callback,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: mocks.companyFindMany,
      findFirst: mocks.companyFindFirst,
      count: mocks.companyCount,
    },
    companyRedirect: { findUnique: mocks.redirectFindUnique },
    $transaction: mocks.transaction,
  },
}));

import {
  getAllCompanies,
  getCompanyDetailResponse,
} from "@/modules/companies/queries";

function ownership(firm: string, year: number) {
  return {
    isActive: true,
    investmentYear: year,
    exitYear: null,
    stake: null,
    vehicleName: `${firm} Fund`,
    fundId: `fund-${firm}`,
    organization: null,
    fund: {
      fundName: `${firm} Fund`,
      status: "PUBLISHED",
      manager: { name: firm },
    },
  };
}

function companyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "company-canonical",
    name: "GridCo",
    sector: "UTILITIES",
    subsector: "Grid services",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: "Reviewed company overview.",
    companyStatus: "ACTIVE",
    website: "https://gridco.example",
    yearFounded: 2010,
    headquarters: "New York",
    status: "PUBLISHED",
    lastVerifiedAt: new Date("2026-07-10T00:00:00.000Z"),
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
    redirects: [{ retiredId: "company-retired" }],
    ownershipPeriods: [ownership("Manager One", 2021)],
    milestones: [],
    managementRoles: [],
    citations: [{
      isPrimary: true,
      purpose: "PORTFOLIO_OWNERSHIP",
      evidenceLabel: "Ownership",
      source: {
        label: "Manager portfolio",
        url: "https://example.test/ownership",
        type: "WEBSITE",
      },
    }],
    ...overrides,
  };
}

describe("company list/detail query contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a minimal list payload from active published companies only", async () => {
    mocks.companyFindMany.mockResolvedValue([companyRow()]);

    const [item] = await getAllCompanies();

    const query = mocks.companyFindMany.mock.calls[0][0];
    expect(query.where).toEqual({ status: "PUBLISHED", retirement: { is: null } });
    expect(query.select).not.toHaveProperty("description");
    expect(query.select).not.toHaveProperty("citations");
    expect(item).toEqual(expect.objectContaining({
      id: "company-canonical",
      name: "GridCo",
      owners: [expect.objectContaining({ firm: "Manager One" })],
    }));
    expect(item).not.toHaveProperty("description");
    expect(item).not.toHaveProperty("sources");
  });

  it("resolves redirects first and derives canonical-group metadata only from contributing active published rows", async () => {
    const sibling = companyRow({
      id: "company-sibling",
      name: "GridCo, LLC",
      redirects: [],
      ownershipPeriods: [ownership("Manager Two", 2022), ownership("Manager Three", 2020)],
      updatedAt: new Date("2026-07-22T00:00:00.000Z"),
      lastVerifiedAt: null,
      citations: [
        {
          isPrimary: true,
          purpose: "PORTFOLIO_OWNERSHIP",
          evidenceLabel: "Ownership",
          source: {
            label: "Manager portfolio duplicate",
            url: "https://example.test/ownership",
            type: "WEBSITE",
          },
        },
        {
          isPrimary: false,
          purpose: "COMPANY_PROFILE",
          evidenceLabel: "Profile",
          source: {
            label: "Company profile",
            url: "https://example.test/profile",
            type: "WEBSITE",
          },
        },
      ],
    });
    mocks.redirectFindUnique.mockResolvedValue({
      company: { id: "company-canonical", status: "PUBLISHED", retirement: null },
    });
    mocks.companyFindMany
      .mockResolvedValueOnce([
        { id: "company-canonical", name: "GridCo" },
        { id: "company-sibling", name: "GridCo, LLC" },
      ])
      .mockResolvedValueOnce([companyRow(), sibling]);

    const response = await getCompanyDetailResponse("company-retired");

    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "RepeatableRead",
    });
    expect(mocks.redirectFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { retiredId: "company-retired" },
    }));
    expect(mocks.companyFindFirst).not.toHaveBeenCalled();
    expect(mocks.companyFindMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: {
        id: { in: ["company-canonical", "company-sibling"] },
        status: "PUBLISHED",
        retirement: { is: null },
      },
    }));
    expect(response).toEqual(expect.objectContaining({
      data: expect.objectContaining({
        id: "company-canonical",
        focusIds: expect.arrayContaining(["company-canonical", "company-retired", "company-sibling"]),
      }),
      meta: {
        canonicalId: "company-canonical",
        updatedAt: "2026-07-22T00:00:00.000Z",
        lastVerifiedAt: null,
        sourceCount: 2,
      },
    }));
  });

  it("uses the oldest verification time only when every contributing row is verified", async () => {
    mocks.redirectFindUnique.mockResolvedValue(null);
    mocks.companyFindFirst.mockResolvedValue({ id: "company-canonical" });
    mocks.companyFindMany
      .mockResolvedValueOnce([
        { id: "company-canonical", name: "GridCo" },
        { id: "company-sibling", name: "GridCo, LLC" },
      ])
      .mockResolvedValueOnce([
        companyRow({ lastVerifiedAt: new Date("2026-07-12T00:00:00.000Z") }),
        companyRow({
          id: "company-sibling",
          name: "GridCo, LLC",
          redirects: [],
          lastVerifiedAt: new Date("2026-07-05T00:00:00.000Z"),
        }),
      ]);

    const response = await getCompanyDetailResponse("company-canonical");

    expect(response?.meta.lastVerifiedAt).toBe("2026-07-05T00:00:00.000Z");
  });

  it("uses the same canonical spine for minimal lists and full details when owner counts tie", async () => {
    const canonicalListRow = companyRow({ description: undefined });
    const siblingListRow = companyRow({
      id: "company-sibling",
      name: "GridCo, LLC",
      redirects: [],
      description: undefined,
    });
    mocks.companyFindMany.mockResolvedValueOnce([canonicalListRow, siblingListRow]);

    const [listItem] = await getAllCompanies();
    expect(listItem.id).toBe("company-canonical");

    mocks.redirectFindUnique.mockResolvedValue(null);
    mocks.companyFindFirst.mockResolvedValue({ id: "company-canonical" });
    mocks.companyFindMany
      .mockResolvedValueOnce([
        { id: "company-canonical", name: "GridCo" },
        { id: "company-sibling", name: "GridCo, LLC" },
      ])
      .mockResolvedValueOnce([
        companyRow({ description: "Short." }),
        companyRow({
          id: "company-sibling",
          name: "GridCo, LLC",
          redirects: [],
          description: "A much longer sibling description that must not change the canonical spine.",
        }),
      ]);

    const detail = await getCompanyDetailResponse(listItem.id);
    expect(detail?.data.id).toBe(listItem.id);
    expect(detail?.meta.canonicalId).toBe(listItem.id);
  });
});
