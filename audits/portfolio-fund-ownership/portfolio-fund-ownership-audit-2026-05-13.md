# Portfolio Fund Ownership Audit - 2026-05-13

## Scope

This report checks every portfolio-company ownership record from `prisma/seed-data/companies.ts` against fund names in `prisma/seed-data/funds.ts`, the current Prisma-backed source equivalent in this repo. It does not edit seed data or live database records.

| Check | Count |
| --- | ---: |
| Portfolio companies | 1169 |
| Funds in fund data | 154 |
| Ownership rows audited | 1341 |
| Active ownership rows | 1336 |
| Rows sourced from owners[] | 1341 |
| Rows sourced from top-level fallback | 0 |

## Priority Counts

| Priority | Rows |
| --- | --- |
| fix | 2 |
| cleanup | 53 |
| review | 698 |
| ok | 588 |

## Match Status Counts

| Match status | Rows |
| --- | --- |
| missing_vehicle | 2 |
| normalized_fund_match | 0 |
| near_miss_fund_match | 53 |
| named_vehicle_missing_from_funds | 237 |
| probable_na | 18 |
| generic_vehicle | 116 |
| composite_fund_match | 0 |
| declared_na | 544 |
| unclassified_review | 327 |
| exact_fund_match | 44 |

## Highest Priority Rows

| Company | Firm | Current vehicle | Suggested | Action |
| --- | --- | --- | --- | --- |
| District Energy System | Harrison Street | (blank) | - | Add an ownershipVehicle or explicitly use n.a. |
| Edwards Sanborn 1A & 1B | Axium Infrastructure | (blank) | - | Add an ownershipVehicle or explicitly use n.a. |
| Alberta Schools Alternative Procurement I | Amber Infrastructure | International Public Partnerships | International Public Partnerships (INPP) | Review replacing ownershipVehicle with "International Public Partnerships (INPP)". |
| Aleatica, S.A.B. de C.V. | IFM Investors | IFM Global Infrastructure Fund | IFM Global Infrastructure Fund (GIF) | Review replacing ownershipVehicle with "IFM Global Infrastructure Fund (GIF)". |
| American Student Transportation Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| American Student Transportation Partners (ASTP) | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Amwaste LLC | 3i Infrastructure | 3i North American Infrastructure Fund | 3i NA Infrastructure Fund | Review replacing ownershipVehicle with "3i NA Infrastructure Fund". |
| Arcwood Environmental | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| CARMA Corp. | CVC DIF | DIF Infrastructure VIII | CVC DIF Infrastructure VIII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VIII". |
| Central Utility Block (Heartland Petrochemical Complex) | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Crown Castle Small Cells Solutions | EQT Infrastructure | EQT Active Core Infrastructure I | EQT Active Core I | Review replacing ownershipVehicle with "EQT Active Core I". |
| CyrusOne | KKR | KKR Global Infrastructure Investors | KKR Global Infrastructure Investors V | Review replacing ownershipVehicle with "KKR Global Infrastructure Investors V". |
| Diverso Energy Inc. | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Diverso Energy Inc. | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Durham Region Courthouse | Amber Infrastructure | International Public Partnerships | International Public Partnerships (INPP) | Review replacing ownershipVehicle with "International Public Partnerships (INPP)". |
| Eagle Railcar Services | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| EC Waste | 3i Infrastructure | 3i North American Infrastructure Fund | 3i NA Infrastructure Fund | Review replacing ownershipVehicle with "3i NA Infrastructure Fund". |
| Edmonton Valley Line LRT Southeast | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Fibernow | DigitalBridge | DigitalBridge Partners III | DigitalBridge Fund III | Review replacing ownershipVehicle with "DigitalBridge Fund III". |
| Fort St. James Green Energy Project | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Freeport Energy Center | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Freeport Power Limited | Fengate Asset Management | Fengate Infrastructure Fund | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Green Street Power Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| GS Power Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Hotwire Communications | Blackstone | Blackstone Infrastructure Partners | Blackstone Infrastructure Partners (BIP) | Review replacing ownershipVehicle with "Blackstone Infrastructure Partners (BIP)". |
| Indiana Toll Road | IFM Investors | IFM Global Infrastructure Fund | IFM Global Infrastructure Fund (GIF) | Review replacing ownershipVehicle with "IFM Global Infrastructure Fund (GIF)". |
| Jim Pattison Outpatient Care and Surgery Centre | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| JW Water Holdings (incl. Robson Utilities) | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Lambton College Residence | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Lazer Logistics | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| Lumos Fiber | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| Madison Energy Infrastructure | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| Merritt Biomass Plant | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| Morris Cogeneration Facility | Fengate Asset Management | Fengate Infrastructure Funds | Fengate Infrastructure Fund IV | Review replacing ownershipVehicle with "Fengate Infrastructure Fund IV". |
| MXT Holdings | Ardian | Ardian Americas Infrastructure Fund V | Ardian Americas Infrastructure Fund V (AAIF V) | Review replacing ownershipVehicle with "Ardian Americas Infrastructure Fund V (AAIF V)". |

## Likely Exact-String Cleanup

These rows look like fund-list matches but will not link to `Fund` during seeding until the string is corrected.

| Company | Firm | Current vehicle | Suggested fundName | Action |
| --- | --- | --- | --- | --- |
| Amwaste LLC | 3i Infrastructure | 3i North American Infrastructure Fund | 3i NA Infrastructure Fund | Review replacing ownershipVehicle with "3i NA Infrastructure Fund". |
| EC Waste | 3i Infrastructure | 3i North American Infrastructure Fund | 3i NA Infrastructure Fund | Review replacing ownershipVehicle with "3i NA Infrastructure Fund". |
| Regional Rail, LLC | 3i Infrastructure | 3i North American Infrastructure Fund | 3i NA Infrastructure Fund | Review replacing ownershipVehicle with "3i NA Infrastructure Fund". |
| Alberta Schools Alternative Procurement I | Amber Infrastructure | International Public Partnerships | International Public Partnerships (INPP) | Review replacing ownershipVehicle with "International Public Partnerships (INPP)". |
| Durham Region Courthouse | Amber Infrastructure | International Public Partnerships | International Public Partnerships (INPP) | Review replacing ownershipVehicle with "International Public Partnerships (INPP)". |
| Phoenix Renewables | ArcLight Capital Partners | ArcLight Infra Partners Fund VIII | ArcLight Infrastructure Partners Fund VIII | Review replacing ownershipVehicle with "ArcLight Infrastructure Partners Fund VIII". |
| Thunderbird Renewables | ArcLight Capital Partners | ArcLight Infra Partners Fund VIII | ArcLight Infrastructure Partners Fund VIII | Review replacing ownershipVehicle with "ArcLight Infrastructure Partners Fund VIII". |
| MXT Holdings | Ardian | Ardian Americas Infrastructure Fund V | Ardian Americas Infrastructure Fund V (AAIF V) | Review replacing ownershipVehicle with "Ardian Americas Infrastructure Fund V (AAIF V)". |
| Hotwire Communications | Blackstone | Blackstone Infrastructure Partners | Blackstone Infrastructure Partners (BIP) | Review replacing ownershipVehicle with "Blackstone Infrastructure Partners (BIP)". |
| Trans Bay Cable LLC | Brookfield Asset Management | Brookfield Super-Core Infra | Brookfield Super-Core Infrastructure Partners | Review replacing ownershipVehicle with "Brookfield Super-Core Infrastructure Partners". |
| American Student Transportation Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| American Student Transportation Partners (ASTP) | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| CARMA Corp. | CVC DIF | DIF Infrastructure VIII | CVC DIF Infrastructure VIII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VIII". |
| Diverso Energy Inc. | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Diverso Energy Inc. | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Green Street Power Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| GS Power Partners | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| JW Water Holdings (incl. Robson Utilities) | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| Robson Communities Utilities / Pima Utility | CVC DIF | DIF Infrastructure VII | CVC DIF Infrastructure VII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VII". |
| SBA Canada | CVC DIF | DIF Infrastructure VIII | CVC DIF Infrastructure VIII | Review replacing ownershipVehicle with "CVC DIF Infrastructure VIII". |
| Fibernow | DigitalBridge | DigitalBridge Partners III | DigitalBridge Fund III | Review replacing ownershipVehicle with "DigitalBridge Fund III". |
| Orange Barrel Media | DigitalBridge | DigitalBridge Partners III | DigitalBridge Fund III | Review replacing ownershipVehicle with "DigitalBridge Fund III". |
| Arcwood Environmental | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |
| Crown Castle Small Cells Solutions | EQT Infrastructure | EQT Active Core Infrastructure I | EQT Active Core I | Review replacing ownershipVehicle with "EQT Active Core I". |
| Eagle Railcar Services | EQT Infrastructure | EQT Infrastructure VI | EQT Infrastructure Fund VI | Review replacing ownershipVehicle with "EQT Infrastructure Fund VI". |

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
| JW Water Holdings | CVC DIF | DIF Infrastructure VII | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| I-4 Mobility Partners | Equitix | John Laing Investments Limited | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Oakland Corridor Partners | Equitix | John Laing Investments Limited | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Doug Meijer Medical Innovation Building | Harrison Street | Social Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| DRFortress | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Duquesne University Forbes Avenue Student Housing | Harrison Street | Social Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Union Station Data Center and Carrier Hotel | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Wyoming Data Center (CHWY1) | Harrison Street | Harrison Street Digital Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Atlantic Power & Utilities | I Squared Capital | ISQ Global Infrastructure Fund II | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Neon Renewables | KKR | KKR Diversified Core Infrastructure Fund | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| Sunrun Mars Holdings 2020, LLC | Manulife | Manulife Infrastructure Fund I | n.a. | Review normalizing ownershipVehicle to "n.a." if the source trail confirms no fund was disclosed. |
| JVR Energy Park | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Peregrine Energy Storage Project | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Project Soho | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Stillhouse Solar Project | Acadia Infrastructure Capital | Preferred Equity | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Stella Wind Farm | Allianz Global Investors | Allianz Capital Partners (Tax Equity) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Arevon Energy, Inc. | APG Infrastructure | Clean Energy Infrastructure JV (APG, CalSTRS, ADIA) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| I-66 Express Mobility Partners, LLC | APG Infrastructure | APG Infrastructure Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| LBJ Infrastructure Group, LLC | APG Infrastructure | Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| North Tarrant Express | APG Infrastructure | APG Infrastructure Pool (Consortium with Cintra & Meridiam) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| SiFi Networks America Limited | APG Infrastructure | Smart City Infrastructure Fund (APG JV) | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Brightspeed | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Bullrock Energy Ventures | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Caledonia Generating LLC | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Capital Power U.S. Natural Gas JV | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| GFL Environmental Services | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Great Bay Renewables | Apollo Global Management | Apollo-managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Astro Solar portfolio | Argo Infrastructure Partners | Argo managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| FleetLogix, Inc. | Argo Infrastructure Partners | Argo Managed Funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| INDIGO Park Canada Inc. | Argo Infrastructure Partners | Argo Managed Funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| LAZ Parking | Argo Infrastructure Partners | Argo managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Mobile Energy LLC | Argo Infrastructure Partners | Argo managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |
| Oneta Power | Argo Infrastructure Partners | Argo managed funds | n.a. | Review whether this generic structure should remain as-is or become "n.a.". |

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
| Empire Access | Antin Infrastructure Partners | Mid Cap Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| FirstLight Fiber | Antin Infrastructure Partners | Flagship Fund III | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Lake State Railway Company | Antin Infrastructure Partners | Mid Cap Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Origis Energy | Antin Infrastructure Partners | Flagship Fund IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Vicinity Energy | Antin Infrastructure Partners | Flagship Fund IV | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Vigor Marine Group | Antin Infrastructure Partners | Flagship Fund V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| FirstDigital Telecom, LLC | Apollo Global Management | Apollo Infrastructure Opps. Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| IonicBlue | Apollo Global Management | Apollo Infrastructure Opps. Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Modern Aviation | Apollo Global Management | Apollo Infrastructure Opps. Fund III | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| US Wind | Apollo Global Management | Apollo Infrastructure Opps. Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Alpha Generation (AlphaGen) | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevate Renewables | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Gulf Coast Express Pipeline (GCX) | ArcLight Capital Partners | AL GCX Holdings LLC (Fund VIII) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Infinigen Renewables | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Inspiration Mobility Group | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| REC Solar | ArcLight Capital Partners | ArcLight Energy Partners Fund VII | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Dauntless Energy | Ardian | Ardian Americas Infrastructure Fund IV (AAIF IV) | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Everfast Fiber Networks | Astatine Investment Partners | Astatine Investment Partners LLC | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| ClearCurrent | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Delta Utilities | Bernhard Capital Partners | BCP Infrastructure Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Elevation | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Green Meadow Sustainable Solutions | Bernhard Capital Partners | BCP Infrastructure Fund I | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| New Mexico Gas Company | Bernhard Capital Partners | BCP Infrastructure Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| CleanCapital Holdings, LLC | BlackRock | Global Renewable Power Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Excelsior U.S. Solar & Storage Portfolio | BlackRock | Evergreen Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Lighthouse | BlackRock | Evergreen Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Vopak Industrial Infrastructure Americas | BlackRock | Global Energy & Power Infrastructure Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| California Bioenergy | Brookfield Asset Management | Brookfield Global Transition Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Carbon TerraVault | Brookfield Asset Management | Brookfield Global Transition Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Entropy Inc. | Brookfield Asset Management | Brookfield Global Transition Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Geronimo Power | Brookfield Asset Management | Brookfield Global Transition Fund II | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| HomeServe North America | Brookfield Asset Management | Brookfield Infrastructure Income Fund | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |
| Intel Arizona Joint Venture | Brookfield Asset Management | Brookfield Infrastructure Fund V | - | Review whether to add this fund to prisma/seed-data/funds.ts, add an alias, or correct the ownershipVehicle. |

## Needs-Work Concentration

| Investment firm | Rows |
| --- | --- |
| Axium Infrastructure | 43 |
| Harrison Street | 32 |
| CVC DIF | 31 |
| Argo Infrastructure Partners | 27 |
| Macquarie Asset Management | 25 |
| Ullico | 24 |
| Fengate Asset Management | 23 |
| Manulife | 23 |
| Blackstone | 22 |
| CPP Investments | 21 |
| EnCap Investments | 21 |
| Apollo Global Management | 20 |
| Copenhagen Infrastructure Partners | 19 |
| Generate Capital | 18 |
| ArcLight Capital Partners | 16 |

## Method Notes

- `exact_fund_match` requires exact string equality with `fund.fundName`.
- `normalized_fund_match` strips punctuation and whitespace only; these are high-confidence rename candidates.
- `near_miss_fund_match` uses edit distance, token overlap, and manager-name hints to surface likely typos or alias drift.
- `declared_na` means the field already follows the no-disclosed-fund convention.
- `probable_na` and `generic_vehicle` are review queues, not automatic edits.
- The full CSV includes all audited rows and evidence URLs for sorting/filtering the cleanup pass.
