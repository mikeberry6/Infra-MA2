# Data Triage — 2026-04-26

Companion to the data-integrity sweep (PR: this branch). The PR fixes code-level
defects (enum drift, duplicated lists, fragile milestone matching). This
document lists the **data-side** items that need a human decision before
seed/admin records are touched.

CLAUDE.md: *"Don't batch-add data to the DB without per-record review"* — so
each row below is yours to triage, not an auto-fix.

## How to triage

For each row, decide one of:

- **Add as fund** → create a record in `prisma/seed-data/funds.ts` (or via the
  admin UI), then add a `BUYER_SHORT_NAMES` entry in
  [src/components/DealDatabase.tsx](src/components/DealDatabase.tsx) if the
  canonical name is long.
- **Exclude** → add to the `NON_INFRA_FUND_ENTITIES` set in
  [src/lib/constants.ts](src/lib/constants.ts).
- **Alias** → add to `FUND_NAME_ALIASES` in
  [src/lib/fund-name-utils.ts](src/lib/fund-name-utils.ts) so it dedupes against
  an existing canonical fund.
- **Skip** → leave as-is; the entity has too few deals to be worth canonicalizing.

---

## §1 Unclassified deal buyers/sellers

Buyers/sellers that appear in `prisma/seed-data/deals.ts` but are **not** in
`funds.ts` and **not** in `NON_INFRA_FUND_ENTITIES`. Currently they show up as
their own row in the "Top Fund Activity" ranking with the long display name.

| Name | Notes / hint | Decision |
|---|---|---|
| DESRI | Distributed Energy Solar Resources — likely a developer/IPP, not a fund |  |
| Erickson Group | Family office? Verify |  |
| Bimergen Energy | Energy company; likely operating, not a fund |  |
| MEAG | Munich Re Asset Management — institutional manager |  |
| Patrizia | Listed alt-asset manager — has infra arm; likely **add as fund** |  |
| KWAP | Malaysian pension — typically a sovereign LP, not a GP |  |
| KJTS | Verify |  |
| Cube Highways Trust | InvIT vehicle in India |  |
| GI Partners | Global Infrastructure Partners? Or a separate firm? Disambiguate |  |
| HarbourVest | Already in `BUYER_SHORT_NAMES` → likely **add as fund** |  |
| Aware Super | Australian super fund — pension, typically LP |  |
| Nuveen Infrastructure | Already in `BUYER_SHORT_NAMES` → likely **add as fund** |  |
| Sonnedix | Solar IPP; likely operating co |  |

## §2 Company `investmentFirm` values not present in `funds.ts`

Companies in `prisma/seed-data/companies.ts` whose `investmentFirm` doesn't
match any `funds.ts` `managerName`. Effect today: the PortCoDrawer fund-strategy
badge section is empty for these companies because the
`funds.find(f => f.managerName === company.investmentFirm)` join fails.

| investmentFirm | Likely action | Decision |
|---|---|---|
| Acadia Infrastructure Capital | Add as fund (or verify spelling vs an existing record) |  |
| CC&L | Connor, Clark & Lunn? Verify expansion |  |
| EIC | Energy & Infrastructure Capital? Disambiguate |  |
| IMCO | Investment Management Corporation of Ontario — pension; LP-only? |  |
| Kimmeridge | Yes, real GP — add as fund |  |
| TPG Real Estate | Distinct from `TPG`; decide whether it should be aliased |  |
| Wren House | Wren House Infrastructure Management (KIA) — add as fund |  |
| Global Infrastructure Partners | Should be **alias to GIP** to dedupe with existing record |  |

## §3 Suggested `FUND_NAME_ALIASES` candidates

Variant names in `deals.ts` that count as separate rows in the ranking today
but probably belong to existing canonical funds.

| Variant | Suggested canonical | Decision |
|---|---|---|
| `"DWS Infrastructure"` | `"DWS"` (or: keep separate if DWS Infrastructure is its own product) |  |
| `"EQT Infrastructure"` | `"EQT"` |  |
| `"Morgan Stanley Infrastructure"` | `"Morgan Stanley Infrastructure Partners"` |  |
| `"Axium Infrastructure Europe"` | `"Axium Infrastructure"` |  |

---

## §4 Notes

- The PR ships `NON_INFRA_FUND_ENTITIES` as the **single source of truth** in
  `src/lib/constants.ts` — both `DealDatabase.tsx` and `DynamicInsightsHero.tsx`
  import it, so additions made there flow to both the deal-row "Infra Fund"
  tag and the Top Fund Activity ranking.
- The PR also shares `FUND_NAME_ALIASES` and `normalizeFundName` via
  `src/lib/fund-name-utils.ts`. Adding an alias automatically dedupes the
  ranking; it does **not** auto-shorten the display — pair it with a
  `BUYER_SHORT_NAMES` entry if the canonical name is wordy.
