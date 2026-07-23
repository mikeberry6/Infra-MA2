export const DETAIL_CACHE_INVALIDATION_EVENT = "infrasight:detail-cache:invalidate";

const DETAIL_CACHE_INVALIDATION_CHANNEL = "infrasight:detail-cache";
const DETAIL_CACHE_GENERATION_PREFIX = "infrasight:detail-cache-generation:";
const DETAIL_CACHE_ENTITIES = new Set<DetailCacheEntity>(["deal", "fund", "company"]);
const clientInstanceId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const memoryGenerations = new Map<DetailCacheEntity, string>();
const observedCacheGenerations = new WeakMap<object, Map<DetailCacheEntity, string>>();
let generationSequence = 0;

export type DetailCacheEntity = "deal" | "fund" | "company";

export interface DetailCacheInvalidation {
  entity: DetailCacheEntity;
  recordId?: string;
  occurredAt: number;
  sourceId: string;
  generation: string;
}

const SAFE_GENERATION = /^[A-Za-z0-9._:-]{1,160}$/;

function generationStorageKey(entity: DetailCacheEntity): string {
  return `${DETAIL_CACHE_GENERATION_PREFIX}${entity}`;
}

function rememberGeneration(
  entity: DetailCacheEntity,
  generation: string,
  persist: boolean,
): void {
  if (!SAFE_GENERATION.test(generation)) return;
  memoryGenerations.set(entity, generation);
  if (!persist || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(generationStorageKey(entity), generation);
  } catch {
    // The in-memory generation still protects this tab when storage is denied.
  }
}

export function getDetailCacheGeneration(entity: DetailCacheEntity): string {
  if (typeof window !== "undefined") {
    try {
      const persisted = window.localStorage.getItem(generationStorageKey(entity));
      if (persisted && SAFE_GENERATION.test(persisted)) {
        memoryGenerations.set(entity, persisted);
      }
    } catch {
      // Fall through to the in-memory value in restricted browsing contexts.
    }
  }
  return memoryGenerations.get(entity) ?? "0";
}

/**
 * Clears a browser cache when its last observed entity generation is stale.
 * The WeakMap survives component unmounts without persisting any record data
 * or identifiers.
 */
export function synchronizeDetailCacheGeneration(
  entity: DetailCacheEntity,
  cache: { clear: () => void },
): boolean {
  const generation = getDetailCacheGeneration(entity);
  let observations = observedCacheGenerations.get(cache);
  if (!observations) {
    observations = new Map();
    observedCacheGenerations.set(cache, observations);
  }
  const previous = observations.get(entity);
  observations.set(entity, generation);
  if (previous === undefined || previous === generation) return false;
  cache.clear();
  return true;
}

function isDetailCacheInvalidation(value: unknown): value is DetailCacheInvalidation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DetailCacheInvalidation>;
  return (
    typeof candidate.entity === "string" &&
    DETAIL_CACHE_ENTITIES.has(candidate.entity as DetailCacheEntity) &&
    (candidate.recordId === undefined || typeof candidate.recordId === "string") &&
    typeof candidate.occurredAt === "number" &&
    Number.isFinite(candidate.occurredAt) &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.generation === "string" &&
    SAFE_GENERATION.test(candidate.generation)
  );
}

/**
 * Announces that browser-resident drawer detail data is stale. A DOM event
 * covers listeners in the current tab; BroadcastChannel covers other open
 * InfraSight tabs. Server cache invalidation remains the responsibility of the
 * mutation that calls this helper.
 */
export function invalidateDetailCache(entity: DetailCacheEntity, recordId?: string): void {
  if (typeof window === "undefined") return;

  const occurredAt = Date.now();
  generationSequence += 1;
  const generation = `${occurredAt}:${clientInstanceId}:${generationSequence}`;
  rememberGeneration(entity, generation, true);
  const detail: DetailCacheInvalidation = {
    entity,
    ...(recordId ? { recordId } : {}),
    occurredAt,
    sourceId: clientInstanceId,
    generation,
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
    // DOM delivery has already invalidated the current tab. BroadcastChannel
    // can be unavailable in restricted/private browsing contexts.
  }
}

/** Subscribe to one entity cache and return an idempotent cleanup function. */
export function subscribeToDetailCacheInvalidation(
  entity: DetailCacheEntity,
  listener: (event: DetailCacheInvalidation) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  let lastDeliveredGeneration: string | null = null;
  const deliver = (detail: unknown, allowSameClient: boolean) => {
    if (!isDetailCacheInvalidation(detail) || detail.entity !== entity) return;
    if (!allowSameClient && detail.sourceId === clientInstanceId) return;
    if (detail.generation === lastDeliveredGeneration) return;
    lastDeliveredGeneration = detail.generation;
    rememberGeneration(entity, detail.generation, false);
    listener(detail);
  };

  const handleWindowEvent = (event: Event) => {
    deliver((event as CustomEvent<unknown>).detail, true);
  };
  window.addEventListener(DETAIL_CACHE_INVALIDATION_EVENT, handleWindowEvent);
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key !== generationStorageKey(entity)
      || !event.newValue
      || !SAFE_GENERATION.test(event.newValue)
    ) {
      return;
    }
    deliver({
      entity,
      occurredAt: Date.now(),
      sourceId: "storage",
      generation: event.newValue,
    }, false);
  };
  window.addEventListener("storage", handleStorage);

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
    window.removeEventListener("storage", handleStorage);
    if (channel) {
      channel.removeEventListener("message", handleChannelMessage);
      channel.close();
    }
  };
}
