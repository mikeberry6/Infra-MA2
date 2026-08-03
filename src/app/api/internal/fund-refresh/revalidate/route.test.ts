import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidateAppData: vi.fn(),
}));

vi.mock("@/lib/revalidation", () => ({
  revalidateAppData: mocks.revalidateAppData,
}));

import { GET, POST } from "./route";

const TOKEN = "a-secure-fund-refresh-token-that-is-long-enough";
const URL = "https://example.com/api/internal/fund-refresh/revalidate";

function request(method: "GET" | "POST", token = TOKEN) {
  return new Request(URL, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
}

describe("fund refresh cache revalidation route", () => {
  beforeEach(() => {
    process.env.FUND_REFRESH_REVALIDATE_TOKEN = TOKEN;
    mocks.revalidateAppData.mockReset();
  });

  afterEach(() => {
    delete process.env.FUND_REFRESH_REVALIDATE_TOKEN;
  });

  it("reports readiness without mutating caches", async () => {
    const response = await GET(request("GET"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    await expect(response.json()).resolves.toEqual({ ready: true });
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("revalidates application data for an authorized POST", async () => {
    const response = await POST(request("POST"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ revalidated: true });
    expect(mocks.revalidateAppData).toHaveBeenCalledOnce();
  });

  it.each([
    ["a missing token", undefined],
    ["a short configured token", "short"],
  ])("fails closed for %s", async (_label, configuredToken) => {
    if (configuredToken === undefined) {
      delete process.env.FUND_REFRESH_REVALIDATE_TOKEN;
    } else {
      process.env.FUND_REFRESH_REVALIDATE_TOKEN = configuredToken;
    }

    const response = await POST(request("POST"));

    expect(response.status).toBe(401);
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("rejects an incorrect bearer token", async () => {
    const response = await GET(request("GET", "another-token-that-is-long-but-still-wrong"));

    expect(response.status).toBe(401);
    expect(mocks.revalidateAppData).not.toHaveBeenCalled();
  });

  it("reports an internal failure without claiming revalidation", async () => {
    mocks.revalidateAppData.mockImplementationOnce(() => {
      throw new Error("test failure");
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(request("POST"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ revalidated: false });
    consoleError.mockRestore();
  });
});
