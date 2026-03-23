# Project Instructions — Infra-MA2

## Architecture Overview

- **Next.js 14** app with App Router, TypeScript, Tailwind CSS
- Deal data lives in `src/data/deals.ts` (typed `Deal` interface)
- Five main pages:
  - `/` — Weekly Briefing (`src/components/WeeklyBriefing.tsx`)
  - `/tracker` — Deal Database (`src/components/DealDatabase.tsx`)
  - `/portfolio` — Portfolio Database (`src/components/PortfolioDatabase.tsx`)
  - `/funds` — Fund Database (`src/components/FundDatabase.tsx`)
  - `/earnings` — Earnings page

## Weekly Briefing Page (`/`)

- The `MarketInsightHero` component receives the weekly deals as a prop (`deals: Deal[]`)
- It must ONLY reflect that week's deals (the same deals listed in the timeline below it), NOT all deals in the database
- Weekly deals are sourced from `getWeeklyDeals()` which uses a **fixed anchor date** (`WEEKLY_ANCHOR` in `src/data/deals.ts`) set to the publish date. It returns all Announced deals in the 7 days up to and including that date.
- **The weekly briefing is manually curated by the user.** Do NOT change `WEEKLY_ANCHOR` or add/remove/modify deals in the weekly window without explicit user instruction.
- `getWeeklyDeals()` includes deals of any status — some deals are simultaneously announced and closed (e.g. sign-and-close transactions), and these should still appear in the briefing
- When the user publishes a new weekly briefing, update `WEEKLY_ANCHOR` to the new publish date

## Deal Database Page (`/tracker`)

### YTD Subtitle

The page subtitle reads "2026 year-to-date as of {date}" where the date is **automatically derived** from the most recent deal in the database via `getLatestDealDate()` in `src/data/deals.ts`. No manual date updates are needed when adding new deals — the subtitle updates itself.

### Insights Hero (`DynamicInsightsHero`)

The hero section displays exactly **3 ranked lists** (no donut charts, no KPI cards, no sparklines):

1. **Top Fund Activity** — Top 5 infrastructure fund buyers ranked by deal count, with stacked horizontal bars color-coded by activity type (Acquisition, Sale, Platform Launch, IPO, Joint Venture)
2. **Top Industries** — Top 5 sectors ranked by deal count, colored by sector
3. **Top Regions** — Top 5 regions ranked by deal count, colored by region

All 3 rankings respond to the page's filter toggles (sector, region, category, search).

### Fund Activity Exclusions

The fund activity ranking must ONLY show infrastructure fund managers. Exclude non-infrastructure-fund buyers:
- Undisclosed Buyer, Public Market, Bain Capital, Mitsui O.S.K. Lines, Talen Energy, Drax Group, Pilot Fiber
- If new deals are added with non-infrastructure-fund buyers (corporate acquirers, operating companies, undisclosed parties), add them to the `NON_INFRA_FUND_BUYERS` set in `DynamicInsightsHero.tsx`

### Fund Name Aliases

Fund names sometimes appear in variant forms across deals (e.g. `"CVC (CVC DIF)"` vs `"CVC DIF"`). The `FUND_NAME_ALIASES` map in `DynamicInsightsHero.tsx` normalizes these to a canonical name so all transactions for the same fund are counted together.
- If a new deal uses a variant name for an existing fund (e.g. parent company prefix, abbreviation difference), add an entry to `FUND_NAME_ALIASES` mapping the variant to the canonical name

## Portfolio Database Page (`/portfolio`)

### Data Sources & Types

- PortCo data: `src/data/portcos/companies.ts` (array), types in `src/data/portcos/types.ts`
- `PortCo` interface fields: `name`, `investmentFirm`, `sector` (PortCoSector), `subsector`, `region` (PortCoRegion), `country`, `ownershipVehicle`, `description`, `status` (Active | Realized), optional: `website`, `yearFounded`, `investmentYear`, `headquarters`, `milestones[]`, `management[]`, `sources[]`
- `PortCoExecutive` interface: `{ name: string; title: string }`
- Color helpers: `getPortCoSectorColor()`, `getPortCoRegionColor()`, `getPortCoStatusColor()`, `getMilestoneCategoryColor()` in `src/data/portcos/types.ts`

### PortCo Drawer — Header Design ("Ambient Canvas")

- NO monogram, NO noise texture — the header uses ONE strong design element: dual ambient orbs creating a smooth gradient wash
- Accent bar: `h-[2px]` sector gradient (left → transparent)
- Orb 1: `w-64 h-64`, sector-colored, `opacity-[0.10]`, `blur(80px)`, `animate-pulse-slow`, top-left
- Orb 2: `w-48 h-48`, indigo `#818CF8`, `opacity-[0.07]`, `blur(80px)`, `animate-pulse-slower`, top-right
- Company name: `text-2xl lg:text-3xl font-bold tracking-tight` — this is the hero element
- Subtitle: `{investmentFirm} · ● {status}` in `text-sm-dense`
- **Design principle: awe comes from restraint, bold typography, and generous spacing — NOT from stacking decorations**

### PortCo Drawer — "Investment Details" Section

- Section is titled **"Investment Details"** (NOT "Company Details")
- Row order: Firm → Fund → Fund Strategy (conditional) → Investment Date (conditional, year only) → Sector (with colored dot) → Subsector (conditional) → Location
- **Fund Strategy** is pulled from the fund database by matching `company.ownershipVehicle` to `fund.fundName` in `src/data/funds.ts`. Rendered as colored badge pills using `getStrategyColor()`.
- **Investment Date** shows only the year (e.g. "2022"), NOT a combined "Fund [Year]" format

### PortCo Drawer — Management Section

- Only **C-suite and President-level** executives are shown
- Filter regex: title contains `\bChief\b` OR (`\bPresident\b` AND NOT `\bVice\s*President\b`)
- Excludes: Vice President, General Counsel, Controller, Director, VP, etc.
- When adding `management[]` data to a PortCo, only include C-suite (CEO, CFO, COO, CTO, etc.) and President — the drawer filters out everything else

### Cross-Database Linking: PortCo ↔ Fund

- `PortCo.ownershipVehicle` maps to `Fund.fundName` (exact string match)
- `PortCo.investmentFirm` corresponds loosely to `Fund.managerName` (may differ slightly — e.g. "3i Infrastructure" vs "3i Group")
- The fund lookup is: `funds.find(f => f.fundName === company.ownershipVehicle)` in `PortfolioDatabase.tsx`
- If a new PortCo's `ownershipVehicle` doesn't match any fund name, no strategy badges will appear — check for typos or add the fund to `src/data/funds.ts`

### Adding New PortCos

When adding portfolio companies to `src/data/portcos/companies.ts`:
- Follow the `PortCo` interface in `src/data/portcos/types.ts`
- `ownershipVehicle` must match a `fundName` in `src/data/funds.ts` for strategy badges to appear
- For `management[]`, only include C-suite (Chief X Officer) and President — the drawer filters out everything else
- Use existing `PortCoSector`, `PortCoRegion`, `PortCoStatus` union types
- **Do NOT batch-add portcos without user review** — always confirm individual companies with the user before adding them

## Fund Database Page (`/funds`)

### Data & Types

- Fund data: `src/data/funds.ts` — contains `Fund` interface, `funds` array, strategy/color helpers
- `Fund` key fields: `id`, `managerName`, `fundName`, `strategies: FundStrategy[]`, `investmentStrategy` (long-form text), `size`, `sizeUsdMm`, `vintage`, `structure`, `status`, `sectors`, `regions`, `portfolioCompanies`
- `FundStrategy` union type: `"Core" | "Core-Plus" | "Value-Add" | "Opportunistic" | "Growth" | "Credit / Debt" | "Fund-of-Funds" | "Secondaries" | "Co-Investments" | "Greenfield" | "Retail Act '40"`
- Color helper: `getStrategyColor(strategy: FundStrategy)` returns hex color string
- Strategy colors: Core = #10b981 (emerald), Core-Plus = #06b6d4 (cyan), Value-Add = #3b82f6 (blue), Opportunistic = #f59e0b (amber), Growth = #8b5cf6 (purple), Credit/Debt = #ec4899 (pink), Fund-of-Funds = #a78bfa (violet), Secondaries = #f97316 (orange), Co-Investments = #14b8a6 (teal), Greenfield = #22c55e (green), Retail Act '40 = #ef4444 (red)

## Design Principles

- **Mobile-first**: All components must look good on mobile devices. Avoid cramming too much into the hero/infographic sections.
- Keep insights clean and minimal — horizontal bar charts with labels, not complex SVG visualizations
- Use the existing color helpers: `getSectorColor()`, `getRegionColor()`, `getCategoryColor()` from `src/data/deals.ts`
- Activity type colors: Acquisition = blue (#3b82f6), Sale = amber (#f59e0b), Platform Launch = cyan (#06b6d4), IPO = green (#10b981), Joint Venture = purple (#8b5cf6)
- **Colored badge pattern** (reusable across all drawers): `text-micro font-medium px-2 py-0.5 rounded-[4px]` with `color: getXxxColor(value)`, `backgroundColor: ${color}1a` (10% opacity), `border: 1px solid ${color}33` (20% opacity). Used for: strategy badges, sector badges, category badges, status badges.

## Adding New Deals

When adding deals to `src/data/deals.ts`:
- Follow the existing `Deal` interface exactly
- Deals may have `status: "Announced"` or `status: "Closed"`. Some transactions are simultaneously announced and closed (sign-and-close deals like bolt-on acquisitions). These are valid and should be captured with `status: "Closed"`. Do NOT exclude a deal just because it has already closed — what matters is that it was newly disclosed during the relevant period.
- If the buyer is not an infrastructure fund, add them to `NON_INFRA_FUND_BUYERS` in `DynamicInsightsHero.tsx`
- If a buyer or seller name is a variant of an existing fund (e.g. `"CVC (CVC DIF)"` for `"CVC DIF"`), add it to `FUND_NAME_ALIASES` in `DynamicInsightsHero.tsx`
- Use existing `DealSector`, `DealRegion`, `DealCategory`, and `DealStatus` union types
- **Do NOT batch-add deals without user review** — always confirm individual deals with the user before adding them
