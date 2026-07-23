import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DETAIL_CACHE_INVALIDATION_EVENT,
  invalidateDetailCache,
  subscribeToDetailCacheInvalidation,
  type DetailCacheInvalidation,
} from "./detail-cache-events";
import { BoundedDetailCache } from "./detail-cache";

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

describe("detail cache invalidation events", () => {
  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
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

    window.removeEventListener(DETAIL_CACHE_INVALIDATION_EVENT, domListener);
  });

  it("lets an entity subscriber evict its in-memory drawer cache immediately", () => {
    type Detail = { id: string };
    const cache = new BoundedDetailCache<Detail>();
    cache.set("deal-1", {
      data: { id: "deal-1" },
      meta: {
        canonicalId: "deal-1",
        updatedAt: "2026-07-22T12:00:00.000Z",
        lastVerifiedAt: null,
        sourceCount: 1,
      },
    });
    const unsubscribe = subscribeToDetailCacheInvalidation("deal", () => cache.clear());

    invalidateDetailCache("deal", "deal-1");

    expect(cache.size).toBe(0);
    unsubscribe();
  });
});
