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

export function getFundStats(fundList: { managerName: string; sizeUsdMm: number | null }[]) {
  const managerSet = new Set(fundList.map((f) => f.managerName));
  const totalAum = fundList.reduce((sum, f) => sum + (f.sizeUsdMm ?? 0), 0);
  return {
    managers: managerSet.size,
    funds: fundList.length,
    totalAumBn: Math.round(totalAum / 100) / 10, // in billions, one decimal
  };
}
