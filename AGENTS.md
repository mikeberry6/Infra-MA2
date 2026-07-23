# Project Instructions — Infra-MA2

## Architecture Overview

- **Next.js 15** app with App Router, TypeScript, Tailwind CSS, Prisma, and Neon/Postgres
- Public database pages fetch Prisma-backed view models from `src/modules/*/queries.ts`, then hand them to client components for filtering and drawers
- Seed/reference data still lives under `prisma/seed-data/*`; do not treat old `src/data/*` paths as the active data source unless they are reintroduced
- Main pages:
  - `/` — Permanent redirect to the canonical Deal Database route (`/tracker`)
  - `/tracker` — Deal Database (`src/components/DealDatabase.tsx`)
  - `/portfolio` — Portfolio Database (`src/components/PortfolioDatabase.tsx`)
  - `/funds` — Fund Database (`src/components/FundDatabase.tsx`)
  - `/news` — News Feed (`src/components/NewsFeed.tsx`)
  - `/search` — Cross-database search
  - `/earnings` — Earnings page

## Weekly Briefing Page (`/`)

- Historical note: the current `/` route no longer renders the Weekly Briefing; it permanently redirects to the Prisma-backed Deal Database at `/tracker`.
- If the Weekly Briefing is restored, preserve the manual-curation rules below.
- The `MarketInsightHero` component receives the weekly deals as a prop (`deals: Deal[]`)
- It must ONLY reflect that week's deals (the same deals listed in the timeline below it), NOT all deals in the database
- Weekly deals are sourced from `getWeeklyDeals()` which uses a **fixed anchor date** (`WEEKLY_ANCHOR` in `src/data/deals.ts`) set to the publish date. It returns all Announced deals in the 7 days up to and including that date.
- **The weekly briefing is manually curated by the user.** Do NOT change `WEEKLY_ANCHOR` or add/remove/modify deals in the weekly window without explicit user instruction.
- `getWeeklyDeals()` includes deals of any status — some deals are simultaneously announced and closed (e.g. sign-and-close transactions), and these should still appear in the briefing
- When the user publishes a new weekly briefing, update `WEEKLY_ANCHOR` to the new publish date

## Weekly Email Briefing (`public/email-format/`)

- Weekly email briefings are static HTML files in `public/email-format/`. Use `public/email-format/template.html` as the starting point for each new issue.
- Preserve the visual and editorial style established in `public/email-format/2026-05-02.html` and `public/email-format/2026-05-09.html`: Guggenheim purple/gold accents, bordered sector cards, compact metadata lines, grey body text, simple horizontal YTD bars, and a factual advisory tone.
- Do not rewrite historical weekly email files unless the user explicitly asks for historical cleanup.

### Key Themes

- Key themes should highlight the week's strongest capital deployment angles, not just sector volume.
- When U.S. transactions are present, explicitly touch on **U.S. deployment** in the second/final theme paragraph with named transactions.
- Name the strongest U.S. operating-asset, platform, and portfolio-company transactions; use non-U.S. platform activity only as contrast.
- Distinguish new U.S. capital deployment and operating-asset/platform acquisitions from secondaries, exits, and broad platform announcements when writing theme language.

### Weekly Section Ordering

- In each published weekly email, order current-week sector sections by that week's deal count in descending order, from most to least active.
- If sector counts are tied, use this fixed tie-break order: Power & ET, Digital, Transportation, Utilities, Midstream, Social Infra.
- Omit sectors with zero deals from final published briefings unless the user explicitly requests zero-deal sections.
- Preheader and previous-editions summaries should list active sectors in the same most-to-least activity order.
- Within each active sector section/card, order deal cards from largest to smallest. Rank by disclosed economic size first (enterprise value, purchase price, committed equity, project financing, PPA/offtake notional, or fund interest size), then by physical asset scale if economics are undisclosed (MW/MWh, km, fleet, portfolio footprint), with undisclosed/no-quantum deals last. If metrics are not directly comparable, use the clearest scale indicator and make the rationale obvious in the overview paragraph.
- When multiple current-week deals share a subsector or closely comparable subsector, rank those deals largest to smallest using public disclosure and editorial judgment. Prefer disclosed transaction value, committed equity, or asset/fund interest size; when those are unavailable, use disclosed operating/development scale, platform breadth, portfolio footprint, customer base, or other public evidence of transaction scale. Do not mechanically preserve source-discovery order.

### Deal Overview Writing Rubric

- Each deal card uses this structure:
  1. **Title:** `{Target / Asset} | {Infrastructure fund / fund manager only}`
  2. **Metadata line:** `{Sponsor} ({transaction type}) · {subsector} · {region/country}`
  3. **Overview paragraph:** one concise paragraph, generally 1–2 sentences
  4. **Source:** one source link labeled "Source"
- In deal card titles, the name after `|` must be the infrastructure fund or fund manager only. Do not put portfolio companies, sponsor-backed platforms, developers, sellers, or co-developers after the pipe; mention those parties in metadata or the overview paragraph.
- If multiple infrastructure funds are direct sponsors, separate fund names with `/`.
- Use canonical sponsor short names consistently across titles, metadata, themes, and body copy. For Goldman Sachs Asset Management, always use **GSAM**.
- Overview paragraphs should state what happened, who is buying/selling/investing, and why the asset or platform matters.
- Prefer concrete facts when available: capacity, geography, market role, enterprise value, capital commitment, customer base, development status, or strategic rationale.
- Keep language factual and restrained. Avoid generic hype or unsupported "strategic fit" phrasing.
- Use consistent transaction labels such as Buyout, Minority Stake, Majority Stake, Joint Venture, Platform Launch, Bolt-On, Portfolio Company Acquisition, Portfolio Company Divestiture, Primary Capital Raise, Sale, and Co-Investment.

### YTD Bar Charts

- The `Deal Count By Sector (YTD)` and `Deal Count By Region (YTD)` tables must both be ordered in descending count order, from most to least active.
- Recalculate bar widths after sorting: the leading row is `100%`; every other row is `round(count / leadingCount * 100)`.
- Before publishing, verify that no lower-count row appears before a higher-count row. For example, if Social Infra has more YTD deals than Midstream, Social Infra must appear above Midstream.
- Use simple email-compatible horizontal bars only; do not introduce complex SVG charts.

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

### PortCo Drawer (aka "Company Scorecard")

The **PortCo Drawer** is the slide-in detail panel that appears when a user clicks on a portfolio company row. It is also referred to as a **"company scorecard"**. The component is `PortCoDrawer` inside `src/components/PortfolioDatabase.tsx` (not a separate file). It renders as a right-anchored full-height panel with `max-w-lg lg:max-w-xl xl:max-w-2xl`.

**Terminology note:** If the user says "scorecard" in the context of portfolio companies, they mean this PortCoDrawer component — NOT the `ScorecardEntry` type in `earnings.ts` (which is for public asset manager earnings tracking).

The drawer has **4 sections** rendered in this exact order:

#### Section 1: Header ("Ambient Canvas")

- NO monogram, NO noise texture — the header uses ONE strong design element: dual ambient orbs creating a smooth gradient wash
- Sticky header with `bg-[#09090B]/95 backdrop-blur-md`, bottom border
- Accent bar: `h-[2px]` sector gradient (left → transparent) at top of header
- Orb 1: `w-64 h-64`, sector-colored, `opacity-[0.10]`, `blur(80px)`, `animate-pulse-slow`, top-left
- Orb 2: `w-48 h-48`, indigo `#818CF8`, `opacity-[0.07]`, `blur(80px)`, `animate-pulse-slower`, top-right
- Company name: `text-2xl lg:text-3xl font-bold tracking-tight` — this is the hero element
- Optional external link icon (if `company.website` exists) next to name
- Subtitle: `{investmentFirm} · ● {status}` in `text-sm-dense`
- Close button (X icon) top-right, triggers `onClose` (also bound to Escape key)
- **Design principle: awe comes from restraint, bold typography, and generous spacing — NOT from stacking decorations**

#### Section 2: Investment Details

- Section icon: `Briefcase` (lucide-react), indigo colored
- Section label: **"Investment Details"** (NOT "Company Details") — `text-micro font-medium uppercase tracking-wider`
- Rendered as a `glass-card` with `divide-y divide-[#27272A]` between rows
- Row order (each row is label on left, value on right):
  1. **Firm** — `company.investmentFirm`
  2. **Fund** — `company.ownershipVehicle`
  3. **Fund Strategy** (conditional) — only if `matchedFund?.strategies?.length`. Rendered as colored badge pills using `getStrategyColor()`. Fund is matched via `funds.find(f => f.fundName === company.ownershipVehicle)`
  4. **Investment Date** (conditional) — only if `company.investmentYear`. Shows year only (e.g. "2023"), NOT a combined "Fund [Year]" format
  5. **Sector** — `company.sector` with a colored dot (`getPortCoSectorColor()`)
  6. **Subsector** (conditional) — only if `company.subsector`
  7. **Location** — `company.headquarters || company.country`

#### Section 3: Company Overview

- Section icon: `FileText` (lucide-react), indigo colored
- Section label: **"Company Overview"** — `text-micro font-medium uppercase tracking-wider`
- Shows `company.description` as `text-sm-dense text-[#A1A1AA] leading-relaxed`
- **Sources sub-panel** (conditional, if `sources.length > 0`): nested dark card (`bg-[#111113] border border-[#1f1f23]`) with "Sources" micro label and list of external links. Each link has `ExternalLink` icon + label, hover state transitions to indigo.

#### Section 4: Historical Milestones

- Section icon: `Clock` (lucide-react), indigo colored
- Section label: **"Historical Milestones"** — `text-micro font-medium uppercase tracking-wider`
- Vertical timeline with a thin line (`w-px bg-[#27272A]`) on the left
- Milestones are displayed in **reverse chronological order** (newest first)
- Initially shows max 6 milestones; "Show all N milestones" / "Show less" toggle if more than 6
- Each milestone shows: colored dot → date (tabular-nums) → category badge → event text

##### Investment Callout Highlighting

- The timeline auto-highlights the milestone representing the **investment firm's initial investment** with a special indigo callout
- Highlighted milestone gets: `bg-[#818CF8]/[0.06]`, `border border-[#818CF8]/20`, `rounded-[6px]`, larger dot (13px vs 11px), indigo colors, "Investment" badge replacing category, brighter `text-[#EDEDED]` event text
- **Detection logic** (line ~516 in PortfolioDatabase.tsx):
  ```
  mentionsFirm = event text includes first word of company.investmentFirm
  isInvestmentMilestone = date includes investmentYear AND (category === "Financing" OR mentionsFirm)
  ```
- This means: "Financing" category milestones in the investment year always match. "Acquisition" or other categories only match if they also mention the firm name. This prevents bolt-on acquisitions in the same year from being incorrectly highlighted.
- The highlighted milestone's year **must align** with the `investmentYear` field in Investment Details — if they don't match, fix the data
- `investmentYear` represents the year the investment firm first invested in the business
- When adding milestones for a new PortCo, always include one for the initial investment/acquisition by the firm, using category "Financing" (preferred) or "Acquisition" with the firm name mentioned in the event text

#### Section 5: Key Management

- Section icon: `Users` (lucide-react), indigo colored
- Section label: **"Key Management"** — `text-micro font-medium uppercase tracking-wider`
- Only **C-suite and President-level** executives are shown
- Filter regex: title contains `\bChief\b` OR (`\bPresident\b` AND NOT `\bVice\s*President\b`)
- Excludes: Vice President, General Counsel, Controller, Director, VP, etc.
- Layout: 2-column grid (1-column if only 1 executive), each card is `glass-card rounded-[4px] px-4 py-3`
- Each card shows: name (`text-sm-dense text-[#EDEDED] font-medium`) and title (`text-micro text-[#52525B]`)
- When adding `management[]` data to a PortCo, only include C-suite (CEO, CFO, COO, CTO, etc.) and President — the drawer filters out everything else

#### Replicating a Scorecard for a New PortCo

To create a scorecard for a new portfolio company, you do NOT need to build any new component. Simply add the company data to `src/data/portcos/companies.ts` following the `PortCo` interface, and the existing `PortCoDrawer` renders it automatically. The scorecard quality depends entirely on the richness of the data:
- `description` — detailed company overview paragraph
- `milestones[]` — chronological history including founding, key acquisitions, financing events, management changes, expansions
- `management[]` — C-suite and President-level executives (the drawer filters the rest)
- `sources[]` — external reference URLs
- `ownershipVehicle` — must match a `fundName` in `src/data/funds.ts` for strategy badges to appear
- `investmentYear` — required for the investment callout highlighting to work

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
- **Colored tag/badge pattern** (canonical, used site-wide in tables, cards, and drawers): `text-[10px] font-medium px-1.5 py-0` with `color: "#444444"`, `backgroundColor: "${color}08"`, `border: "1px solid ${color}12"`. Color comes from the relevant helper function (e.g. `getSectorColor()`, `getCategoryColor()`, `getStrategyColor()`).
  - **Use tags for:** Sector, Category, Strategy, Status, Structure, Subsector (card view only)
  - **Do NOT use tags for:** Country (plain text), Region (plain text in tables)
  - All tag instances across all pages must use this exact pattern — do not introduce alternative sizing, padding, or opacity values

### Deal Database Table Layout

- The `Deal` interface has a `target` field (clean company/asset name, e.g. "Contact Energy") separate from `title` (long headline). The table's "Target / Seller" column shows `deal.target` in bold with `deal.seller` underneath in grey `text-[10px] text-[#999]`. When seller is "N/A" or "—", only the target is shown.
- All rows use `min-h-[28px]` on the target/seller cell to ensure uniform row height regardless of whether a seller is present. All `<td>` elements use `align-top`.
- **Buyer name shortening**: The `BUYER_SHORT_NAMES` map in `DealDatabase.tsx` abbreviates long fund names for table display (e.g. "Igneo Infrastructure Partners" → "Igneo", "Macquarie Asset Management" → "Macquarie AM"). The `shortenBuyer()` function also strips "(via XYZ)" suffixes and splits multi-buyer names on " / " to stack them vertically. When adding new deals with long buyer names, add an entry to `BUYER_SHORT_NAMES` if the name would truncate in the table.
- The full unabbreviated buyer name is still stored in `deal.buyer` and shown in the deal drawer and mobile card — `BUYER_SHORT_NAMES` only affects the desktop table column.

## Adding New Deals

When adding deals to `src/data/deals.ts`:
- Follow the existing `Deal` interface exactly
- Deals may have `status: "Announced"` or `status: "Closed"`. Some transactions are simultaneously announced and closed (sign-and-close deals like bolt-on acquisitions). These are valid and should be captured with `status: "Closed"`. Do NOT exclude a deal just because it has already closed — what matters is that it was newly disclosed during the relevant period.
- If the buyer is not an infrastructure fund, add them to `NON_INFRA_FUND_BUYERS` in `DynamicInsightsHero.tsx`
- If a buyer or seller name is a variant of an existing fund (e.g. `"CVC (CVC DIF)"` for `"CVC DIF"`), add it to `FUND_NAME_ALIASES` in `DynamicInsightsHero.tsx`
- Use existing `DealSector`, `DealRegion`, `DealCategory`, and `DealStatus` union types
- **Do NOT batch-add deals without user review** — always confirm individual deals with the user before adding them
