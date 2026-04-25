# Project Instructions — Infra-MA2

## Architecture Overview

- **Next.js 15** App Router, TypeScript (`strict`), Tailwind CSS
- **Postgres via Neon + Prisma 7** is the system of record for deals, funds, companies, and users
- **NextAuth 4** handles auth; admin routes are middleware-gated
- Five public pages:
  - `/` — Deal Database ([src/components/DealDatabase.tsx](src/components/DealDatabase.tsx)) — currently the home page
  - `/tracker` — Deal Database (same component as `/`)
  - `/portfolio` — Portfolio Database ([src/components/PortfolioDatabase.tsx](src/components/PortfolioDatabase.tsx))
  - `/funds` — Fund Database ([src/components/FundDatabase.tsx](src/components/FundDatabase.tsx))
  - `/search` — Cross-database search
- Admin pages live under `/admin/*` (companies, deals, funds, sources, users), all gated by middleware

### Layout: where things live

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router routes, layouts, error/loading boundaries |
| `src/components/` | React UI components (page-level + shared) |
| `src/modules/{deals,funds,companies,insights,search}/queries.ts` | Server-side Prisma read queries returning *View types |
| `src/modules/admin/{actions.ts,schemas.ts}` | Admin server actions + Zod validation |
| `src/modules/auth/config.ts` | NextAuth configuration |
| `src/modules/shared/{types.ts,enum-maps.ts}` | View-layer types and Prisma enum → display string maps |
| `src/lib/` | Cross-cutting utilities: `prisma.ts`, `colors.ts`, `types.ts` (display unions), `csv.ts`, `format.ts`, `{deal,fund,portco}-utils.ts` |
| `src/lib/colors.ts` | **Single source of truth** for all sector/region/strategy/category color helpers |
| `src/hooks/` | `useDebounce`, `useFilterToggle`, `useAnimatedNumber` |
| `src/generated/prisma/` | Generated Prisma client (run `npm run db:generate` if missing) |
| `prisma/` | Schema, migrations, seed data |

## Data Layer

### Source of truth

All public read paths query Postgres via Prisma. Static seed data lives under `prisma/seed-data/` and is only used by `npm run db:seed`. **Do not** import from `prisma/seed-data/` in app code.

### Prisma → View mapping

The Prisma schema uses uppercase enums (e.g. `DEAL_DIGITAL`); the UI uses display strings (e.g. `"Digital"`). Maps live in [src/modules/shared/enum-maps.ts](src/modules/shared/enum-maps.ts). Conversion happens in the `to*View` functions inside each module's `queries.ts`. Components only ever see *View types — never raw Prisma types.

Display unions (`DealSector`, `FundStrategy`, `PortCoSector`, etc.) are in [src/lib/types.ts](src/lib/types.ts).

### Adding new data

Use the admin UI (`/admin/{deals,funds,companies}`). Inputs are validated with Zod schemas in [src/modules/admin/schemas.ts](src/modules/admin/schemas.ts). Bulk import/export is available via the import bar on each admin index page (CSV, ADMIN role only).

## Page-Level Components

Each public page uses a thin Server Component → `*Client` Client Component bridge:

- `src/app/page.tsx` and `src/app/tracker/page.tsx` → `DealDatabaseClient` → `DealDatabase`
- `src/app/portfolio/page.tsx` → `PortfolioDatabaseClient` → `PortfolioDatabase`
- `src/app/funds/page.tsx` → `FundDatabaseClient` → `FundDatabase`

The Server Component fetches via `getAllDeals()` / `getAllCompanies()` / `getAllFunds()` from `src/modules/*/queries.ts` and passes data as props.

### Filter pattern (shared across all three databases)

- Filter sets are URL-synced via [`useUrlFilterSet`](src/hooks/useUrlFilterSet.ts) (e.g. `?sector=Digital,Utilities&region=Europe`). Refreshing or sharing a URL preserves filters.
- "Clear all" uses [`useClearUrlFilters`](src/hooks/useUrlFilterSet.ts) to wipe multiple params in a single `router.replace`
- Search input is debounced via `useDebounce` (300ms) before being applied; search text is local state, not URL-synced
- Multi-select dropdowns: [`MultiSelectDropdown`](src/components/shared/MultiSelectDropdown.tsx) — fully ARIA-compliant, portal-rendered, Escape-to-close
- Active filter chips: [`ActiveFiltersStrip`](src/components/shared/ActiveFiltersStrip.tsx) wrapping [`FilterChip`](src/components/shared/FilterChip.tsx)
- Ranking visualizations: shared `deriveRanking` + `RankingColumn` from [`RankingBars`](src/components/shared/RankingBars.tsx)

## Deal Database (`/` and `/tracker`)

### Insights Hero ([DynamicInsightsHero](src/components/DealDatabase/DynamicInsightsHero.tsx))

Three ranked lists, each Top 5, all reactive to active filters:
1. **Top Fund Activity** — infrastructure fund buyers by deal count, with stacked bars colored by activity type
2. **Top Industries** — sectors by deal count
3. **Top Regions** — regions by deal count

### Fund-activity exclusions and aliases

Inside `DynamicInsightsHero.tsx`:
- `NON_INFRA_FUND_BUYERS` — set of buyer names to exclude from the fund-activity ranking (corporate acquirers, undisclosed buyers, etc.). When adding a deal whose buyer is not an infrastructure fund, add the name here.
- `FUND_NAME_ALIASES` — normalizes variant fund names to a canonical name (e.g. `"CVC (CVC DIF)"` → `"CVC DIF"`). When a deal uses a variant of an existing fund name, add an entry here so transactions are counted together.

### Buyer name shortening

Inside [DealDatabase.tsx](src/components/DealDatabase.tsx):
- `BUYER_SHORT_NAMES` — abbreviates long fund names for the desktop table column (e.g. "Macquarie Asset Management" → "Macquarie AM"). The full name is preserved in the deal drawer and mobile card.

### Deal table layout

- The `target` field (clean asset name) is displayed in bold; `seller` shows underneath in `text-[10px] text-[#999]`. When seller is `"N/A"` or `"—"`, only target is shown.
- All `<td>` use `align-top`; target/seller cell uses `min-h-[28px]` for uniform row height.

## Portfolio Database (`/portfolio`)

### Data shape — `CompanyView`

Defined in [src/modules/shared/types.ts](src/modules/shared/types.ts). Key fields: `id`, `name`, `investmentFirm`, `sector` (PortCoSector), `subsector`, `region` (PortCoRegion), `country`, `ownershipVehicle`, `description`, `status` (`Active` | `Realized`). Optional: `website`, `yearFounded`, `investmentYear`, `headquarters`, `milestones[]`, `management[]`, `sources[]`, `countryTags[]`.

`investmentFirm` and `ownershipVehicle` are derived from the company's primary `OwnershipPeriod` in [src/modules/companies/queries.ts](src/modules/companies/queries.ts).

### PortCo Drawer (aka "Company Scorecard")

The slide-in detail panel that opens when a company row is clicked. Component is `PortCoDrawer` inside [PortfolioDatabase.tsx](src/components/PortfolioDatabase.tsx) (still inline as of writing — extraction is a known TODO).

**Terminology:** "scorecard" in a portfolio context = `PortCoDrawer`, NOT the `ScorecardEntry` type used elsewhere.

Renders in this order:

1. **Header ("Ambient Canvas")** — sticky, dual ambient orbs (sector-colored + indigo), bold `text-2xl/3xl` company name, subtitle `{investmentFirm} · ● {status}`, optional website link icon, X close button (also Escape-bound). Design principle: restraint and bold typography over stacked decorations.

2. **Investment Details** — `Briefcase` icon, `glass-card` rows separated by `divide-y divide-[#27272A]`:
   - Firm → `company.investmentFirm`
   - Fund → `company.ownershipVehicle`
   - Fund Strategy *(if matched fund has strategies)* — colored badge pills via `getStrategyColor()`. Lookup: `funds.find(f => f.fundName === company.ownershipVehicle)`
   - Investment Date *(if `company.investmentYear`)* — year only
   - Sector — with sector-colored dot
   - Subsector *(if present)*
   - Location — `company.headquarters || company.country`

3. **Company Overview** — `FileText` icon, `company.description` in `text-sm-dense text-[#A1A1AA] leading-relaxed`. Optional Sources sub-panel (nested dark card) with external links if `sources.length > 0`.

4. **Historical Milestones** — `Clock` icon, vertical timeline (`w-px bg-[#27272A]`), reverse chronological. Shows max 6 with "Show all N" toggle. Each row: colored dot → date → category badge → event text.

   **Investment callout highlighting:** the milestone for the firm's initial investment gets indigo treatment (larger dot, `bg-[#818CF8]/[0.06]`, "Investment" badge). Detection logic in [PortfolioDatabase.tsx](src/components/PortfolioDatabase.tsx):
   ```
   mentionsFirm = event text includes first word of company.investmentFirm
   isInvestmentMilestone = date includes investmentYear AND (category === "Financing" OR mentionsFirm)
   ```
   The highlighted milestone year **must** match `investmentYear` — if not, fix the data. When entering milestones for a new company, include one for the initial investment using category `"Financing"` (preferred) or `"Acquisition"` with the firm name in the event text.

5. **Key Management** — `Users` icon, 2-column grid (1-column if single exec). Filter regex: title contains `\bChief\b` OR (`\bPresident\b` AND NOT `\bVice\s*President\b`). Excludes VP, GC, Director, Controller. When entering management data, only include C-suite and President — the drawer filters the rest.

### Cross-database linking

- `CompanyView.ownershipVehicle` ↔ `FundView.fundName` (exact string match)
- `CompanyView.investmentFirm` ↔ `FundView.managerName` (loose; can differ slightly)
- The fund lookup is `funds.find(f => f.fundName === company.ownershipVehicle)` in PortfolioDatabase.tsx
- If no fund matches, no strategy badges appear — check for typos in either record

## Fund Database (`/funds`)

### Data shape — `FundView`

Defined in [src/modules/shared/types.ts](src/modules/shared/types.ts). Key fields: `id`, `managerName`, `fundName`, `strategies: FundStrategy[]`, `investmentStrategy` (long-form), `size`, `sizeUsdMm`, `vintage`, `structure`, `status`, `sectors`, `regions`, `portfolioCompanies`.

### Strategy types & colors

Strategies are `FundStrategy` from [src/lib/types.ts](src/lib/types.ts). Colors come from `getStrategyColor()` in [src/lib/colors.ts](src/lib/colors.ts).

## Design System

### Colors

All color helpers live in [src/lib/colors.ts](src/lib/colors.ts):
- Deal: `getSectorColor`, `getCategoryColor`, `getRegionColor`, `getActivityColor`
- Fund: `getStrategyColor`, `getStatusColor`, `getFundSectorColor`, `getFundRegionColor`, `getStructureColor`
- PortCo: `getPortCoSectorColor`, `getPortCoRegionColor`, `getPortCoStatusColor`, `getPortCoCountryTagColor`, `getMilestoneCategoryColor`

Every helper falls back to `#a1a1aa` (or `#71717a` for milestone) on unknown input — see [src/lib/colors.test.ts](src/lib/colors.test.ts) for the contract.

### Tailwind theme additions

- Custom font sizes: `text-micro` (11px), `text-xs-dense` (12px), `text-sm-dense` (13px)
- Custom shadows: `shadow-card`, `shadow-card-hover`, `shadow-card-elevated`, `shadow-accent-glow`, `shadow-accent-ring`
- Custom animations: `animate-fade-in`, `animate-fade-in-up`, `animate-pulse-slow`, `animate-pulse-slower`
- Custom utilities: `glass-card`, `surface-card`, `filter-pill`

### Canonical badge pattern

Used site-wide for sector/category/strategy/status/structure tags:
```
text-[10px] font-medium px-1.5 py-0
color: "#444444"
backgroundColor: "${color}08"
border: "1px solid ${color}12"
```
Color comes from the relevant helper. **Use tags for:** Sector, Category, Strategy, Status, Structure, Subsector (card view only). **Do NOT** use tags for Country (plain text) or Region in tables (plain text).

### Mobile-first

All components must look good on mobile. Avoid cramming hero/infographic sections.

## Testing

- Vitest config: [vitest.config.ts](vitest.config.ts)
- Tests live alongside source as `*.test.ts` (e.g. [src/lib/csv.test.ts](src/lib/csv.test.ts))
- Run: `npm test` (CI also runs this)
- Current coverage: pure utility functions in `src/lib/`. Component tests are not yet set up.

## Build & Deploy

- Node 22 (pinned via `.nvmrc` and package.json `engines`)
- CI: [.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs `tsc --noEmit`, `npm test`, `next build`
- After cloning, run `npx prisma generate` (or `npm install`, which triggers `postinstall`) to generate the Prisma client into `src/generated/prisma/`
- App boundary files: [src/app/error.tsx](src/app/error.tsx), [src/app/loading.tsx](src/app/loading.tsx), [src/app/not-found.tsx](src/app/not-found.tsx), plus admin-scoped [src/app/admin/error.tsx](src/app/admin/error.tsx) and [src/app/admin/loading.tsx](src/app/admin/loading.tsx)

## Conventions for Claude

- **Use the dedicated tools**: Read/Edit/Glob/Grep, not bash equivalents
- **Don't batch-add data** to the DB without per-record review
- **Don't introduce new color helpers** — extend [src/lib/colors.ts](src/lib/colors.ts)
- **Don't introduce alternative badge sizing/padding** — use the canonical pattern
