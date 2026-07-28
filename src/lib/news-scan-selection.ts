export type ShardableNewsEntity = {
  id: string;
  type: string;
};

export type NewsScanSelection<T> = {
  entities: T[];
  totalEntities: number;
  eligibleEntities: number;
  selectedEntities: number;
  shardCount: number;
  shardIndex: number;
  cappedByMaxTargets: boolean;
};

export function stableNewsEntityShard(entity: ShardableNewsEntity, shardCount: number): number {
  assertShardConfiguration(shardCount, 0);

  const key = `${entity.type}:${entity.id}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % shardCount;
}

export function selectNewsScanEntities<T extends ShardableNewsEntity>(
  entities: T[],
  options: {
    shardCount: number;
    shardIndex: number;
    maxTargets?: number;
  },
): NewsScanSelection<T> {
  assertShardConfiguration(options.shardCount, options.shardIndex);

  if (
    options.maxTargets !== undefined
    && (!Number.isInteger(options.maxTargets) || options.maxTargets < 1)
  ) {
    throw new Error("maxTargets must be a positive integer when provided.");
  }

  const eligible = entities.filter(
    (entity) => stableNewsEntityShard(entity, options.shardCount) === options.shardIndex,
  );
  const selected = options.maxTargets ? eligible.slice(0, options.maxTargets) : eligible;

  return {
    entities: selected,
    totalEntities: entities.length,
    eligibleEntities: eligible.length,
    selectedEntities: selected.length,
    shardCount: options.shardCount,
    shardIndex: options.shardIndex,
    cappedByMaxTargets: selected.length < eligible.length,
  };
}

function assertShardConfiguration(shardCount: number, shardIndex: number): void {
  if (!Number.isInteger(shardCount) || shardCount < 1) {
    throw new Error("shardCount must be a positive integer.");
  }
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= shardCount) {
    throw new Error("shardIndex must be an integer between 0 and shardCount - 1.");
  }
}
