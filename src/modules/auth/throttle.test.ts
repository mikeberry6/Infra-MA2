import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authThrottle: {
      findMany: mocks.findMany,
      deleteMany: mocks.deleteMany,
    },
    $transaction: mocks.transaction,
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
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.findMany.mockResolvedValue([]);
    mocks.findUnique.mockResolvedValue(null);
    mocks.upsert.mockResolvedValue({});
    mocks.deleteMany.mockResolvedValue({ count: 0 });
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) => callback({
      authThrottle: { findUnique: mocks.findUnique, upsert: mocks.upsert },
    }));
  });

  it("hashes account and IP keys and writes them in a serializable transaction", async () => {
    await recordFailedLogin("Admin@Example.com", "203.0.113.5");

    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "Serializable",
    });
    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    const serialized = JSON.stringify(mocks.upsert.mock.calls);
    expect(serialized).not.toContain("Admin@Example.com");
    expect(serialized).not.toContain("203.0.113.5");
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ failedAttempts: 1, lockedUntil: null }),
    }));
  });

  it("locks on the fifth failure within the fifteen-minute window", async () => {
    mocks.findUnique.mockResolvedValue({
      failedAttempts: 4,
      windowStartedAt: new Date("2026-07-22T11:55:00.000Z"),
    });

    await recordFailedLogin("admin@example.com");

    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({
        failedAttempts: 5,
        lockedUntil: new Date("2026-07-22T12:15:00.000Z"),
      }),
    }));
  });

  it("retries serialization conflicts and exposes only a generic lock decision", async () => {
    mocks.transaction
      .mockRejectedValueOnce(Object.assign(new Error("serialization conflict"), { code: "P2034" }))
      .mockImplementationOnce(async (callback: (tx: unknown) => unknown) => callback({
        authThrottle: { findUnique: mocks.findUnique, upsert: mocks.upsert },
      }));
    await expect(recordFailedLogin("admin@example.com")).resolves.toBeUndefined();
    expect(mocks.transaction).toHaveBeenCalledTimes(2);

    mocks.findMany.mockResolvedValue([{ lockedUntil: new Date("2026-07-22T12:01:00.000Z") }]);
    await expect(isLoginThrottled("admin@example.com", "203.0.113.5")).resolves.toBe(true);
    expect(requestIp({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" })).toBe("203.0.113.5");

    await clearLoginThrottle("admin@example.com");
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { keyHash: expect.any(String) },
    });
    expect(JSON.stringify(mocks.deleteMany.mock.calls)).not.toContain("203.0.113.5");
  });
});
