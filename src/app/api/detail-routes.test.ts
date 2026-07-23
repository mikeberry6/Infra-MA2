import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDealById: vi.fn(),
  getFundById: vi.fn(),
  getCompanyByFocusId: vi.fn(),
  dealFindUnique: vi.fn(),
  fundFindUnique: vi.fn(),
  companyFindMany: vi.fn(),
}));

vi.mock("@/modules/deals/queries", () => ({ getDealById: mocks.getDealById }));
vi.mock("@/modules/funds/queries", () => ({ getFundById: mocks.getFundById }));
vi.mock("@/modules/companies/queries", () => ({ getCompanyByFocusId: mocks.getCompanyByFocusId }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deal: { findUnique: mocks.dealFindUnique },
    fund: { findUnique: mocks.fundFindUnique },
    company: { findMany: mocks.companyFindMany },
  },
}));

import { GET as getDealDetail } from "@/app/api/deals/[legacyId]/route";
import { GET as getFundDetail } from "@/app/api/funds/[legacyId]/route";
import { GET as getCompanyDetail } from "@/app/api/portfolio/[id]/route";

describe("published detail API envelopes", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it("returns a consistent deal envelope with freshness and provenance metadata", async () => {
    mocks.getDealById.mockResolvedValue({
      id: "DEAL/1",
      legacyId: "DEAL/1",
      title: "Deal title",
      target: "Target",
    });
    mocks.dealFindUnique.mockResolvedValue({
      status: "PUBLISHED",
      updatedAt: new Date("2026-07-21T12:00:00.000Z"),
      lastVerifiedAt: new Date("2026-07-20T12:00:00.000Z"),
      _count: { citations: 2 },
    });

    const response = await getDealDetail(
      new Request("http://localhost/api/deals/DEAL%2F1"),
      { params: Promise.resolve({ legacyId: "DEAL%2F1" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({
      data: expect.objectContaining({ legacyId: "DEAL/1" }),
      meta: {
        canonicalId: "DEAL/1",
        updatedAt: "2026-07-21T12:00:00.000Z",
        lastVerifiedAt: "2026-07-20T12:00:00.000Z",
        sourceCount: 2,
      },
    });
    expect(mocks.getDealById).toHaveBeenCalledWith("DEAL/1");
  });

  it("does not expose a draft deal even when its detail query finds a record", async () => {
    mocks.getDealById.mockResolvedValue({ id: "DEAL-1", legacyId: "DEAL-1" });
    mocks.dealFindUnique.mockResolvedValue({
      status: "DRAFT",
      updatedAt: new Date(),
      lastVerifiedAt: null,
      _count: { citations: 0 },
    });

    const response = await getDealDetail(
      new Request("http://localhost/api/deals/DEAL-1"),
      { params: Promise.resolve({ legacyId: "DEAL-1" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Deal not found" });
  });

  it("deduplicates fund source URLs in metadata and blocks draft funds", async () => {
    mocks.getFundById.mockResolvedValue({ id: "FUND-1", legacyId: "FUND-1", fundName: "Fund" });
    mocks.fundFindUnique.mockResolvedValue({
      status: "PUBLISHED",
      updatedAt: new Date("2026-07-21T12:00:00.000Z"),
      lastVerifiedAt: null,
      primarySourceUrl: "  https://example.test/a  ",
      sourceUrls: ["https://example.test/a", " https://example.test/a ", "https://example.test/b"],
      strategyUrl: " https://example.test/b ",
    });

    const published = await getFundDetail(
      new Request("http://localhost/api/funds/FUND-1"),
      { params: Promise.resolve({ legacyId: "FUND-1" }) },
    );
    expect(published.status).toBe(200);
    expect((await published.json()).meta).toMatchObject({ sourceCount: 2, lastVerifiedAt: null });

    mocks.fundFindUnique.mockResolvedValueOnce({
      status: "DRAFT",
      updatedAt: new Date(),
      lastVerifiedAt: null,
      primarySourceUrl: null,
      sourceUrls: [],
      strategyUrl: "",
    });
    const draft = await getFundDetail(
      new Request("http://localhost/api/funds/FUND-1"),
      { params: Promise.resolve({ legacyId: "FUND-1" }) },
    );
    expect(draft.status).toBe(404);
  });

  it("aggregates canonical company metadata across redirected or deduplicated rows", async () => {
    mocks.getCompanyByFocusId.mockResolvedValue({
      id: "company-canonical",
      focusIds: ["company-old", "company-canonical"],
      name: "Company",
    });
    mocks.companyFindMany.mockResolvedValue([
      {
        id: "company-old",
        status: "ARCHIVED",
        updatedAt: new Date("2026-07-20T12:00:00.000Z"),
        lastVerifiedAt: new Date("2026-07-18T12:00:00.000Z"),
        _count: { citations: 1 },
      },
      {
        id: "company-canonical",
        status: "PUBLISHED",
        updatedAt: new Date("2026-07-22T12:00:00.000Z"),
        lastVerifiedAt: new Date("2026-07-21T12:00:00.000Z"),
        _count: { citations: 3 },
      },
    ]);

    const response = await getCompanyDetail(
      new Request("http://localhost/api/portfolio/company-old"),
      { params: Promise.resolve({ id: "company-old" }) },
    );

    expect(response.status).toBe(200);
    expect((await response.json()).meta).toEqual({
      canonicalId: "company-canonical",
      updatedAt: "2026-07-22T12:00:00.000Z",
      lastVerifiedAt: "2026-07-21T12:00:00.000Z",
      sourceCount: 4,
    });
    expect(mocks.companyFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: ["company-old", "company-canonical"] } },
    }));
  });

  it("fails closed when a cached company detail points at a depublished canonical row", async () => {
    mocks.getCompanyByFocusId.mockResolvedValue({
      id: "company-canonical",
      focusIds: ["company-old", "company-canonical"],
      name: "Stale cached company",
    });
    mocks.companyFindMany.mockResolvedValue([
      {
        id: "company-old",
        status: "ARCHIVED",
        updatedAt: new Date("2026-07-20T12:00:00.000Z"),
        lastVerifiedAt: null,
        _count: { citations: 1 },
      },
      {
        id: "company-canonical",
        status: "ARCHIVED",
        updatedAt: new Date("2026-07-22T12:00:00.000Z"),
        lastVerifiedAt: null,
        _count: { citations: 2 },
      },
    ]);

    const response = await getCompanyDetail(
      new Request("http://localhost/api/portfolio/company-old"),
      { params: Promise.resolve({ id: "company-old" }) },
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({ error: "Company not found" });
  });

  it("returns 404 when no published canonical company can be resolved", async () => {
    mocks.getCompanyByFocusId.mockResolvedValue(null);

    const response = await getCompanyDetail(
      new Request("http://localhost/api/portfolio/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.companyFindMany).not.toHaveBeenCalled();
  });

  it.each([
    ["deal", getDealDetail, { legacyId: "%E0%A4%A" }, "Invalid deal identifier"],
    ["fund", getFundDetail, { legacyId: "%E0%A4%A" }, "Invalid fund identifier"],
    ["company", getCompanyDetail, { id: "%E0%A4%A" }, "Invalid company identifier"],
  ] as const)("rejects a malformed encoded %s identifier without querying data", async (
    _entity,
    handler,
    params,
    error,
  ) => {
    const response = await handler(
      new Request("http://localhost/api/detail/%E0%A4%A"),
      { params: Promise.resolve(params) } as never,
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({ error });
    expect(mocks.getDealById).not.toHaveBeenCalled();
    expect(mocks.getFundById).not.toHaveBeenCalled();
    expect(mocks.getCompanyByFocusId).not.toHaveBeenCalled();
  });
});
