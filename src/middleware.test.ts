import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

import { middleware } from "@/middleware";

describe("privileged-route middleware", () => {
  beforeEach(() => {
    mocks.getToken.mockReset().mockResolvedValue(null);
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  });

  it("rejects legacy admin JWTs that lack the versioned snapshot", async () => {
    mocks.getToken.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    const response = await middleware(
      new NextRequest("https://example.test/admin/deals"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("admits a current-looking admin snapshot to the Node-side role check", async () => {
    mocks.getToken.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      authVersion: 1_700_000_000_000,
      authenticatedAt: Date.now(),
    });

    const response = await middleware(
      new NextRequest("https://example.test/admin/deals"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("blocks an expired snapshot before it reaches privileged handlers", async () => {
    mocks.getToken.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      authVersion: 1_700_000_000_000,
      authenticatedAt: Date.now() - 8 * 60 * 60 * 1000 - 1,
    });

    const response = await middleware(
      new NextRequest("https://example.test/api/imports/deals"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("treats token-decoding failures as unauthenticated without leaking details", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getToken.mockRejectedValue(
      new Error("secret cookie contents and private adapter details"),
    );

    const response = await middleware(
      new NextRequest("https://example.test/api/exports/deals"),
    );

    expect(response.status).toBe(403);
    const serialized = JSON.stringify(errorLog.mock.calls);
    expect(serialized).toContain("invalid_session");
    expect(serialized).not.toContain("secret cookie contents");
    errorLog.mockRestore();
  });

  it.each([
    ["ADMIN", 200],
    ["ANALYST", 200],
    ["SUBSCRIBER", 403],
  ])("enforces the export role matrix for %s", async (role, status) => {
    mocks.getToken.mockResolvedValue({
      id: `${role.toLowerCase()}-1`,
      role,
      authVersion: 1_700_000_000_000,
      authenticatedAt: Date.now(),
    });

    const response = await middleware(
      new NextRequest("https://example.test/api/exports/funds"),
    );

    expect(response.status).toBe(status);
  });
});
