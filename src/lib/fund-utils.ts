// ─── Fund Utility Functions ─────────────────────────────────

export function matchesSizeRange(sizeUsdMm: number | null, range: string): boolean {
  if (sizeUsdMm === null) return true; // Unknown size always passes
  switch (range) {
    case "< $500M": return sizeUsdMm < 500;
    case "$500M – $1B": return sizeUsdMm >= 500 && sizeUsdMm < 1000;
    case "$1B – $5B": return sizeUsdMm >= 1000 && sizeUsdMm < 5000;
    case "$5B – $10B": return sizeUsdMm >= 5000 && sizeUsdMm < 10000;
    case "$10B+": return sizeUsdMm >= 10000;
    default: return true;
  }
}

export function groupFundsByManager<T extends { managerName: string }>(fundList: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const fund of fundList) {
    const existing = map.get(fund.managerName);
    if (existing) {
      existing.push(fund);
    } else {
      map.set(fund.managerName, [fund]);
    }
  }
  return map;
}

/**
 * Slices a grouped fund list by result count while preserving manager
 * headings. A page can begin or end inside a manager group, but it never
 * contains more than `pageSize` fund records.
 */
export function paginateManagerGroups<T>(
  groups: [string, T[]][],
  page: number,
  pageSize: number,
): [string, T[]][] {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safePage = Math.max(1, Math.floor(page));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  let cursor = 0;
  const visible: [string, T[]][] = [];

  for (const [manager, funds] of groups) {
    const groupStart = cursor;
    const groupEnd = cursor + funds.length;
    cursor = groupEnd;
    if (groupEnd <= start || groupStart >= end) continue;

    const sliceStart = Math.max(0, start - groupStart);
    const sliceEnd = Math.min(funds.length, end - groupStart);
    const pageFunds = funds.slice(sliceStart, sliceEnd);
    if (pageFunds.length > 0) visible.push([manager, pageFunds]);
  }

  return visible;
}

export function getFundStats(fundList: { managerName: string; sizeUsdMm: number | null }[]) {
  const managerSet = new Set(fundList.map((f) => f.managerName));
  const totalAum = fundList.reduce((sum, f) => sum + (f.sizeUsdMm ?? 0), 0);
  return {
    managers: managerSet.size,
    funds: fundList.length,
    totalAumBn: Math.round(totalAum / 100) / 10, // in billions, one decimal
  };
}
