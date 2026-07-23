import type { DealView } from "@/modules/shared/types";

export const DEAL_PAGE_SIZE = 25;

export const DEAL_SORT_FIELDS = [
  "date",
  "target",
  "buyer",
  "sector",
  "region",
  "category",
] as const;

export type DealSortField = (typeof DEAL_SORT_FIELDS)[number];
export type DealSortDirection = "asc" | "desc";

export const DEFAULT_DEAL_SORT: DealSortField = "date";
export const DEFAULT_DEAL_DIRECTION: DealSortDirection = "desc";

const textCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export function parseDealSortField(value: string | null | undefined): DealSortField {
  return DEAL_SORT_FIELDS.includes(value as DealSortField)
    ? (value as DealSortField)
    : DEFAULT_DEAL_SORT;
}

export function parseDealSortDirection(value: string | null | undefined): DealSortDirection {
  return value === "asc" || value === "desc" ? value : DEFAULT_DEAL_DIRECTION;
}

export function defaultDirectionForDealSort(field: DealSortField): DealSortDirection {
  return field === "date" ? "desc" : "asc";
}

export function parseDealPage(value: string | null | undefined): number {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : 1;
}

export function clampDealPage(page: number, totalItems: number): number {
  const totalPages = Math.max(1, Math.ceil(totalItems / DEAL_PAGE_SIZE));
  return Math.min(Math.max(1, page), totalPages);
}

function compareDealField(a: DealView, b: DealView, field: DealSortField): number {
  switch (field) {
    case "date":
      return Date.parse(a.date) - Date.parse(b.date);
    case "target":
      return textCollator.compare(a.target, b.target);
    case "buyer":
      return textCollator.compare(a.buyer, b.buyer);
    case "sector":
      return textCollator.compare(a.sector, b.sector);
    case "region":
      return textCollator.compare(a.region, b.region);
    case "category":
      return textCollator.compare(a.category.join(" / "), b.category.join(" / "));
  }
}

export function sortDeals(
  deals: readonly DealView[],
  field: DealSortField,
  direction: DealSortDirection,
): DealView[] {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...deals].sort((a, b) => {
    const primary = compareDealField(a, b, field);
    if (primary !== 0) return primary * multiplier;

    const targetTieBreak = textCollator.compare(a.target, b.target);
    if (targetTieBreak !== 0) return targetTieBreak;
    return textCollator.compare(a.legacyId, b.legacyId);
  });
}
