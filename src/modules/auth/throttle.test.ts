import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  deleteMany: vi.fn(),
  executeRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authThrottle: {
      findMany: mocks.findMany,
      deleteMany: mocks.deleteMany,
    },
    $executeRaw: mocks.executeRaw,
  },
}));

import {
  clearLoginThrottle,
  isLoginThrottled,
  recordFailedLogin,
  requestIp,
} from "@/modules/auth/throttle";

describe("durable login throttling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00.000Z"));
    vi.stubEnv("NEXTAUTH_SECRET", "test-auth-throttle-secret");
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.findMany.mockResolvedValue([]);
    mocks.deleteMany.mockResolvedValue({ count: 0 });
    mocks.executeRaw.mockResolvedValue(1);
  });

  it("hashes account and IP keys and records both with atomic upserts", async () => {
    await recordFailedLogin("Admin@Example.com", "203.0.113.5");

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: {
        updatedAt: {
          lt: new Date("2026-07-28T12:00:00.000Z"),
        },
      },
    });
    expect(mocks.executeRaw).toHaveBeenCalledTimes(2);
    const serialized = JSON.stringify(mocks.executeRaw.mock.calls);
    expect(serialized).not.toContain("Admin@Example.com");
    expect(serialized).not.toContain("203.0.113.5");
    expect(serialized).toContain("ON CONFLICT");
    expect(serialized).toContain("failedAttempts");
  });

  it("binds a fifteen-minute lock time to the fifth-failure condition", async () => {
    await recordFailedLogin("admin@example.com");

    const serialized = JSON.stringify(mocks.executeRaw.mock.calls);
    expect(serialized).toContain(">= ");
    expect(serialized).toContain("2026-07-29T12:15:00.000Z");
  });

  it("returns a generic lock decision", async () => {
    mocks.findMany.mockResolvedValue([
      { lockedUntil: new Date("2026-07-29T12:01:00.000Z") },
    ]);
    await expect(
      isLoginThrottled("admin@example.com", "203.0.113.5"),
    ).resolves.toBe(true);
  });

  it("reads the trusted forwarding chain case-insensitively", () => {
    expect(requestIp({
      "x-vercel-forwarded-for": "192.0.2.4",
      "x-forwarded-for": "203.0.113.5",
    })).toBe("192.0.2.4");
    expect(requestIp({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    })).toBe("203.0.113.5");
    expect(requestIp({
      "X-Forwarded-For": ["198.51.100.8, 10.0.0.2"],
    })).toBe("198.51.100.8");
    expect(requestIp({
      "x-vercel-forwarded-for": "not-an-ip",
    })).toBeNull();
    expect(requestIp(undefined)).toBeNull();
  });

  it("clears only the account bucket after a valid login", async () => {
    await clearLoginThrottle("admin@example.com");
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { keyHash: expect.any(String) },
    });
    expect(JSON.stringify(mocks.deleteMany.mock.calls)).not.toContain("admin@example.com");
  });
});
