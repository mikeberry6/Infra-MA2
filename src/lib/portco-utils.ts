// ─── PortCo Utility Functions ───────────────────────────────

export function getUniqueFirms(companies: { investmentFirm: string }[]): string[] {
  return Array.from(new Set(companies.map((c) => c.investmentFirm))).sort();
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
