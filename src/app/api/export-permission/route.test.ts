import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canExportData: vi.fn(),
  markFailure: vi.fn(),
}));

vi.mock("@/modules/auth/guards", () => ({
  canExportData: mocks.canExportData,
}));

vi.mock("@/lib/server-log", () => ({
  withServerOperation: (
    _request: Request,
    _details: unknown,
    run: (context: {
      requestId: string;
      elapsedMs: () => number;
      markFailure: (error: unknown, status?: number) => void;
    }) => Promise<Response>,
  ) => run({
    requestId: "request-test",
    elapsedMs: () => 0,
    markFailure: mocks.markFailure,
  }),
}));

import { GET } from "./route";

function expectPrivateNoStore(response: Response) {
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
}

describe("GET /api/export-permission", () => {
  beforeEach(() => {
    mocks.canExportData.mockReset();
    mocks.markFailure.mockReset();
  });

  it("returns the permission result without permitting caches to retain it", async () => {
    mocks.canExportData.mockResolvedValue(true);

    const response = await GET(new Request("http://localhost/api/export-permission"));

    expect(response.status).toBe(200);
    expectPrivateNoStore(response);
    await expect(response.json()).resolves.toEqual({ canExport: true });
    expect(mocks.markFailure).not.toHaveBeenCalled();
  });

  it("fails closed with a generic response and a sanitized structured failure", async () => {
    const error = new Error("sensitive database details");
    mocks.canExportData.mockRejectedValue(error);

    const response = await GET(new Request("http://localhost/api/export-permission"));

    expect(response.status).toBe(200);
    expectPrivateNoStore(response);
    await expect(response.json()).resolves.toEqual({ canExport: false });
    expect(mocks.markFailure).toHaveBeenCalledWith(error);
  });
});
