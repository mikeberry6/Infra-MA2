"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Syncs a Set<string> filter to a URL query parameter.
 *
 * The set values are stored as a comma-separated list (e.g. `?sector=Digital,Utilities`).
 * Empty sets are serialized as the absence of the param so URLs stay clean.
 *
 * Reads/writes against `window.location.search` at call time rather than
 * against the render-time `useSearchParams` snapshot — this avoids races when
 * multiple filter updates fire in the same tick.
 *
 * Uses `router.replace({ scroll: false })` so filter changes don't pollute the
 * history stack or jump the scroll position.
 *
 * @param paramName The URL query parameter name (e.g. "sector")
 * @returns [set, toggle, clear, setAll] — same shape as a useState wrapper.
 */
export function useUrlFilterSet(
  paramName: string,
): [Set<string>, (value: string) => void, () => void, (next: Set<string>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(paramName);
    if (!raw) return new Set<string>();
    return new Set(raw.split(",").filter(Boolean));
  }, [searchParams, paramName]);

  const writeUrl = useCallback(
    (nextValues: Set<string>) => {
      // Always read the LATEST URL at call time — not render time — so that
      // consecutive updates within the same tick compose correctly.
      const latest = new URLSearchParams(window.location.search);
      if (nextValues.size > 0) {
        latest.set(paramName, Array.from(nextValues).join(","));
      } else {
        latest.delete(paramName);
      }
      const query = latest.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [paramName, router, pathname],
  );

  const toggle = useCallback(
    (v: string) => {
      const latest = new URLSearchParams(window.location.search);
      const current = new Set((latest.get(paramName) ?? "").split(",").filter(Boolean));
      if (current.has(v)) current.delete(v);
      else current.add(v);
      writeUrl(current);
    },
    [paramName, writeUrl],
  );

  const clear = useCallback(() => writeUrl(new Set()), [writeUrl]);

  const setAll = useCallback((next: Set<string>) => writeUrl(next), [writeUrl]);

  return [value, toggle, clear, setAll];
}

/**
 * Returns a `clear` function that wipes several URL-synced filter params in a
 * single `router.replace` call — prefer this over calling each filter's own
 * `clear` in sequence, which would produce intermediate URL states.
 */
export function useClearUrlFilters(paramNames: string[]): () => void {
  const router = useRouter();
  const pathname = usePathname();
  // Derive a stable cache key from the names so identity is preserved across
  // renders that pass the same list.
  const key = paramNames.join(",");

  return useCallback(() => {
    const latest = new URLSearchParams(window.location.search);
    for (const name of key.split(",")) {
      latest.delete(name);
    }
    const query = latest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [router, pathname, key]);
}
