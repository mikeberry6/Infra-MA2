# Primary Citation Source-Gap Review — 2026-07-22

> **REVIEW-ONLY CONTROL:** Every item in this document is **PENDING RESEARCH REVIEW**. No seed, database, company-merge, email, website, historical briefing, or other publication mutation is authorized. This artifact does not approve a citation backfill, data correction, merge, redirect, or publication change.

This review covers the 16 deal rows `INF-2026-080` through `INF-2026-095`, whose seed records currently have blank source fields, plus the proposed duplicate-company merge between `ExteNet Systems` and `Extenet`. It records candidate evidence and corrections for a human reviewer; it is not an implementation plan.

## Evidence classes

- **Authoritative primary — direct:** an announcement hosted by the buyer, seller, target, portfolio company, or other transaction party.
- **Authoritative primary — issuer wire:** a release issued by a transaction party and distributed through Business Wire or GlobeNewswire. The issuer, not the wire service, is the evidentiary source.
- **Authoritative primary — exchange filing:** a company filing hosted by a securities exchange; use this to resolve announcement and completion chronology when a corporate webpage conflicts.
- **Secondary fallback only:** independent reporting used only when no reliable public primary source was found. It must not be represented as first-party verification.

Publication dates below are source publication dates. They do not automatically determine the appropriate deal `date`; the reviewer must apply the repository's event-date convention consistently.

## Review register

| Record | Target | Best evidence class | Candidate source | Recommendation status |
|---|---|---|---|---|
| `INF-2026-080` | Reload | Authoritative primary — direct | Scale Microgrids, 2026-02-24 | **PENDING RESEARCH REVIEW** |
| `INF-2026-081` | Cleanwatts | Authoritative primary — direct | Verdane, 2026-02-24 | **PENDING RESEARCH REVIEW** |
| `INF-2026-082` | Andion CH4 Renewables | Authoritative primary — direct | Andion CH4, 2026-02-23 | **PENDING RESEARCH REVIEW** |
| `INF-2026-083` | Cella Dati Biomethane Plant | Authoritative primary — direct | Andion CH4, 2026-02-26 | **PENDING RESEARCH REVIEW** |
| `INF-2026-084` | HyCC | Authoritative primary — direct | Nobian, 2026-02-24 | **PENDING RESEARCH REVIEW** |
| `INF-2026-085` | 83 MW Indian Solar Energy Projects | Authoritative primary — direct | Digital Edge, 2026-02-26 | **PENDING RESEARCH REVIEW** |
| `INF-2026-086` | Masdar Portuguese Wind Portfolio | Authoritative primary — direct | Exus Renewables, 2026-02-25 | **PENDING RESEARCH REVIEW** |
| `INF-2026-087` | atNorth | Authoritative primary — direct | Equinix / CPP Investments and Partners Group, 2026-02-27 | **PENDING RESEARCH REVIEW** |
| `INF-2026-088` | Ori Industries | Authoritative primary — direct | Radiant, 2026-02-24 | **PENDING RESEARCH REVIEW** |
| `INF-2026-089` | Sandy Farms & Eternal Rings Data Centers | Authoritative primary — direct, with a two-party corroboration requirement | Harrison Street, 2026-02-26; GI Partners, 2026-03-04 | **PENDING RESEARCH REVIEW** |
| `INF-2026-090` | Skellefteå Data Center Site | Authoritative primary — direct | EdgeConneX, 2026-02-27 | **PENDING RESEARCH REVIEW** |
| `INF-2026-091` | Digital Sense | Authoritative primary — direct plus exchange filings with conflicting chronology | 11:11 Systems, 2026-02-22; Aussie Broadband / ASX, 2026-02-23 and 2026-06-15 | **PENDING RESEARCH REVIEW** |
| `INF-2026-092` | Macquarie AirFinance | Authoritative primary — direct | Dubai Aerospace Enterprise, 2026-02-26 | **PENDING RESEARCH REVIEW** |
| `INF-2026-093` | Lower Lakes Towing and six Canadian-flagged Lakers | Authoritative primary — issuer wire | Algoma Central Corporation, 2026-02-27 | **PENDING RESEARCH REVIEW** |
| `INF-2026-094` | 321 Precision Conversions | Authoritative primary — direct | 321 Precision Conversions / ATSG, 2026-02-24 | **PENDING RESEARCH REVIEW** |
| `INF-2026-095` | DTG Recycle | Secondary fallback only; no reliable public primary transaction source found | Waste Dive, 2026-02-23, updated 2026-02-24 | **PENDING RESEARCH REVIEW** |
| Company duplicate | `ExteNet Systems` / `Extenet` | Authoritative primary — direct | Extenet, 2022-12-15 | **PENDING RESEARCH REVIEW** |

## Deal-by-deal citation and correction review

### INF-2026-080 — Reload

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Scale Acquires Reload to Accelerate Power Delivery for the Next Generation of Data Centers”](https://www.scalemicrogrids.com/blog/scale-acquires-reload-to-accelerate-power-delivery-for-the-next-generation-of-data-centers) — Scale Microgrids, February 24, 2026.
- **Primary evidence:** Scale says it acquired Reload, describes Reload's gigawatt-scale data-center-campus and on-site-power capabilities, and identifies a material EQT capital commitment.
- **Required correction/caveat:** The seed date `2026-02-28` is not the announcement date and should be reviewed against `2026-02-24`. The source does not identify a seller, so `seller: "N/A"` must not be replaced by inference. The indirect attribution to EQT should remain expressed through Scale Microgrids.

### INF-2026-081 — Cleanwatts

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Verdane realises investment in Cleanwatts”](https://verdane.com/verdane-realises-investment-in-cleanwatts/) — Verdane, February 24, 2026.
- **Primary evidence:** Verdane says an infrastructure fund managed by DWS will obtain 100% ownership of Cleanwatts, with approximately €150 million of investment contemplated through 2030, and that Verdane realised its investment.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-24`. Verdane describes itself as the **former majority owner**, not necessarily the only seller; `seller: "Verdane"` may be incomplete and must not imply that Verdane held 100% immediately before the transaction without further evidence.

### INF-2026-082 — Andion CH4 Renewables

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Goldman Sachs Alternatives Backs Andion CH4 With €67 Million Private Credit Facility”](https://andionch4.com/goldman-sachs-alternatives-backs-andion-ch4-with-e67-million-private-credit-facility/) — Andion CH4, February 23, 2026.
- **Primary evidence:** Andion reports financial close of a €67 million Goldman Sachs Alternatives private-credit facility plus an equity contribution from existing shareholders led by Equitix.
- **Required correction/caveat:** `Acquisition (Minority Stake)` is not supported. The same release says Equitix had already been an Andion investor for several years. Review the row as a financing/equity-contribution event, including its title, category, buyer/stake semantics, and the seed date `2026-02-28` versus `2026-02-23`. Do not imply a new Equitix ownership acquisition unless another primary source establishes one.

### INF-2026-083 — Cella Dati Biomethane Plant

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“ACQUISITION OF THE CELLA DATI PLANT”](https://andionch4.com/acquisition-of-the-cella-dati-plant/) — Andion CH4, February 26, 2026.
- **Primary evidence:** Andion says it signed a binding agreement, subject to customary closing conditions, to acquire 100% of Cella Dati from IREN and SAR; it also states approximately 45 GWh of installed capacity and a planned expansion to 56 GWh.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-26`; `Announced` is consistent with the conditional agreement. The source uses the abbreviation `SAR`, so expansion to `Santini Agricoltura Rinnovabile` requires separate authoritative corroboration before publication.

### INF-2026-084 — HyCC

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Nobian and Macquarie Asset Management agree to sell their interest in the green hydrogen joint venture HyCC to Power2X”](https://www.nobian.com/news/nobian-and-macquarie-asset-management-agree-to-sell-their-interest-in-the-green-hydrogen-joint-venture-hycc-to-power2x) — Nobian, February 24, 2026.
- **Primary evidence:** Nobian directly confirms that it and Macquarie Asset Management agreed to sell their interests in HyCC to Power2X.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-24`. Keep the transaction at `Announced` unless a later primary completion source is approved. Confirm whether `country: "Europe"` should be normalized to the Netherlands or retained as a regional descriptor.

### INF-2026-085 — 83 MW Indian Solar Energy Projects

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Digital Edge Advances Sustainability Strategy with Renewable PPA and Industry-First Recycled Water Initiative in India”](https://www.digitaledgedc.com/resources/newsroom/digital-edge-india-83mw-solar-ppa-recycled-water-data-center/) — Digital Edge, February 26, 2026.
- **Primary evidence:** Digital Edge confirms an up-to-83-MW PPA with Hexa Climate Solutions and says Digital Edge India **will take** a substantial minority interest in the associated renewable projects to establish captive-user status.
- **Required correction/caveat:** The source does not support `Closed`, “acquired,” or Hexa as the seller of an existing stake. Review `status` to `Announced`, rewrite the title and description as a prospective minority investment paired with a PPA, and leave the seller unresolved unless a primary source identifies one. Review the seed date `2026-02-28` against `2026-02-26`.

### INF-2026-086 — Masdar Portuguese Wind Portfolio

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Exus Renewables to acquire stake in Masdar’s Portuguese wind portfolio”](https://www.exusrenewables.com/news/exus-renewables-to-acquire-stake-in-masdars-portuguese-wind-portfolio) — Exus Renewables, February 25, 2026.
- **Primary evidence:** Exus confirms an agreement to acquire 60% of nine Portuguese wind farms from Masdar, with Masdar retaining 40%, repowering from 144 MW to 164 MW, and planned 110 MW solar hybridization.
- **Required correction/caveat:** The transaction facts and `Announced` status are supported. Review only the seed date `2026-02-28` against the authoritative publication date `2026-02-25`; do not infer a closing date.

### INF-2026-087 — atNorth

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citations:** [“CPP Investments and Equinix to Acquire atNorth for US$4 Billion”](https://newsroom.equinix.com/2026-02-27-CPP-Investments-and-Equinix-to-Acquire-atNorth-for-US-4-Billion) — Equinix / CPP Investments, February 27, 2026; and [“Partners Group to sell atNorth for an EV of USD 4 billion”](https://www.partnersgroup.com/news-and-views/press-releases/investment-news/detail?news_id=064d4e79-30b6-4500-9a08-f7a65686f860) — Partners Group, February 27, 2026.
- **Primary evidence:** The joint buyer release confirms a US$4 billion enterprise value, CPP Investments' approximate 60% controlling interest and US$1.6 billion investment, Equinix's approximate 40% interest, and the provisional US$4.2 billion financing package. Partners Group separately confirms its plan to reinvest for up to 10%.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-27`. Clarify what `stake: "60%"` represents because it is CPP Investments' stated interest, not a complete expression of the joint acquisition and Partners Group reinvestment. Keep `Announced` pending completion evidence.

### INF-2026-088 — Ori Industries / Radiant

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Brookfield Launches Radiant as first vertically integrated AI Infrastructure Company Through Merger with Ori Industries”](https://radiant.co/press-release-launch) — Radiant, February 24, 2026.
- **Primary evidence:** Radiant identifies itself as a Brookfield AI Infrastructure Fund portfolio company and confirms its merger with Ori Industries, transition into operations, role as the fund's first compute deployment vehicle, and NVIDIA DSX-based infrastructure.
- **Required correction/caveat:** The primary source describes a **merger**, not a 100% buyout. It does not disclose the seed's US$1.3 billion valuation; that figure was reported by Reuters using unnamed sources. Review removal or quarantine of `equityValue: "$1.3bn"`, `stake: "100%"`, and `Acquisition (Buyout)` unless separately substantiated. Review the seed date `2026-02-28` against `2026-02-24`; separately source the fund's US$10 billion target if that figure remains in the description.

### INF-2026-089 — Sandy Farms and Emerson / Eternal Rings data centers

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citations:** [“Harrison Street Asset Management Sells Two Hyperscale Powered Shell Data Center Campuses in Maryland”](https://harrisonst.com/harrison-street-asset-management-sells-two-hyperscale-powered-shell-data-center-campuses-in-maryland/) — Harrison Street Asset Management, February 26, 2026; and [“GI Partners Acquires Two Baltimore-Area Data Centers”](https://www.gipartners.com/news/gi-partners-acquires-two-baltimore-area-data-centers) — GI Partners, March 4, 2026.
- **Primary evidence:** Harrison Street confirms the sale of two fully leased Maryland powered-shell campuses totaling more than 218,000 square feet and calls them `Emerson` and `Sandy Farms`. GI Partners confirms its completed acquisition of two data centers in Laurel and Severn.
- **Required correction/caveat:** The primary sources do not disclose the US$221.9 million price, the US$113.4 million Capital One loan, or use `Eternal Rings` as the asset name. Those details appear in property-data/trade reporting. Reconcile `Emerson` with the Laurel property on South Eternal Rings Drive and decide whether the target should use the official project name, address shorthand, or both. The seed date `2026-02-28` matches neither party's release; apply the event-date convention only after reviewing the reported February 24 closing date versus the February 26 seller and March 4 buyer announcements.

### INF-2026-090 — Skellefteå Data Center Site

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“EdgeConneX Looks to Enter Swedish Market as Part of European Data Center Expansion Strategy”](https://www.edgeconnex.com/news/press-releases/edgeconnex-looks-to-enter-swedish-market-as-part-of-european-data-center-expansion-strategy/) — EdgeConneX, February 27, 2026.
- **Primary evidence:** EdgeConneX says the Skellefteå site will be acquired from Lyten and could support a data-center campus of up to 1 GW, subject to administrative and regulatory processes.
- **Required correction/caveat:** `Announced` is supported; a completed acquisition is not. Review the seed date `2026-02-28` against `2026-02-27`. The release does not state `stake: "100%"`; verify or remove that field rather than inferring whole-site ownership from the acquisition language.

### INF-2026-091 — Digital Sense

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citations:** [“11:11 Systems Successfully Completes Acquisition of Digital Sense”](https://1111systems.com/resources/1111-systems-successfully-completes-acquisition-of-digital-sense/) — 11:11 Systems, February 22, 2026; [“ABB Half Year Results”](https://announcements.asx.com.au/asxpdf/20260223/pdf/06wls6jwmqr4jd.pdf) — Aussie Broadband via ASX, February 23, 2026; and [“Strategic Transactions and Trading Update”](https://announcements.asx.com.au/asxpdf/20260615/pdf/070mdngvmxms08.pdf) — Aussie Broadband via ASX, June 15, 2026.
- **Primary evidence:** The buyer page calls the transaction completed on February 22, but the seller's next-day ASX filing says only that an agreement had been entered into, subject to customary conditions. The June 15 ASX filing later confirms the divestment's recent completion.
- **Required correction/caveat:** Do not use the February 22 buyer page as unqualified proof of a February closing. Review `date` as the February 23 announcement date and preserve `Closed` only with the June 15 completion filing and an appropriate `closingDate` or milestone. The US/Australia time-zone difference does not resolve the substantive agreement-versus-completion conflict.

### INF-2026-092 — Macquarie AirFinance

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“DAE to Acquire Macquarie AirFinance Limited in an All-Cash Transaction”](https://dubaiaerospace.com/2026/02/26/dae-to-acquire-macquarie-airfinance-limited-in-an-all-cash-transaction/) — Dubai Aerospace Enterprise, February 26, 2026.
- **Primary evidence:** DAE confirms a definitive agreement to acquire 100% of Macquarie AirFinance for an approximate US$7 billion enterprise value, subject to customary conditions and regulatory approvals, with expected closing in the second half of 2026.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-26`. If `stake` records the transaction stake, `50%` is inconsistent with DAE's 100% acquisition and appears to describe only Macquarie Asset Management's holding. The DAE source does not identify the full seller consortium, so PGGM and Australian Retirement Trust ownership should be retained only with separate primary support.

### INF-2026-093 — Lower Lakes Towing and six Canadian-flagged Lakers

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Algoma Central Corporation Announces Agreement to Acquire Lower Lakes Fleet”](https://www.businesswire.com/news/home/20260224672359/en/Algoma-Central-Corporation-Announces-Agreement-to-Acquire-Lower-Lakes-Fleet) — Algoma Central Corporation via Business Wire, February 27, 2026.
- **Primary evidence:** Algoma confirms a definitive agreement to acquire Mainstay Maritime's three Canadian operating companies, including Lower Lakes, and six named Canadian-flagged vessels, subject to closing conditions.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-27`; `Announced` is supported. The release names Mainstay as the seller but does not establish the seed's `Oaktree (via Mainstay Maritime)` attribution, which requires separate primary ownership evidence.

### INF-2026-094 — 321 Precision Conversions

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“Erickson Acquires Full Ownership of 321 Precision Conversions”](https://www.atsginc.com/news-and-media/newsroom/year/2026/2026-02-24-erickson-acquires-321-precision) — 321 Precision Conversions, hosted by ATSG, February 24, 2026.
- **Primary evidence:** The target confirms that Erickson acquired ATSG's minority interest through Cargo Aircraft Management, giving Erickson full ownership.
- **Required correction/caveat:** Review the seed date `2026-02-28` against `2026-02-24`. This release does not quantify ATSG's minority interest as 49% or name Stonepeak as the seller; the exact percentage and `Stonepeak (via ATSG)` attribution require separate authoritative ownership evidence if retained.

### INF-2026-095 — DTG Recycle

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Secondary fallback:** [“Macquarie exits DTG Recycle with sales to founder, Waste Connections”](https://www.wastedive.com/news/macquarie-exits-dtg-recycle-with-sales-to-founder-waste-connections/812150/) — Waste Dive, February 23, 2026, updated February 24, 2026.
- **Secondary evidence:** Waste Dive reports that founder Dan Guimont repurchased the core operation and Waste Connections acquired selected Pierce County assets.
- **Required correction/caveat:** No reliable public primary transaction source was found. Waste Dive reports that Macquarie declined comment and Waste Connections did not respond, so the article cannot be labeled primary confirmation. Keep the primary-source gap open, do not treat `2026-02-28` as verified, and require reviewer approval before using this explicitly labeled secondary fallback or publishing the split-sale details as settled fact.

## Extenet duplicate-company review

### Proposed identity merge — `ExteNet Systems` and `Extenet`

- **Recommendation status:** **PENDING RESEARCH REVIEW**
- **Candidate primary citation:** [“ExteNet Systems is Now Extenet”](https://extenet.com/extenet-systems-is-now-extenet/) — Extenet, December 15, 2022.
- **Primary evidence:** The company explicitly states that ExteNet Systems rebranded as Extenet, establishing that the two names refer to the same continuing wireless and fiber infrastructure business.
- **Rows under review:** proposed survivor `ExteNet Systems` (`cmnva0mwt00elm8lz2xp3ijr4`) and proposed retired duplicate `Extenet` (`cmoqc0y7100vi171flkm8xuz4`).
- **Required correction/caveat:** Identity consolidation is supported, but no merge is authorized. Before approval, reconcile the conflicting founding years (2003 versus 2002), ownership records, investment years, milestones, sources, and current canonical display name. Because the primary source establishes `Extenet` as the post-2022 brand, the reviewer should decide whether the richer proposed survivor should be renamed after consolidation. Any later approved merge must preserve retired-ID resolution through the repository's canonical redirect and audit process.

## Human review gate

For each row, a research reviewer must record `APPROVE`, `REJECT`, or `REVISE`, their name, the review date, and a short rationale. Approval of a source does not automatically approve every existing seed fact supported only by secondary reporting. Approval of this document also does not authorize implementation: any seed, database, merge, redirect, or publication change requires a separate, explicit mutation instruction.
