import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUser: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/modules/auth/config", () => ({ authOptions: { providers: [] } }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUser } },
}));

import {
  AuthorizationError,
  canExportData,
  getSessionIdentity,
  getSessionRole,
  hasAnyRole,
  isAuthorizationError,
  requireAdmin,
} from "@/modules/auth/guards";

describe("authentication role guards", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset().mockResolvedValue(null);
    mocks.findUser.mockReset().mockResolvedValue(null);
  });

  function session(id: string, role: string, authVersion = 1_700_000_000_000) {
    return {
      user: {
        id,
        role,
        authVersion,
        authenticatedAt: Date.now(),
      },
    };
  }

  function user(id: string, role: string, authVersion = 1_700_000_000_000) {
    return { id, role, updatedAt: new Date(authVersion) };
  }

  it("rejects anonymous and non-admin sessions with a recognizable authorization error", async () => {
    await expect(requireAdmin()).rejects.toSatisfy(isAuthorizationError);

    mocks.getServerSession.mockResolvedValue(session("analyst-1", "ANALYST"));
    mocks.findUser.mockResolvedValue(user("analyst-1", "ANALYST"));
    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("allows administrators and returns their complete session identity", async () => {
    mocks.getServerSession.mockResolvedValue(session("admin-1", "ADMIN"));
    mocks.findUser.mockResolvedValue(user("admin-1", "ADMIN"));

    await expect(getSessionRole()).resolves.toBe("ADMIN");
    await expect(getSessionIdentity()).resolves.toEqual({ id: "admin-1", role: "ADMIN" });
    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("keeps exports limited to ADMIN and ANALYST", async () => {
    for (const role of ["ADMIN", "ANALYST"]) {
      mocks.getServerSession.mockResolvedValue(session(`${role}-1`, role));
      mocks.findUser.mockResolvedValue(user(`${role}-1`, role));
      await expect(canExportData()).resolves.toBe(true);
    }

    mocks.getServerSession.mockResolvedValue(session("viewer-1", "VIEWER"));
    mocks.findUser.mockResolvedValue(user("viewer-1", "VIEWER"));
    await expect(canExportData()).resolves.toBe(false);
    await expect(hasAnyRole(["ADMIN"])).resolves.toBe(false);
  });

  it("does not treat partial sessions as authenticated identities", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { role: "ADMIN" } });
    await expect(getSessionIdentity()).resolves.toBeNull();
  });

  it("revokes stale JWT privileges after a role, password, or account update", async () => {
    mocks.getServerSession.mockResolvedValue(session("admin-1", "ADMIN", 1_700_000_000_000));

    mocks.findUser.mockResolvedValue(user("admin-1", "ANALYST", 1_700_000_001_000));
    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthorizationError);

    mocks.findUser.mockResolvedValue(user("admin-1", "ADMIN", 1_700_000_001_000));
    await expect(getSessionIdentity()).resolves.toBeNull();

    mocks.findUser.mockResolvedValue(null);
    await expect(canExportData()).resolves.toBe(false);
  });

  it("rejects a valid-looking privileged snapshot after its absolute lifetime", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "ADMIN",
        authVersion: 1_700_000_000_000,
        authenticatedAt: Date.now() - 8 * 60 * 60 * 1000 - 1,
      },
    });
    mocks.findUser.mockResolvedValue(user("admin-1", "ADMIN"));
    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthorizationError);
  });
});
