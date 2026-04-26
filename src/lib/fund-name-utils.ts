// Shared fund-name normalization for deal-database aggregations.
//
// Two related but distinct concerns live elsewhere — keep them separate:
//   * FUND_NAME_ALIASES (this file): canonicalizes variant names so the same
//     fund counts as one row in the "Top Fund Activity" ranking.
//   * BUYER_SHORT_NAMES (DealDatabase.tsx): purely cosmetic shortening for
//     compact display of the canonical name in tables/drawers.
//
// When adding an alias, also consider whether the canonical target needs a
// short-name entry so the deal table shows a tight label.

/** Maps a variant fund/buyer name to its canonical name for ranking dedup. */
export const FUND_NAME_ALIASES: Record<string, string> = {
  "CVC (CVC DIF)": "CVC DIF",
  "Infracapital (M&G)": "Infracapital",
  "GIP (BlackRock)": "GIP",
  "Macquarie Infrastructure Partners": "Macquarie Asset Management",
  "Northleaf Capital": "Northleaf",
  "Blackstone Energy Transition Partners": "Blackstone",
  InfraBridge: "DigitalBridge",
  "Blackstone Infrastructure": "Blackstone",
  "Brookfield Infrastructure": "Brookfield Asset Management",
  "Brookfield Renewable": "Brookfield Asset Management",
  IFM: "IFM Investors",
  "Greencoat Renewables": "Schroders Greencoat",
  "Goldman Sachs Alternatives": "Goldman Sachs Asset Management",
  Apollo: "Apollo Global Management",
  "Vauban Infrastructure": "Vauban Infrastructure Partners",
  "Tallvine Partners": "Tallvine",
  "TPG Rise Climate": "TPG",
  "APG Infrastructure": "APG Asset Management",
  "Quinbrook Infrastructure Partners": "Quinbrook Infrastructure",
  "Basalt Infrastructure": "Basalt Infrastructure Partners",
  EIG: "EIG Global Energy Partners",
  InfraVia: "InfraVia Capital Partners",
  "Brookfield Infrastructure Structured Solutions": "Brookfield Asset Management",
  "Standard Solar / Brookfield": "Brookfield Asset Management",
  "Mainstay Maritime": "Oaktree Capital",
  "Brookfield / La Caisse": "Brookfield Asset Management",
};

/** Normalize a fund name to its canonical form using known aliases. */
export function normalizeFundName(name: string): string {
  if (FUND_NAME_ALIASES[name]) return FUND_NAME_ALIASES[name];
  // Strip "(via ...)" suffix used for subsidiary/portfolio company context
  const stripped = name.replace(/\s*\(via\s+[^)]+\)\s*$/, "").trim();
  return FUND_NAME_ALIASES[stripped] ?? stripped;
}

/** Split compound entity strings like "A & B" or "X / Y / Z" into individual names. */
export function splitEntities(field: string): string[] {
  return field
    .split(/\s+&\s+|\s+\/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
