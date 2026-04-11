// Entity Resolution Map
// Maps variant organization names to their canonical form.
// Used during seeding to deduplicate organizations across deals, funds, and portcos.

// Canonical name map: variant -> canonical
// The canonical name should match the most commonly used form across the datasets.
export const ORG_CANONICAL: Record<string, string> = {
  // From FUND_NAME_ALIASES in DynamicInsightsHero.tsx
  "CVC (CVC DIF)": "CVC DIF",
  "Infracapital (M&G)": "Infracapital",
  "GIP (BlackRock)": "GIP",
  "Macquarie Infrastructure Partners": "Macquarie Asset Management",
  "Northleaf Capital": "Northleaf",
  "Blackstone Energy Transition Partners": "Blackstone",
  "InfraBridge": "DigitalBridge",
  "Blackstone Infrastructure": "Blackstone",
  "Brookfield Infrastructure": "Brookfield Asset Management",
  "Brookfield Renewable": "Brookfield Asset Management",
  "IFM": "IFM Investors",
  "Greencoat Renewables": "Schroders Greencoat",
  "Goldman Sachs Alternatives": "Goldman Sachs Asset Management",
  "Apollo": "Apollo Global Management",
  "Vauban Infrastructure": "Vauban Infrastructure Partners",
  "Tallvine Partners": "Tallvine",
  "TPG Rise Climate": "TPG",
  "APG Infrastructure": "APG Asset Management",
  "Quinbrook Infrastructure Partners": "Quinbrook Infrastructure",
  "Basalt Infrastructure": "Basalt Infrastructure Partners",
  "EIG": "EIG Global Energy Partners",
  "InfraVia": "InfraVia Capital Partners",
  "Brookfield Infrastructure Structured Solutions": "Brookfield Asset Management",
  "Standard Solar / Brookfield": "Brookfield Asset Management",
  "Mainstay Maritime": "Oaktree Capital",
  "Brookfield / La Caisse": "Brookfield Asset Management",

  // Cross-dataset resolution: portco.investmentFirm -> fund.managerName
  "3i Infrastructure": "3i Group",
  "ADIA Infrastructure": "Abu Dhabi Investment Authority (ADIA)",
  "CC&L": "Connor, Clark & Lunn",
  "CDPQ": "La Caisse de dépôt (CDPQ)",
};

// Non-infrastructure-fund entities (from NON_INFRA_FUND_BUYERS in DynamicInsightsHero.tsx)
// These are tagged as CORPORATE org type during seeding, excluded from fund rankings.
export const NON_INFRA_FUND_ENTITIES = new Set([
  "Undisclosed Buyer",
  "Undisclosed Seller",
  "Public Market",
  "Bain Capital",
  "Mitsui O.S.K. Lines",
  "Talen Energy",
  "Drax Group",
  "Pilot Fiber",
  "Siris",
  "Polus Capital Management",
  "Corsair Capital",
  "Equinix",
  "Exus Renewables",
  "IHS Towers",
  "TPI Composites",
  "Claro",
  "Taylor Farms",
  "Abertis",
  "VINCI Highways",
  "Technique Solaire",
  "Algoma Central Corporation",
  "Dubai Aerospace Enterprise",
  "Power2X",
  "Nobian",
  "Jupiter Energy Investor",
]);

// Resolve an organization name to its canonical form
export function resolveOrgName(name: string): string {
  // Direct match
  if (ORG_CANONICAL[name]) return ORG_CANONICAL[name];

  // Strip "(via ...)" suffixes
  const stripped = name.replace(/\s*\(via\s+[^)]+\)\s*$/, "").trim();
  if (ORG_CANONICAL[stripped]) return ORG_CANONICAL[stripped];

  return stripped;
}

// Determine org type for a name
export function getOrgType(name: string): "FUND_MANAGER" | "CORPORATE" | "OTHER" {
  const canonical = resolveOrgName(name);
  if (NON_INFRA_FUND_ENTITIES.has(name) || NON_INFRA_FUND_ENTITIES.has(canonical)) {
    return "CORPORATE";
  }
  return "FUND_MANAGER";
}
