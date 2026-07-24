import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  redirectFindUnique: vi.fn(),
  count: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      findUnique: mocks.findUnique,
      count: mocks.count,
    },
    companyRedirect: { findUnique: mocks.redirectFindUnique },
  },
}));

import {
  getAllCompanies,
  getCompanyById,
  getCompanyByFocusId,
  getCompanyCount,
} from "@/modules/companies/queries";

const ownershipPeriod = {
  id: "ownership-1",
  companyId: "company-1",
  organizationId: "organization-1",
  fundId: "fund-1",
  vehicleName: "Infrastructure Fund V",
  investmentYear: 2024,
  exitYear: null,
  isActive: true,
  stake: "100%",
  createdAt: new Date("2026-07-20T00:00:00.000Z"),
  updatedAt: new Date("2026-07-20T00:00:00.000Z"),
  organization: { name: "Fallback Organization" },
  fund: {
    status: "PUBLISHED",
    fundName: "Infrastructure Fund V",
    manager: { name: "Canonical Manager" },
  },
};

const listRow = {
  id: "company-1",
  redirects: [
    { retiredId: "company-retired" },
    { retiredId: "company-retired-older" },
  ],
  name: "Portfolio Company",
  sector: "DIGITAL",
  subsector: "Fiber",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  companyStatus: "ACTIVE",
  ownershipPeriods: [ownershipPeriod],
};

const detailRow = {
  ...listRow,
  description: "A fiber platform.",
  status: "PUBLISHED",
  website: "https://example.test/company",
  yearFounded: 2012,
  headquarters: "New York, NY",
  createdAt: new Date("2026-07-20T00:00:00.000Z"),
  updatedAt: new Date("2026-07-21T00:00:00.000Z"),
  lastVerifiedAt: new Date("2026-07-21T00:00:00.000Z"),
  milestones: [{ date: "2024", event: "Canonical Manager invested.", category: "FINANCING" }],
  managementRoles: [{ title: "Chief Executive Officer", person: { name: "Executive" } }],
  citations: [{
    purpose: "OWNERSHIP",
    evidenceLabel: "Acquisition announcement",
    source: { label: "Company release", url: "https://example.test/source", type: "ARTICLE" },
  }],
};

describe("company query projections and canonical redirects", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it("loads only published list rows without scorecard-heavy relations", async () => {
    mocks.findMany.mockResolvedValue([listRow]);

    const companies = await getAllCompanies({ detail: false });

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED" },
      select: expect.objectContaining({
        id: true,
        redirects: {
          select: { retiredId: true },
          orderBy: { retiredId: "asc" },
        },
        name: true,
        ownershipPeriods: expect.any(Object),
      }),
      orderBy: { name: "asc" },
    }));
    const select = mocks.findMany.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("milestones");
    expect(select).not.toHaveProperty("managementRoles");
    expect(select).not.toHaveProperty("citations");
    expect(select.ownershipPeriods.select).not.toHaveProperty("stake");
    expect(select.ownershipPeriods.select).not.toHaveProperty("exitYear");
    expect(select.ownershipPeriods.where).toEqual({
      OR: [
        { fundId: null },
        { fund: { is: { status: "PUBLISHED" } } },
      ],
    });
    expect(companies[0]).toMatchObject({
      id: "company-1",
      investmentFirm: "Canonical Manager",
      ownershipVehicle: "Infrastructure Fund V",
      investmentYear: 2024,
      focusIds: ["company-1", "company-retired", "company-retired-older"],
      sector: "Digital",
      region: "North America",
    });
    expect(companies[0]).not.toHaveProperty("milestones");
    expect(companies[0]).not.toHaveProperty("management");
    expect(companies[0]).not.toHaveProperty("sources");
    expect(companies[0]).not.toHaveProperty("description");
    expect(companies[0]).not.toHaveProperty("website");
  });

  it("does not hide duplicate database rows in the public query layer", async () => {
    mocks.findMany.mockResolvedValue([
      listRow,
      {
        ...listRow,
        id: "company-duplicate",
        name: "Portfolio Company, LLC",
      },
    ]);

    const companies = await getAllCompanies({ detail: false });

    expect(companies.map((company) => company.id)).toEqual([
      "company-1",
      "company-duplicate",
    ]);
    expect(companies).toHaveLength(2);
  });

  it("resolves a retired ID and hydrates only the published canonical company", async () => {
    mocks.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(detailRow);
    mocks.redirectFindUnique.mockResolvedValue({
      company: { id: "company-1", status: "PUBLISHED" },
    });

    const company = await getCompanyByFocusId("company-retired");

    expect(mocks.findFirst).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { id: "company-retired", status: "PUBLISHED" },
      include: expect.objectContaining({
        redirects: expect.any(Object),
        milestones: expect.any(Object),
        managementRoles: expect.any(Object),
        citations: expect.any(Object),
      }),
    }));
    expect(mocks.redirectFindUnique).toHaveBeenCalledWith({
      where: { retiredId: "company-retired" },
      select: { company: { select: { id: true, status: true } } },
    });
    expect(mocks.findFirst).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: { id: "company-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        redirects: expect.any(Object),
        milestones: expect.any(Object),
        managementRoles: expect.any(Object),
        citations: expect.any(Object),
      }),
    }));
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(company).toMatchObject({
      id: "company-1",
      focusIds: ["company-1", "company-retired", "company-retired-older"],
      description: "A fiber platform.",
      management: [{ name: "Executive", title: "Chief Executive Officer" }],
      sources: [{
        label: "Company release",
        purpose: "OWNERSHIP",
        evidenceLabel: "Acquisition announcement",
      }],
    });
  });

  it("does not follow a redirect to an unpublished canonical company", async () => {
    mocks.findFirst.mockResolvedValue(null);
    mocks.redirectFindUnique.mockResolvedValue({
      company: { id: "company-draft", status: "DRAFT" },
    });

    await expect(getCompanyByFocusId("company-retired")).resolves.toBeNull();
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.findFirst).toHaveBeenCalledOnce();
  });

  it("hydrates a company by ID only when it is published", async () => {
    mocks.findFirst.mockResolvedValue(detailRow);

    const company = await getCompanyById("company-1");

    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "company-1", status: "PUBLISHED" },
      include: expect.objectContaining({
        redirects: expect.any(Object),
        milestones: expect.any(Object),
        managementRoles: expect.any(Object),
        citations: expect.any(Object),
      }),
    }));
    expect(company).toMatchObject({ id: "company-1", description: "A fiber platform." });
  });

  it.each(["DRAFT", "IN_REVIEW", "ARCHIVED"])(
    "suppresses ownership linked to a %s fund in list and detail projections",
    async (fundStatus) => {
      const hiddenOwnership = {
        ...ownershipPeriod,
        fund: { ...ownershipPeriod.fund, status: fundStatus },
      };
      mocks.findMany.mockResolvedValue([{ ...listRow, ownershipPeriods: [hiddenOwnership] }]);
      mocks.findFirst.mockResolvedValue([{ ...detailRow, ownershipPeriods: [hiddenOwnership] }][0]);

      const list = await getAllCompanies({ detail: false });
      const detail = await getCompanyById("company-1");

      expect(list[0]).toMatchObject({
        investmentFirm: "",
        ownershipVehicle: "",
        owners: [],
      });
      expect(detail).toMatchObject({
        investmentFirm: "",
        ownershipVehicle: "",
        owners: [],
      });
      expect(mocks.findFirst.mock.calls.at(-1)?.[0].include.ownershipPeriods.where).toEqual({
        OR: [
          { fundId: null },
          { fund: { is: { status: "PUBLISHED" } } },
        ],
      });
    },
  );

  it("counts only published companies", async () => {
    mocks.count.mockResolvedValue(17);
    await expect(getCompanyCount()).resolves.toBe(17);
    expect(mocks.count).toHaveBeenCalledWith({ where: { status: "PUBLISHED" } });
  });
});
