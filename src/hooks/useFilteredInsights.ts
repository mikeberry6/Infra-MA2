import { useMemo } from "react";
import type { Deal, DealSector, DealRegion, DealCategory } from "@/data/deals";
import { deals as allDeals } from "@/data/deals";

export interface FilteredInsights {
  // Core counts
  filteredCount: number;
  totalCount: number;
  percentageOfTotal: number;

  // Distribution
  sectorCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;

  // Top items
  topSector: { name: DealSector; count: number; percentage: number } | null;
  topRegion: { name: DealRegion; count: number; percentage: number } | null;
  topCategory: { name: string; count: number } | null;

  // Time analysis
  dateRange: { earliest: Date; latest: Date } | null;

  // Unique entities
  uniqueBuyers: string[];
  uniqueSellers: string[];
  mostActiveBuyer: { name: string; count: number } | null;

  // Filter state
  hasFilters: boolean;
}

export function useFilteredInsights(filteredDeals: Deal[]): FilteredInsights {
  return useMemo(() => {
    const totalCount = allDeals.length;
    const filteredCount = filteredDeals.length;
    const percentageOfTotal = totalCount > 0
      ? Math.round((filteredCount / totalCount) * 100)
      : 0;

    // Sector distribution
    const sectorCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const buyerCounts: Record<string, number> = {};

    const buyers = new Set<string>();
    const sellers = new Set<string>();
    let earliest: Date | null = null;
    let latest: Date | null = null;

    for (const deal of filteredDeals) {
      // Sector
      sectorCounts[deal.sector] = (sectorCounts[deal.sector] || 0) + 1;

      // Region
      regionCounts[deal.region] = (regionCounts[deal.region] || 0) + 1;

      // Category (base only)
      const baseCategory = deal.category.split(" (")[0];
      categoryCounts[baseCategory] = (categoryCounts[baseCategory] || 0) + 1;

      // Buyers/Sellers
      buyers.add(deal.buyer);
      sellers.add(deal.seller);
      buyerCounts[deal.buyer] = (buyerCounts[deal.buyer] || 0) + 1;

      // Date range
      const dealDate = new Date(deal.date);
      if (!earliest || dealDate < earliest) earliest = dealDate;
      if (!latest || dealDate > latest) latest = dealDate;
    }

    // Top sector
    const topSectorEntry = Object.entries(sectorCounts)
      .sort(([, a], [, b]) => b - a)[0];
    const topSector = topSectorEntry
      ? {
          name: topSectorEntry[0] as DealSector,
          count: topSectorEntry[1],
          percentage: Math.round((topSectorEntry[1] / filteredCount) * 100),
        }
      : null;

    // Top region
    const topRegionEntry = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)[0];
    const topRegion = topRegionEntry
      ? {
          name: topRegionEntry[0] as DealRegion,
          count: topRegionEntry[1],
          percentage: Math.round((topRegionEntry[1] / filteredCount) * 100),
        }
      : null;

    // Top category
    const topCategoryEntry = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0];
    const topCategory = topCategoryEntry
      ? { name: topCategoryEntry[0], count: topCategoryEntry[1] }
      : null;

    // Most active buyer
    const topBuyerEntry = Object.entries(buyerCounts)
      .sort(([, a], [, b]) => b - a)[0];
    const mostActiveBuyer = topBuyerEntry && topBuyerEntry[1] > 1
      ? { name: topBuyerEntry[0], count: topBuyerEntry[1] }
      : null;

    return {
      filteredCount,
      totalCount,
      percentageOfTotal,
      sectorCounts,
      regionCounts,
      categoryCounts,
      topSector,
      topRegion,
      topCategory,
      dateRange: earliest && latest ? { earliest, latest } : null,
      uniqueBuyers: Array.from(buyers),
      uniqueSellers: Array.from(sellers),
      mostActiveBuyer,
      hasFilters: filteredCount !== totalCount,
    };
  }, [filteredDeals]);
}
