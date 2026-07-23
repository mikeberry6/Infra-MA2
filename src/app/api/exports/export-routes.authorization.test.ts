import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { parseCsv } from "@/lib/csv";

const mocks = vi.hoisted(() => ({
  role: null as "ADMIN" | "ANALYST" | "SUBSCRIBER" | null,
  canExportData: vi.fn(),
  getAllDealDetails: vi.fn(),
  getAllFundDetails: vi.fn(),
  getAllCompanyDetails: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  canExportData: mocks.canExportData,
}));
vi.mock("@/modules/deals/queries", () => ({
  getAllDealDetails: mocks.getAllDealDetails,
}));
vi.mock("@/modules/funds/queries", () => ({
  getAllFundDetails: mocks.getAllFundDetails,
}));
vi.mock("@/modules/companies/queries", () => ({
  getAllCompanyDetails: mocks.getAllCompanyDetails,
}));
vi.mock("@/lib/server-log", () => ({
  withServerOperation: (
    _request: Request,
    _context: unknown,
    operation: () => Promise<Response>,
  ) => operation(),
}));

import { GET as exportDeals } from "@/app/api/exports/deals/route";
import { GET as exportFunds } from "@/app/api/exports/funds/route";
import { GET as exportPortfolio } from "@/app/api/exports/portfolio/route";

const routes = [
  {
    label: "deals",
    url: "http://localhost/api/exports/deals",
    get: exportDeals,
    query: mocks.getAllDealDetails,
  },
  {
    label: "funds",
    url: "http://localhost/api/exports/funds",
    get: exportFunds,
    query: mocks.getAllFundDetails,
  },
  {
    label: "portfolio",
    url: "http://localhost/api/exports/portfolio",
    get: exportPortfolio,
    query: mocks.getAllCompanyDetails,
  },
] as const;

function expectPrivateNoStore(response: Response) {
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
}

describe("export route authorization", () => {
  beforeEach(() => {
    mocks.role = null;
    mocks.canExportData.mockReset().mockImplementation(
      () => Promise.resolve(mocks.role === "ADMIN" || mocks.role === "ANALYST"),
    );
    mocks.getAllDealDetails.mockReset().mockResolvedValue([]);
    mocks.getAllFundDetails.mockReset().mockResolvedValue([]);
    mocks.getAllCompanyDetails.mockReset().mockResolvedValue([]);
  });

  it.each(routes)("denies anonymous access to $label exports", async ({ get, url, query }) => {
    const response = await get(new NextRequest(url));

    expect(response.status).toBe(403);
    expectPrivateNoStore(response);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    expect(query).not.toHaveBeenCalled();
  });

  it.each(routes)("denies subscriber access to $label exports", async ({ get, url, query }) => {
    mocks.role = "SUBSCRIBER";

    const response = await get(new NextRequest(url));

    expect(response.status).toBe(403);
    expectPrivateNoStore(response);
    expect(query).not.toHaveBeenCalled();
  });

  for (const role of ["ANALYST", "ADMIN"] as const) {
    it.each(routes)(`allows ${role.toLowerCase()} access to $label exports`, async ({ get, url, query }) => {
      mocks.role = role;

      const response = await get(new NextRequest(url));

      expect(response.status).toBe(200);
      expectPrivateNoStore(response);
      expect(response.headers.get("content-type")).toContain("text/csv");
      expect(query).toHaveBeenCalledOnce();
    });
  }

  it.each(routes)("prevents caching of $label export failures", async ({ get, url, query }) => {
    mocks.role = "ADMIN";
    query.mockRejectedValueOnce(new Error("database unavailable"));

    const response = await get(new NextRequest(url));

    expect(response.status).toBe(500);
    expectPrivateNoStore(response);
  });

  it("preserves full deal detail fields in CSV and JSON exports", async () => {
    mocks.role = "ANALYST";
    mocks.getAllDealDetails.mockResolvedValue([{
      legacyId: "DEAL-1",
      title: "Buyer acquires Target",
      target: "Target",
      buyer: "Buyer",
      seller: "Seller",
      sellerDisclosureStatus: "DISCLOSED",
      sellerDisclosureReason: "Seller identified in the primary announcement.",
      sector: "Digital",
      subsector: "Fiber",
      region: "North America",
      category: ["Acquisition (Buyout)"],
      date: "2026-07-20T00:00:00.000Z",
      status: "Announced",
      description: "Full deal description",
      country: "United States",
      enterpriseValue: "$1bn",
      equityValue: "$800m",
      stake: "100%",
      closingDate: "2026-12-31T00:00:00.000Z",
      assetScale: "1,000 route miles",
      valuationMultiple: "12x EBITDA",
      fundVehicle: "Infrastructure Fund V",
      sourceName: "Primary source",
      sourceUrl: "https://example.test/deal",
    }]);

    const csvResponse = await exportDeals(new NextRequest("http://localhost/api/exports/deals"));
    expect(csvResponse.status).toBe(200);
    const [csvRow] = parseCsv(await csvResponse.text());
    expect(csvRow).toMatchObject({
      description: "Full deal description",
      enterpriseValue: "$1bn",
      equityValue: "$800m",
      assetScale: "1,000 route miles",
      valuationMultiple: "12x EBITDA",
      fundVehicle: "Infrastructure Fund V",
      sellerDisclosureStatus: "DISCLOSED",
      sellerDisclosureReason: "Seller identified in the primary announcement.",
    });

    const jsonResponse = await exportDeals(
      new NextRequest("http://localhost/api/exports/deals?format=json"),
    );
    expect(jsonResponse.status).toBe(200);
    expectPrivateNoStore(jsonResponse);
    const body = await jsonResponse.json();
    expect(body.data[0]).toMatchObject({
      description: "Full deal description",
      enterpriseValue: "$1bn",
      assetScale: "1,000 route miles",
      fundVehicle: "Infrastructure Fund V",
      sellerDisclosureStatus: "DISCLOSED",
      sellerDisclosureReason: "Seller identified in the primary announcement.",
    });
  });

  it("preserves full fund research fields in CSV and JSON exports", async () => {
    mocks.role = "ANALYST";
    mocks.getAllFundDetails.mockResolvedValue([{
      id: "FUND-1",
      legacyId: "FUND-1",
      managerName: "Infra Manager",
      fundName: "Infrastructure Fund V",
      strategies: ["Core-Plus"],
      structure: "Closed-End",
      status: "Investing",
      size: "$2.5bn",
      sizeUsdMm: 2500,
      vintage: 2026,
      sectors: ["Digital", "Power & Energy Transition"],
      regions: ["North America", "Europe"],
      investmentStrategy: "Invests in essential infrastructure platforms.",
      primarySourceUrl: "https://example.test/fund-primary",
      sourceUrls: [
        "https://example.test/fund-primary",
        "https://example.test/fund-secondary",
      ],
      ticker: "IFV",
      strategyUrl: "https://example.test/strategy",
      portfolioCompanies: [],
      managerPortfolioCompanies: [],
    }]);

    const csvResponse = await exportFunds(new NextRequest("http://localhost/api/exports/funds"));
    expect(csvResponse.status).toBe(200);
    expectPrivateNoStore(csvResponse);
    const [csvRow] = parseCsv(await csvResponse.text());
    expect(csvRow).toMatchObject({
      investmentStrategy: "Invests in essential infrastructure platforms.",
      regions: "North America; Europe",
      primarySourceUrl: "https://example.test/fund-primary",
      sourceUrls: "https://example.test/fund-primary; https://example.test/fund-secondary",
    });

    const jsonResponse = await exportFunds(
      new NextRequest("http://localhost/api/exports/funds?format=json"),
    );
    expect(jsonResponse.status).toBe(200);
    expectPrivateNoStore(jsonResponse);
    const body = await jsonResponse.json();
    expect(body.data[0]).toMatchObject({
      investmentStrategy: "Invests in essential infrastructure platforms.",
      regions: ["North America", "Europe"],
      primarySourceUrl: "https://example.test/fund-primary",
      sourceUrls: [
        "https://example.test/fund-primary",
        "https://example.test/fund-secondary",
      ],
    });
  });

  it("preserves full portfolio detail fields in JSON exports", async () => {
    mocks.role = "ANALYST";
    mocks.getAllCompanyDetails.mockResolvedValue([{
      id: "COMPANY-1",
      focusIds: ["COMPANY-1"],
      name: "Essential Networks",
      investmentFirm: "Infra Manager",
      sector: "Digital",
      subsector: "Fiber",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Infrastructure Fund V",
      status: "Active",
      description: "Operates essential fiber infrastructure.",
      website: "https://example.test/company",
      investmentYear: 2024,
      milestones: [{
        date: "2024",
        event: "Infra Manager completed its initial investment.",
        category: "Financing",
      }],
      management: [{
        name: "Avery Executive",
        title: "Chief Executive Officer",
      }],
      sources: [{
        label: "Company profile",
        url: "https://example.test/company/source",
      }],
      owners: [{
        firm: "Infra Manager",
        vehicle: "Infrastructure Fund V",
        investmentYear: 2024,
        isActive: true,
      }],
    }]);

    const response = await exportPortfolio(
      new NextRequest("http://localhost/api/exports/portfolio?format=json"),
    );

    expect(response.status).toBe(200);
    expectPrivateNoStore(response);
    const body = await response.json();
    expect(body.data[0]).toMatchObject({
      description: "Operates essential fiber infrastructure.",
      website: "https://example.test/company",
      milestones: [{
        date: "2024",
        event: "Infra Manager completed its initial investment.",
        category: "Financing",
      }],
      management: [{
        name: "Avery Executive",
        title: "Chief Executive Officer",
      }],
      sources: [{
        label: "Company profile",
        url: "https://example.test/company/source",
      }],
    });
  });
});
