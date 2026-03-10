# Plan: Organize Fund Database with Detailed Portfolio Companies

## Overview

Restructure the fund database page (`/funds`) to support ~100 fund managers with richly detailed portfolio companies. Add a dual-tab view: **Tab 1** for Firms & Funds (current accordion), **Tab 2** for a flat, searchable Portfolio Companies table with full cross-filtering.

---

## Step 1: Expand the `PortfolioCompany` Data Model

**File:** `src/data/funds.ts`

Replace `portfolioCompanies: string[]` with a structured interface:

```ts
export interface PortfolioCompany {
  name: string;                    // e.g. "Belfast City Airport"
  sector: FundSector;              // reuse existing FundSector type
  subsector?: string;              // e.g. "Airports", "Fiber Networks"
  region: FundRegion;              // reuse existing FundRegion type
  country: string;                 // e.g. "United Kingdom", "Germany"
  description?: string;            // 1-2 sentence summary of the asset
}
```

- Keeps it lean — no status field needed (all active per user)
- Reuses existing `FundSector` and `FundRegion` types for consistency with filters
- `subsector` and `description` are optional to keep data entry manageable
- Each portfolio company is still nested inside its parent `Fund`, so the firm → fund → portco hierarchy is preserved naturally

**Migration:** Convert existing `portfolioCompanies: ["name1", "name2"]` entries to the new object format. For existing entries where sector/region aren't known yet, default to the parent fund's primary sector/region.

---

## Step 2: Add Utility Functions for Portfolio Companies

**File:** `src/data/funds.ts`

Add helpers to flatten and aggregate portfolio companies across all funds:

```ts
export interface PortfolioCompanyWithContext extends PortfolioCompany {
  fundId: string;
  fundName: string;
  managerName: string;
}

export function getAllPortfolioCompanies(fundList: Fund[]): PortfolioCompanyWithContext[]
export function getPortfolioCompanyStats(companies: PortfolioCompanyWithContext[]): { ... }
export function getUniqueCountries(companies: PortfolioCompanyWithContext[]): string[]
export function getUniqueSubsectors(companies: PortfolioCompanyWithContext[]): string[]
```

These functions join each portfolio company with its parent fund/manager context, enabling cross-filtering in the UI.

---

## Step 3: Add Dual-Tab UI to FundDatabase Component

**File:** `src/components/FundDatabase.tsx`

Add a tab bar at the top of the page with two tabs:

- **Firms & Funds** — The existing accordion view (unchanged)
- **Portfolio Companies** — A new flat, searchable table view

The tab state is a simple `useState<"funds" | "portfolio">`. Both tabs share the same page header. The filter bar and insights hero adapt based on the active tab.

---

## Step 4: Build the Portfolio Companies Tab

**File:** `src/components/FundDatabase.tsx` (or a new sub-component if it gets too large)

### Filter Bar (Portfolio Tab)
New filter dropdowns specific to portfolio companies:
- **Sector** — FundSector multi-select (reuses existing dropdown)
- **Region** — FundRegion multi-select
- **Country** — Multi-select from unique countries in the data
- **Fund Manager** — Multi-select from unique manager names
- **Subsector** — Multi-select from unique subsectors
- **Text search** — Searches across: company name, description, subsector, country, fund name, manager name

### Table/Card View
- **Desktop:** Sortable table with columns: Company Name | Sector | Subsector | Region/Country | Fund Manager | Fund Vehicle
- **Mobile:** Card layout with key info and tap-to-expand
- Click a row to open a detail drawer showing full company info + link to parent fund

### Portfolio Company Drawer
When clicking a portfolio company, show:
- Company name, sector badge, region badge, country
- Description (if available)
- Subsector
- **Parent fund card** with fund name, manager, strategy badges — clickable to open the fund drawer
- If the same company appears in multiple fund vehicles under the same manager, show all

---

## Step 5: Update the Insights Hero for Portfolio Tab

**File:** `src/components/FundDatabase.tsx`

When the Portfolio Companies tab is active, the insights hero switches to show:
1. **Top Sectors** — by portfolio company count
2. **Top Regions** — by portfolio company count
3. **Top Fund Managers** — by number of portfolio companies

Same horizontal bar chart pattern as the existing fund insights hero.

---

## Step 6: Update the Fund Drawer's Portfolio Section

**File:** `src/components/FundDatabase.tsx`

In the existing fund detail drawer, upgrade the portfolio companies section from plain name pills to rich cards showing:
- Company name (bold)
- Sector + subsector badges
- Country label
- Short description (if available)

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/funds.ts` | Add `PortfolioCompany` interface, update `Fund.portfolioCompanies` type, add utility functions, migrate existing data |
| `src/components/FundDatabase.tsx` | Add tab bar, portfolio companies tab with table/filters/drawer, update insights hero, update fund drawer |

## Not Changed
- No new routes needed (stays on `/funds`)
- No changes to the deal database, weekly briefing, or navbar
- No new dependencies needed
