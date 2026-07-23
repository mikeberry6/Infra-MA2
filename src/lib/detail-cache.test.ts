import { describe, expect, it, vi } from "vitest";
import {
  BoundedDetailCache,
  DETAIL_CACHE_MAX_ENTRIES,
  isDetailResponse,
  revalidateDetail,
} from "./detail-cache";
import type { DetailResponse } from "@/modules/shared/types";

type TestDetail = { id: string; value: string };

const isTestDetail = (value: unknown): value is TestDetail => Boolean(
  value
  && typeof value === "object"
  && typeof (value as Partial<TestDetail>).id === "string"
  && typeof (value as Partial<TestDetail>).value === "string",
);

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
    expect(() => new BoundedDetailCache<TestDetail>(DETAIL_CACHE_MAX_ENTRIES + 1, isTestDetail))
      .toThrow("between 1 and 100");

    const cache = new BoundedDetailCache<TestDetail>(DETAIL_CACHE_MAX_ENTRIES, isTestDetail);
    for (let index = 0; index <= DETAIL_CACHE_MAX_ENTRIES; index += 1) {
      cache.set(`record-${index}`, envelope(`record-${index}`));
    }
    expect(cache.size).toBe(DETAIL_CACHE_MAX_ENTRIES);
    expect(cache.peek("record-0")).toBeUndefined();
    expect(cache.peek(`record-${DETAIL_CACHE_MAX_ENTRIES}`)).toBeDefined();
  });

  it("evicts the least-recently-used entry at capacity", () => {
    const cache = new BoundedDetailCache<TestDetail>(2, isTestDetail);
    cache.set("first", envelope("first"));
    cache.set("second", envelope("second"));
    cache.get("first");
    cache.set("third", envelope("third"));

    expect(cache.size).toBe(2);
    expect(cache.peek("first")).toBeDefined();
    expect(cache.peek("second")).toBeUndefined();
    expect(cache.peek("third")).toBeDefined();
  });

  it("rejects incomplete entity data and mismatched canonical metadata", () => {
    const cache = new BoundedDetailCache<TestDetail>(2, isTestDetail);
    expect(isDetailResponse({ data: { id: "x" }, meta: envelope("x").meta }, isTestDetail)).toBe(false);
    expect(() => cache.set("bad", {
      data: { id: "bad", value: "value" },
      meta: { ...envelope("other").meta, canonicalId: "other" },
    })).toThrow("valid { data, meta } envelope");
    expect(() => cache.set("wrong-cache-key", envelope("record")))
      .toThrow("valid { data, meta } envelope");
  });

  it("uses a stable legacyId as the public canonical identifier when present", () => {
    type LegacyDetail = { id: string; legacyId: string; value: string };
    const isLegacyDetail = (value: unknown): value is LegacyDetail => Boolean(
      value
      && typeof value === "object"
      && typeof (value as Partial<LegacyDetail>).id === "string"
      && typeof (value as Partial<LegacyDetail>).legacyId === "string"
      && typeof (value as Partial<LegacyDetail>).value === "string",
    );
    const cache = new BoundedDetailCache<LegacyDetail>(2, isLegacyDetail);
    cache.set("PUBLIC-1", {
      data: { id: "database-id", legacyId: "PUBLIC-1", value: "detail" },
      meta: { ...envelope("PUBLIC-1").meta, canonicalId: "PUBLIC-1" },
    });

    expect(cache.peek("PUBLIC-1")?.data.id).toBe("database-id");
  });
});

describe("revalidateDetail", () => {
  it("stores and returns a valid network envelope", async () => {
    const cache = new BoundedDetailCache<TestDetail>(100, isTestDetail);
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
    ["incomplete entity", async () => response({
      data: { id: "record" },
      meta: envelope("record").meta,
    })],
    ["transport failure", async () => { throw new Error("offline"); }],
  ])("retains cached detail after %s", async (_label, fetcher) => {
    const cache = new BoundedDetailCache<TestDetail>(100, isTestDetail);
    const cached = envelope("record", "cached");
    cache.set("record", cached);
    await expect(revalidateDetail({ cache, key: "record", fetcher }))
      .resolves.toEqual({ status: "retained", envelope: cached });
    expect(cache.peek("record")).toEqual(cached);
  });

  it("returns an error for an uncached failure", async () => {
    const cache = new BoundedDetailCache<TestDetail>(100, isTestDetail);
    await expect(revalidateDetail({
      cache,
      key: "missing",
      fetcher: async () => { throw new Error("offline"); },
    })).resolves.toEqual({ status: "error", envelope: null });
  });

  it("rejects an internally valid response for a different route key", async () => {
    const cache = new BoundedDetailCache<TestDetail>(100, isTestDetail);
    await expect(revalidateDetail({
      cache,
      key: "requested",
      fetcher: async () => response(envelope("different")),
    })).resolves.toEqual({ status: "error", envelope: null });
    expect(cache.size).toBe(0);
  });

  it.each([404, 410])("evicts cached detail after terminal HTTP %s", async (status) => {
    const cache = new BoundedDetailCache<TestDetail>(100, isTestDetail);
    cache.set("record", envelope("record", "cached"));

    await expect(revalidateDetail({
      cache,
      key: "record",
      fetcher: async () => response({ error: "not found" }, false, status),
    })).resolves.toEqual({ status: "error", envelope: null });
    expect(cache.peek("record")).toBeUndefined();
  });
});
