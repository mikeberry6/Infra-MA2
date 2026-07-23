import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createRequestId: vi.fn(),
  getToken: vi.fn(),
  logServerOperation: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@/lib/server-log", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/server-log")>(),
  createRequestId: mocks.createRequestId,
  logServerOperation: mocks.logServerOperation,
}));

import { middleware } from "@/middleware";

describe("middleware request-ID trust boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createRequestId.mockReturnValue("server-owned-request-id");
    process.env.NEXTAUTH_SECRET = "test-secret-that-is-at-least-32-characters";
  });

  it("replaces a public caller ID and forwards the same server-owned value", async () => {
    const response = await middleware(new NextRequest("http://localhost/tracker", {
      headers: { "x-request-id": "caller-chosen-request-id" },
    }));

    expect(mocks.createRequestId).toHaveBeenCalledOnce();
    expect(response.headers.get("x-request-id")).toBe("server-owned-request-id");
    expect(response.headers.get("x-middleware-request-x-request-id")).toBe("server-owned-request-id");
    expect(response.headers.get("x-request-id")).not.toBe("caller-chosen-request-id");
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("uses one server-owned ID for an authorized privileged request and its log", async () => {
    mocks.getToken.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      authVersion: 1,
      authenticatedAt: Date.now(),
    });

    const response = await middleware(new NextRequest("http://localhost/admin", {
      headers: { "x-request-id": "spoofed-admin-request-id" },
    }));

    expect(response.headers.get("x-request-id")).toBe("server-owned-request-id");
    expect(response.headers.get("x-middleware-request-x-request-id")).toBe("server-owned-request-id");
    expect(mocks.logServerOperation).toHaveBeenCalledWith(expect.objectContaining({
      route: "/admin/*",
      operation: "authorize_admin_page",
      status: 200,
      requestId: "server-owned-request-id",
    }));
    expect(JSON.stringify(mocks.logServerOperation.mock.calls)).not.toContain("spoofed-admin-request-id");
  });
});
