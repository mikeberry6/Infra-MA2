# Webpage Update Audit — April 2, 2026

## Updated Rows (21)

| Row | Deal ID | Fields Changed |
|-----|---------|---------------|
| 55 | INF-2026-030 | title, buyer, seller, subsector, description, targetDescription, keyHighlights |
| 54 | INF-2026-015 | title, buyer, subsector, description, targetDescription, keyHighlights |
| 50 | INF-2026-077 | title, buyer, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 51 | INF-2026-062 | title, buyer, seller, subsector, country, description, targetDescription, keyHighlights |
| 56 | INF-2026-052 | title, buyer, seller, description, targetDescription, keyHighlights |
| 53 | INF-2026-022 | title, buyer, seller, subsector, description, targetDescription, keyHighlights |
| 37 | INF-2026-084 | title, seller, subsector, country, description, targetDescription, keyHighlights |
| 45 | INF-2026-092 | title, seller, subsector, region (Europe), country, description, targetDescription, keyHighlights |
| 46 | INF-2026-093 | title, seller, country, subsector, description, targetDescription, keyHighlights |
| 25 | INF-2026-108 | title, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 19 | INF-2026-110 | title, seller, sector (Power & ET), subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 31 | INF-2026-103 | title, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 23 | INF-2026-105 | title, buyer, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 27 | INF-2026-099 | title, buyer, sector (Power & ET), subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 21 | INF-2026-096 | title, buyer, seller, subsector, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 24 | INF-2026-106 | title, buyer, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 22 | INF-2026-104 | title, buyer, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 18 | INF-2026-111 | title, buyer, seller, subsector, country, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 30 | INF-2026-102 | title, buyer, seller, subsector, country, category, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 4 | INF-2026-122 | title, buyer, seller, subsector, description, targetDescription, sourceUrl, sourceName, keyHighlights |
| 5 | INF-2026-123 | title, buyer, seller, subsector, description, targetDescription, sourceUrl, sourceName, keyHighlights |

## New Rows Added (20)

| Deal ID | Date | Title | Sector |
|---------|------|-------|--------|
| INF-2026-128 | 2026-03-16 | Standard Solar / Brookfield acquire 48.4 MW NM solar | Power & ET |
| INF-2026-129 | 2026-03-16 | KKR invests in PMI Electro / Allfleet | Transportation |
| INF-2026-130 | 2026-03-17 | MSIP divests Bayonne Energy Center | Power & ET |
| INF-2026-131 | 2026-03-17 | Equitix / COFIDES co-invest in Spanish Hybridisation | Power & ET |
| INF-2026-132 | 2026-03-17 | Cube Highways Trust acquires 4 highway assets | Transportation |
| INF-2026-133 | 2026-03-19 | Ares Management invests in Plenitude | Power & ET |
| INF-2026-134 | 2026-03-19 | CBRE IM acquires 10% stake in Porterbrook | Transportation |
| INF-2026-135 | 2026-03-19 | Zenobe / KKR acquire Revolv | Transportation |
| INF-2026-136 | 2026-03-19 | APG / Antin co-invest in NorthC Datacenters | Digital |
| INF-2026-137 | 2026-03-20 | Axium acquires 49.9% in 174 MW French wind | Power & ET |
| INF-2026-138 | 2026-03-24 | ReNew divests Tamil Nadu Solar to Technique Solaire | Power & ET |
| INF-2026-139 | 2026-03-24 | Generate Capital divests Equinox Growers | Social |
| INF-2026-140 | 2026-03-24 | Igneo acquires OnStream | Utilities |
| INF-2026-141 | 2026-03-25 | Brookfield / La Caisse acquire Boralex | Power & ET |
| INF-2026-142 | 2026-03-25 | KWAP joins Stonepeak / KJTS in Lestari Cooling | Utilities |
| INF-2026-143 | 2026-03-26 | Allianz GI acquires Amprion stake from Talanx | Utilities |
| INF-2026-144 | 2026-03-26 | Sonnedix / JPAM acquire Akira solar portfolio | Power & ET |
| INF-2026-145 | 2026-03-26 | VINCI Highways acquires Safeway from Macquarie | Transportation |
| INF-2026-146 | 2026-03-26 | Abertis acquires remaining A63 stake | Transportation |
| INF-2026-147 | 2026-03-26 | H.I.G. Capital divests Desktop S.A. to Claro | Digital |

## Hold Items (NOT Published)

| Item | Reason |
|------|--------|
| LES / Goldman Sachs AM acquire All American Grease Services | HOLD — no confirmed date/source |
| Row 39: Exus Renewables / Masdar Portuguese wind portfolio | REVALIDATE — left untouched |
| Row 49: MEAG / Culmia Affordable Housing Portfolio | REVALIDATE — left untouched |

## Category / Taxonomy Choices

- `categoryHint` was used directly for all deals; no overrides needed
- INF-2026-102 (Valokuitunen): Added dual category `["Sale (Majority Stake)", "Acquisition (Majority Stake)"]` per change pack
- INF-2026-092 (MAF): Region changed from "Global" to "Europe" (DealRegion union does not include "Global")
- INF-2026-110 (SK Eternix): Sector changed from "Digital" to "Power & ET" per change pack
- INF-2026-099 (Calisen): Sector changed from "Utilities" to "Power & ET" per change pack

## NON_INFRA_FUND_BUYERS Additions

Added to both `DynamicInsightsHero.tsx` and `DealDatabase.tsx`:
- Claro, Taylor Farms, Abertis, VINCI Highways, Technique Solaire
- Algoma Central Corporation, Dubai Aerospace Enterprise, Power2X, Nobian
- Jupiter Energy Investor

## FUND_NAME_ALIASES Additions

- `"Brookfield Infrastructure Structured Solutions"` → `"Brookfield Asset Management"`
- `"Standard Solar / Brookfield"` → `"Brookfield Asset Management"`
- `"Mainstay Maritime"` → `"Oaktree Capital"`
- `"Brookfield / La Caisse"` → `"Brookfield Asset Management"`

## Self-Check

| # | Check | Result |
|---|-------|--------|
| 1 | Every ready_updates item addressed exactly once | PASS (21/21) |
| 2 | Every ready_additions item addressed exactly once | PASS (20/20) |
| 3 | Exactly 21 existing rows updated | PASS |
| 4 | Exactly 20 new rows added | PASS |
| 5 | All 3 hold_items NOT published | PASS |
| 6 | Final deal count = 146 | PASS |
| 7 | No duplicate IDs | PASS |
| 8 | All changed records have required fields | PASS |
| 9 | npm run build passes | PASS |
| 10 | No unintended changes outside target files | PASS |
| 11 | WEEKLY_ANCHOR unchanged | PASS |
