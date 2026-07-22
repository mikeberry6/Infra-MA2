import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoundedDetailCache } from "@/lib/detail-cache";
import type { DetailResponse } from "@/modules/shared/types";
import { useFreshDetail } from "./useFreshDetail";

type TestDetail = { id: string; value: string };

function envelope(value: string): DetailResponse<TestDetail> {
  return {
    data: { id: "record", value },
    meta: {
      canonicalId: "record",
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFreshDetail", () => {
  it("renders cached detail immediately and revalidates with no-store", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("cached"));
    let resolveFetch!: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<Harness cache={cache} />);
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

  it("keeps cached detail ready when background revalidation fails", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("cached"));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<Harness cache={cache} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("ready"));
    expect(screen.getByTestId("value")).toHaveTextContent("cached");
  });

  it("shows the existing error state for an uncached failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    render(<Harness cache={new BoundedDetailCache<TestDetail>()} />);

    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("error"));
    expect(screen.getByTestId("value")).toHaveTextContent("none");
  });

  it("removes cached detail when the record is no longer public", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("cached"));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    render(<Harness cache={cache} />);
    expect(screen.getByTestId("value")).toHaveTextContent("cached");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("error"));
    expect(screen.getByTestId("value")).toHaveTextContent("none");
    expect(cache.peek("record")).toBeUndefined();
  });

  it("treats invalidation versions as a fresh uncached request", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("cached"));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope("fresh")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<Harness cache={cache} requestVersion={0} />);
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("fresh"));

    cache.clear();
    fetchMock.mockImplementation(() => new Promise<Response>(() => undefined));
    view.rerender(<Harness cache={cache} requestVersion={1} />);
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    expect(screen.getByTestId("value")).toHaveTextContent("none");
  });

  it("revalidates again whenever the same cached drawer is reopened", async () => {
    const cache = new BoundedDetailCache<TestDetail>();
    cache.set("record", envelope("cached"));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope("fresh")), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<Harness cache={cache} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    view.rerender(<Harness cache={cache} cacheKey={null} />);
    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    view.rerender(<Harness cache={cache} />);
    expect(screen.getByTestId("value")).toHaveTextContent("fresh");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith("/api/detail/record", expect.objectContaining({
      cache: "no-store",
    }));
  });
});
