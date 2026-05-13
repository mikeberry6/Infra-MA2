# Portfolio Fund Ownership Audit - 2026-05-13

## Scope

This report checks every portfolio-company ownership record from `prisma/seed-data/companies.ts` against fund names in `prisma/seed-data/funds.ts`, the current Prisma-backed source equivalent in this repo. It does not edit seed data or live database records.

| Check | Count |
| --- | ---: |
| Portfolio companies | 1169 |
| Funds in fund data | 179 |
| Ownership rows audited | 1325 |
| Active ownership rows | 1318 |
| Rows sourced from owners[] | 1325 |
| Rows sourced from top-level fallback | 0 |

## Priority Counts

| Priority | Rows |
| --- | --- |
| fix | 0 |
| cleanup | 0 |
| review | 514 |
| ok | 811 |

## Match Status Counts

| Match status | Rows |
| --- | --- |
| missing_vehicle | 0 |
| normalized_fund_match | 0 |
| near_miss_fund_match | 0 |
| named_vehicle_missing_from_funds | 120 |
| probable_na | 16 |
| generic_vehicle | 119 |
| composite_fund_match | 1 |
| declared_na | 582 |
| unclassified_review | 258 |
| exact_fund_match | 229 |

## Highest Priority Rows

| Company | Firm | Current vehicle | Suggested | Action |
| --- | --- | --- | --- | --- |
| Aligned Data Centers | Macquarie Asset Management | MIP IV / MIP V and related vehicles | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| AlohaNAP | Harrison Street | Harrison Street Digital Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Alpha Generation (AlphaGen) | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Altius Renewable Royalties Corp. | Northampton | Royal Aggregator LP | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Amadeus Wind Project | Fengate Asset Management | Fengate Core Infrastructure Fund III | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Ambient Photonics | I Squared Capital | ISQ Global InfraTech Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| American Campus Communities (ACC) ASU P3 Portfolio | Harrison Street | Social Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Amp Energy | Carlyle Infrastructure | Carlyle Global Infrastructure Opportunity Fund / Renewable & Sustainable Energy Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Appalachian State University Innovation District Energy System | Harrison Street | Social Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Atlantic Aviation | KKR | KKR Global Infrastructure Investors IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Avports | Goldman Sachs Asset Management | West Street Infrastructure Partners III | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Bildmore Clean Energy | EnCap Investments | EnCap Energy Transition Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| BKV-CIP Joint Venture | Copenhagen Infrastructure Partners | Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Boingo Wireless | DigitalBridge | DigitalBridge Partners II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Bold Ocean / Schuyler Line Navigation | J.P. Morgan Asset Management | Global Transport Income Fund (GTIF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Capstone Infrastructure Corporation | iCON Infrastructure | iCON Infrastructure Partners III | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cartier Energy Holding | Vauban | Cartier Energy Fund SCS; Cartier Energy Fund II SCS | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Catalyze | Actis | Actis Energy 5 | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| CheckSammy | I Squared Capital | ISQ Global InfraTech Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Chicago CBD Data Center (CHIL2) | Harrison Street | Harrison Street Digital Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cirba Solutions | EQT Infrastructure | EQT Infrastructure V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| ClearCurrent | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Commonwealth LNG | Mubadala | Caturus / SoTex HoldCo | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| CoolCo (Cincinnati District Energy) | Harrison Street | Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Creative Energy | Instar | InstarAGF Essential Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cruise Terminals International | iCON Infrastructure | iCON Infrastructure Partners VI | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cypress Creek Renewables | EQT Infrastructure | EQT Infrastructure V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Delta Utilities | Bernhard Capital Partners | BCP Infrastructure Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Depot Connect International | KKR | KKR Global Infrastructure Investors IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Dobson Fiber | iCON Infrastructure | iCON Infrastructure Partners V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Duquesne Light Company | Manulife | Manulife Infrastructure Fund I / PGGM Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| EdgeConneX | EQT Infrastructure | EQT Infrastructure IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevate Renewables | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevation | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Epirus | I Squared Capital | ISQ Global InfraTech Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |

## Likely Exact-String Cleanup

These rows look like fund-list matches but will not link to `Fund` during seeding until the string is corrected.

| Company | Firm | Current vehicle | Suggested fundName | Action |
| --- | --- | --- | --- | --- |

## N/A And Generic Candidates

These are the rows most likely to need either `n.a.` normalization or a deliberate decision to keep generic transaction structure text.

| Company | Firm | Current vehicle | Suggested | Action |
| --- | --- | --- | --- | --- |
| Hudson Transmission Project | APG Infrastructure | Argo managed funds | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Hudson Transmission Project | Argo Infrastructure Partners | Argo managed funds | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Pueblo Airport Generating Station | Argo Infrastructure Partners | Argo Infrastructure Partners (Apollo) | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| National Water Infrastructure | Bernhard Capital Partners | BCP Infrastructure Fund I | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Beale Infrastructure | Blue Owl | Blue Owl Digital Infrastructure | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Dark Fiber and Infrastructure, LLC | Blue Owl | Blue Owl Digital Infrastructure | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| STACK Infrastructure | Blue Owl | Blue Owl Digital Infrastructure | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| I-4 Mobility Partners | Equitix | John Laing Investments Limited | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Oakland Corridor Partners | Equitix | John Laing Investments Limited | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Doug Meijer Medical Innovation Building | Harrison Street | Social Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| DRFortress | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Duquesne University Forbes Avenue Student Housing | Harrison Street | Social Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Union Station Data Center and Carrier Hotel | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Wyoming Data Center (CHWY1) | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Atlantic Power & Utilities | I Squared Capital | ISQ Global Infrastructure Fund II | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Neon Renewables | KKR | KKR Diversified Core Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| JVR Energy Park | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Peregrine Energy Storage Project | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Project Soho | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Stillhouse Solar Project | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Stella Wind Farm | Allianz Global Investors | Allianz Capital Partners (Tax Equity) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Arevon Energy, Inc. | APG Infrastructure | Clean Energy Infrastructure JV (APG, CalSTRS, ADIA) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Cross-Sound Cable Company, LLC | APG Infrastructure | Argo-managed AIA platform | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Hawaiʻi Gas | APG Infrastructure | Argo-managed AIA platform | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| I-66 Express Mobility Partners, LLC | APG Infrastructure | APG Infrastructure Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| LBJ Infrastructure Group, LLC | APG Infrastructure | Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| North Tarrant Express | APG Infrastructure | APG Infrastructure Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| SiFi Networks America Limited | APG Infrastructure | Smart City Infrastructure Fund (APG JV) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Arthur Kill Terminal | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Brightspeed | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Bullrock Energy Ventures | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Caledonia Generating LLC | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Capital Power U.S. Natural Gas JV | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Eagle Creek Renewable Energy | Apollo Global Management | Pending acquisition by Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| GFL Environmental Services | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Great Bay Renewables | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| DSD Renewables | Ares Management | Infrastructure and Power strategy | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Rover Pipeline | Ares Management | Infrastructure Opportunities strategy | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Astro Solar portfolio | Argo Infrastructure Partners | Argo managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| FleetLogix, Inc. | Argo Infrastructure Partners | Argo Managed Funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |

## Named Vehicles Missing From Fund Data

| Company | Firm | Current vehicle | Nearest/suggested | Action |
| --- | --- | --- | --- | --- |
| Catalyze | Actis | Actis Energy 5 | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Valia Energía | Actis | Actis Energy 5 | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Euryalus Solar Portfolio | Amber Infrastructure | US Solar Fund plc (USF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Granite Solar Portfolio | Amber Infrastructure | US Solar Fund plc (USF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Heelstone Solar Portfolio | Amber Infrastructure | US Solar Fund plc (USF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Milford Solar Project | Amber Infrastructure | US Solar Fund plc (USF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Olympos Solar Portfolio | Amber Infrastructure | US Solar Fund plc (USF) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Alpha Generation (AlphaGen) | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevate Renewables | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Gulf Coast Express Pipeline (GCX) | ArcLight Capital Partners | AL GCX Holdings LLC (Fund VIII) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Infinigen Renewables | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Inspiration Mobility Group | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| REC Solar | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Everfast Fiber Networks | Astatine Investment Partners | Astatine Investment Partners LLC | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| ClearCurrent | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Delta Utilities | Bernhard Capital Partners | BCP Infrastructure Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevation | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Green Meadow Sustainable Solutions | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Vopak Industrial Infrastructure Americas | BlackRock | Global Energy & Power Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Geronimo Power | Brookfield Asset Management | Brookfield Global Transition Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| HomeServe North America | Brookfield Asset Management | Brookfield Infrastructure Income Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Intel Arizona Joint Venture | Brookfield Asset Management | Brookfield Infrastructure Fund V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Ontario Wind | Brookfield Asset Management | Brookfield Infrastructure Income Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Scout Clean Energy | Brookfield Asset Management | Brookfield Global Transition Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| SH 130 Concession Company | Brookfield Asset Management | Brookfield Infrastructure Income Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Smoky Mountain Hydroelectric Facilities | Brookfield Asset Management | Brookfield Infrastructure Income Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Standard Solar | Brookfield Asset Management | Brookfield Global Transition Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Amp Energy | Carlyle Infrastructure | Carlyle Global Infrastructure Opportunity Fund / Renewable & Sustainable Energy Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| BKV-CIP Joint Venture | Copenhagen Infrastructure Partners | Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Helax Istmo | Copenhagen Infrastructure Partners | CI Growth Markets Fund II / CI Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| St. Charles Clean Fuels | Copenhagen Infrastructure Partners | Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Sunstone Power | Copenhagen Infrastructure Partners | CI Growth Markets Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Tenaska-CIP Joint Venture | Copenhagen Infrastructure Partners | Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Toqlukuti'k Wind & Hydrogen | Copenhagen Infrastructure Partners | Energy Transition Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Boingo Wireless | DigitalBridge | DigitalBridge Partners II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Switch, Inc. | DigitalBridge | DigitalBridge Partners II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Bildmore Clean Energy | EnCap Investments | EnCap Energy Transition Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cirba Solutions | EQT Infrastructure | EQT Infrastructure V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Cypress Creek Renewables | EQT Infrastructure | EQT Infrastructure V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| EdgeConneX | EQT Infrastructure | EQT Infrastructure IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |

## Needs-Work Concentration

| Investment firm | Rows |
| --- | --- |
| Axium Infrastructure | 42 |
| Harrison Street | 30 |
| Argo Infrastructure Partners | 26 |
| Ullico | 24 |
| Blackstone | 21 |
| EnCap Investments | 21 |
| CPP Investments | 20 |
| Generate Capital | 18 |
| Apollo Global Management | 15 |
| ArcLight Capital Partners | 14 |
| Copenhagen Infrastructure Partners | 14 |
| Equitix | 14 |
| Harbert Management Corp (Harbert Infra / Gulf Pacific) | 14 |
| Ares Management | 13 |
| I Squared Capital | 13 |

## Method Notes

- `exact_fund_match` requires exact string equality with `fund.fundName`.
- `normalized_fund_match` strips punctuation and whitespace only; these are high-confidence rename candidates.
- `near_miss_fund_match` uses edit distance, token overlap, and manager-name hints to surface likely typos or alias drift.
- `declared_na` means the field already follows the no-disclosed-fund convention.
- `probable_na` and `generic_vehicle` are review queues, not automatic edits.
- The full CSV includes all audited rows and evidence URLs for sorting/filtering the cleanup pass.
