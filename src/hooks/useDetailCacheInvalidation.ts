"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BoundedDetailCache } from "@/lib/detail-cache";
import {
  subscribeToDetailCacheInvalidation,
  synchronizeDetailCacheGeneration,
  type DetailCacheEntity,
} from "@/lib/detail-cache-events";

const REFRESH_COALESCE_MS = 50;

/**
 * Keeps module-level drawer caches and their server-rendered list in step with
 * admin mutations, including mutations that happened while the route was
 * unmounted. A short coalescing window prevents import batches from producing
 * a refresh storm.
 */
export function useDetailCacheInvalidation<T extends object>(
  entity: DetailCacheEntity,
  cache: BoundedDetailCache<T>,
): number {
  const router = useRouter();
  const [requestVersion, setRequestVersion] = useState(0);

  // This comparison must precede useFreshDetail so a remount cannot
  // synchronously expose an envelope from an older entity generation.
  synchronizeDetailCacheGeneration(entity, cache);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = subscribeToDetailCacheInvalidation(entity, () => {
      synchronizeDetailCacheGeneration(entity, cache);
      setRequestVersion((value) => value + 1);
      if (refreshTimer !== null) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        router.refresh();
      }, REFRESH_COALESCE_MS);
    });

    return () => {
      unsubscribe();
      if (refreshTimer !== null) clearTimeout(refreshTimer);
    };
  }, [cache, entity, router]);

  return requestVersion;
}
