import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCompanyByFocusId: vi.fn(),
}));

vi.mock("@/modules/companies/queries", () => ({
  getCompanyByFocusId: mocks.getCompanyByFocusId,
}));

import { GET } from "./route";

describe("portfolio detail verification cache version", () => {
  beforeEach(() => {
    mocks.getCompanyByFocusId.mockReset();
  });

  it("forwards a bounded after-image hash into the cached query key", async () => {
    const verification = "a".repeat(64);
    mocks.getCompanyByFocusId.mockResolvedValue({ id: "company-1" });
    const response = await GET(
      new Request(`https://example.com/api/portfolio/company-1?verification=${verification}`),
      { params: Promise.resolve({ id: "company-1" }) },
    );
    expect(response.status).toBe(200);
    expect(mocks.getCompanyByFocusId).toHaveBeenCalledWith("company-1", verification);
  });

  it("rejects unbounded cache-version input before querying", async () => {
    const response = await GET(
      new Request("https://example.com/api/portfolio/company-1?verification=random"),
      { params: Promise.resolve({ id: "company-1" }) },
    );
    expect(response.status).toBe(400);
    expect(mocks.getCompanyByFocusId).not.toHaveBeenCalled();
  });
});
