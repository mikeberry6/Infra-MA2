# Audit Plan: Portfolio Company → Fund Mapping Verification

## Objective
Verify that every single portfolio company in `src/data/portfolios.ts` is mapped to the correct fund in `src/data/funds.ts`. Ensure 100% coverage — no company skipped.

---

## Phase 1: Inventory & Cross-Reference Validation

### Step 1.1 — Extract Complete Inventory
- Write a Node.js audit script (`scripts/audit-portfolio-mapping.ts`) that:
  - Imports `PORTFOLIO_DATA` from `portfolios.ts` and `funds` from `funds.ts`
  - Lists every fund ID key in `PORTFOLIO_DATA` and confirms it exists in the `funds` array
  - Flags any fund ID in `PORTFOLIO_DATA` that has NO matching entry in `funds` (orphaned portfolio data)
  - Flags any fund in `funds` that has an ID NOT present in `PORTFOLIO_DATA` (fund with no portfolio companies — acceptable but flagged)
  - Counts total portfolio companies across all funds
  - Outputs a complete CSV/report: `Fund ID | Manager Name | Fund Name | # Portfolio Companies | Company Names`

### Step 1.2 — Structural Integrity Checks
- Verify no duplicate company names within the same fund
- Verify no fund ID appears more than once in `PORTFOLIO_DATA`
- Check that every portfolio company has all required fields (`name`, `sector`, `region`, `country`)
- Validate `sector` and `region` values against the allowed `FundSector` and `FundRegion` union types

---

## Phase 2: Fund-by-Fund Portfolio Verification (Web Research)

This is the core audit. For each fund that has portfolio companies, research the fund manager's actual portfolio and verify every company is correctly assigned.

The audit will proceed manager-by-manager through all ~112 fund entries that have portfolio data. For each:

1. **Look up the fund manager's actual portfolio** via web search (official website, press releases, PitchBook, Preqin, InfraLogic, etc.)
2. **Cross-check every listed company** — confirm it is actually held/was held by that specific fund vehicle
3. **Flag mismatches** where a company is assigned to the wrong fund vehicle (e.g., assigned to Fund V but actually held by Fund IV)
4. **Flag missing companies** that should be in the portfolio but aren't (note: we won't add without user approval, just flag)
5. **Verify co-investor data** where listed — confirm co-investors are accurate

### Fund Groups to Audit (complete list of all PORTFOLIO_DATA keys):

**Batch 1 — FUND-001 to FUND-020** (3i Group, Acadia, Actis, Allianz, Amber, Ancala, Antin, Apollo)
**Batch 2 — FUND-021 to FUND-040** (Apollo cont., Ara, ArcLight, Ardian, Ares, Argo, Astatine, Asterion, Axium)
**Batch 3 — FUND-041 to FUND-060** (Axium cont., Basalt, Bernhard, BlackRock, BlackRock GIP, Blackstone, Brookfield)
**Batch 4 — FUND-061 to FUND-080** (Brookfield cont., Carlyle, CBRE, CIM, Copenhagen, Cube, CVC DIF, DigitalBridge)
**Batch 5 — FUND-081 to FUND-100** (DWS, EIG, Ember, EnCap, Energy Capital, Energy Infra Partners, EQT, Equitix, Fengate)
**Batch 6 — FUND-101 to FUND-120** (Generate, Goldman Sachs, Harbert, Harrison Street, H.I.G., I Squared, iCON, IFM, Igneo)
**Batch 7 — FUND-121 to FUND-140** (Igneo cont., InfraRed, InfraVia, Infratil, J.P. Morgan, Kimmeridge, KKR, Macquarie)
**Batch 8 — FUND-141 to FUND-160** (Macquarie cont., MEAG, Meridiam, Mirova, Morgan Stanley)
**Batch 9 — FUND-161 to FUND-180** (Northleaf, NOVA, Nuveen, Oaktree, Partners Group, Patria, Patrizia, PSP, QIC)
**Batch 10 — FUND-181 to FUND-200** (Quinbrook, Ridgewood, Schroders Greencoat, Stonepeak, Swiss Life)
**Batch 11 — FUND-201 to FUND-220** (Swiss Life cont., Tallvine, Temasek, Tiger, TPG, True Green, Vauban, Vision Ridge, Wafra, Wren House, ADIA, Ancala)
**Batch 12 — FUND-221 to FUND-236** (Apollo, BCI, Charlesbank, AustralianSuper, CPP, IMCO, Mubadala, OMERS, OTPP, Pantheon, Ridgemont, Riverstone, Sixth Street, StepStone, UBS, GIC)

---

## Phase 3: Issue Tracking & Correction

### Step 3.1 — Compile Findings
- Create a findings report listing every discrepancy found:
  - **Wrong fund**: Company X is under FUND-NNN but should be under FUND-MMM
  - **Wrong manager**: Portfolio data references a company not actually managed by that fund manager
  - **Wrong metadata**: Sector, region, country, or description is incorrect
  - **Missing co-investors**: Known co-investors not listed
  - **Orphan fund IDs**: Portfolio data keys that don't match any fund

### Step 3.2 — Apply Corrections
- For each confirmed discrepancy, edit `portfolios.ts` to move/fix the company
- If a company belongs to a fund not in the database, document it but keep it mapped to the closest correct fund (or remove if no match)
- Update co-investor arrays as needed

---

## Phase 4: Self-Checking Mechanism

### Step 4.1 — Automated Validation Script
- Enhance the audit script to run as a comprehensive validator:
  - Re-verify all fund ID cross-references after edits
  - Count companies per fund before and after — ensure no companies were lost or duplicated
  - Verify TypeScript compilation still passes (`npx tsc --noEmit`)
  - Verify the app builds successfully (`npm run build`)

### Step 4.2 — Second-Pass Web Verification
- After all corrections, do a second complete pass through all funds
- Run a spot-check on 20+ random portfolio companies to re-confirm they're in the right fund
- Compare total company counts before and after audit to ensure nothing was accidentally deleted

### Step 4.3 — Summary Report
- Generate final report with:
  - Total funds audited
  - Total portfolio companies verified
  - Number of corrections made (itemized)
  - Number of companies confirmed correct
  - Any unresolved items requiring user input

---

## Execution Order

1. Build the audit script (Phase 1) — ~15 min
2. Run structural checks — ~5 min
3. Web-research verification, batch by batch (Phase 2) — bulk of the work, ~10-15 min per batch × 12 batches
4. Compile findings and apply corrections (Phase 3) — ~30 min
5. Run self-checks and second pass (Phase 4) — ~30 min
6. Commit and push to branch `claude/audit-portfolio-fund-mapping-CTnix`
