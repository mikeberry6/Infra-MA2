import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const mocks = vi.hoisted(() => ({
  clearLoginThrottle: vi.fn(),
  findUnique: vi.fn(),
  isLoginThrottled: vi.fn(),
  recordFailedLogin: vi.fn(),
  requestIp: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUnique } } }));
vi.mock("@/modules/auth/throttle", () => ({
  clearLoginThrottle: mocks.clearLoginThrottle,
  isLoginThrottled: mocks.isLoginThrottled,
  recordFailedLogin: mocks.recordFailedLogin,
  requestIp: mocks.requestIp,
}));

import { authOptions } from "@/modules/auth/config";
import { PRIVILEGED_SESSION_MAX_AGE_SECONDS } from "@/modules/auth/session";

describe("NextAuth privileged-session configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00Z"));
    mocks.isLoginThrottled.mockResolvedValue(false);
    mocks.requestIp.mockReturnValue("203.0.113.7");
  });

  afterEach(() => vi.useRealTimers());

  it("uses an eight-hour JWT and session lifetime", () => {
    expect(authOptions.session?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
    expect(authOptions.jwt?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
  });

  it("keeps redirect targets on same-origin application paths", async () => {
    type RedirectCallback = (input: { url: string; baseUrl: string }) => Promise<string>;
    const redirect = authOptions.callbacks?.redirect as unknown as RedirectCallback;
    const baseUrl = "https://infrasight.example";

    await expect(redirect({ url: "/admin/deals?status=draft#review", baseUrl })).resolves.toBe(
      "https://infrasight.example/admin/deals?status=draft#review",
    );
    await expect(redirect({ url: "https://infrasight.example/tracker", baseUrl })).resolves.toBe(
      "https://infrasight.example/tracker",
    );
    await expect(redirect({ url: "https://attacker.example/phish", baseUrl })).resolves.toBe(
      "https://infrasight.example/",
    );
    await expect(redirect({ url: "//attacker.example/phish", baseUrl })).resolves.toBe(
      "https://infrasight.example/",
    );
    await expect(redirect({ url: "/\\attacker.example/phish", baseUrl })).resolves.toBe(
      "https://infrasight.example/",
    );
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

  it("does not serialize NextAuth adapter metadata", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const privateMetadata = {
      error: new Error("postgresql://admin:secret@private-db/auth"),
      password: "do-not-log",
    };

    authOptions.logger?.error?.("ADAPTER_ERROR", privateMetadata);

    const serialized = String(errorLog.mock.calls[0]?.[0]);
    expect(JSON.parse(serialized)).toMatchObject({
      task: "nextauth",
      operation: "auth_library_error",
      status: 500,
      errorClassification: "internal_error",
    });
    expect(serialized).not.toMatch(/private-db|admin:secret|password|do-not-log/i);
    errorLog.mockRestore();
  });

  it.each([
    {
      label: "ASCII",
      accepted: `Aa1!${"x".repeat(68)}`,
      truncatedAlias: `Aa1!${"x".repeat(69)}`,
    },
    {
      label: "multibyte",
      accepted: `Aa1!${"é".repeat(34)}`,
      truncatedAlias: `Aa1!${"é".repeat(35)}`,
    },
  ])("rejects a bcrypt-truncated $label login alias", async ({ accepted, truncatedAlias }) => {
    vi.useRealTimers();
    const passwordHash = bcrypt.hashSync(accepted, 4);
    mocks.findUnique.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Administrator",
      role: "ADMIN",
      passwordHash,
      updatedAt: new Date("2026-07-22T11:00:00Z"),
    });
    const credentialsProvider = authOptions.providers[0] as unknown as {
      options: {
        authorize: (
          credentials: { email: string; password: string },
          request: { headers: Headers },
        ) => Promise<{ id: string } | null>;
      };
    };
    const authorize = credentialsProvider.options.authorize;
    const request = { headers: new Headers() };

    await expect(authorize({
      email: "admin@example.com",
      password: truncatedAlias,
    }, request)).resolves.toBeNull();
    expect(mocks.recordFailedLogin).toHaveBeenCalledWith(
      "admin@example.com",
      "203.0.113.7",
    );

    await expect(authorize({
      email: "admin@example.com",
      password: accepted,
    }, request)).resolves.toMatchObject({ id: "admin-1" });
  });
});
