import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  executeRaw: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authThrottle: {
      deleteMany: mocks.deleteMany,
    },
    $executeRaw: mocks.executeRaw,
    $queryRaw: mocks.queryRaw,
  },
}));

import {
  releaseSuccessfulLogin,
  reserveLoginAttempt,
  requestIp,
} from "@/modules/auth/throttle";

describe("durable login throttling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00.000Z"));
    vi.stubEnv("NEXTAUTH_SECRET", "test-auth-throttle-secret");
    vi.stubEnv("VERCEL", "1");
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.deleteMany.mockResolvedValue({ count: 0 });
    mocks.executeRaw.mockResolvedValue(1);
    mocks.queryRaw.mockResolvedValue([
      { failedAttempts: 1 },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("hashes and atomically reserves the IP and account buckets", async () => {
    await expect(
      reserveLoginAttempt("Admin@Example.com", "203.0.113.5"),
    ).resolves.toBe(true);

    expect(mocks.queryRaw).toHaveBeenCalledTimes(2);
    const serialized = JSON.stringify(mocks.queryRaw.mock.calls);
    expect(serialized).not.toContain("Admin@Example.com");
    expect(serialized).not.toContain("203.0.113.5");
    expect(serialized).toContain("ON CONFLICT");
    expect(serialized).toContain("CURRENT_TIMESTAMP");
    expect(serialized).toContain("failedAttempts");
  });

  it("allows the fifth reservation while establishing the fifteen-minute lock", async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        failedAttempts: 5,
      },
    ]);
    await expect(reserveLoginAttempt("admin@example.com")).resolves.toBe(true);

    const serialized = JSON.stringify(mocks.queryRaw.mock.calls);
    expect(serialized).toContain(">= ");
    expect(serialized).toContain("INTERVAL '15 minutes'");
  });

  it("denies reservations beyond the fifth attempt", async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        failedAttempts: 6,
      },
    ]);
    await expect(reserveLoginAttempt("admin@example.com")).resolves.toBe(false);
  });

  it("reads Vercel's trusted forwarding header case-insensitively", () => {
    expect(requestIp({
      "x-vercel-forwarded-for": "192.0.2.4",
      "x-forwarded-for": "203.0.113.5",
    })).toBe("192.0.2.4");
    expect(requestIp({
      "X-Vercel-Forwarded-For": ["198.51.100.8, 10.0.0.2"],
    })).toBe("198.51.100.8");
    expect(requestIp({
      "x-vercel-forwarded-for": "not-an-ip",
    })).toBeNull();
  });

  it("uses X-Forwarded-For only for an explicitly trusted non-Vercel proxy", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TRUST_PROXY_HEADERS", "");
    expect(requestIp({
      "x-vercel-forwarded-for": "192.0.2.4",
      "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    })).toBeNull();

    vi.stubEnv("TRUST_PROXY_HEADERS", "true");
    expect(requestIp({
      "X-Forwarded-For": ["198.51.100.8, 10.0.0.2"],
    })).toBe("198.51.100.8");
    expect(requestIp(undefined)).toBeNull();
  });

  it("releases the IP reservation when the account bucket is locked", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ failedAttempts: 1 }])
      .mockResolvedValueOnce([{ failedAttempts: 6 }]);

    await expect(
      reserveLoginAttempt("locked@example.com", "203.0.113.5"),
    ).resolves.toBe(false);

    const serialized = JSON.stringify(mocks.executeRaw.mock.calls);
    expect(serialized).toContain("GREATEST");
    expect(serialized).not.toContain("203.0.113.5");
  });

  it("does not touch the account bucket when the IP bucket is locked", async () => {
    mocks.queryRaw.mockResolvedValueOnce([{ failedAttempts: 6 }]);

    await expect(
      reserveLoginAttempt("admin@example.com", "203.0.113.5"),
    ).resolves.toBe(false);

    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
  });

  it("releases the IP reservation if the account reservation fails", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ failedAttempts: 1 }])
      .mockRejectedValueOnce(new Error("transient database failure"));

    await expect(
      reserveLoginAttempt("admin@example.com", "203.0.113.5"),
    ).rejects.toThrow("transient database failure");

    expect(JSON.stringify(mocks.executeRaw.mock.calls)).toContain("GREATEST");
  });

  it("clears the account and releases only one IP reservation after success", async () => {
    await releaseSuccessfulLogin("admin@example.com", "203.0.113.5");

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { keyHash: expect.any(String) },
    });
    expect(mocks.executeRaw).toHaveBeenCalledTimes(1);
    const serialized = JSON.stringify([
      ...mocks.deleteMany.mock.calls,
      ...mocks.executeRaw.mock.calls,
    ]);
    expect(serialized).toContain("GREATEST");
    expect(JSON.stringify(mocks.deleteMany.mock.calls)).not.toContain("admin@example.com");
    expect(serialized).not.toContain("203.0.113.5");
  });
});
