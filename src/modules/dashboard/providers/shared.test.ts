import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchJson, fetchText } from "@/modules/dashboard/providers/shared";

describe("dashboard provider HTTP handling", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("surfaces rate limits without leaking API keys", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("rate limited", {
      status: 429,
      statusText: "Too Many Requests",
    })));

    await expect(fetchJson("https://example.test/data?api_key=secret-value&series=x"))
      .rejects.toThrow("429 Too Many Requests from https://example.test/data?api_key=%5BREDACTED%5D&series=x");
  });

  it("rejects a successful HTTP response with malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{not-json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(fetchJson("https://example.test/data")).rejects.toBeInstanceOf(SyntaxError);
  });

  it.each([
    ["JSON", fetchJson],
    ["text", fetchText],
  ])("aborts a hung %s request at the configured bound", async (_label, request) => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, init: RequestInit) => (
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
      })
    )));

    const pending = expect(request("https://example.test/data?api_key=secret-value", {}, 25))
      .rejects.toThrow("Provider request timed out after 25ms from https://example.test/data?api_key=%5BREDACTED%5D");
    await vi.advanceTimersByTimeAsync(25);
    await pending;
  });

  it("preserves a caller-initiated abort instead of misclassifying it as a timeout", async () => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, init: RequestInit) => (
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new Error("caller cancelled")), { once: true });
      })
    )));

    const pending = expect(fetchJson("https://example.test/data", { signal: controller.signal }, 1_000))
      .rejects.toThrow("caller cancelled");
    controller.abort();
    await pending;
  });
});
