import { describe, expect, it } from "vitest";
import {
  DEFAULT_NEWS_SCAN_MAX_TARGETS,
  effectiveNewsScanLookbackDays,
  parseNewsScanAsOf,
  parseNewsScanRotationDate,
  parsePublicNewsScanWindow,
  selectCanonicalNewsScanTerms,
  selectNewsScanWindow,
  scheduledNewsScanServiceDate,
  sortNewsScanEntityUrls,
} from "@/modules/news/scan-window";

type Entity = { id: string; type: "COMPANY" | "FUND" | "FUND_MANAGER" };

function syntheticUniverse(size: number): Entity[] {
  const types: Entity["type"][] = ["COMPANY", "FUND", "FUND_MANAGER"];
  return Array.from({ length: size }, (_, index) => ({
    id: `entity-${String(index).padStart(4, "0")}`,
    type: types[index % types.length],
  }));
}

function keys(entities: Entity[]): string[] {
  return entities.map((entity) => `${entity.type}:${entity.id}`);
}

describe("daily news scan target window", () => {
  it("bounds the current-scale default and exposes its eight-day cycle metadata", () => {
    const result = selectNewsScanWindow(syntheticUniverse(1_500), {
      date: new Date("2026-07-22T23:30:00.000Z"),
    });

    expect(DEFAULT_NEWS_SCAN_MAX_TARGETS).toBe(200);
    expect(result.entities).toHaveLength(200);
    expect(result.metadata).toMatchObject({
      fullUniverseCount: 1_500,
      eligibleCount: 1_500,
      selectedCount: 200,
      maxTargets: 200,
      windowsPerCycle: 8,
      selectionDateUtc: "2026-07-22",
    });
  });

  it("selects the same canonical entities for every retry on one UTC date", () => {
    const universe = syntheticUniverse(137).reverse();
    const first = selectNewsScanWindow(universe, {
      date: new Date("2026-07-22T00:00:01.000Z"),
      maxTargets: 17,
    });
    const retry = selectNewsScanWindow([...universe].reverse(), {
      date: new Date("2026-07-22T23:59:59.999Z"),
      maxTargets: 17,
    });

    expect(keys(retry.entities)).toEqual(keys(first.entities));
    expect(retry.metadata.offset).toBe(first.metadata.offset);
    expect(retry.metadata.windowIndex).toBe(first.metadata.windowIndex);
  });

  it("advances adjacent windows and covers every eligible entity in one cycle", () => {
    const universe = syntheticUniverse(137);
    const start = Date.parse("2026-07-20T12:00:00.000Z");
    const first = selectNewsScanWindow(universe, {
      date: new Date(start),
      maxTargets: 17,
    });
    const second = selectNewsScanWindow(universe, {
      date: new Date(start + 24 * 60 * 60 * 1_000),
      maxTargets: 17,
    });

    expect(second.metadata.windowIndex).toBe((first.metadata.windowIndex + 1) % first.metadata.windowsPerCycle);
    expect(keys(second.entities)).not.toEqual(keys(first.entities));

    const covered = new Set<string>();
    for (let day = 0; day < first.metadata.windowsPerCycle; day++) {
      const window = selectNewsScanWindow(universe, {
        date: new Date(start + day * 24 * 60 * 60 * 1_000),
        maxTargets: 17,
      });
      keys(window.entities).forEach((key) => covered.add(key));
    }
    expect(covered.size).toBe(universe.length);
  });

  it("rotates only within an explicitly target-filtered eligible set", () => {
    const result = selectNewsScanWindow(syntheticUniverse(12), {
      date: new Date("2026-07-22T12:00:00.000Z"),
      maxTargets: 5,
      fullUniverseCount: 1_500,
      targetFiltered: true,
    });

    expect(result.metadata).toMatchObject({
      fullUniverseCount: 1_500,
      eligibleCount: 12,
      selectedCount: 5,
      targetFiltered: true,
    });
    expect(result.entities.every((entity) => entity.id.startsWith("entity-"))).toBe(true);
  });

  it("validates the workflow-pinned UTC date and rejects rollover-prone inputs", () => {
    expect(parseNewsScanRotationDate("2026-07-22").toISOString()).toBe("2026-07-22T00:00:00.000Z");
    expect(() => parseNewsScanRotationDate("2026-7-22")).toThrow(/YYYY-MM-DD/);
    expect(() => parseNewsScanRotationDate("2026-02-30")).toThrow(/real UTC calendar date/);
    expect(parseNewsScanAsOf("2026-07-22T23:30:00Z").toISOString()).toBe("2026-07-22T23:30:00.000Z");
    expect(() => parseNewsScanAsOf("2026-07-22T23:30:00-04:00")).toThrow(/canonical UTC ISO/);
    expect(() => parseNewsScanAsOf("2026-02-30T23:30:00Z")).toThrow(/real UTC timestamp/);
  });

  it("keeps a delayed 23:30 cron execution on its intended service day", () => {
    expect(scheduledNewsScanServiceDate(new Date("2026-07-22T23:30:00.000Z"))).toBe("2026-07-22");
    expect(scheduledNewsScanServiceDate(new Date("2026-07-23T00:45:00.000Z"))).toBe("2026-07-22");
    expect(scheduledNewsScanServiceDate(new Date("2026-07-23T05:59:59.999Z"))).toBe("2026-07-22");
    expect(scheduledNewsScanServiceDate(new Date("2026-07-23T06:00:00.000Z"))).toBe("2026-07-23");
    expect(scheduledNewsScanServiceDate(new Date("2026-07-23T23:30:00.000Z"))).toBe("2026-07-23");
  });

  it("derives a lookback that covers the full rotation plus late-posting margin", () => {
    const currentScale = selectNewsScanWindow(syntheticUniverse(1_500), {
      date: new Date("2026-07-22T23:30:00.000Z"),
    });
    const lookbackDays = effectiveNewsScanLookbackDays(currentScale.metadata.windowsPerCycle, 2);

    expect(currentScale.metadata.windowsPerCycle).toBe(8);
    expect(lookbackDays).toBe(10);
    expect(lookbackDays).toBeGreaterThanOrEqual(currentScale.metadata.windowsPerCycle);
    expect(effectiveNewsScanLookbackDays(8, 14)).toBe(14);
  });

  it("sorts per-entity URLs deterministically before choosing required seeds", () => {
    const canonical = [
      { url: "https://example.com/history/2020", expandSite: false },
      { url: "https://example.com", expandSite: true },
      { url: "https://example.com/news", expandSite: true },
    ];
    const firstInput = [canonical[2], canonical[0], canonical[1]];
    const secondInput = [canonical[1], canonical[2], canonical[0]];
    const firstPlan = sortNewsScanEntityUrls(firstInput);
    const secondPlan = sortNewsScanEntityUrls(secondInput);

    expect(secondPlan).toEqual(firstPlan);
    expect(firstPlan.map((entry) => entry.url)).toEqual([
      "https://example.com",
      "https://example.com/news",
      "https://example.com/history/2020",
    ]);
    expect(firstPlan[0]).toEqual({ url: "https://example.com", expandSite: true });
  });

  it("chooses the same bounded alias/context subset from shuffled relation rows", () => {
    const terms = Array.from({ length: 20 }, (_, index) => ({
      key: `term-${String(index).padStart(2, "0")}`,
      value: `Term ${index}`,
    }));
    const shuffled = [...terms.slice(10), ...terms.slice(0, 10)].reverse();

    expect(selectCanonicalNewsScanTerms(shuffled, 12)).toEqual(
      selectCanonicalNewsScanTerms(terms, 12),
    );
    expect(selectCanonicalNewsScanTerms(shuffled, 12)).toHaveLength(12);
  });

  it("publishes only a tightly validated non-sensitive window summary", () => {
    expect(parsePublicNewsScanWindow({
      selectionDateUtc: "2026-07-22",
      fullUniverseCount: 1_500,
      eligibleCount: 1_500,
      selectedCount: 200,
      maxTargets: 200,
      offset: 1_000,
      windowIndex: 5,
      windowsPerCycle: 8,
      cycleNumber: 688,
      privateIds: ["must-not-leak"],
    })).toEqual({
      selectionDateUtc: "2026-07-22",
      fullUniverseCount: 1_500,
      eligibleCount: 1_500,
      selectedCount: 200,
      offset: 1_000,
      windowIndex: 5,
      windowsPerCycle: 8,
    });
    expect(parsePublicNewsScanWindow({
      selectionDateUtc: "2026-07-22",
      fullUniverseCount: 10,
      eligibleCount: 10,
      selectedCount: 50,
      offset: 0,
      windowIndex: 0,
      windowsPerCycle: 1,
    })).toBeUndefined();
  });
});
