import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  role: null as "ADMIN" | "ANALYST" | "SUBSCRIBER" | null,
  canExportData: vi.fn(),
  getAllDeals: vi.fn(),
  getAllFundDetails: vi.fn(),
  getAllCompanyDetails: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  canExportData: mocks.canExportData,
}));
vi.mock("@/modules/deals/queries", () => ({
  getAllDeals: mocks.getAllDeals,
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
    query: mocks.getAllDeals,
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
    mocks.getAllDeals.mockReset().mockResolvedValue([]);
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
});
