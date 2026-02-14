import { useMemo } from "react";
import type { Deal, DealSector, DealRegion, DealCategory, DealStatus } from "@/data/deals";
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
  statusCounts: Record<string, number>;

  // Top items
  topSector: { name: DealSector; count: number; percentage: number } | null;
  topRegion: { name: DealRegion; count: number; percentage: number } | null;
  topCategory: { name: string; count: number } | null;

  // Time analysis
  dateRange: { earliest: Date; latest: Date } | null;
  dealsByWeek: { weekLabel: string; count: number; startDate: Date }[];

  // Unique entities
  uniqueBuyers: string[];
  uniqueSellers: string[];
  mostActiveBuyer: { name: string; count: number } | null;

  // Financial aggregates
  totalEnterpriseValueUSD: number;
  dealsWithValue: number;
  avgDealSizeUSD: number;
  largestDealUSD: { value: number; title: string } | null;

  // Filter state
  hasFilters: boolean;
}

/** Parse enterprise value strings to approximate USD millions */
function parseValueToUSDMillions(ev: string | null): number | null {
  if (!ev) return null;

  // Normalize
  const s = ev.toLowerCase().replace(/,/g, "");

  // Try to find a USD amount first (prefer parenthetical USD conversions)
  const usdMatch = s.match(/\~?\$?([\d.]+)\s*(billion|b\b|million|m\b|trillion|t\b)/i)
    || s.match(/us\$?([\d.]+)\s*(billion|b\b|million|m\b)/i);

  if (usdMatch) {
    const num = parseFloat(usdMatch[1]);
    const unit = usdMatch[2].toLowerCase();
    if (unit.startsWith("b")) return num * 1000;
    if (unit.startsWith("t")) return num * 1000000;
    return num; // millions
  }

  // EUR → approximate USD (1.08)
  const eurMatch = s.match(/€([\d.]+)\s*(billion|b\b|million|m\b)/i);
  if (eurMatch) {
    const num = parseFloat(eurMatch[1]);
    const unit = eurMatch[2].toLowerCase();
    const usd = unit.startsWith("b") ? num * 1000 : num;
    return usd * 1.08;
  }

  // GBP → approximate USD (1.27)
  const gbpMatch = s.match(/£([\d.]+)\s*(billion|b\b|million|m\b)/i);
  if (gbpMatch) {
    const num = parseFloat(gbpMatch[1]);
    const unit = gbpMatch[2].toLowerCase();
    const usd = unit.startsWith("b") ? num * 1000 : num;
    return usd * 1.27;
  }

  // CAD → approximate USD (0.74)
  const cadMatch = s.match(/c\$([\d.]+)\s*(billion|b\b|million|m\b)/i);
  if (cadMatch) {
    const num = parseFloat(cadMatch[1]);
    const unit = cadMatch[2].toLowerCase();
    const usd = unit.startsWith("b") ? num * 1000 : num;
    return usd * 0.74;
  }

  // INR crore → approximate USD (1 crore ≈ 0.12M USD)
  const inrMatch = s.match(/₹([\d.]+)\s*crore/i);
  if (inrMatch) {
    return parseFloat(inrMatch[1]) * 0.12;
  }

  return null;
}

function getWeekOfMonth(date: Date): number {
  const dayOfMonth = date.getUTCDate();
  return Math.ceil(dayOfMonth / 7);
}

export function useFilteredInsights(filteredDeals: Deal[]): FilteredInsights {
  return useMemo(() => {
    const totalCount = allDeals.length;
    const filteredCount = filteredDeals.length;
    const percentageOfTotal = totalCount > 0
      ? Math.round((filteredCount / totalCount) * 100)
      : 0;

    // Distributions
    const sectorCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const buyerCounts: Record<string, number> = {};

    const buyers = new Set<string>();
    const sellers = new Set<string>();
    let earliest: Date | null = null;
    let latest: Date | null = null;

    // Financial aggregates
    let totalEV = 0;
    let dealsWithValue = 0;
    let largestDeal: { value: number; title: string } | null = null;

    // Time series - weekly buckets
    const weekBuckets: Record<string, { count: number; startDate: Date }> = {};

    for (const deal of filteredDeals) {
      // Sector
      sectorCounts[deal.sector] = (sectorCounts[deal.sector] || 0) + 1;

      // Region
      regionCounts[deal.region] = (regionCounts[deal.region] || 0) + 1;

      // Category (base only)
      for (const cat of deal.category) {
        const baseCategory = cat.split(" (")[0];
        categoryCounts[baseCategory] = (categoryCounts[baseCategory] || 0) + 1;
      }

      // Status
      statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;

      // Buyers/Sellers
      buyers.add(deal.buyer);
      sellers.add(deal.seller);
      buyerCounts[deal.buyer] = (buyerCounts[deal.buyer] || 0) + 1;

      // Date range & time series
      const dealDate = new Date(deal.date);
      if (!earliest || dealDate < earliest) earliest = dealDate;
      if (!latest || dealDate > latest) latest = dealDate;

      const weekNum = getWeekOfMonth(dealDate);
      const monthName = dealDate.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      const weekKey = `W${weekNum} ${monthName}`;
      if (!weekBuckets[weekKey]) {
        const startOfWeek = new Date(Date.UTC(
          dealDate.getUTCFullYear(),
          dealDate.getUTCMonth(),
          (weekNum - 1) * 7 + 1,
        ));
        weekBuckets[weekKey] = { count: 0, startDate: startOfWeek };
      }
      weekBuckets[weekKey].count += 1;

      // Enterprise value
      const parsedEV = parseValueToUSDMillions(deal.enterpriseValue);
      if (parsedEV !== null && parsedEV > 0) {
        totalEV += parsedEV;
        dealsWithValue += 1;
        if (!largestDeal || parsedEV > largestDeal.value) {
          largestDeal = { value: parsedEV, title: deal.title };
        }
      }
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

    // Build dealsByWeek sorted by date
    const dealsByWeek = Object.entries(weekBuckets)
      .map(([weekLabel, data]) => ({
        weekLabel,
        count: data.count,
        startDate: data.startDate,
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      filteredCount,
      totalCount,
      percentageOfTotal,
      sectorCounts,
      regionCounts,
      categoryCounts,
      statusCounts,
      topSector,
      topRegion,
      topCategory,
      dateRange: earliest && latest ? { earliest, latest } : null,
      dealsByWeek,
      uniqueBuyers: Array.from(buyers),
      uniqueSellers: Array.from(sellers),
      mostActiveBuyer,
      totalEnterpriseValueUSD: totalEV,
      dealsWithValue,
      avgDealSizeUSD: dealsWithValue > 0 ? totalEV / dealsWithValue : 0,
      largestDealUSD: largestDeal,
      hasFilters: filteredCount !== totalCount,
    };
  }, [filteredDeals]);
}
