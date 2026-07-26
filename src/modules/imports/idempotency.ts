type PrimaryCitation = {
  source: {
    url: string;
    label: string;
  };
};

export function sameOrderedValues<T>(
  left: readonly T[],
  right: readonly T[],
): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function sameUnorderedStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return sameOrderedValues(
    [...left].sort((a, b) => a.localeCompare(b)),
    [...right].sort((a, b) => a.localeCompare(b)),
  );
}

export function sameDateValue(
  left: Date | null,
  right: Date | null,
): boolean {
  return left?.getTime() === right?.getTime();
}

/**
 * Import routes own the record's primary citation. A replay is unchanged only
 * when the current primary-source state is exactly what the import would write.
 * An omitted label intentionally leaves an existing shared Source label alone.
 */
export function samePrimarySource(
  citations: readonly PrimaryCitation[],
  sourceUrl?: string,
  sourceName?: string,
): boolean {
  if (!sourceUrl) return citations.length === 0;
  if (citations.length !== 1 || citations[0].source.url !== sourceUrl) return false;
  return !sourceName || citations[0].source.label === sourceName;
}
