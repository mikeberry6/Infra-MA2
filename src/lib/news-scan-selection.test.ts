import { describe, expect, it } from "vitest";
import {
  selectNewsScanEntities,
  stableNewsEntityShard,
  type ShardableNewsEntity,
} from "./news-scan-selection";

const entities: ShardableNewsEntity[] = [
  { id: "company-a", type: "COMPANY" },
  { id: "company-b", type: "COMPANY" },
  { id: "manager-a", type: "FUND_MANAGER" },
  { id: "manager-b", type: "FUND_MANAGER" },
  { id: "fund-a", type: "FUND" },
  { id: "fund-b", type: "FUND" },
];

describe("news scan entity selection", () => {
  it("assigns every entity to exactly one stable shard", () => {
    const first = entities.map((entity) => stableNewsEntityShard(entity, 2));
    const second = entities.map((entity) => stableNewsEntityShard(entity, 2));

    expect(second).toEqual(first);
    expect(first.every((shard) => shard === 0 || shard === 1)).toBe(true);

    const shardZero = selectNewsScanEntities(entities, { shardCount: 2, shardIndex: 0 });
    const shardOne = selectNewsScanEntities(entities, { shardCount: 2, shardIndex: 1 });
    const selectedKeys = [...shardZero.entities, ...shardOne.entities]
      .map((entity) => `${entity.type}:${entity.id}`)
      .sort();

    expect(selectedKeys).toEqual(
      entities.map((entity) => `${entity.type}:${entity.id}`).sort(),
    );
    expect(new Set(selectedKeys).size).toBe(entities.length);
    expect(
      selectNewsScanEntities([...entities].reverse(), { shardCount: 2, shardIndex: 0 }).entities,
    ).toEqual(shardZero.entities);
  });

  it("reports when a nightly cap would silently omit eligible records", () => {
    const eligible = entities.filter(
      (entity) => stableNewsEntityShard(entity, 2) === 0,
    );
    const selection = selectNewsScanEntities(entities, {
      shardCount: 2,
      shardIndex: 0,
      maxTargets: 1,
    });

    expect(selection.eligibleEntities).toBe(eligible.length);
    expect(selection.selectedEntities).toBe(1);
    expect(selection.cappedByMaxTargets).toBe(eligible.length > 1);
  });

  it("rejects invalid shard configuration", () => {
    expect(() => selectNewsScanEntities(entities, { shardCount: 0, shardIndex: 0 })).toThrow(
      "shardCount",
    );
    expect(() => selectNewsScanEntities(entities, { shardCount: 2, shardIndex: 2 })).toThrow(
      "shardIndex",
    );
  });
});
