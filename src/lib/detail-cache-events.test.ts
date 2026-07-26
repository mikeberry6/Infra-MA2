import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DETAIL_CACHE_INVALIDATION_EVENT,
  getDetailCacheGeneration,
  invalidateDetailCache,
  subscribeToDetailCacheInvalidation,
  synchronizeDetailCacheGeneration,
  type DetailCacheInvalidation,
} from "./detail-cache-events";

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];

  readonly name: string;
  readonly messages: unknown[] = [];
  readonly listeners = new Set<(event: MessageEvent<unknown>) => void>();
  closed = false;

  constructor(name: string) {
    this.name = name;
    FakeBroadcastChannel.instances.push(this);
  }

  addEventListener(_type: "message", listener: (event: MessageEvent<unknown>) => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: "message", listener: (event: MessageEvent<unknown>) => void) {
    this.listeners.delete(listener);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
  }

  close() {
    this.closed = true;
  }

  receive(message: unknown) {
    for (const listener of this.listeners) {
      listener({ data: message } as MessageEvent<unknown>);
    }
  }
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

describe("detail cache invalidation events", () => {
  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delivers same-tab invalidations only to subscribers for that entity", () => {
    const dealListener = vi.fn();
    const fundListener = vi.fn();
    const unsubscribeDeal = subscribeToDetailCacheInvalidation("deal", dealListener);
    const unsubscribeFund = subscribeToDetailCacheInvalidation("fund", fundListener);

    invalidateDetailCache("deal", "deal-1");

    expect(dealListener).toHaveBeenCalledTimes(1);
    expect(dealListener).toHaveBeenCalledWith(
      expect.objectContaining({ entity: "deal", recordId: "deal-1" }),
    );
    expect(fundListener).not.toHaveBeenCalled();

    unsubscribeDeal();
    unsubscribeFund();
  });

  it("stops delivering after the subscriber is removed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToDetailCacheInvalidation("company", listener);
    unsubscribe();

    invalidateDetailCache("company");

    expect(listener).not.toHaveBeenCalled();
  });

  it("accepts valid cross-tab messages and ignores malformed messages", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToDetailCacheInvalidation("fund", listener);
    const subscriberChannel = FakeBroadcastChannel.instances[0];
    const remoteEvent: DetailCacheInvalidation = {
      entity: "fund",
      recordId: "fund-9",
      occurredAt: Date.now(),
      sourceId: "another-tab",
      generation: "remote-generation-1",
    };

    subscriberChannel.receive({ entity: "fund" });
    subscriberChannel.receive(remoteEvent);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(remoteEvent);
    unsubscribe();
  });

  it("publishes a typed DOM event and a cross-tab message", () => {
    const domListener = vi.fn();
    window.addEventListener(DETAIL_CACHE_INVALIDATION_EVENT, domListener);

    invalidateDetailCache("company", "company-3");

    const publisherChannel = FakeBroadcastChannel.instances[0];
    expect(publisherChannel.messages).toHaveLength(1);
    expect(publisherChannel.messages[0]).toEqual(
      expect.objectContaining({ entity: "company", recordId: "company-3" }),
    );
    expect(publisherChannel.closed).toBe(true);
    expect(domListener).toHaveBeenCalledTimes(1);
    expect(getDetailCacheGeneration("company")).toMatch(/^.+:client-.+:\d+$/);

    window.removeEventListener(DETAIL_CACHE_INVALIDATION_EVENT, domListener);
  });

  it("clears a cache on remount after an invalidation had no active subscriber", () => {
    const cache = { clear: vi.fn() };
    expect(synchronizeDetailCacheGeneration("deal", cache)).toBe(false);

    invalidateDetailCache("deal", "record-id-is-not-persisted");

    expect(synchronizeDetailCacheGeneration("deal", cache)).toBe(true);
    expect(cache.clear).toHaveBeenCalledTimes(1);
    expect(
      Array.from({ length: window.localStorage.length }, (_, index) => (
        window.localStorage.getItem(window.localStorage.key(index) ?? "")
      )).join(" "),
    ).not.toContain("record-id-is-not-persisted");
  });

  it("delivers storage generations to active subscribers without record identifiers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToDetailCacheInvalidation("company", listener);
    window.dispatchEvent(new StorageEvent("storage", {
      key: "infrasight:detail-cache-generation:company",
      newValue: "remote-storage-generation",
    }));

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      entity: "company",
      generation: "remote-storage-generation",
    }));
    expect(listener.mock.calls[0][0]).not.toHaveProperty("recordId");
    unsubscribe();
  });
});
