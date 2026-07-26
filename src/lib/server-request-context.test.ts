import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { headers } from "next/headers";
import { currentServerRequestId } from "@/lib/server-request-context";

describe("server request log context", () => {
  beforeEach(() => vi.resetAllMocks());

  it("reuses the safe middleware request ID", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers({
      "x-request-id": "middleware:request-123",
    }) as never);

    await expect(currentServerRequestId()).resolves.toBe("middleware:request-123");
  });

  it("does not propagate unsafe IDs or require a request store", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers({
      "x-request-id": "email@example.com private query",
    }) as never);
    await expect(currentServerRequestId()).resolves.toBeUndefined();

    vi.mocked(headers).mockRejectedValue(new Error("request scope unavailable"));
    await expect(currentServerRequestId()).resolves.toBeUndefined();
  });
});
