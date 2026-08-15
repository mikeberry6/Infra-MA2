import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      count: mocks.count,
    },
  },
}));

import {
  getAllCompanies,
  getCompanyByFocusId,
} from "@/modules/companies/queries";

describe("redirect-aware public company queries", () => {
  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.findFirst.mockReset();
    mocks.count.mockReset();
  });

  it("keeps distinct physical companies separate even when their display keys match", async () => {
    mocks.findMany.mockResolvedValue([
      companyFixture({ id: "company-us", name: "Shared Platform" }),
      companyFixture({ id: "company-ca", name: "Shared Platform" }),
    ]);

    const companies = await getAllCompanies({ detail: false });

    expect(companies.map((company) => company.id)).toEqual([
      "company-us",
      "company-ca",
    ]);
    expect(companies).toHaveLength(2);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
    }));
  });

  it("includes every retired alias in the canonical company's focus IDs", async () => {
    mocks.findMany.mockResolvedValue([
      companyFixture({
        id: "company-canonical",
        redirects: [
          { retiredId: "company-retired-a" },
          { retiredId: "company-retired-b" },
          { retiredId: "company-retired-a" },
        ],
      }),
    ]);

    const [company] = await getAllCompanies({ detail: false });

    expect(company.focusIds).toEqual([
      "company-canonical",
      "company-retired-a",
      "company-retired-b",
    ]);
  });

  it("resolves a retired ID to its published canonical company", async () => {
    mocks.findFirst.mockResolvedValue(companyFixture({
      id: "company-canonical",
      redirects: [{ retiredId: "company-retired" }],
    }));

    const company = await getCompanyByFocusId("company-retired");

    expect(company).toMatchObject({
      id: "company-canonical",
      focusIds: ["company-canonical", "company-retired"],
    });
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        status: "PUBLISHED",
        OR: [
          { id: "company-retired" },
          { redirects: { some: { retiredId: "company-retired" } } },
        ],
      },
    }));
  });

  it("returns null for unknown or draft-only focus IDs while preserving the publication guard", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(getCompanyByFocusId("company-draft")).resolves.toBeNull();
    await expect(getCompanyByFocusId("company-unknown")).resolves.toBeNull();

    expect(mocks.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLISHED",
          OR: expect.arrayContaining([
            { id: "company-draft" },
            { redirects: { some: { retiredId: "company-draft" } } },
          ]),
        }),
      }),
    );
    expect(mocks.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PUBLISHED",
          OR: expect.arrayContaining([
            { id: "company-unknown" },
            { redirects: { some: { retiredId: "company-unknown" } } },
          ]),
        }),
      }),
    );
  });
});

function companyFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "company-1",
    name: "Company One",
    sector: "DIGITAL",
    subsector: "Data Centers",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    companyStatus: "ACTIVE",
    description: "A PortCo.",
    website: null,
    yearFounded: null,
    headquarters: null,
    ownershipPeriods: [],
    milestones: [],
    managementRoles: [],
    citations: [],
    redirects: [],
    ...overrides,
  };
}
