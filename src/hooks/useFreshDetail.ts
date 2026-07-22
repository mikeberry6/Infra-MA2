"use client";

import { useEffect, useState } from "react";
import { BoundedDetailCache, revalidateDetail } from "@/lib/detail-cache";
import type { DetailResponse, RecordMeta } from "@/modules/shared/types";

export type DetailLoadState = "idle" | "loading" | "ready" | "error";

type DetailSnapshot<T extends object> = {
  key: string | null;
  requestVersion: number;
  detail: T | null;
  meta: RecordMeta | null;
  state: DetailLoadState;
};

const IDLE_SNAPSHOT: DetailSnapshot<never> = {
  key: null,
  requestVersion: 0,
  detail: null,
  meta: null,
  state: "idle",
};

function readySnapshot<T extends object>(
  key: string,
  requestVersion: number,
  envelope: DetailResponse<T>,
): DetailSnapshot<T> {
  return {
    key,
    requestVersion,
    detail: envelope.data,
    meta: envelope.meta,
    state: "ready",
  };
}
/**
 * Stale-while-revalidate detail loading for public drawers. A cached envelope
 * renders synchronously, while every selection/open still issues a no-store
 * request in the background.
 */
export function useFreshDetail<T extends object>({
  cache,
  cacheKey,
  requestUrl,
  requestVersion = 0,
}: {
  cache: BoundedDetailCache<T>;
  cacheKey: string | null;
  requestUrl: string | null;
  requestVersion?: number;
}): { detail: T | null; meta: RecordMeta | null; state: DetailLoadState } {
  const [snapshot, setSnapshot] = useState<DetailSnapshot<T>>(
    IDLE_SNAPSHOT as DetailSnapshot<T>,
  );

  useEffect(() => {
    if (!cacheKey || !requestUrl) {
      setSnapshot(IDLE_SNAPSHOT as DetailSnapshot<T>);
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached) setSnapshot(readySnapshot(cacheKey, requestVersion, cached));
    else {
      setSnapshot({
        key: cacheKey,
        requestVersion,
        detail: null,
        meta: null,
        state: "loading",
      });
    }

    let active = true;
    const controller = new AbortController();
    void revalidateDetail({
      cache,
      key: cacheKey,
      signal: controller.signal,
      fetcher: () => fetch(requestUrl, {
        cache: "no-store",
        signal: controller.signal,
      }),
    }).then((result) => {
      if (!active) return;
      if (result.status === "error") {
        setSnapshot({
          key: cacheKey,
          requestVersion,
          detail: null,
          meta: null,
          state: "error",
        });
        return;
      }
      setSnapshot(readySnapshot(cacheKey, requestVersion, result.envelope));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [cache, cacheKey, requestUrl, requestVersion]);

  if (!cacheKey || !requestUrl) {
    return { detail: null, meta: null, state: "idle" };
  }
  if (snapshot.key === cacheKey && snapshot.requestVersion === requestVersion) {
    return { detail: snapshot.detail, meta: snapshot.meta, state: snapshot.state };
  }
  const cached = cache.peek(cacheKey);
  if (cached) {
    return { detail: cached.data, meta: cached.meta, state: "ready" };
  }
  return { detail: null, meta: null, state: "loading" };
}
