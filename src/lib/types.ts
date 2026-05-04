// ─── Deal Types ────────────────────────────────────────────

export type DealSector = "Power & ET" | "Utilities" | "Digital" | "Midstream" | "Transportation" | "Social Infra";

export type DealRegion = "North America" | "Europe" | "Asia-Pacific" | "Middle East & Africa" | "Latin America";

export type DealCategory =
  | "Acquisition (Buyout)"
  | "Acquisition (Majority Stake)"
  | "Acquisition (Minority Stake)"
  | "Acquisition (Bolt-On)"
  | "Sale (Buyout)"
  | "Sale (Majority Stake)"
  | "Sale (Minority Stake)"
  | "Sale (Carve-Out)"
  | "Platform Launch"
  | "IPO"
  | "Joint Venture";

export type DealStatus = "Announced" | "Closed" | "Pending Regulatory Approval" | "Terminated";

// ─── Fund Types ────────────────────────────────────────────

export type FundStrategy =
  | "Core"
  | "Core-Plus"
  | "Value-Add"
  | "Opportunistic"
  | "Growth"
  | "Credit / Debt"
  | "Fund-of-Funds"
  | "Secondaries"
  | "Co-Investments"
  | "Greenfield"
  | "Retail Act '40";

export type FundStatus = "Evergreen" | "Financial Close" | "Raising";

export type FundSector =
  | "Power & ET"
  | "Utilities"
  | "Digital"
  | "Midstream"
  | "Transportation"
  | "Social Infra";

export type FundRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Middle East & Africa"
  | "Global";

export type FundStructure =
  | "Open-End"
  | "Closed-End"
  | "Permanent Capital"
  | "Evergreen"
  | "Listed / Evergreen"
  | "Listed / Closed-End";

export type FundSizeRange =
  | "< $500M"
  | "$500M – $1B"
  | "$1B – $5B"
  | "$5B – $10B"
  | "$10B+";

// ─── PortCo Types ──────────────────────────────────────────

export type MilestoneCategory =
  | "Founding"
  | "Acquisition"
  | "Financing"
  | "Expansion"
  | "Management"
  | "Divestiture"
  | "IPO"
  | "Other";

export type PortCoSector =
  | "Power & ET"
  | "Utilities"
  | "Digital"
  | "Midstream"
  | "Transportation"
  | "Social Infra";

export type PortCoRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Global";

export type PortCoCountryTag = "United States" | "Canada" | "Mexico";

export type PortCoStatus = "Active" | "Realized";
