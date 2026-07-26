import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BoundedDetailCache } from "@/lib/detail-cache";
import { invalidateDetailCache } from "@/lib/detail-cache-events";
import type { DetailResponse } from "@/modules/shared/types";
import { useDetailCacheInvalidation } from "./useDetailCacheInvalidation";
import { useFreshDetail } from "./useFreshDetail";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

type TestDetail = { id: string };

const envelope: DetailResponse<TestDetail> = {
  data: { id: "stale" },
  meta: {
    canonicalId: "stale",
    updatedAt: "2026-07-22T12:00:00.000Z",
    lastVerifiedAt: null,
    sourceCount: 1,
  },
};

function Harness({ cache }: { cache: BoundedDetailCache<TestDetail> }) {
  const version = useDetailCacheInvalidation("deal", cache);
  return <span data-testid="version">{version}</span>;
}

function DetailHarness({ cache }: { cache: BoundedDetailCache<TestDetail> }) {
  const requestVersion = useDetailCacheInvalidation("deal", cache);
  const result = useFreshDetail({
    cache,
    cacheKey: "stale",
    requestUrl: "/api/deals/stale",
    requestVersion,
  });
  return (
    <>
      <span data-testid="detail-state">{result.state}</span>
      <span data-testid="detail-id">{result.detail?.id ?? "none"}</span>
    </>
  );
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, String(value));
    },
  };
}

describe("useDetailCacheInvalidation", () => {
  beforeEach(() => {
    router.refresh.mockReset();
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("clears active detail state and coalesces list refreshes", () => {
    vi.useFakeTimers();
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("stale", envelope);
    render(<Harness cache={cache} />);

    act(() => {
      invalidateDetailCache("deal", "stale");
      invalidateDetailCache("deal", "another-record");
    });

    expect(cache.size).toBe(0);
    expect(screen.getByTestId("version")).toHaveTextContent("2");
    expect(router.refresh).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(50));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it("clears a cache before render when remounting after an inactive mutation", () => {
    const cache = new BoundedDetailCache<TestDetail>();
    const first = render(<Harness cache={cache} />);
    cache.set("stale", envelope);
    first.unmount();

    invalidateDetailCache("deal", "stale");
    render(<Harness cache={cache} />);

    expect(cache.size).toBe(0);
  });

  it("does not expose stale detail on remount and preserves terminal 404 unavailability", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    const first = render(<Harness cache={cache} />);
    cache.set("stale", envelope);
    first.unmount();
    invalidateDetailCache("deal", "stale");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    render(<DetailHarness cache={cache} />);

    expect(screen.getByTestId("detail-id")).toHaveTextContent("none");
    expect(screen.getByTestId("detail-state")).toHaveTextContent("loading");
    await waitFor(() => {
      expect(screen.getByTestId("detail-state")).toHaveTextContent("unavailable");
    });
    expect(cache.size).toBe(0);
  });
});
