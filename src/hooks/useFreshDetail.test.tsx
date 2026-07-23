import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoundedDetailCache } from "@/lib/detail-cache";
import type { DetailResponse } from "@/modules/shared/types";
import { useFreshDetail } from "./useFreshDetail";

type TestDetail = { id: string; value: string };

const isTestDetail = (value: unknown): value is TestDetail => Boolean(
  value
  && typeof value === "object"
  && typeof (value as Partial<TestDetail>).id === "string"
  && typeof (value as Partial<TestDetail>).value === "string",
);

function envelope(value: string, id = "record"): DetailResponse<TestDetail> {
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

function Harness({
  cache,
  cacheKey = "record",
  requestVersion = 0,
}: {
  cache: BoundedDetailCache<TestDetail>;
  cacheKey?: string | null;
  requestVersion?: number;
}) {
  const result = useFreshDetail({
    cache,
    cacheKey,
    requestUrl: cacheKey ? `/api/detail/${cacheKey}` : null,
    requestVersion,
  });
  return (
    <div>
      <span data-testid="state">{result.state}</span>
      <span data-testid="value">{result.detail?.value ?? "none"}</span>
    </div>
  );
}

function cache() {
  return new BoundedDetailCache<TestDetail>(100, isTestDetail);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFreshDetail", () => {
  it("does not issue a request before a drawer is opened", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<Harness cache={cache()} cacheKey={null} />);

    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    await act(async () => Promise.resolve());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders uncached detail as loading, then hydrates it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify(envelope("fresh")),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    render(<Harness cache={cache()} />);

    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    expect(screen.getByTestId("value")).toHaveTextContent("none");
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("fresh"));
    expect(screen.getByTestId("state")).toHaveTextContent("ready");
  });

  it("renders cached detail synchronously and revalidates with no-store", async () => {
    const detailCache = cache();
    detailCache.set("record", envelope("cached"));
    let resolveFetch!: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<Harness cache={detailCache} />);
    expect(screen.getByTestId("state")).toHaveTextContent("ready");
    expect(screen.getByTestId("value")).toHaveTextContent("cached");
    expect(fetchMock).toHaveBeenCalledWith("/api/detail/record", expect.objectContaining({
      cache: "no-store",
      signal: expect.any(AbortSignal),
    }));

    await act(async () => {
      resolveFetch(new Response(JSON.stringify(envelope("fresh")), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      await fetchPromise;
    });
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("fresh"));
  });

  it("keeps cached detail visible and marks it stale when background revalidation fails", async () => {
    const detailCache = cache();
    detailCache.set("record", envelope("cached"));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<Harness cache={detailCache} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("stale"));
    expect(screen.getByTestId("value")).toHaveTextContent("cached");
  });

  it("can retry a failed background refresh without dropping cached detail", async () => {
    const detailCache = cache();
    detailCache.set("record", envelope("cached"));
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<Harness cache={detailCache} requestVersion={0} />);

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("stale"));
    expect(screen.getByTestId("value")).toHaveTextContent("cached");

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(envelope("fresh")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    view.rerender(<Harness cache={detailCache} requestVersion={1} />);

    expect(screen.getByTestId("value")).toHaveTextContent("cached");
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("fresh"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("supports an explicit retry after an uncached failure", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const detailCache = cache();
    const view = render(<Harness cache={detailCache} requestVersion={0} />);

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("error"));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(envelope("recovered")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    view.rerender(<Harness cache={detailCache} requestVersion={1} />);

    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("recovered"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("removes cached detail when the record is no longer public", async () => {
    const detailCache = cache();
    detailCache.set("record", envelope("cached"));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    render(<Harness cache={detailCache} />);
    expect(screen.getByTestId("value")).toHaveTextContent("cached");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("error"));
    expect(screen.getByTestId("value")).toHaveTextContent("none");
    expect(detailCache.peek("record")).toBeUndefined();
  });

  it("aborts the stale request when the drawer closes", async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal("fetch", vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal as AbortSignal;
      return new Promise<Response>(() => undefined);
    }));
    const detailCache = cache();
    const view = render(<Harness cache={detailCache} />);
    expect(requestSignal?.aborted).toBe(false);

    view.rerender(<Harness cache={detailCache} cacheKey={null} />);
    expect(requestSignal?.aborted).toBe(true);
  });

  it("revalidates again whenever the same cached drawer is reopened", async () => {
    const detailCache = cache();
    detailCache.set("record", envelope("cached"));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope("fresh")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<Harness cache={detailCache} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    view.rerender(<Harness cache={detailCache} cacheKey={null} />);
    view.rerender(<Harness cache={detailCache} />);
    expect(screen.getByTestId("value")).toHaveTextContent("fresh");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
