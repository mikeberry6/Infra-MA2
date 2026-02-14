# Project Instructions — Infra-MA2

## Architecture Overview

- **Next.js 14** app with App Router, TypeScript, Tailwind CSS
- Deal data lives in `src/data/deals.ts` (typed `Deal` interface)
- Three main pages:
  - `/` — Weekly Briefing (`src/components/WeeklyBriefing.tsx`)
  - `/tracker` — Deal Database (`src/components/DealDatabase.tsx`)
  - `/earnings` — Earnings page

## Weekly Briefing Page (`/`)

- The `MarketInsightHero` component receives the weekly deals as a prop (`deals: Deal[]`)
- It must ONLY reflect that week's deals (the same deals listed in the timeline below it), NOT all deals in the database
- Weekly deals are sourced from `getWeeklyDeals()` — a rolling 7-day window

## Deal Database Page (`/tracker`)

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

## Design Principles

- **Mobile-first**: All components must look good on mobile devices. Avoid cramming too much into the hero/infographic sections.
- Keep insights clean and minimal — horizontal bar charts with labels, not complex SVG visualizations
- Use the existing color helpers: `getSectorColor()`, `getRegionColor()`, `getCategoryColor()` from `src/data/deals.ts`
- Activity type colors: Acquisition = blue (#3b82f6), Sale = amber (#f59e0b), Platform Launch = cyan (#06b6d4), IPO = green (#10b981), Joint Venture = purple (#8b5cf6)

## Adding New Deals

When adding deals to `src/data/deals.ts`:
- Follow the existing `Deal` interface exactly
- If the buyer is not an infrastructure fund, add them to `NON_INFRA_FUND_BUYERS` in `DynamicInsightsHero.tsx`
- Use existing `DealSector`, `DealRegion`, `DealCategory`, and `DealStatus` union types
