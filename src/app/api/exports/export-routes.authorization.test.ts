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
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    expect(query).not.toHaveBeenCalled();
  });

  it.each(routes)("denies subscriber access to $label exports", async ({ get, url, query }) => {
    mocks.role = "SUBSCRIBER";

    const response = await get(new NextRequest(url));

    expect(response.status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });

  for (const role of ["ANALYST", "ADMIN"] as const) {
    it.each(routes)(`allows ${role.toLowerCase()} access to $label exports`, async ({ get, url, query }) => {
      mocks.role = role;

      const response = await get(new NextRequest(url));

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("text/csv");
      expect(query).toHaveBeenCalledOnce();
    });
  }

  it("preserves full deal detail fields in CSV and JSON exports", async () => {
    mocks.role = "ANALYST";
    mocks.getAllDealDetails.mockResolvedValue([{
      legacyId: "DEAL-1",
      title: "Buyer acquires Target",
      target: "Target",
      buyer: "Buyer",
      seller: "Seller",
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
    });

    const jsonResponse = await exportDeals(
      new NextRequest("http://localhost/api/exports/deals?format=json"),
    );
    expect(jsonResponse.status).toBe(200);
    const body = await jsonResponse.json();
    expect(body.data[0]).toMatchObject({
      description: "Full deal description",
      enterpriseValue: "$1bn",
      assetScale: "1,000 route miles",
      fundVehicle: "Infrastructure Fund V",
    });
  });
});
