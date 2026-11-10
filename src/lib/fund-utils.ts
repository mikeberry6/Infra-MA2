// ─── Fund Utility Functions ─────────────────────────────────

export const UNDISCLOSED_FUND_SIZE = "Undisclosed size";

export function matchesSizeRange(sizeUsdMm: number | null, range: string, nativeAmount?: string): boolean {
  if (range === UNDISCLOSED_FUND_SIZE) return sizeUsdMm === null && !nativeAmount;
  if (sizeUsdMm === null) return false;
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

export function getFundStats(fundList: {
  managerName: string;
  sizeUsdMm: number | null;
  sizeNativeAmount?: string;
}[]) {
  return {
    managers: new Set(fundList.map((fund) => fund.managerName)).size,
    funds: fundList.length,
    disclosedSize: fundList.filter((fund) => fund.sizeUsdMm !== null || !!fund.sizeNativeAmount).length,
  };
}
