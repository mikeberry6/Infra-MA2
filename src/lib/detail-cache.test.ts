import { describe, expect, it, vi } from "vitest";
import {
  BoundedDetailCache,
  DETAIL_CACHE_MAX_ENTRIES,
  isDetailResponse,
  revalidateDetail,
} from "./detail-cache";
import type { DetailResponse } from "@/modules/shared/types";

type TestDetail = { id: string; value: string };

function envelope(id: string, value = id): DetailResponse<TestDetail> {
  return {
    data: { id, value },
    meta: {
      canonicalId: id,
      updatedAt: "2026-07-22T12:00:00.000Z",
      lastVerifiedAt: null,
      sourceCount: 1,
    },
  };
}

function response(
  body: unknown,
  ok = true,
  status = ok ? 200 : 503,
): Pick<Response, "ok" | "status" | "json"> {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

describe("BoundedDetailCache", () => {
  it("enforces the global 100-entry ceiling", () => {
    expect(() => new BoundedDetailCache<TestDetail>(DETAIL_CACHE_MAX_ENTRIES + 1))
      .toThrow("between 1 and 100");

    const cache = new BoundedDetailCache<TestDetail>();
    for (let index = 0; index <= DETAIL_CACHE_MAX_ENTRIES; index += 1) {
      cache.set(`record-${index}`, envelope(`record-${index}`));
    }
    expect(cache.size).toBe(DETAIL_CACHE_MAX_ENTRIES);
    expect(cache.peek("record-0")).toBeUndefined();
    expect(cache.peek(`record-${DETAIL_CACHE_MAX_ENTRIES}`)).toBeDefined();
  });

  it("evicts the least-recently-used entry at capacity", () => {
    const cache = new BoundedDetailCache<TestDetail>(2);
    cache.set("first", envelope("first"));
    cache.set("second", envelope("second"));
    cache.get("first");
    cache.set("third", envelope("third"));

    expect(cache.size).toBe(2);
    expect(cache.peek("first")).toBeDefined();
    expect(cache.peek("second")).toBeUndefined();
    expect(cache.peek("third")).toBeDefined();
  });

  it("rejects malformed envelopes", () => {
    expect(isDetailResponse({ data: { id: "x" }, meta: { canonicalId: "x" } })).toBe(false);
    expect(() => cacheMalformedEnvelope()).toThrow("valid { data, meta } envelope");
  });
});

function cacheMalformedEnvelope() {
  const cache = new BoundedDetailCache<TestDetail>();
  cache.set("bad", { data: { id: "bad" }, meta: {} } as DetailResponse<TestDetail>);
}

describe("revalidateDetail", () => {
  it("stores and returns a valid network envelope", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    const fresh = envelope("record", "fresh");
    await expect(revalidateDetail({
      cache,
      key: "record",
      fetcher: async () => response(fresh),
    })).resolves.toEqual({ status: "updated", envelope: fresh });
    expect(cache.peek("record")).toEqual(fresh);
  });

  it.each([
    ["HTTP failure", async () => response({ error: "unavailable" }, false)],
    ["invalid envelope", async () => response({ data: { id: "record" } })],
    ["transport failure", async () => { throw new Error("offline"); }],
  ])("retains cached detail after %s", async (_label, fetcher) => {
    const cache = new BoundedDetailCache<TestDetail>();
    const cached = envelope("record", "cached");
    cache.set("record", cached);
    await expect(revalidateDetail({ cache, key: "record", fetcher }))
      .resolves.toEqual({ status: "retained", envelope: cached });
    expect(cache.peek("record")).toEqual(cached);
  });

  it("returns an error for an uncached failure", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    await expect(revalidateDetail({
      cache,
      key: "missing",
      fetcher: async () => { throw new Error("offline"); },
    })).resolves.toEqual({ status: "error", envelope: null });
  });

  it.each([404, 410])("evicts cached detail after terminal HTTP %s", async (status) => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("record", "cached"));

    await expect(revalidateDetail({
      cache,
      key: "record",
      fetcher: async () => response({ error: "not found" }, false, status),
    })).resolves.toEqual({ status: "error", envelope: null });
    expect(cache.peek("record")).toBeUndefined();
  });
});
