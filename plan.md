# Plan: Replace Fund Database & Expand Scorecards

## Overview
Replace 235 funds with ~160 curated funds from the user's table, extend the Fund interface with new fields (`rationale`, `sourceUrls`), expand the FundDrawer scorecard UI, and fetch qualitative details from source URLs to enrich descriptions.

## User Preferences (Confirmed)
- **Status logic**: Vintage-based — 2025 or "Target"/"In Market" = Raising; ≤2024 = Deploying; Evergreen Y = Evergreen
- **Portfolio data**: Preserve ALL existing portfolio data in `portfolios.ts` (don't remove entries for dropped funds)
- **Source URLs**: Fetch each URL to extract richer qualitative detail for fund descriptions

---

## Phase 1: Extend the Data Model
**File:** `src/data/funds.ts`

1. Add two new fields to the `Fund` interface:
   - `rationale: string` — why the fund qualifies for inclusion
   - `sourceUrls: string[]` — array of root source URLs
2. Update the `f()` helper to accept these via `overrides`

## Phase 2: Replace Fund Data
**File:** `src/data/funds.ts`

Process all ~160 funds alphabetically by Firm. For each entry:
- Map columns to existing fields + new fields
- Match against existing fund IDs to preserve portfolio linkage
- Derive `status`, `structure`, `regions`, `sectors` from context
- Compound strategies (e.g., "Core-Plus / Value-Add") → `strategies: ["Core-Plus", "Value-Add"]`

### ID Matching Strategy
1. Match by normalized `(managerName, fundName)` pairs
2. Reuse existing FUND-XXX IDs where matched → preserves portfolio data
3. Assign new IDs for funds not in current dataset

## Phase 3: Fetch Qualitative Details from Source URLs
For each of the ~160 funds, fetch 2-3 source URLs to extract:
- Investment thesis and market positioning
- LP commitment details and fundraising history
- Geographic focus and sector specialization
- Notable transactions and portfolio highlights

Process in parallel batches. Weave extracted facts into enriched `description` fields.

## Phase 4: Expand FundDrawer Scorecard UI
**File:** `src/components/FundDatabase.tsx`

Add to FundDrawer after description:
1. **"Investment Rationale" section** — styled card with `fund.rationale`
2. **"Sources & References" section** — clickable URL list with domain labels + ExternalLink icons
3. **Structure badge** in header alongside strategy/status badges
4. **Structure field** added to the overview card grid (3 columns: Size, Vintage, Structure)

## Phase 5: Self-Checking & Validation
1. Count verification: confirm ~160 funds in array
2. Manager coverage: cross-reference every firm from user table
3. Field completeness: all funds have rationale + sourceUrls
4. TypeScript compilation: `npx tsc --noEmit`
5. Build check: `npm run build`

## Execution Order
1. Phase 1 (model) + Phase 4 (UI) — can be done first, in parallel
2. Phase 2 (data replacement) — largest effort, in alphabetical batches
3. Phase 3 (source fetching) — concurrent with Phase 2
4. Phase 5 (validation) — final step
5. Commit and push to branch `claude/update-infrastructure-funds-db-Bq3ce`
