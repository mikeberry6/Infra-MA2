// ─── Deal Utility Functions ─────────────────────────────────

interface DealLike {
  sector: string;
  region: string;
  category: string[];
  date: string;
}

export function getDealStats(deals: DealLike[]) {
  const sectorCounts = deals.reduce(
    (acc, d) => {
      acc[d.sector] = (acc[d.sector] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topSector = Object.entries(sectorCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const categoryCounts = deals.reduce(
    (acc, d) => {
      for (const cat of d.category) {
        const base = cat.split(" (")[0];
        acc[base] = (acc[base] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return {
    totalCount: deals.length,
    sectorCounts,
    topSector: topSector[0],
    topSectorCount: topSector[1],
    topCategory: topCategory[0],
    topCategoryCount: topCategory[1],
  };
}

export function getRecentDeals<T extends DealLike>(deals: T[]): T[] {
  return [...deals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getRegionStats(deals: DealLike[]) {
  const regionCounts = deals.reduce(
    (acc, d) => {
      acc[d.region] = (acc[d.region] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sorted = Object.entries(regionCounts).sort(([, a], [, b]) => b - a);

  return {
    regionCounts,
    topRegion: sorted[0][0],
    topRegionCount: sorted[0][1],
    topRegionShare: Math.round((sorted[0][1] / deals.length) * 100),
  };
}

export function getMarketNarrative(deals: DealLike[]): {
  headline: string;
  subtext: string;
  sentiment: "concentrated" | "leading" | "balanced";
} {
  const stats = getDealStats(deals);
  const topSectorShare = (stats.topSectorCount / stats.totalCount) * 100;

  if (topSectorShare > 40) {
    return {
      headline: "is dominating",
      subtext: `commanding ${Math.round(topSectorShare)}% of all activity`,
      sentiment: "concentrated",
    };
  } else if (topSectorShare > 25) {
    return {
      headline: "is leading the market",
      subtext: `with ${stats.topSectorCount} deals this month`,
      sentiment: "leading",
    };
  } else {
    return {
      headline: "leads a diversified market",
      subtext: `across ${Object.keys(stats.sectorCounts).length} active sectors`,
      sentiment: "balanced",
    };
  }
}

export function getSectorDistribution(deals: DealLike[]): Array<{
  sector: string;
  count: number;
  percentage: number;
}> {
  const stats = getDealStats(deals);
  return Object.entries(stats.sectorCounts)
    .map(([sector, count]) => ({
      sector,
      count,
      percentage: (count / stats.totalCount) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}
