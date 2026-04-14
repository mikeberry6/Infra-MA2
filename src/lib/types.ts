// ─── Deal Types ────────────────────────────────────────────

export type DealSector = "Transportation" | "Power & ET" | "Midstream" | "Utilities" | "Waste & ES" | "Digital" | "Social";

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
  | "Transportation"
  | "Utilities"
  | "Digital Infrastructure"
  | "Renewables / Energy Transition"
  | "Waste / Environmental Services"
  | "Power Generation"
  | "Midstream / Energy"
  | "Social Infrastructure"
  | "Communications"
  | "Logistics"
  | "Water";

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
  | "Transportation"
  | "Digital Infrastructure"
  | "Energy Transition"
  | "Power Generation"
  | "Midstream Energy"
  | "Regulated Utilities"
  | "Utilities"
  | "Social Infrastructure"
  | "Environmental / Waste"
  | "Renewable Resources"
  | "Infrastructure Services";

export type PortCoRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Global";

export type PortCoCountryTag = "United States" | "Canada" | "Mexico";

export type PortCoStatus = "Active" | "Realized";
