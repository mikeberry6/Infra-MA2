import type { DetailResponse, RecordMeta } from "@/modules/shared/types";

export const DETAIL_CACHE_MAX_ENTRIES = 100;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export function isRecordMeta(value: unknown): value is RecordMeta {
  if (!isObject(value)) return false;
  return (
    typeof value.canonicalId === "string"
    && value.canonicalId.trim().length > 0
    && isTimestamp(value.updatedAt)
    && (value.lastVerifiedAt === null || isTimestamp(value.lastVerifiedAt))
    && Number.isInteger(value.sourceCount)
    && (value.sourceCount as number) >= 0
  );
}

export function isDetailResponse<T extends object>(value: unknown): value is DetailResponse<T> {
  if (!isObject(value)) return false;
  return isObject(value.data) && isRecordMeta(value.meta);
}

/** A small LRU cache for browser-resident drawer detail envelopes. */
export class BoundedDetailCache<T extends object> {
  readonly maxEntries: number;
  private readonly entries = new Map<string, DetailResponse<T>>();

  constructor(maxEntries = DETAIL_CACHE_MAX_ENTRIES) {
    if (
      !Number.isSafeInteger(maxEntries)
      || maxEntries < 1
      || maxEntries > DETAIL_CACHE_MAX_ENTRIES
    ) {
      throw new Error(`Detail cache capacity must be between 1 and ${DETAIL_CACHE_MAX_ENTRIES}.`);
    }
    this.maxEntries = maxEntries;
  }

  get size(): number {
    return this.entries.size;
  }

  /** Read without changing recency; useful while deriving render state. */
  peek(key: string): DetailResponse<T> | undefined {
    return this.entries.get(key);
  }

  /** Read and promote the entry to most recently used. */
  get(key: string): DetailResponse<T> | undefined {
    const value = this.entries.get(key);
    if (!value) return undefined;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: string, value: DetailResponse<T>): void {
    if (!key || !isDetailResponse<T>(value)) {
      throw new Error("Detail cache entries require a non-empty key and valid { data, meta } envelope.");
    }
    this.entries.delete(key);
    while (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
    this.entries.set(key, value);
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }
}

type DetailFetchResponse = Pick<Response, "ok" | "status" | "json">;

export type DetailRevalidationResult<T extends object> =
  | { status: "updated"; envelope: DetailResponse<T> }
  | { status: "retained"; envelope: DetailResponse<T> }
  | { status: "unavailable"; envelope: null }
  | { status: "error"; envelope: null };

/**
 * Revalidate a detail record. Transient HTTP, parsing, validation, and
 * transport failures retain a usable cached envelope, but terminal 404/410
 * responses evict it so an archived public record cannot remain available in
 * a long-lived browser session. Only validated envelopes enter the cache.
 */
export async function revalidateDetail<T extends object>({
  cache,
  key,
  fetcher,
  signal,
}: {
  cache: BoundedDetailCache<T>;
  key: string;
  fetcher: () => Promise<DetailFetchResponse>;
  signal?: AbortSignal;
}): Promise<DetailRevalidationResult<T>> {
  const cached = cache.get(key);
  const fallback = (): DetailRevalidationResult<T> => cached
    ? { status: "retained", envelope: cached }
    : { status: "error", envelope: null };

  try {
    const response = await fetcher();
    if (response.status === 404 || response.status === 410) {
      cache.delete(key);
      return { status: "unavailable", envelope: null };
    }
    if (signal?.aborted || !response.ok) return fallback();
    const payload: unknown = await response.json();
    if (signal?.aborted || !isDetailResponse<T>(payload)) return fallback();
    cache.set(key, payload);
    return { status: "updated", envelope: payload };
  } catch {
    return fallback();
  }
}
