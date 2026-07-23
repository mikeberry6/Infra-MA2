function comparable(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(comparable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, comparable(item)]),
    );
  }
  return value;
}

export function changedFieldSummary(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): string[] {
  return Object.keys(after)
    .filter((key) => JSON.stringify(comparable(before[key])) !== JSON.stringify(comparable(after[key])))
    .sort();
}
