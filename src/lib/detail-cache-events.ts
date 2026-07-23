export const DETAIL_CACHE_INVALIDATION_EVENT = "infrasight:detail-cache:invalidate";

const DETAIL_CACHE_INVALIDATION_CHANNEL = "infrasight:detail-cache";
const DETAIL_CACHE_ENTITIES = new Set<DetailCacheEntity>(["deal", "fund", "company"]);
const clientInstanceId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export type DetailCacheEntity = "deal" | "fund" | "company";

export interface DetailCacheInvalidation {
  entity: DetailCacheEntity;
  recordId?: string;
  occurredAt: number;
  sourceId: string;
}

function isDetailCacheInvalidation(value: unknown): value is DetailCacheInvalidation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DetailCacheInvalidation>;
  return (
    typeof candidate.entity === "string"
    && DETAIL_CACHE_ENTITIES.has(candidate.entity as DetailCacheEntity)
    && (candidate.recordId === undefined
      || (typeof candidate.recordId === "string" && candidate.recordId.length > 0))
    && typeof candidate.occurredAt === "number"
    && Number.isFinite(candidate.occurredAt)
    && typeof candidate.sourceId === "string"
    && candidate.sourceId.length > 0
  );
}

/**
 * Announces that browser-resident drawer detail data is stale. A DOM event
 * covers listeners in the current tab; BroadcastChannel covers other open
 * InfraSight tabs. Server cache-tag invalidation remains the responsibility
 * of the successful mutation that calls this helper.
 */
export function invalidateDetailCache(entity: DetailCacheEntity, recordId?: string): void {
  if (typeof window === "undefined") return;

  const detail: DetailCacheInvalidation = {
    entity,
    ...(recordId ? { recordId } : {}),
    occurredAt: Date.now(),
    sourceId: clientInstanceId,
  };

  window.dispatchEvent(
    new CustomEvent<DetailCacheInvalidation>(DETAIL_CACHE_INVALIDATION_EVENT, { detail }),
  );

  if (typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(DETAIL_CACHE_INVALIDATION_CHANNEL);
    channel.postMessage(detail);
    channel.close();
  } catch {
    // Same-tab delivery has already happened. Cross-tab delivery can be
    // unavailable in restricted or private browsing contexts.
  }
}

/** Subscribe to one entity cache and return an idempotent cleanup function. */
export function subscribeToDetailCacheInvalidation(
  entity: DetailCacheEntity,
  listener: (event: DetailCacheInvalidation) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const deliver = (detail: unknown, allowSameClient: boolean) => {
    if (!isDetailCacheInvalidation(detail) || detail.entity !== entity) return;
    if (!allowSameClient && detail.sourceId === clientInstanceId) return;
    listener(detail);
  };

  const handleWindowEvent = (event: Event) => {
    deliver((event as CustomEvent<unknown>).detail, true);
  };
  window.addEventListener(DETAIL_CACHE_INVALIDATION_EVENT, handleWindowEvent);

  let channel: BroadcastChannel | null = null;
  const handleChannelMessage = (event: MessageEvent<unknown>) => {
    deliver(event.data, false);
  };
  if (typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel(DETAIL_CACHE_INVALIDATION_CHANNEL);
      channel.addEventListener("message", handleChannelMessage);
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener(DETAIL_CACHE_INVALIDATION_EVENT, handleWindowEvent);
    if (channel) {
      channel.removeEventListener("message", handleChannelMessage);
      channel.close();
    }
  };
}
