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
| `src/hooks/` | `useDebounce`, `useScrolledPast`, `useUrlFilterSet` |
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

Used by [DynamicInsightsHero](src/components/DealDatabase/DynamicInsightsHero.tsx) when bucketing buyers/sellers into the Top Fund Activity ranking:

- `NON_INFRA_FUND_ENTITIES` in [src/lib/constants.ts](src/lib/constants.ts) — set of party names excluded from the fund-activity ranking (corporate acquirers, undisclosed buyers, etc.). When adding a deal whose buyer/seller is not an infrastructure fund, add the name here.
- `normalizeFundName` + alias map in [src/lib/fund-name-utils.ts](src/lib/fund-name-utils.ts) — collapses variant fund names to a canonical name (e.g. `"CVC (CVC DIF)"` → `"CVC DIF"`). When a deal uses a variant of an existing fund name, add an entry here so transactions are counted together.

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

The slide-in detail panel that opens when a company row is clicked. Component is [PortCoDrawer](src/components/PortfolioDatabase/PortCoDrawer.tsx).

**Terminology:** "scorecard" in a portfolio context = `PortCoDrawer`, NOT the `ScorecardEntry` type used elsewhere.

Renders in this order:

1. **Header ("Ambient Canvas")** — sticky, dual ambient orbs (sector-colored + indigo), bold `text-2xl/3xl` company name, subtitle `{investmentFirm} · ● {status}`, optional website link icon, X close button (also Escape-bound). Design principle: restraint and bold typography over stacked decorations.

2. **Investment Details** — `Briefcase` icon, one card per `OwnerView` in `company.owners` (active first, then prior owners chronologically). Each owner card shows firm name + Current/Former status pill, vehicle name, fund-strategy badges (looked up via `funds.find(f => f.fundName === owner.fundName ?? owner.vehicle)`), optional stake, and the year range from `formatYearRange()` (`2020–Present` for active, `2018–2024` or `Exited 2024` for realized). Below the owner cards: Sector (with sector-colored dot), optional Subsector, Location (`company.headquarters || company.country`). Note: there is no longer a separate "Investment Date" row — investment year lives inside each owner card's year range.

3. **Company Overview** — `FileText` icon, `company.description` in `text-sm-dense text-[#A1A1AA] leading-relaxed`. Optional Sources sub-panel (nested dark card) with external links if `sources.length > 0`.

4. **Historical Milestones** — `Clock` icon, vertical timeline, reverse chronological (newest at top). Shows max 6 with "Show all N" toggle. Each row: colored dot → date → category badge → event text.

   **Entry / exit highlighting:** milestones that align with an owner's `investmentYear` or `exitYear` get a colored callout — green ("Investment") for entries, rust ("Exit") for exits. The classifier in [PortCoDrawer.tsx](src/components/PortfolioDatabase/PortCoDrawer.tsx) (`bestOwnerMatch` + `classifyMilestone`) tries to match the firm name in the event text first (full normalized form beats first-word match), then falls back to a year + category pattern (`Financing`/`Acquisition` for entries, `Divestiture` for exits). For entries to highlight cleanly, the milestone year **must** match an owner's `investmentYear` — if not, fix the data. When entering milestones for a new owner, include one using category `"Financing"` (preferred) or `"Acquisition"` with the firm name in the event text.

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

### Token layer

All design tokens live in [src/app/globals.css](src/app/globals.css) `:root`:
- **Primitives** (raw, never used directly): `--gray-0` through `--gray-900`, `--accent-500`, `--accent-600`, `--accent-50`
- **Semantic** (consumed by components): `--bg-app`, `--bg-surface`, `--bg-subtle`, `--bg-hover`, `--bg-overlay` (drawer backdrop), `--border`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--accent`, `--accent-hover`, `--accent-soft`

**Never hardcode hex in component code.** Color always flows through a token (`bg-[var(--bg-surface)]`) or a helper from `src/lib/colors.ts`.

### Colors

All categorical color helpers live in [src/lib/colors.ts](src/lib/colors.ts):
- Deal: `getSectorColor`, `getCategoryColor`, `getRegionColor`, `getActivityColor`, `getDealPartyRoleColor`
- Fund: `getStrategyColor`, `getStatusColor`, `getFundSectorColor`, `getFundRegionColor`, `getStructureColor`, `getSizeRangeColor`
- PortCo: `getPortCoSectorColor`, `getPortCoRegionColor`, `getPortCoStatusColor`, `getPortCoCountryTagColor`, `getMilestoneCategoryColor`
- Admin meta: `getRecordStatusColor`, `getUserRoleColor`

The whole palette flows through a single internal `PALETTE` constant in `colors.ts` — slightly desaturated values tuned toward the Mercury / Linear gamut. Every helper falls back to `#a1a1aa` (or `#71717a` for milestone) on unknown input — see [src/lib/colors.test.ts](src/lib/colors.test.ts) for the contract.

### Shared primitives

Use these whenever possible — don't reinvent inline:

- [`<Button>`](src/components/shared/Button.tsx) — `primary` / `secondary` / `ghost` / `danger` × `sm` / `md` / `lg`. Carries focus rings, loading states, leading/trailing icons.
- [`<Tag>`](src/components/shared/Tag.tsx) — `dot` (default — color dot + neutral text), `solid` (neutral chip for status), `tinted` (low-opacity color, used sparingly).
- [`<TextInput>`](src/components/shared/TextInput.tsx) — canonical input pattern, takes a `leadingIcon` prop. Used in navbar, all filter bars, search page.
- [`<SectionLabel>`](src/components/shared/SectionLabel.tsx) — uppercase 11px tracked-wider label for drawer sections, admin pages, hero columns. Optional `count` prop for the right-aligned numeric.
- [`<Divider>`](src/components/shared/Divider.tsx) — vertical or horizontal hairline.
- [`<MultiSelectDropdown>`](src/components/shared/MultiSelectDropdown.tsx), [`<FilterChip>`](src/components/shared/FilterChip.tsx), [`<ActiveFiltersStrip>`](src/components/shared/ActiveFiltersStrip.tsx), [`<RankingColumn>`, `<SimpleBarRow>`](src/components/shared/RankingBars.tsx), [`<DatabaseTiles>`](src/components/shared/DatabaseTiles.tsx), [`<CTABlock>`](src/components/shared/CTABlock.tsx), [`<MarketSnapshotSection>`](src/components/shared/MarketSnapshotSection.tsx).

### Drawer chrome (unified)

When adding a new drawer, match the established pattern:
- Backdrop: `bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in`
- Drawer container: `shadow-overlay bg-[var(--bg-surface)] animate-slide-in-right` (0.25s)
- Left edge accent stripe: 2px wide, colored from the relevant data dimension
- Sticky header with scroll-shadow: use [`useScrolledPast`](src/hooks/useScrolledPast.ts) hook → conditional `shadow-[0_1px_2px_rgba(17,17,20,0.04)]` on scroll
- Section dividers between content blocks: `border-t border-[var(--border)] pt-6`
- ESC key closes (handled per-drawer via `useEffect` keydown listener)

### Tailwind theme additions

- Custom font sizes: `text-2xs` (11px) — most other sizes via standard Tailwind scale
- Custom colors: token-aliased (`bg-app`, `bg-surface`, `bg-subtle`, `bg-hover`, `bg-overlay`, `text-primary`, `text-secondary`, `text-tertiary`, `accent`, `accent-soft`, `accent-hover`)
- Custom shadows: `shadow-card`, `shadow-card-hover`, `shadow-card-elevated`, `shadow-overlay`, `shadow-focus-ring`
- Custom animations: `animate-fade-in`, `animate-fade-in-up`, `animate-slide-in-right` (0.25s), `animate-scale-in`
- Custom utilities (in `globals.css` `@layer components`): `.surface`, `.surface-elevated`, `.surface-overlay`, `.mono`, `.line-clamp-2`

### Canonical badge pattern

Use [`<Tag>`](src/components/shared/Tag.tsx) — never inline tinted-background spans:
```tsx
<Tag color={getSectorColor(sector)}>{sector}</Tag>      // dot+text (default)
<Tag variant="solid">Closed</Tag>                       // neutral status chip
<Tag variant="tinted" color={hex}>Active</Tag>          // tinted (use sparingly)
```
**Use Tag for:** Sector, Category, Strategy, Status, Structure, Subsector (card view only). **Do NOT** use Tag for Country (plain text) or Region in tables (plain text).

### Mobile-first

All components must look good on mobile. Touch targets ≥ 40px (use `h-10` for primary tap surfaces). Avoid cramming hero/infographic sections.

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
