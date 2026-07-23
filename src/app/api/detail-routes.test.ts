import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deal: vi.fn(),
  fund: vi.fn(),
  company: vi.fn(),
}));

vi.mock("@/modules/deals/queries", () => ({
  getDealDetailResponse: mocks.deal,
}));
vi.mock("@/modules/funds/queries", () => ({
  getFundDetailResponse: mocks.fund,
}));
vi.mock("@/modules/companies/queries", () => ({
  getCompanyDetailResponse: mocks.company,
}));

import { GET as getDeal } from "@/app/api/deals/[legacyId]/route";
import { GET as getFund } from "@/app/api/funds/[legacyId]/route";
import { GET as getCompany } from "@/app/api/portfolio/[id]/route";

const envelope = {
  data: { id: "canonical-1", name: "Public record" },
  meta: {
    canonicalId: "canonical-1",
    updatedAt: "2026-07-20T00:00:00.000Z",
    lastVerifiedAt: null,
    sourceCount: 1,
  },
};

describe("public detail API contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["deal", getDeal, mocks.deal, { legacyId: "deal%2Fone" }, "deal/one"],
    ["fund", getFund, mocks.fund, { legacyId: "fund%2Fone" }, "fund/one"],
    ["company", getCompany, mocks.company, { id: "company%2Fone" }, "company/one"],
  ] as const)("returns the %s envelope from one query-layer operation with no-store", async (
    _entity,
    handler,
    query,
    routeParams,
    expectedId,
  ) => {
    query.mockResolvedValue(envelope);

    const invoke = handler as unknown as (
      request: Request,
      context: { params: Promise<Record<string, string>> },
    ) => Promise<Response>;
    const response = await invoke(
      new Request("https://example.test/api/detail"),
      { params: Promise.resolve(routeParams) },
    );

    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expectedId);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual(envelope);
  });

  it("returns a no-store 404 without changing the response shape", async () => {
    mocks.company.mockResolvedValue(null);

    const response = await getCompany(new Request("https://example.test"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({ error: "Company not found" });
  });

  it("rejects malformed encoded identifiers before querying", async () => {
    const response = await getDeal(new Request("https://example.test"), {
      params: Promise.resolve({ legacyId: "%E0%A4%A" }),
    });

    expect(response.status).toBe(400);
    expect(mocks.deal).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
  });
});
