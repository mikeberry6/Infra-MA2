import type { DealListItem } from "@/modules/shared/types";

export const DEAL_SORT_FIELDS = ["date", "target", "buyer", "sector", "region", "category"] as const;

export type DealSortField = (typeof DEAL_SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";

export function parseDealSortField(value: string): DealSortField {
  return DEAL_SORT_FIELDS.includes(value as DealSortField)
    ? (value as DealSortField)
    : "date";
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

function compareByField(a: DealListItem, b: DealListItem, field: DealSortField): number {
  switch (field) {
    case "date": {
      const aTime = Date.parse(a.date);
      const bTime = Date.parse(b.date);
      if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
      if (!Number.isFinite(aTime)) return 1;
      if (!Number.isFinite(bTime)) return -1;
      return aTime - bTime;
    }
    case "target":
      return compareText(a.target, b.target);
    case "buyer":
      return compareText(a.buyer, b.buyer);
    case "sector":
      return compareText(a.sector, b.sector);
    case "region":
      return compareText(a.region, b.region);
    case "category":
      return compareText(a.category.join(", "), b.category.join(", "));
  }
}

export function sortDeals(
  deals: DealListItem[],
  field: DealSortField,
  direction: SortDirection,
): DealListItem[] {
  const multiplier = direction === "desc" ? -1 : 1;
  return [...deals].sort((a, b) => {
    const comparison = compareByField(a, b, field);
    if (comparison !== 0) return multiplier * comparison;

    // Keep pagination deterministic when the selected values are equal.
    const targetComparison = compareText(a.target, b.target);
    if (targetComparison !== 0) return targetComparison;
    return compareText(a.legacyId, b.legacyId);
  });
}
