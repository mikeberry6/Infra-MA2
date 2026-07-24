"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { track } from "@vercel/analytics";

const URL_FILTER_CHANGE_EVENT = "infra:url-filter-change";

type AnalyticsFilterName =
  | "sector"
  | "region"
  | "category"
  | "country"
  | "firm"
  | "year"
  | "strategy"
  | "status"
  | "size"
  | "entity"
  | "source"
  | "confidence";

function readSearchParam(paramName: string, search?: string): string | null {
  if (typeof window === "undefined" && search === undefined) return null;
  return new URLSearchParams(search ?? window.location.search).get(paramName);
}

function readFilterSet(paramName: string, search?: string): Set<string> {
  const raw = readSearchParam(paramName, search);
  if (!raw) return new Set<string>();
  return new Set(raw.split(",").filter(Boolean));
}

function notifyUrlFiltersChanged(query: string) {
  window.dispatchEvent(
    new CustomEvent(URL_FILTER_CHANGE_EVENT, { detail: { search: query ? `?${query}` : "" } }),
  );
}

export function useUrlQueryParam(paramName: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setValue(readSearchParam(paramName));
    const syncFromEvent = (event: Event) => {
      const search = (event as CustomEvent<{ search?: string }>).detail?.search;
      setValue(readSearchParam(paramName, search));
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    };
  }, [paramName]);

  return value;
}

export function useUrlQueryState(
  paramName: string,
  defaultValue = "",
  options: { resetPage?: boolean } = {},
): [string, (next: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const resetPage = options.resetPage ?? false;

  useEffect(() => {
    const sync = () => setValue(readSearchParam(paramName) ?? defaultValue);
    const syncFromEvent = (event: Event) => {
      const search = (event as CustomEvent<{ search?: string }>).detail?.search;
      setValue(readSearchParam(paramName, search) ?? defaultValue);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    };
  }, [defaultValue, paramName]);

  const write = useCallback((next: string) => {
    const latest = new URLSearchParams(window.location.search);
    const current = latest.get(paramName) ?? defaultValue;
    if (next && next !== defaultValue) latest.set(paramName, next);
    else latest.delete(paramName);
    if (resetPage && paramName !== "page") latest.delete("page");
    const query = latest.toString();
    setValue(next);
    const href = query ? `${pathname}?${query}` : pathname;
    // Search input creates one navigable history entry, then coalesces later
    // keystrokes into it. Discrete sort/page/view changes each remain
    // independently reachable with browser Back and Forward.
    const history = paramName === "q" && current !== defaultValue && next !== defaultValue
      ? "replace"
      : "push";
    router[history](href, { scroll: false });
    notifyUrlFiltersChanged(query);
  }, [defaultValue, resetPage, paramName, pathname, router]);

  return [value, write];
}

export function useUrlQueryWriter() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback((paramName: string, value: string | null, history: "push" | "replace" = "replace") => {
    const latest = new URLSearchParams(window.location.search);
    if (value) latest.set(paramName, value);
    else latest.delete(paramName);
    const query = latest.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router[history](href, { scroll: false });
    notifyUrlFiltersChanged(query);
  }, [pathname, router]);
}

/**
 * Applies related query-state changes in one navigation. This avoids exposing
 * intermediate states such as a new sort field paired with the old direction,
 * and gives the whole interaction a single Back/Forward history entry.
 */
export function useUrlQueryParamsWriter() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback((
    updates: Record<string, string | null>,
    options: { history?: "push" | "replace"; resetPage?: boolean } = {},
  ) => {
    const latest = new URLSearchParams(window.location.search);
    for (const [paramName, value] of Object.entries(updates)) {
      if (value) latest.set(paramName, value);
      else latest.delete(paramName);
    }
    if (options.resetPage) latest.delete("page");
    const query = latest.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router[options.history ?? "push"](href, { scroll: false });
    notifyUrlFiltersChanged(query);
  }, [pathname, router]);
}

/**
 * Syncs a Set<string> filter to a URL query parameter.
 *
 * The set values are stored as a comma-separated list (e.g. `?sector=Digital,Utilities`).
 * Empty sets are serialized as the absence of the param so URLs stay clean.
 *
 * Reads/writes against `window.location.search` at call time rather than
 * against a render-time query snapshot — this avoids races when
 * multiple filter updates fire in the same tick.
 *
 * Each discrete filter change uses `router.push({ scroll: false })` so the
 * browser's Back and Forward controls restore the prior result state.
 *
 * @param paramName The URL query parameter name (e.g. "sector")
 * @returns [set, toggle, clear, setAll] — same shape as a useState wrapper.
 */
export function useUrlFilterSet(
  paramName: AnalyticsFilterName,
): [Set<string>, (value: string) => void, () => void, (next: Set<string>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const sync = () => setValue(readFilterSet(paramName));
    const syncFromEvent = (event: Event) => {
      const search = (event as CustomEvent<{ search?: string }>).detail?.search;
      setValue(readFilterSet(paramName, search));
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(URL_FILTER_CHANGE_EVENT, syncFromEvent);
    };
  }, [paramName]);

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
      latest.delete("page");
      const query = latest.toString();
      setValue(new Set(nextValues));
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      notifyUrlFiltersChanged(query);
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
      track("filter_applied", { filter: paramName, active_count: current.size });
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
    latest.delete("page");
    const query = latest.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    notifyUrlFiltersChanged(query);
  }, [router, pathname, key]);
}
