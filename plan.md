# Infrastructure Funds Database — Implementation Plan

## Overview

A new `/funds` page that serves as a searchable, filterable database of 100+ infrastructure fund vehicles, grouped by fund manager. Designed to answer questions like "Who would buy a $1bn US transportation company at core-plus/value-add?" by filtering on strategy, sector, geography, size, and structure.

---

## 1. Data Model — `src/data/funds.ts`

### TypeScript Types

```ts
// Normalized strategy tags (a fund can have multiple)
export type FundStrategy =
  | "Core"
  | "Core-Plus"
  | "Value-Add"
  | "Opportunistic"
  | "Growth"
  | "Credit / Debt"
  | "Fund-of-Funds"
  | "Secondaries"
  | "Co-Investments";

// Sectors the fund targets
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

// Geographic regions where the fund deploys capital
export type FundRegion =
  | "North America"
  | "Europe"
  | "Asia-Pacific"
  | "Latin America"
  | "Middle East & Africa"
  | "Global";

// Open/Closed end structure
export type FundStructure = "Open-End" | "Closed-End" | "Permanent Capital" | "Evergreen";
```

### Fund Interface

```ts
export interface Fund {
  id: string;                        // e.g. "FUND-001a"
  managerName: string;               // e.g. "3i Group"
  fundName: string;                  // e.g. "3i Infrastructure plc"
  ticker: string | null;             // e.g. "3IN" (only for public vehicles)
  description: string;               // Full fund description paragraph
  size: string;                      // Display string: "~£3.8 Billion"
  sizeUsdMm: number | null;         // Normalized USD in millions for range filtering (e.g. 3800 for $3.8B). null if unknown/variable
  vintage: string;                   // e.g. "2007", "2023", "Evergreen", "2024/2025"
  strategies: FundStrategy[];        // e.g. ["Core-Plus", "Value-Add"]
  structure: FundStructure;          // e.g. "Closed-End"
  sectors: FundSector[];             // e.g. ["Utilities", "Communications", "Transportation"]
  regions: FundRegion[];             // Where the fund invests, e.g. ["North America"]
  portfolioCompanies: string[];      // e.g. ["DNS:NET", "ESVAGT", ...]
}
```

### Fund Size Ranges (for filter dropdown)

```ts
export type FundSizeRange =
  | "< $500M"
  | "$500M – $1B"
  | "$1B – $5B"
  | "$5B – $10B"
  | "$10B+";
```

Filtering logic: compare `sizeUsdMm` against range thresholds. Funds with `sizeUsdMm: null` appear in all ranges (not excluded).

### Data Structure

Funds stored as a flat array `export const funds: Fund[] = [...]`, sorted/grouped by manager name in the source code with section comments (same pattern as `deals.ts`):

```ts
export const funds: Fund[] = [
  // ═══════════════════════════════════════════════════════════
  // 3i Group
  // ═══════════════════════════════════════════════════════════
  { id: "FUND-001a", managerName: "3i Group", fundName: "3i Infrastructure plc", ... },
  { id: "FUND-001b", managerName: "3i Group", fundName: "3i North American Infrastructure Fund", ... },
  { id: "FUND-001c", managerName: "3i Group", fundName: "3i Managed Infrastructure Acquisitions LP", ... },
  // ═══════════════════════════════════════════════════════════
  // Acadia Infrastructure Capital
  // ═══════════════════════════════════════════════════════════
  { id: "FUND-002a", managerName: "Acadia Infrastructure Capital", ... },
  ...
];
```

### Color Helpers

```ts
export function getStrategyColor(strategy: FundStrategy): string { ... }
export function getFundSectorColor(sector: FundSector): string { ... }
export function getFundRegionColor(region: FundRegion): string { ... }
export function getStructureColor(structure: FundStructure): string { ... }
```

Color palettes chosen to be distinct from existing deal colors but harmonious with the dark theme.

### Utility Functions

```ts
// Group flat fund array into manager groups for the accordion display
export function groupFundsByManager(fundList: Fund[]): Map<string, Fund[]>

// Get unique managers count, fund count, etc. for hero stats
export function getFundStats(fundList: Fund[]): { managers: number; funds: number; ... }
```

---

## 2. Component Architecture — `src/components/FundDatabase.tsx`

A single-file component (matching the `DealDatabase.tsx` pattern) containing:

### Sub-components (defined inside the file)

1. **`MultiSelectDropdown`** — Reused pattern from DealDatabase. Filter dropdowns for Strategy, Sector, Region, Structure, and Size Range.

2. **`ActiveFiltersChips`** — Shows active filter tags with X to remove. Reused pattern.

3. **`FilterBar`** — Combines search input + all 5 filter dropdowns + active chips. Search searches across: fund name, manager name, portfolio companies, description.

4. **`FundManagerAccordion`** — An expandable row representing a fund manager. Shows:
   - Manager name
   - Fund count badge (e.g. "3 vehicles")
   - Aggregate sector tags (combined unique sectors across all vehicles)
   - Aggregate strategy tags
   - Aggregate regions
   - Expand/collapse chevron
   - When expanded: shows nested fund vehicle rows/cards

5. **`FundVehicleRow`** (desktop) / **`FundVehicleCard`** (mobile) — Nested row for each fund vehicle within an accordion:
   - Fund name, size, vintage, strategy tags, sector tags, structure badge
   - Click opens detail drawer

6. **`FundDrawer`** — Side drawer (matching DealDrawer pattern) showing full fund details:
   - Fund name, manager name, ticker (if applicable)
   - Full description
   - Strategy, structure, vintage, size
   - Sectors as colored tags
   - Regions as colored tags
   - Portfolio companies list
   - Links to other vehicles from same manager at bottom

7. **`FundsInsightsHero`** — Top hero section with 3 ranked bar charts (matching DynamicInsightsHero pattern):
   - **Top Strategies** — Strategy types ranked by fund count
   - **Top Sectors** — Sectors ranked by fund count
   - **Top Regions** — Regions ranked by fund count
   - All reactive to current filters
   - Summary stat line: "X managers · Y fund vehicles · $Z total AUM tracked"

### Filtering Logic

```ts
// Filter funds → then group by manager → only show managers that have matching vehicles
const filteredFunds = funds.filter(fund => {
  // Text search: fund name, manager name, portfolio companies, description
  // Strategy filter: fund.strategies intersects active strategies
  // Sector filter: fund.sectors intersects active sectors
  // Region filter: fund.regions intersects active regions
  // Structure filter: fund.structure matches
  // Size range filter: fund.sizeUsdMm falls within selected range
});

const groupedFunds = groupFundsByManager(filteredFunds);
```

### Sorting

Manager accordion rows sorted alphabetically by manager name (default). Optional toggle to sort by total fund count or total AUM.

---

## 3. Page Route — `src/app/funds/page.tsx`

```ts
import { FundDatabase } from "@/components/FundDatabase";

export default function FundsPage() {
  return <FundDatabase />;
}
```

---

## 4. Navbar Update — `src/components/Navbar.tsx`

Add new link to the `links` array:

```ts
const links = [
  { href: "/", label: "Weekly Briefing" },
  { href: "/tracker", label: "Deal Database" },
  { href: "/funds", label: "Fund Database" },     // ← NEW
  { href: "/earnings", label: "Public Asset Managers" },
];
```

---

## 5. Files to Create / Modify

| Action | File | Description |
|--------|------|-------------|
| **Create** | `src/data/funds.ts` | Types, interfaces, fund data array, color helpers, utility functions |
| **Create** | `src/components/FundDatabase.tsx` | Main page component with all sub-components |
| **Create** | `src/app/funds/page.tsx` | Next.js page route |
| **Modify** | `src/components/Navbar.tsx` | Add "Fund Database" link |

---

## 6. Implementation Order

1. Create `src/data/funds.ts` — types, interfaces, color helpers, utility functions, and seed the first 5 fund managers (from user-provided data)
2. Create `src/components/FundDatabase.tsx` — full component with filtering, accordion, table/cards, drawer, and hero
3. Create `src/app/funds/page.tsx` — page route
4. Update `src/components/Navbar.tsx` — add nav link
5. Verify the build passes and the page renders correctly

---

## 7. Data Entry Notes for the First 5 Managers

The user's 5 fund managers map to **20 individual fund vehicles**:

| # | Manager | Vehicles |
|---|---------|----------|
| 1 | 3i Group | 3i Infrastructure plc, 3i North American Infrastructure Fund, 3i MIA |
| 2 | Acadia Infrastructure Capital | CCIC, Acadia SMAs |
| 3 | Actis | AE6, AE5, ALLIF 2, AACT |
| 4 | ADIA | Direct Infrastructure / Proprietary Balance Sheet |
| 5 | Allianz Global Investors | AEIF I & II, AGDIEF I & II, AICOF II, Asia Pacific Credit, Global Infrastructure ELTIF |

Geography (regions) will be inferred from the fund descriptions:
- 3i Infrastructure plc → Europe
- 3i North American Fund → North America
- Actis AE6 → Global (emerging markets focus)
- ADIA → Global
- Allianz AEIF → Europe
- etc.

Strategy tags will be normalized from the description strings:
- "Core-plus / Value-add" → ["Core-Plus", "Value-Add"]
- "Fund-of-Funds / Secondaries / Co-investments" → ["Fund-of-Funds", "Secondaries", "Co-Investments"]
- "Core infrastructure / Long-term buy-and-hold" → ["Core"]
- "Subordinated debt, mezzanine financing" → ["Credit / Debt"]

Size will include both display string and normalized USD millions for filtering.
