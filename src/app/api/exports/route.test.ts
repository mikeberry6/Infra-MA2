import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canExportData: vi.fn(),
  dealDetails: vi.fn(),
  fundDetails: vi.fn(),
  companyDetails: vi.fn(),
  analytics: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({ canExportData: mocks.canExportData }));
vi.mock("@/modules/deals/queries", () => ({ getAllDealDetails: mocks.dealDetails }));
vi.mock("@/modules/funds/queries", () => ({ getAllFundDetails: mocks.fundDetails }));
vi.mock("@/modules/companies/queries", () => ({ getAllCompanyDetails: mocks.companyDetails }));
vi.mock("@/lib/server-product-analytics", () => ({
  trackServerProductEvent: mocks.analytics,
}));

import { GET as exportDeals } from "@/app/api/exports/deals/route";
import { GET as exportFunds } from "@/app/api/exports/funds/route";
import { GET as exportPortfolio } from "@/app/api/exports/portfolio/route";

describe("authenticated full-detail exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canExportData.mockResolvedValue(true);
    mocks.analytics.mockResolvedValue(false);
  });

  it.each([
    ["deals", exportDeals, mocks.dealDetails],
    ["funds", exportFunds, mocks.fundDetails],
    ["portfolio", exportPortfolio, mocks.companyDetails],
  ] as const)("uses the separate %s full-detail collection and records a safe event", async (
    entity,
    handler,
    query,
  ) => {
    query.mockResolvedValue([{ id: `${entity}-1` }]);
    const request = new NextRequest(`https://example.test/api/exports/${entity}?format=json`, {
      headers: { "x-request-id": "request-1" },
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(query).toHaveBeenCalledTimes(1);
    expect(mocks.analytics).toHaveBeenCalledWith(
      "export_started",
      { entity },
    );
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      data: [{ id: `${entity}-1` }],
      count: 1,
    }));
  });

  it("does not query, log, or expose export data before authorization", async () => {
    mocks.canExportData.mockResolvedValue(false);

    const response = await exportDeals(new NextRequest(
      "https://example.test/api/exports/deals?format=json",
    ));

    expect(response.status).toBe(403);
    expect(mocks.dealDetails).not.toHaveBeenCalled();
    expect(mocks.analytics).not.toHaveBeenCalled();
  });
});
