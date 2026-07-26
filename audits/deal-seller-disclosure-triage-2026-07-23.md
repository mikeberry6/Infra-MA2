# Deal Seller-Disclosure Triage — 2026-07-23

> **REVIEW-ONLY CONTROL:** This document is a triage aid, not an approval artifact. It does not select `NOT_DISCLOSED` or `NOT_APPLICABLE`, approve a named seller, authorize publication, authorize a seed or database change, or authorize any historical weekly-email edit. Every record remains pending independent Research review. Do not pass this document to a remediation command or copy its classifications into an approval file without reviewing the complete current record and its source.

## Exact validation provenance

This review is bound only to:

- GitHub Actions [Release Gate run 30048515397](https://github.com/mikeberry6/Infra-MA2/actions/runs/30048515397);
- source head `bf05e5d582d795037c098ffb0fabb6b4e7705d20`;
- retained artifact `validation-evidence-30048515397`, artifact ID `8580178919`;
- artifact digest `sha256:8009e8e7870ec4d06cb862e9d4a292d923af42019ca115e23423d21b7dd15694`;
- reviewer-neutral template `deal-seller-disclosure-approval-template.json`;
- template SHA-256 `98a9dc011c6a245813eea82b729a4cd16da1e4e66c8ef3bf647d4b719832b923`; and
- template generation time `2026-07-23T22:04:06.970Z`.

The template contains 194 published Deals. All 194 `decisionStatus` values and all 194 `decisionReason` values are null. The candidate and source order is opaque-record order, not a recommendation.

Earlier handoff documents refer to a different validation run and template digest. They may provide research context, but they are not interchangeable with this exact template. Any eventual approval must be generated from, reviewed against, and cryptographically bound to the then-current template.

## Method and limitations

The retained snapshots, their source URLs, the checked-in Deal descriptions, and existing review-only audits were compared without changing any record. The buckets below prioritize the review queue:

1. structurally clean-looking absence-treatment candidates;
2. structurally complex rows that require transaction-model review;
3. rows whose checked-in evidence already names a seller or transfer counterparty;
4. remaining source-backed acquisition rows; and
5. rows whose retained snapshot contains no source.

The buckets are mutually exclusive and account for all 194 items:

| Triage bucket | Count |
| --- | ---: |
| Structurally clean-looking `NOT_APPLICABLE` candidates | 22 |
| Structurally complex non-sale-category rows | 11 |
| Named-seller or named-transfer-counterparty blockers | 35 |
| Remaining source-backed acquisition rows | 123 |
| No-source rows | 3 |
| **Total** | **194** |

The words “candidate,” “clean-looking,” and “blocker” are triage labels only. They are not Research decisions.

## Evidence-density warning

The template contains 436 citation snapshot rows. Those rows collapse to 196
per-Deal unique URL uses and 194 globally unique URLs:

- 186 Deals have one distinct URL;
- 5 Deals have two distinct URLs (`INF-2026-218`,
  `WB-2026-05-02-001`, `WB-2026-06-06-002`, `WB-2026-06-13-009`, and
  `WB-2026-06-27-001`);
- 3 Deals have no URL;
- every citation snapshot has `isPrimary: false`.

Repeated citation rows therefore do not provide independent corroboration.
Source presence also does not prove that a page supports every stored
transaction fact or the absence of a seller. Research must open each distinct
source, confirm that it applies to the exact Deal, and distinguish a primary
transaction source from secondary, profile, ownership, or milestone context.

## Bucket 1 — 22 structurally clean-looking candidates

These retained snapshots use only `JOINT_VENTURE`, `PLATFORM_LAUNCH`, or `IPO` categories and, on initial triage, do not describe a conventional transfer from a seller:

`INF-2026-008`, `INF-2026-010`, `INF-2026-069`, `INF-2026-105`, `INF-2026-106`, `INF-2026-122`, `INF-2026-131`, `INF-2026-162`, `INF-2026-195`, `INF-2026-207`, `INF-2026-221`, `INF-2026-222`, `WB-2026-05-16-002`, `WB-2026-05-16-006`, `WB-2026-05-16-010`, `WB-2026-06-06-011`, `WB-2026-06-13-001`, `WB-2026-06-13-002`, `WB-2026-06-13-010`, `WB-2026-06-27-007`, `WB-2026-07-03-011`, and `WB-2026-07-03-014`.

For each row, Research must still verify that:

- the source describes a primary issuance, new platform, new project, joint development, or IPO rather than an embedded secondary transfer;
- no selling shareholder, asset contributor, or transferor is identified;
- the stored category is accurate; and
- an evidence-specific reason supports `NOT_APPLICABLE`.

The two `WB-2026-07-03` snapshots are also affected by the ordinal-identity issue described below and must not be interpreted using current seed metadata.

## Bucket 2 — 11 structurally complex rows

These rows use only nominally non-sale categories, but the checked-in narrative contains an acquisition, merger, transfer, contribution, or other mixed structure. Seller treatment must wait for transaction-model and participant review.

| Legacy ID | Record | Reason for hold |
| --- | --- | --- |
| `INF-2026-078` | Truespeed & Freedom Fibre | Merger of two sponsor-backed businesses; counterparties and continuing holders must be modeled before treating seller as inapplicable. |
| `INF-2026-111` | Drogheda Energy Park | Joint-venture launch includes an inaugural project acquisition. |
| `INF-2026-156` | Mercia Power Response + Balance Power Projects | Platform was created through two majority acquisitions and a merger. |
| `INF-2026-180` | EdgeConneX | Narrative describes a transfer from EQT Infrastructure into a new strategy vehicle. |
| `INF-2026-189` | Saavi Energía & Grupo México Power Assets | Combination includes contributed power assets and changed ownership percentages. |
| `INF-2026-201` | i3 Broadband | Joint venture was formed to acquire an existing company. |
| `WB-2026-05-02-008` | Americold North American Cold Storage JV | Americold contributes facilities while EQT acquires a 70% interest. |
| `WB-2026-05-16-001` | Casa dos Ventos Renewable-Power Assets | Checked-in narrative is a long-term power-supply/self-production arrangement, not a straightforward joint-venture transaction. |
| `WB-2026-06-13-006` | SK Group Renewable Energy JV | Narrative includes a business-transfer agreement, asset acquisitions, and capital contributions. |
| `WB-2026-06-13-007` | Groupe Santé Sedna | Record is described as an equity investment and relies on an adviser LinkedIn post; transaction form and evidence quality require review. |
| `WB-2026-06-20-008` | CtrlS Datacenters | Record combines an 8.2% company stake with a 48% interest in a newly formed development platform. |

No missing-seller status is supportable for these rows until the underlying category, participant, and transfer mechanics are settled.

## Bucket 3 — 35 named-seller or transfer-counterparty blockers

The checked-in description or linked evidence already identifies the following seller or transfer counterparty. These names are research leads, not approved participants. Research must confirm the complete legal seller perimeter and source quality, add any approved seller through the editorial workflow, and regenerate the neutral template. The missing-seller remediation path must not be used to encode these records as `NOT_DISCLOSED` or `NOT_APPLICABLE`.

| Legacy ID | Record | Named seller or transfer counterparty | Evidence |
| --- | --- | --- | --- |
| `INF-2026-004` | 105 MW In-Construction Solar Project | Cordelio Power | [Altus Power issuer-wire release](https://www.businesswire.com/news/home/20260115191753/en/Altus-Power-Acquires-105MW-DC-of-In-Construction-Solar-Projects-from-Cordelio-Power) |
| `INF-2026-005` | 283 MW UK Solar PV Portfolio | Metlen | [Referenced sale report](https://inspenet.com/en/noticias/metlen-agrees-to-sell-283-mw-of-solar-power-to-schroders-greencoat-in-the-uk/) |
| `INF-2026-050` | iPark | Elliott Investment Management | [CVC release](https://www.cvc.com/media/news/2026/cvc-dif-to-acquire-leading-iberian-parking-infrastructure-platform-ipark-from-elliott-investment-management/) |
| `INF-2026-051` | Norwegian Travel Assets | Longship Fund I | [Longship exit announcement](https://www.longship.no/pressemelding/longship-fund-i-exits-norwegian-travels-gondola-and-rail-operations-to-leading-european-infrastructure-investor/) |
| `INF-2026-058` | Belambra | Caravelle | [Antin issuer-wire release](https://www.businesswire.com/news/home/20260213455568/en/Antin-Has-Entered-Into-Exclusive-Negotiations-With-CARAVELLE-to-Acquire-Belambra) |
| `WB-2026-05-02-002` | Air Liquide Biogas Assets | Air Liquide | [Air Liquide divestiture release](https://www.airliquide.com/group/press-releases-news/2026-05-04/air-liquide-divests-its-biogas-production-activities-four-countries) |
| `WB-2026-05-02-004` | 117 MWp Sicily Agrivoltaic Portfolio | Genertec International Holding | [Referenced transaction report](https://www.energiamercato.it/notizie/rinnovabili/verdian-progetti-agrivoltaici-sicilia) |
| `WB-2026-05-16-004` | Birdseye Battery Storage Project | Accelergen | [GridStor release](https://gridstor.com/gridstor-acquires-colorado-battery-energy-storage-project-from-accelergen/) |
| `WB-2026-05-16-007` | APF Energy | SWEN Capital Partners strategy / APF BV | [SWEN exit announcement](https://www.swen-cp.fr/en/blog/2026/05/19/first-exit-of-swift-2-schroders-capital-acquires-apf-energy/) |
| `WB-2026-05-16-009` | Equans Infra & Mobility / Velian | Equans | [DigitalBridge release](https://ir.digitalbridge.com/news-releases/news-release-details/aberdeen-investments-and-digitalbridge-acquire-equans-infra) |
| `WB-2026-05-16-011` | Kalmar Energi 50% Stake | E.ON Sverige | [Nordion announcement](https://www.mynewsdesk.com/se/nordion-energi/pressreleases/nordion-energi-foervaervar-eon-sveriges-aktier-i-kalmar-energi-och-ingaar-daermed-partnerskap-med-kalmar-kommun-3448627) |
| `WB-2026-05-16-012` | Seraya Partners Fund I Interest | AIIB | [GenZero announcement](https://genzero.co/genzero-acquires-stake-in-seraya-partners-fund-i-through-secondary-transaction/) |
| `WB-2026-05-23-002` | Maple Infrastructure Trust Units | La Caisse / CDPQ Infrastructures Asia III | [Government transaction notice](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2256396&lang=1&reg=3) |
| `WB-2026-05-23-006` | Stoneworthy BESS Project | RES | [Referenced transaction report](https://renewablesnow.com/news/eelpower-energy-buys-50-mw-battery-project-from-res-1295446/) |
| `WB-2026-05-23-007` | Cogent Fiber Data Center Portfolio | Cogent Fiber | [I Squared release](https://isquaredcapital.com/news/us-ai-inference-edge-colocation-data-center-platform/) |
| `WB-2026-05-23-010` | Estia Health | Bain Capital | [Stonepeak release](https://stonepeak.com/news/stonepeak-led-consortium-to-acquire-estia-health) |
| `WB-2026-06-06-003` | Enderby Battery Storage Project | Innova | [Fidra release](https://fidraenergy.com/fidra-energy-accelerates-uk-growth-with-acquisition-of-1gw-enderby-battery-storage-project-from-innova/) |
| `WB-2026-06-13-003` | Repsol Spanish Renewables Portfolio | Repsol | [Masdar release](https://masdar.ae/en/news/newsroom/repsol-and-masdar-to-partner-in-renewables-portfolio-in-spain) |
| `WB-2026-06-13-012` | A25 Concession | Transurban | [La Caisse release](https://www.lacaisse.com/en/news/pressreleases/caisse-become-sole-owner-a25-concession-acquiring-transurbans-remaining-stake) |
| `WB-2026-06-20-002` | LOGISTEC Marine Terminal Division | Blue Wolf Capital Partners | [Enstructure release](https://enstructure.com/enstructure-to-acquire-logistec-marine-terminal-division-creating-a-leading-network-of-marine-terminals-across-north-america/) |
| `WB-2026-06-20-006` | Greenlink Interconnector | Equitix | [Referenced transaction release](https://www.zawya.com/en/press-release/companies-news/mubadala-partners-with-equitix-to-invest-in-greenlink-hi8zzhl7) |
| `WB-2026-06-20-009` | Transcend Towers Infrastructure | American Tower | [Frontier Towers release](https://frontiertowersphilippines.com/news/frontier-completes-acquisition-of-american-towers-philippine-tower-portfolio/) |
| `WB-2026-06-20-012` | ThamesWey Central Milton Keynes | ThamesWey Energy | [Ancala release](https://ancala.com/ancala-backed-leep-utilities-acquires-milton-keynes-based-district-heating-and-electricity-network/) |
| `WB-2026-06-20-013` | Waste Eliminator / Liberty Waste Solutions | Allied Industrial Partners | [TPG release](https://www.tpg.com/news-and-insights/tpg-to-acquire-waste-eliminator-and-liberty-waste-solutions-from-allied-industrial-partners-to-create-a-sustainable-waste-infrastructure-player) |
| `WB-2026-06-27-005` | Yarnton BESS | Rivington Energy | [Rivington sale announcement](https://rivingtonenergy.co.uk/2026/06/rivington-energy-announces-sale-of-oxfordshire-battery-energy-storage-system/) |
| `WB-2026-06-27-006` | Gresham House UK Solar Portfolio | Gresham House Renewable Energy VCT 1 and VCT 2 | [True Green Capital announcement](https://www.truegreencapital.com/insights/operating-gresham-house) |
| `WB-2026-06-27-008` | Specialist Fleet Services | Paragon Banking Group | [Paragon market announcement](https://www.investegate.co.uk/announcement/rns/paragon-banking-group--pag/sale-of-vehicle-and-fleet-subsidiary-/9629300) |
| `WB-2026-07-10-004` | Schwarzholz Agri-PV Park | FEFA | [Referenced acquisition release](https://www.renewablepress.com/energy/press-release-8869-tion-renewables-acquires-operational-69-mwp-agri-pv-park-from-fefa) |
| `WB-2026-07-10-005` | NuGen C&I Solar Portfolio | NuGen | [Argo issuer-wire release](https://www.prnewswire.com/news-releases/argo-infrastructure-partners-acquires-solar-portfolio-from-and-establishes-new-partnership-with-owner-developer-nugen-302822094.html) |
| `WB-2026-07-10-009` | Kundl Campus Infrastructure & Site Services | Novartis | [INNEXIS release](https://www.innexis.com/innexis/press/latest-news/innexis-announces-further-site-acquisition-in-austria/) |
| `WB-2026-07-10-010` | Milestone Environmental | SK Capital | [I Squared release](https://isquaredcapital.com/news/acquisition-agreement-milestone-environmental/) |
| `WB-2026-07-10-014` | Helen EV Charging Business | Helen | [Plugit release](https://plugit.com/insights/plugit-is-acquiring-helens-charging-business/) |
| `WB-2026-07-17-001` | Sprng Energy | Shell | [Shell sale announcement](https://www.shell.com/news-and-insights/newsroom/news-and-media-releases/2026/shell-to-sell-sprng-energy-group.html) |
| `WB-2026-07-17-004` | Tuscania BESS Portfolio | Sphera Energy | [Sonnedix release](https://www.sonnedix.com/news/sonnedix-bolsters-hybrid-capabilities-in-italy-with-acquisition-of-260mw-battery-storage-portfolio) |
| `WB-2026-07-17-006` | ClearGen C&I Solar Portfolio | Tortoise Capital affiliates | [ClearGen issuer-wire release](https://www.businesswire.com/news/home/20260714806483/en/ClearGen-Acquires-19-MW-Portfolio-of-Operating-Distributed-Generation-Solar-Assets) |

Some linked pages are secondary or intermediary-hosted. A named party in this table must not be treated as an approved legal seller until Research confirms it against the best available transaction evidence and determines whether the named party is the complete seller group, an asset contributor, a continuing shareholder, or another counterparty.

## Bucket 4 — 123 remaining source-backed acquisition rows

This bucket is the exact residual set after excluding the 22, 11, 35, and 3
specifically enumerated buckets above. It contains 118 one-URL rows and the
five two-URL rows named in the evidence-density warning. Each row:

- has at least one citation snapshot and one or two distinct source URLs;
- is acquisition-coded in the retained snapshot;
- has no seller participant and no reviewed absence treatment; and
- was not conservatively classified above as an already named-seller blocker.

No batch status is supportable. For each record, Research must choose one path:

1. **Seller identified:** add the complete reviewed seller participant set through the editorial interface and regenerate this template.
2. **Seller genuinely omitted from applicable transaction evidence:** consider `NOT_DISCLOSED` with an evidence-specific reason.
3. **Seller does not apply to the actual transaction form:** correct any category or transaction facts first, regenerate, and then consider `NOT_APPLICABLE`.
4. **Evidence is inadequate or contradictory:** add or correct evidence through the editorial workflow and defer the seller decision.

Acquisition labels are not conclusive. Several checked-in rows describe preferred equity, tax equity, qualified institutional placements, funding rounds, co-investments, final investment decisions, mergers, or financial closes. Those underlying semantics must be resolved before seller treatment.

## Bucket 5 — 3 no-source rows

The retained snapshot contains no source for these records. Existing review-only research identifies possible evidence, but no seller decision can be bound to the current source-less snapshot. Evidence and any underlying fact corrections must be applied through the editorial workflow, followed by template regeneration.

| Legacy ID | Record | Existing review-only finding | Required next step |
| --- | --- | --- | --- |
| `INF-2026-080` | Reload | Scale confirms the acquisition but does not identify a seller; the stored date is also unsupported by the located announcement. | Review and add a primary citation, correct the date if approved, regenerate, then independently consider `NOT_DISCLOSED`. |
| `INF-2026-082` | Andion CH4 Renewables | Target, investor, and adviser sources describe debt financing and existing-shareholder equity, contradicting the stored minority-acquisition framing. | Correct or quarantine the transaction model before any seller treatment. |
| `INF-2026-088` | Ori Industries | Target and adviser evidence describes an all-equity merger with continuing investors, not a conventional buyout or identified seller. | Correct category, stake, valuation, date, status, and participant semantics as supported, then regenerate. |

Detailed evidence and reviewer questions remain in [Deal Seller-Disclosure Source-Gap Review — 2026-07-22](deal-seller-disclosure-source-gap-review-2026-07-22.md) and [Primary Citation Source-Gap Review — 2026-07-22](primary-citation-source-gap-review-2026-07-22.md). Those documents are also review-only.

## July 3 weekly ordinal drift

The `2026-07-03` weekly issue has ordinal Deal IDs that shifted when cards were inserted. The current generated projection and the retained database therefore reuse several identical `WB-2026-07-03-NNN` labels for different targets. Eight affected labels appear in this seller template: `-006`, `-008`, `-009`, `-011`, `-012`, `-014`, `-018`, and `-020`.

This audit does not select replacement IDs, change a historical email, resolve the five missing weekly records, or authorize a weekly synchronization. Treat each retained seller snapshot by its complete embedded identity, not by current seed data associated with the same ordinal label. Resolve weekly identity and publication questions separately under [Weekly Deal Publication Review — 2026-07-03](weekly-deal-publication-review-2026-07-03.md), then regenerate any seller template whose Deal identity, participants, sources, or facts changed.

## Required human-review sequence

1. Resolve upstream Deal-identity, transaction-model, and evidence corrections without editing historical weekly emails.
2. Add any source-supported named sellers through the reviewed editorial interface.
3. Regenerate the neutral seller template against the corrected isolated validation database.
4. Review every regenerated item independently and supply a specific reason for either `NOT_DISCLOSED` or `NOT_APPLICABLE`.
5. Commit only the completed canonical approval file at `audits/approvals/deal-seller-disclosures.json`, with exact reviewer identity, review time, and byte-level SHA-256.
6. Apply only through the protected, snapshot-bound validation workflow and rerun all publication, source, audit, and weekly-coverage gates.

This document itself must remain outside the approval path. It grants no mutation authority and records no final Research decision.
