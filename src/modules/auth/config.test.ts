import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock("@/modules/auth/throttle", () => ({
  clearLoginThrottle: vi.fn(),
  isLoginThrottled: vi.fn(),
  recordFailedLogin: vi.fn(),
  requestIp: vi.fn(),
}));

import { authOptions } from "@/modules/auth/config";
import { PRIVILEGED_SESSION_MAX_AGE_SECONDS } from "@/modules/auth/session";

describe("NextAuth privileged-session configuration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("uses an eight-hour JWT and session lifetime", () => {
    expect(authOptions.session?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
    expect(authOptions.jwt?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
  });

  it("signs the account version and absolute authentication time into the JWT and session", async () => {
    type JwtCallback = (input: {
      token: Record<string, unknown>;
      user: { id: string; role: string; authVersion: number };
    }) => Promise<Record<string, unknown>>;
    const jwt = authOptions.callbacks?.jwt as unknown as JwtCallback;
    const token = await jwt({
      token: {},
      user: { id: "admin-1", role: "ADMIN", authVersion: 1_700_000_000_000 },
    });
    expect(token).toMatchObject({
      id: "admin-1",
      role: "ADMIN",
      authVersion: 1_700_000_000_000,
      authenticatedAt: Date.now(),
    });

    type SessionCallback = (input: {
      session: { user: Record<string, unknown> };
      token: Record<string, unknown>;
    }) => Promise<{ user: Record<string, unknown> }>;
    const sessionCallback = authOptions.callbacks?.session as unknown as SessionCallback;
    const session = await sessionCallback({ session: { user: {} }, token });
    expect(session.user).toMatchObject(token);
  });
});
