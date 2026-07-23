import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getToken: vi.fn() }));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));

import { middleware } from "@/middleware";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("request ID middleware", () => {
  beforeEach(() => {
    mocks.getToken.mockReset();
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.NEXTAUTH_SECRET;
  });

  it("overwrites an inbound request ID and propagates the fresh UUID", async () => {
    const response = await middleware(new NextRequest(
      "https://example.test/Infra-MA2/tracker?q=person%40example.com&token=private",
      { headers: { "x-request-id": "attacker-controlled-secret" } },
    ));
    const responseId = response.headers.get("x-request-id");
    const forwardedId = response.headers.get("x-middleware-request-x-request-id");

    expect(responseId).toMatch(UUID_PATTERN);
    expect(forwardedId).toBe(responseId);
    expect(responseId).not.toContain("attacker");
    expect(mocks.getToken).not.toHaveBeenCalled();
  });

  it("issues a distinct request ID for every request", async () => {
    const first = await middleware(new NextRequest("https://example.test/tracker"));
    const second = await middleware(new NextRequest("https://example.test/tracker"));
    expect(first.headers.get("x-request-id")).toMatch(UUID_PATTERN);
    expect(second.headers.get("x-request-id")).toMatch(UUID_PATTERN);
    expect(second.headers.get("x-request-id")).not.toBe(first.headers.get("x-request-id"));
  });

  it("keeps authorization behavior while attaching the same ID to denials", async () => {
    mocks.getToken.mockResolvedValue(null);
    const response = await middleware(new NextRequest("https://example.test/api/imports/deals"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(response.headers.get("x-request-id")).toMatch(UUID_PATTERN);
  });

  it("does not expose authentication exceptions or inbound IDs", async () => {
    mocks.getToken.mockRejectedValue(
      new Error("person@example.com token=private postgres://user:secret@host/db"),
    );
    const response = await middleware(new NextRequest(
      "https://example.test/admin",
      { headers: { "x-request-id": "private-inbound-id" } },
    ));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(response.headers.get("x-request-id")).toMatch(UUID_PATTERN);
    expect(`${body}${response.headers.get("x-request-id")}`).not.toMatch(
      /person@example|token|postgres|secret|private-inbound/i,
    );
  });

  it("preserves the base-path callback on admin redirects", async () => {
    mocks.getToken.mockResolvedValue(null);
    // Next strips the configured basePath before invoking middleware while
    // retaining it on NextURL for URL reconstruction.
    const request = new NextRequest("https://example.test/admin/users?tab=active");
    Object.defineProperty(request.nextUrl, "basePath", { value: "/Infra-MA2" });
    const response = await middleware(request);

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("callbackUrl"))
      .toBe("/Infra-MA2/admin/users?tab=active");
    expect(response.headers.get("x-request-id")).toMatch(UUID_PATTERN);
  });
});
