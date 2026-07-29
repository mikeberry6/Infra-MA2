import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  releaseSuccessfulLogin: vi.fn(),
  reserveLoginAttempt: vi.fn(),
  requestIp: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}));
vi.mock("@/modules/auth/throttle", () => ({
  releaseSuccessfulLogin: mocks.releaseSuccessfulLogin,
  reserveLoginAttempt: mocks.reserveLoginAttempt,
  requestIp: mocks.requestIp,
}));

import { authOptions } from "@/modules/auth/config";
import { PRIVILEGED_SESSION_MAX_AGE_SECONDS } from "@/modules/auth/session";

type Authorize = (
  credentials: { email: string; password: string },
  request: { headers?: Record<string, string> },
) => Promise<{ id: string; authVersion: number } | null>;

function authorizeCallback(): Authorize {
  const credentialsProvider = authOptions.providers[0] as unknown as {
    options: { authorize: Authorize };
  };
  return credentialsProvider.options.authorize;
}

describe("NextAuth privileged-session configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00Z"));
    mocks.reserveLoginAttempt.mockResolvedValue(true);
    mocks.requestIp.mockReturnValue("203.0.113.7");
  });

  afterEach(() => vi.useRealTimers());

  it("uses an eight-hour absolute JWT and session lifetime", () => {
    expect(authOptions.session?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
    expect(authOptions.jwt?.maxAge).toBe(PRIVILEGED_SESSION_MAX_AGE_SECONDS);
  });

  it("signs the account version and authentication time into JWTs", async () => {
    type JwtCallback = (input: {
      token: Record<string, unknown>;
      user: { id: string; role: string; authVersion: number };
    }) => Promise<Record<string, unknown>>;
    const jwt = authOptions.callbacks?.jwt as unknown as JwtCallback;
    const token = await jwt({
      token: {},
      user: {
        id: "admin-1",
        role: "ADMIN",
        authVersion: 1_700_000_000_000,
      },
    });

    expect(token).toMatchObject({
      id: "admin-1",
      role: "ADMIN",
      authVersion: 1_700_000_000_000,
      authenticatedAt: Date.now(),
    });
  });

  it("records failed attempts without disclosing whether an account exists", async () => {
    mocks.findUnique.mockResolvedValue(null);
    await expect(authorizeCallback()(
      { email: "Unknown@Example.com", password: "wrong-password" },
      { headers: {} },
    )).resolves.toBeNull();

    expect(mocks.reserveLoginAttempt).toHaveBeenCalledWith(
      "unknown@example.com",
      "203.0.113.7",
    );
    expect(mocks.releaseSuccessfulLogin).not.toHaveBeenCalled();
  });

  it("returns the same denial for a locked account without querying the user", async () => {
    const compare = vi.spyOn(bcrypt, "compare");
    mocks.reserveLoginAttempt.mockResolvedValue(false);
    await expect(authorizeCallback()(
      { email: "admin@example.com", password: "possible-password" },
      { headers: {} },
    )).resolves.toBeNull();

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.releaseSuccessfulLogin).not.toHaveBeenCalled();
    expect(compare).not.toHaveBeenCalled();
    compare.mockRestore();
  });

  it("does not expose database errors through the credentials callback", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.reserveLoginAttempt.mockRejectedValue(
      new Error("postgresql://admin:secret@private-db/auth"),
    );

    await expect(authorizeCallback()(
      { email: "admin@example.com", password: "possible-password" },
      { headers: {} },
    )).resolves.toBeNull();

    const serialized = JSON.stringify(errorLog.mock.calls);
    expect(serialized).toContain("credential_authorize");
    expect(serialized).not.toMatch(/private-db|admin:secret|postgresql/i);
    errorLog.mockRestore();
  });

  it("does not serialize private NextAuth error metadata", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    authOptions.logger?.error?.(
      "ADAPTER_ERROR",
      new Error("postgresql://admin:secret@private-db/auth"),
    );

    const serialized = JSON.stringify(errorLog.mock.calls);
    expect(serialized).toContain("auth");
    expect(serialized).not.toMatch(/private-db|admin:secret|postgresql/i);
    errorLog.mockRestore();
  });

  it("clears the account bucket and versions a valid login", async () => {
    vi.useRealTimers();
    const password = "Strong-valid-password-1!";
    mocks.findUnique.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Administrator",
      role: "ADMIN",
      passwordHash: bcrypt.hashSync(password, 4),
      updatedAt: new Date("2026-07-29T11:00:00Z"),
    });

    await expect(authorizeCallback()(
      { email: "ADMIN@example.com", password },
      { headers: {} },
    )).resolves.toMatchObject({
      id: "admin-1",
      authVersion: new Date("2026-07-29T11:00:00Z").getTime(),
    });
    expect(mocks.releaseSuccessfulLogin).toHaveBeenCalledWith(
      "admin@example.com",
      "203.0.113.7",
    );
  });
});
