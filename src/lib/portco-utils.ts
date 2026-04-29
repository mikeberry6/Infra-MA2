// ─── PortCo Utility Functions ───────────────────────────────

interface OwnerLike {
  firm: string;
}

interface CompanyOwnerLike {
  investmentFirm: string;
  owners: OwnerLike[];
}

/**
 * Returns the unique set of firm names attached to a company across every
 * `OwnershipPeriod` — primary + co-owners + former. Used by the firm filter
 * and the "Top Investment Firms" ranking so a firm surfaces wherever it
 * holds equity, even as a minority co-investor.
 *
 * The scalar `investmentFirm` is included defensively in case `owners` is
 * empty or missing the primary (the View layer mostly keeps them in sync
 * but a defensive union is cheap insurance).
 */
export function getAllOwnerFirms(company: CompanyOwnerLike): string[] {
  const firms = new Set<string>();
  if (company.investmentFirm) firms.add(company.investmentFirm);
  for (const o of company.owners) {
    if (o.firm) firms.add(o.firm);
  }
  return Array.from(firms);
}

/**
 * Builds the firm picklist for the portfolio filter. Now flattens across
 * every owner on every company so co-owners appear in the dropdown — not
 * just primary investors.
 */
export function getUniqueFirms(companies: CompanyOwnerLike[]): string[] {
  const firms = new Set<string>();
  for (const c of companies) {
    for (const f of getAllOwnerFirms(c)) firms.add(f);
  }
  return Array.from(firms).sort();
}

export function getUniqueCountries(companies: { country: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.country))).sort();
}

export function getUniqueSubsectors(companies: { subsector: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.subsector).filter(Boolean))).sort();
}

export function getUniqueVehicles(companies: { ownershipVehicle: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.ownershipVehicle))).sort();
}
