import type { DealListView } from "@/modules/shared/types";

export const DEAL_SCREEN_KEYS = [
  "q", "sector", "region", "category", "briefing", "from", "to", "status",
  "country", "subsector", "sponsor", "role", "direction",
] as const;

export type DealScreenKey = (typeof DEAL_SCREEN_KEYS)[number];

export function dealScreenParams(params: Pick<URLSearchParams, "get">): URLSearchParams {
  const screen = new URLSearchParams();
  for (const key of DEAL_SCREEN_KEYS) {
    const value = params.get(key)?.trim();
    if (value && (key !== "direction" || value === "asc")) screen.set(key, value);
  }
  return screen;
}

function toDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

export function filterDealScreen<T extends DealListView>(deals: T[], params: URLSearchParams): T[] {
  const search = params.get("q")?.trim().toLowerCase();
  const sectors = new Set(params.get("sector")?.split(",").filter(Boolean));
  const regions = new Set(params.get("region")?.split(",").filter(Boolean));
  const categories = new Set(params.get("category")?.split(",").filter(Boolean));
  const briefing = params.get("briefing");
  const from = toDate(params.get("from"));
  const to = toDate(params.get("to"));
  const status = params.get("status");
  const country = params.get("country");
  const subsector = params.get("subsector");
  const sponsor = params.get("sponsor")?.trim().toLowerCase();
  const role = params.get("role");
  return deals.filter((deal) => {
    if (briefing && !deal.briefings?.some((issue) => issue.edition === briefing)) return false;
    if (sectors.size && !sectors.has(deal.sector)) return false;
    if (regions.size && !regions.has(deal.region)) return false;
    if (categories.size && !deal.category.some((category) => categories.has(category))) return false;
    if (status && status !== deal.status) return false;
    if (country && country !== deal.country) return false;
    if (subsector && subsector !== deal.subsector) return false;
    const date = deal.date.slice(0, 10);
    if ((from && date < from) || (to && date > to)) return false;
    if (sponsor || role === "buyer" || role === "seller") {
      const names = [
        ...(role !== "seller" ? [deal.buyer] : []),
        ...(role !== "buyer" ? [deal.seller] : []),
        ...(deal.participants ?? []).filter((participant) => (
          (role !== "seller" && participant.role === "BUYER") ||
          (role !== "buyer" && participant.role === "SELLER")
        )).map((participant) => participant.name),
      ];
      if (!names.some((name) => (
        name && !["N/A", "—"].includes(name) && (!sponsor || name.toLowerCase().includes(sponsor))
      ))) return false;
    }
    if (!search) return true;
    return [
      deal.title, deal.target, deal.buyer, deal.seller, deal.legacyId,
      ...(deal.legacyIdAliases ?? []), ...deal.category, deal.subsector,
    ].some((value) => value.toLowerCase().includes(search));
  });
}

export function sortDealScreen<T extends DealListView>(deals: T[], direction: "asc" | "desc"): T[] {
  return [...deals].sort((a, b) => (
    (direction === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
    || a.legacyId.localeCompare(b.legacyId)
  ));
}
