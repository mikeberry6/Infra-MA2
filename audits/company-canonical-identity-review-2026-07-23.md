# Company Canonical Identity Review — 2026-07-23

## Control status and evidence binding

> **REVIEW ONLY — NOT AN APPROVAL.** This document records research
> recommendations for human review. It does not authorize a canonical merge,
> select primary citations, modify an approval artifact, or permit a database
> mutation.

| Evidence field | Bound value |
|---|---|
| GitHub Actions run | `30048515397` |
| Source head | `bf05e5d582d795037c098ffb0fabb6b4e7705d20` |
| Validation artifact ID | `8580178919` |
| Validation artifact ZIP SHA-256 | `8009e8e7870ec4d06cb862e9d4a292d923af42019ca115e23423d21b7dd15694` |
| Company merge template SHA-256 | `2a086d40e0eb42c39aa0cc890ea121764d0cae3427f86334d8e9c254549a7c7c` |
| Company merge template generated at | `2026-07-23T22:04:04.152Z` |
| Company merge template scope | `ALL_COMPANY_RECORD_STATUSES` |
| Artifact template state | 21 clusters, 43 candidate rows, all decisions `null` |

Run `30048515397` is an evidence-bearing failed validation run, not a passing
release attestation. Its retained company template and canonical review were
inspected read-only. The artifact's migration-lineage check reported
`retired_lineage_schema_equivalent`, `schemaEquivalent: true`, and
`mutated: false`.

This Markdown file is deliberately outside
`audits/approvals/company-merges.json`. It is not schema-valid merge approval
input, has no reviewer identity or approval timestamp, and does not satisfy the
hash-bound controls in `scripts/merge-duplicate-companies.ts`. No Deal, Fund,
or Company seed record, approval file, validation database, Preview database,
or Production database was changed while preparing this review.

## Review outcome

| Recommended disposition | Clusters | Meaning |
|---|---:|---|
| `MERGE` | 16 | Identity is supported, subject to the stated survivor, field corrections, regenerated snapshots, and formal human approval. |
| `KEEP_SEPARATE` | 3 | Evidence supports distinct legal, geographic, or transaction perimeters. No ID should be retired. |
| `NEEDS_MORE_EVIDENCE` | 2 | A merge may be plausible, but the current record set or entity scope is insufficient for an executable decision. |
| **Total** | **21** | **All clusters from the bound artifact are addressed below.** |

The recommendations are research conclusions, not execution instructions.
Every eventual merge still requires a freshly generated template, exact
candidate snapshots, a named Research reviewer, a review timestamp, the
reviewed file's SHA-256, Engineering review of the transaction plan, and the
normal target/release mutation guards.

## Expected detector result after the pending code fix

The retained artifact remains the authoritative record of what run
`30048515397` detected: **21 clusters / 43 candidate rows**. A narrowly scoped
candidate-key correction has since been prepared in the working tree, but it
has not been run against the validation database and is not attested by the
bound artifact.

Based solely on the corrected key semantics, the next all-status report is
expected to contain **18 clusters / 38 candidate rows**:

1. `AlphaGen` normalizes to `Alpha Generation`, so the previously omitted
   singleton `cmnva0ynx00xtm8lzu5aakvr6` should join the two-row Alpha
   Generation cluster. That cluster should contain three candidates.
2. Geographic parentheticals such as `(US)`, `(U.S.)`, and
   `(United States)` remain identity-defining, so the two Boldyn records should
   no longer form a candidate cluster.
3. Parentheticals ending in `JV` remain identity-defining, so the Montecito JV
   and MedCraft JV medical portfolios should no longer form a candidate
   cluster.
4. The curated Puget alias is removed, so
   `Puget Energy / Puget Sound Energy` should no longer cluster with the
   operating utility solely because of that alias.
5. Intended alias and former-name matching remains in place for ASTP, DCLI,
   GCX, TEN, and Skyservice US.

The expected 18 clusters comprise the **16 recommended merges** plus the
**Alpha Generation** and **JW Water / Robson** evidence blockers. This is an
expected code-level result, not a database-attested fact. It must be confirmed
by rerunning the report against the intended validation lineage and retaining
the new report, template, digest, and run metadata.

## Exact disposition and ID plan

`Provisional` below means that the IDs are the expected plan only if the
identified evidence blocker is resolved. It is not permission to retire those
records.

| # | Cluster | Recommendation | Recommended survivor or retained IDs | Recommended retired IDs |
|---:|---|---|---|---|
| 1 | Alpha Generation | `NEEDS_MORE_EVIDENCE` | Provisional survivor: `cmnva0slh00nmm8lzew8x0vm3` | Provisional only: `cmoqbxfm6004k171f6yqbqr3i`, `cmnva0ynx00xtm8lzu5aakvr6` |
| 2 | American Student Transportation Partners | `MERGE` | `cmnva0yw700y8m8lz066tfhwl` | `cmoqbyrxz00ep171f0j0xkh9o` |
| 3 | Boldyn Networks | `KEEP_SEPARATE` | Retain `cmnva0nf200fgm8lzckud2zgk` and `cmoqbx3az001x171fmlp3rf24` | None |
| 4 | Cleco | `MERGE` | `cmnva0ng800fim8lz95b1no81` | `cmoqbxwj50084171fwym9a80l` |
| 5 | Coastal GasLink | `MERGE` | `cmnva0psl00jcm8lzi01srw0p` | `cmoqc06f300pj171fz77p460g` |
| 6 | Convergent Energy and Power | `MERGE` | `cmoqbyx6l00fv171f32ezu2ch` | `cmnva0o2700ghm8lzwp37rpx9` |
| 7 | CoolCo | `MERGE` | `cmnva12qt0152m8lzwh32rl0d` | `cmoqbzq6100m1171fx36pzrsj` |
| 8 | Direct ChassisLink | `MERGE` | `cmnva0qc300k8m8lz0ukvcrlw` | `cmoqbzgu500k1171fs4ccuw39` |
| 9 | Extenet | `MERGE` | `cmoqc0y7100vi171flkm8xuz4` | `cmnva0mwt00elm8lz2xp3ijr4` |
| 10 | GCT Global Container Terminals | `MERGE` | `cmoqbxwza0088171ffl39qhda` | `cmoqc0put00tn171ffyt56gok`, `cmnva13lf016gm8lz8ws9mnx2` |
| 11 | Gulf Coast Express Pipeline | `MERGE` | `cmnva0rsh00m5m8lzrh4iikgq` | `cmoqbxg4x004p171fzy5wwte4` |
| 12 | JW Water / Robson Utilities | `NEEDS_MORE_EVIDENCE` | No executable choice. If a unified platform is proven, provisional survivor: `cmnva0z1n00yim8lzbh3yfx1c`; otherwise retain both IDs and correct the aggregate row. | Provisional only if unified: `cmoqbytnp00f3171fjyn934yg` |
| 13 | Landmark Dividend | `MERGE` | `cmoqbx33h001v171f207gs2e3` | `cmnva0zyr0105m8lz7mzz7ea2` |
| 14 | Luminace | `MERGE` | `cmoqby8li00ao171flqpuqq6j` | `cmnva0nyo00gbm8lz6vln8d8d` |
| 15 | Northview Energy | `MERGE` | `cmoqbxxhq008d171ffvxr3rv9` | `cmnva0xvs00wgm8lzqdgowwv1` |
| 16 | Pattern Energy | `MERGE` | `cmnva0stf00nzm8lz2pthnja0` | `cmoqbyqsa00ef171fswry13u5` |
| 17 | Pearl/Ruby Solar Portfolio | `MERGE` | `cmnva0tjn00p9m8lz7d3k3svi` | `cmoqbxnxb006a171fwojc3elz` |
| 18 | Puget | `KEEP_SEPARATE` | Retain `cmnva0pnm00j4m8lzk4vmiuoa` and `cmnva0pr700jam8lzjb1yb2n1` | None |
| 19 | Skyservice US | `MERGE` | `cmoqc03lb00ow171fge71941i` | `cmnva0ols00hem8lz203dcggi` |
| 20 | Transportation Equipment Network | `MERGE` | `cmnva0pwi00jjm8lzomcojs56` | `cmoqbzvsz00n9171f6oiy98aw` |
| 21 | U.S. Medical Outpatient Facilities Portfolios | `KEEP_SEPARATE` | Retain `cmnva11ml0133m8lzhltgjdef` and `cmoqbzd9p00j9171fy63wi359` | None |

## Cluster findings, evidence, and caveats

### 1. Alpha Generation — `NEEDS_MORE_EVIDENCE`

The bound template includes only Alpha Generation, LLC
(`cmnva0slh00nmm8lzew8x0vm3`) and Alpha Generation (AlphaGen)
(`cmoqbxfm6004k171f6yqbqr3i`). The same artifact's citation inventory and the
versioned seed manifest also contain AlphaGen
(`cmnva0ynx00xtm8lzu5aakvr6`), tied to CPP Investments. The official
[AlphaGen profile](https://www.alphagen.com/about-us/) and
[portfolio page](https://www.alphagen.com/portfolio/) support operating
continuity. The
[2024 platform-formation release](https://www.alphagen.com/newsroom/press-releases/arclight-creates-alphagen-to-manage-one-of-the-largest-power-infrastructure-portfolios-in-the-united-states/),
[ADIA investment announcement](https://www.prnewswire.com/news-releases/arclight-announces-500mm-investment-by-a-wholly-owned-subsidiary-of-adia-in-11-gw-alphagen-power-infrastructure-platform-302348464.html),
and
[CPP Investments announcement](https://www.cppinvestments.com/newsroom/arclight-announces-us1-0-billion-investment-by-cpp-investments-in-alphagen/)
all refer to the AlphaGen platform.

The three-row identity case is strong, but the current two-row artifact cannot
authorize a partial merge. Regenerate the cluster with all three snapshots and
verify closing status and the current ownership/capitalization record for the
announced minority investments. If confirmed, use
`cmnva0slh00nmm8lzew8x0vm3` as the provisional legal-name survivor and redirect
both other IDs.

### 2. American Student Transportation Partners — `MERGE`

Keep American Student Transportation Partners (ASTP)
(`cmnva0yw700y8m8lz066tfhwl`) and retire the unabbreviated duplicate
(`cmoqbyrxz00ep171f0j0xkh9o`). The company uses both the full name and ASTP on
its [official profile](https://astpartners.com/about-astp/). The
[CVC DIF acquisition announcement](https://www.cvc.com/media/news/2025/cvc-dif-agrees-to-acquire-premier-us-student-transportation-operator-astp-from-access-holdings/)
and
[Access Holdings sale announcement](https://www.prnewswire.com/news-releases/access-holdings-announces-sale-of-american-student-transportation-partners-to-cvc-dif-302526686.html)
refer to the same operating company. No material identity gap remains.

### 3. Boldyn Networks — `KEEP_SEPARATE`

Retain Boldyn Networks (US) (`cmnva0nf200fgm8lzckud2zgk`) and Boldyn Networks
(`cmoqbx3az001x171fmlp3rf24`) with no redirect. The
[Manulife investment release](https://www.manulifeim.com/institutional/global/en/about-us/press-releases/cpp-investments-aimco-and-manulife-im-increase-commitment-to-boldyn-networks-to-support-continued-growth-in-the-us)
and the matching
[AIMCo disclosure](https://www.aimco.ca/insights/boldyn-networks-investment)
distinguish CPP Investments' and AIMCo's ownership in the global Boldyn
platform from Manulife's minority interest in Boldyn's U.S. digital
infrastructure assets. Boldyn's
[U.S. profile](https://www.boldyn.com/us/about-us) also describes the broader
global group.

The records should be renamed or scoped to precise legal investment perimeters
when those names are sourced. Until then, merging would incorrectly imply that
the U.S.-asset investor owns the global parent on the same basis.

### 4. Cleco — `MERGE`

Keep Cleco Corporate Holdings LLC (`cmnva0ng800fim8lz95b1no81`) and retire
Cleco Corporation (`cmoqbxwj50084171fwym9a80l`). This reverses the artifact's
automatically proposed survivor. Cleco's
[company history](https://www.cleco.com/about/history),
[executive roster](https://www.cleco.com/about/leadership-governance/executive-officers),
and
[official brand guide](https://www.cleco.com/docs/default-source/communications-/cleco-brand-guide-digital-%28updated-september-2024%29.pdf?sfvrsn=2bc2a_1)
support the current holding-company name and succession from Cleco
Corporation. The
[2016 acquisition close](https://www.cleco.com/media/press-releases/detail/2016/04/13/north-american-led-investor-group-completes-acquisition-of-cleco)
supports ownership continuity.

The pending 2026 sale should be verified separately; it does not alter the
historical identity conclusion.

### 5. Coastal GasLink — `MERGE`

Keep Coastal GasLink Pipeline Project (`cmnva0psl00jcm8lzi01srw0p`) and retire
Coastal GasLink Pipeline (`cmoqc06f300pj171fz77p460g`). The
[project profile](https://www.coastalgaslink.com/about/),
[project FAQ](https://www.coastalgaslink.com/about/faqs/), and
[TC Energy operating page](https://www.tcenergy.com/operations/natural-gas/coastal-gaslink/)
describe the same pipeline. The
[2020 monetization and financing close](https://www.coastalgaslink.com/whats-new/news-stories/2020/tc-energy-completes-partial-monetization-and-project-financing-transactions-for-coastal-gaslink/)
confirms the investment history attached to the richer record. Current owner
percentages may be refreshed separately but do not block the identity merge.

### 6. Convergent Energy and Power — `MERGE`

Keep the richer record `cmoqbyx6l00fv171f32ezu2ch` and retire
`cmnva0o2700ghm8lzwp37rpx9`. The official
[company site](https://convergentep.com/),
[company history](https://convergentep.com/our-story/),
[ECP acquisition announcement](https://www.ecpgp.com/about/news-and-insights/press-releases/2019/energy-capital-partners-acquires-convergent-energy-power),
and [ECP portfolio page](https://www.ecpgp.com/equity/portfolio/convergent)
support one company.

Before approval, resolve the canonical meaning of `country` versus operating
footprint. The candidates currently say United States and North America, while
the operating record reaches beyond one scalar jurisdiction. Correct the
survivor's nonblank geography and description first, then regenerate its
snapshot.

### 7. CoolCo — `MERGE`

Keep CoolCo (`cmnva12qt0152m8lzwh32rl0d`) and retire CoolCo (Cincinnati
District Energy) (`cmoqbzq6100m1171fx36pzrsj`). The
[official site](https://coolco.com/),
[company profile](https://coolco.com/about-us/), and
[chilled-water service page](https://coolco.com/chilled-water-services/)
describe the same Cincinnati district-cooling system and history.

Reconcile the generic `Infrastructure Fund` ownership vehicle against the
survivor's `n.a.` value before final verification. The field discrepancy does
not undermine entity identity.

### 8. Direct ChassisLink — `MERGE`

Keep Direct ChassisLink, Inc. (`cmnva0qc300k8m8lz0ukvcrlw`) and retire Direct
ChassisLink Inc. (DCLI) (`cmoqbzgu500k1171fs4ccuw39`). DCLI's
[official profile](https://dcli.com/about-us/), the
[OMERS acquisition announcement](https://www.omers.com/news/gic-omers-infrastructure-and-wren-house-to-acquire-direct-chassislink-inc),
and the
[Wren House announcement](https://www.whinfra.com/gic-omers-infrastructure-and-wren-house-to-acquire-direct-chassislink-inc/)
all support one operating platform. No material identity gap remains.

### 9. Extenet — `MERGE`

Keep the current-brand record Extenet (`cmoqc0y7100vi171flkm8xuz4`) and retire
ExteNet Systems (`cmnva0mwt00elm8lz2xp3ijr4`). This reverses the artifact's
automatically proposed survivor. The official
[rebrand notice](https://extenet.com/extenet-systems-is-now-extenet/) directly
supports continuity. The older record's
[company profile](https://extenet.com/about-us/),
[DigitalBridge portfolio page](https://www.digitalbridge.com/portfolio/extenet-systems),
and
[recapitalization close](https://www.prnewswire.com/news-releases/chicago-region-extenet-systems-completes-recapitalization-300180129.html)
provide the historical operating and ownership evidence.

The current-brand row had no candidate citation in the bound pre-merge
template. Add and formally review the rebrand evidence after consolidation,
and reconcile founded-year and ownership-field differences before publication.

### 10. GCT Global Container Terminals — `MERGE`

Keep GCT Global Container Terminals Inc. (`cmoqbxwza0088171ffl39qhda`) and
retire `cmoqc0put00tn171ffyt56gok` and `cmnva13lf016gm8lz8ws9mnx2`. This
reverses the artifact's proposed Canada/U.S. survivor in favor of the
legal-name record with current management and Canada scope. GCT's
[current company profile](https://globalterminals.com/about/about-us/),
[leadership page](https://globalterminals.com/about/leadership/), and
[ownership announcement](https://globalterminals.com/ifm-investors-bci-join-ontario-teachers-equity-partners-gct-global-container-terminals-inc/)
support the current business and the disclosed 37.5% Ontario Teachers',
37.5% IFM, and 25% BCI structure. The
[Ontario Teachers' announcement](https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ifm-investors-and-bci-to-join-ontario-teachers-as-equity-partners-in-gct-global-container-terminals-inc-/)
uses the legal company name.

Keep the historical U.S. footprint or divestiture in milestones rather than in
a stale current-country scalar. Confirm the final canonical description and
geography before regenerating the three candidate snapshots.

### 11. Gulf Coast Express Pipeline — `MERGE`

Keep Gulf Coast Express Pipeline LLC (`cmnva0rsh00m5m8lzrh4iikgq`) and retire
Gulf Coast Express Pipeline (GCX) (`cmoqbxg4x004p171fzy5wwte4`). This reverses
the artifact's automatically proposed survivor. The
[Kinder Morgan operating page](https://www2.kindermorgan.com/Operations/Natural-Gas/Index),
[Phillips 66 sale announcement](https://investor.phillips66.com/financial-information/news-releases/news-release-details/2024/Phillips-66-announces-agreement-to-sell-interest-in-Gulf-Coast-Express/default.aspx),
[ArcLight acquisition close](https://www.prnewswire.com/news-releases/arclight-announces-865-million-acquisition-of-strategic-pipeline-interest-302365746.html),
and [Mubadala portfolio page](https://www.mubadala.com/en/what-we-do/gulf-coast-express)
refer to the same pipeline.

The full current non-Kinder Morgan ownership split and exact Mubadala vehicle
remain useful provenance work, but they do not block the identity merge.

### 12. JW Water / Robson Utilities — `NEEDS_MORE_EVIDENCE`

The bound cluster pairs JW Water Holdings (including Robson Utilities)
(`cmnva0z1n00yim8lzbh3yfx1c`) with JW Water Holdings
(`cmoqbytnp00f3171fjyn934yg`). The
[CVC DIF acquisition announcement](https://www.cvc.com/media/news/2024/2024-11-21-cvc-dif-acquires-a-portfolio-of-us-regulated-water-and-wastewater-utilities/)
describes JW Water and a separate portfolio of Robson utilities. The
[transaction counsel summary](https://www.pillsburylaw.com/en/news-and-insights/cvc-dif-strategic-acquisition-arizona-water-wastewater-sector.html)
and
[industry research summary](https://www.bluefieldresearch.com/research/pe-firm-cvc-lands-deal-in-arizona-utility-market/)
do not establish that Robson was legally folded into JW Water.

Obtain a post-close organization chart, regulatory order, or company disclosure
that establishes the operating/legal platform. If one unified platform is
proven, provisionally keep `cmnva0z1n00yim8lzbh3yfx1c` and retire
`cmoqbytnp00f3171fjyn934yg`. If it is not, retain both and rename or split the
aggregate record so it does not imply unsupported legal consolidation.

### 13. Landmark Dividend — `MERGE`

Keep Landmark Dividend LLC (`cmoqbx33h001v171f207gs2e3`) and retire Landmark
Dividend (`cmnva0zyr0105m8lz7mzz7ea2`). The
[company site](https://www.landmarkdividend.com/),
[business profile](https://www.landmarkdividend.com/what-we-do),
[ADIA investment close](https://ir.digitalbridge.com/news-releases/news-release-details/adia-completes-acquisition-40-stake-landmark-dividend-alongside/),
and [DigitalBridge portfolio page](https://www.digitalbridge.com/portfolio/landmark-dividend)
support one company.

The surviving evidence contains a founding-year conflict, including 2002 and
2010 references. Resolve that scalar before the survivor snapshot is approved.

### 14. Luminace — `MERGE`

Keep the public brand Luminace (`cmoqby8li00ao171flqpuqq6j`) and retire
Luminace Holdings, LLC (`cmnva0nyo00gbm8lz6vln8d8d`). The
[company site](https://luminace.com/),
[company profile](https://luminace.com/about-us/), and
[2021 brand launch](https://www.globenewswire.com/news-release/2021/07/21/2266346/0/en/luminace-a-leading-provider-of-decarbonization-as-a-service-solutions-in-north-america-announces-brand-launch.html)
support continuity between the operating brand and holding-company record.
[Temasek's investment discussion](https://www.temasek.com.sg/en/news-and-resources/stories/future/building-for-resilience-a-strategic-approach-to-long-term-growth)
supports the later ownership history.

Confirm current ownership percentages and final transaction mechanics before
marking the consolidated record verified; they do not change the identity
conclusion.

### 15. Northview Energy — `MERGE`

Keep the richer United States / Canada record
`cmoqbxxhq008d171ffvxr3rv9` and retire `cmnva0xvs00wgm8lzqdgowwv1`. The
[BCI launch announcement](https://www.bci.ca/news/article/bci-norges-bank-investment-management-and-brookfield-partner-to-launch-northview-energy/),
[Brookfield announcement](https://bep.brookfield.com/press-releases/bep/bci-norges-bank-investment-management-and-brookfield-partner-launch-northview),
and
[Norges Bank Investment Management disclosure](https://www.nbim.no/en/news-and-insights/the-press/press-releases/2026/new-investment-in-unlisted-renewable-energy-infrastructure/)
describe the same jointly owned platform.

The disclosed seed assets are U.S. assets, while the framework includes future
U.S. and Canadian acquisitions. Preserve an announced or conditional status
unless separate closing evidence is obtained, and resolve the geographic
scalar before regenerating the survivor snapshot.

### 16. Pattern Energy — `MERGE`

Keep Pattern Energy Group LP (`cmnva0stf00nzm8lz2pthnja0`) and retire Pattern
Energy Group (`cmoqbyqsa00ef171fswry13u5`). The
[company site](https://patternenergy.com/),
[CPP Investments transaction close](https://patternenergy.com/pattern-energy-and-canada-pension-plan-investment-board-complete-transaction/),
[APG/ART investment close](https://patternenergy.com/pattern-energy-announces-closing-of-equity-investment-from-consortium-headed-by-apg-and-art/),
and
[Cordelio acquisition close](https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/)
support legal and operating continuity.

The proposed legal-name survivor has a United States country scalar while the
other record says United States / Canada and the company has a broader
operating footprint. Resolve whether `country` represents headquarters,
principal operations, or full footprint before regenerating the snapshot.

### 17. Pearl/Ruby Solar Portfolio — `MERGE`

Keep the normalized-name record `cmnva0tjn00p9m8lz7d3k3svi` and retire
`cmoqbxnxb006a171fwojc3elz`. The
[transaction announcement](https://www.prnewswire.com/news-releases/marathon-capital-announces-argos-investment-in-a-114-mw-distributed-solar-portfolio-300790298.html),
[transaction counsel summary](https://www.ballardspahr.com/insights/news/2019/03/ballard-spahr-represents-argo-infrastructure-partners-in-solar-energy-investment),
and
[SEC filing](https://www.sec.gov/Archives/edgar/data/1289790/000110465921083888/tm2120341d1_defa14a.htm)
identify the same 114 MW, 134-site distributed-solar portfolio. No material
identity gap remains.

### 18. Puget — `KEEP_SEPARATE`

Retain Puget Sound Energy (`cmnva0pnm00j4m8lzk4vmiuoa`) and the current slash
record (`cmnva0pr700jam8lzjb1yb2n1`) with no redirect. The
[Puget Energy Form 10-K](https://www.pse.com/-/media/PDFs/PugetEnergy/PE-10K-12312021.pdf)
identifies Puget Energy as the holding company and Puget Sound Energy as its
wholly owned regulated utility subsidiary. The
[PSE company page](https://www.pse.com/en/about-us) covers the operating
utility, while the
[Macquarie / Ontario Teachers' announcement](https://www.macquarie.com/us/en/about/news/2022/macquarie-asset-management-and-ontario-teachers-complete-acquisition-of-stake-in-puget-holdings.html)
describes ownership at Puget Holdings.

Rename and scope `cmnva0pr700jam8lzjb1yb2n1` to the precise parent entity that
its facts are intended to model—Puget Energy or Puget Holdings—then keep the
operating utility separate. The current slash label is not a canonical entity
name.

### 19. Skyservice US — `MERGE`

Keep the current-brand Skyservice US (`cmoqc03lb00ow171fge71941i`) and retire
Skyservice US (formerly Leading Edge Jet Center)
(`cmnva0ols00hem8lz203dcggi`). This reverses the artifact's automatically
proposed survivor. The
[2021 expansion and rebrand coverage](https://www.ainonline.com/aviation-news/business-aviation/2021-11-10/canadas-skyservice-expands-us),
[Leading Edge expansion announcement](https://www.globenewswire.com/news-release/2020/09/29/2100789/0/en/Leading-Edge-Jet-Center-Expands-its-Business-Aviation-Footprint.html),
and
[Instar infrastructure fact sheet](https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf)
support operating continuity.

The precise U.S. legal entity and current ownership percentage should be added
when primary evidence is located, but the former-name/current-brand identity is
supported.

### 20. Transportation Equipment Network — `MERGE`

Keep Transportation Equipment Network (`cmnva0pwi00jjm8lzomcojs56`) and retire
Transportation Equipment Network (TEN) (`cmoqbzvsz00n9171f6oiy98aw`). The
[TEN company profile](https://tenleasing.com/en/about/),
[official name-change announcement](https://tenleasing.com/en/news/star-leasing-company-commercial-trailer-leasing-inc-cooling-concepts-and-north-east-trailerservices-leasing-announce-intent-to-change-name-to-ten-transportation-equipment-network/),
[QIA investment announcement](https://www.qia.qa/en/Newsroom/Pages/QIA-invests-in-Transportation-Equipment-Network-%28TEN%29%2C-the-leading-North-American-full-service-trailer-lessor.aspx),
and
[shareholder announcement](https://www.businesswire.com/news/home/20240713566555/en/I-Squared-Announces-New-Shareholders-in-Transportation-Equipment-Network-TEN-the-Leading-North-American-Full-Service-Trailer-Lessor)
support one platform. Current shareholder percentages remain useful provenance
work but do not block the identity merge.

### 21. Montecito JV and MedCraft JV medical portfolios — `KEEP_SEPARATE`

Retain both the Montecito JV record (`cmnva11ml0133m8lzhltgjdef`) and MedCraft
JV record (`cmoqbzd9p00j9171fy63wi359`) with no redirect. They are distinct
transactions:

- The
  [MedCraft JV announcement](https://fengate.com/news/fengate-expands-healthcare-infrastructure-portfolio-with-acquisition-of-24-u-s-outpatient-facilities)
  describes 24 facilities in two states and is dated September 11, 2025. The
  operating counterparty is [MedCraft](https://www.medcraft.com/).
- The
  [Montecito JV announcement](https://fengate.com/news/fengate-acquires-16-medical-outpatient-facilities-in-the-united-states)
  describes 16 facilities across ten states and is dated October 30, 2025. The
  operating counterparty is
  [Montecito Medical](https://montecitomac.com/).

The bound primary-citation template cross-contaminates the Montecito record
with MedCraft URLs. Remove those citations through the reviewed editorial
workflow before selecting a Montecito primary citation.

## Regeneration and execution requirements

The merge engine deliberately does not choose between nonblank company
scalars. It preserves the selected survivor's name and other nonblank values,
only backfills certain blank values, unions country tags, moves or exactly
deduplicates reviewed relations, rehomes older redirects, creates direct
`CompanyRedirect` rows, deletes the reviewed retired records, and emits a
hash-bound `CANONICAL_MERGE` audit event.

`CompanyRedirect` currently preserves retired IDs, not retired public names.
That means an otherwise correct merge can reduce search and news-matching
coverage when the retired label carries a useful acronym or former name.
Before approving AlphaGen, DCLI, GCX, TEN, or Leading Edge Jet Center for
retirement, Research and Engineering must either:

- choose and review a canonical display name that preserves the material
  alternate name; or
- add a durable, queryable Company alias mechanism and prove that merge,
  search, news matching, exports, and redirects preserve the retired label.

No merge that loses a material alternate name is ready for execution.

Accordingly:

1. **Regenerate for alternate survivors.** The next candidate/approval
   template must explicitly select the non-proposed survivors recommended for
   Cleco (`cmnva0ng800fim8lz95b1no81`), Extenet
   (`cmoqc0y7100vi171flkm8xuz4`), GCT
   (`cmoqbxwza0088171ffl39qhda`), Gulf Coast Express
   (`cmnva0rsh00m5m8lzrh4iikgq`), and Skyservice US
   (`cmoqc03lb00ow171fge71941i`). Do not reuse the artifact's automatic
   survivor choices.
2. **Correct nonblank scalars before approval.** Resolve and review the
   geography, description, status, naming, founding-year, or ownership-field
   issues identified for Convergent, GCT, Extenet, Landmark Dividend,
   Northview Energy, Pattern Energy, Puget, and any other affected survivor.
   Because the merge does not overwrite a nonblank survivor scalar with a
   retired row's value, these corrections must be present before snapshot
   hashes are regenerated.
3. **Regenerate the Alpha cluster.** The template must include all three Alpha
   IDs and their current relation snapshots. A two-row approval would be
   incomplete.
4. **Exclude supported nonmatches.** Boldyn, Puget, and the two medical JVs
   should not appear in the corrected detector output solely from the old key
   behavior. If any still appears, investigate the live names and keys rather
   than hand-removing a candidate.
5. **Leave the evidence blockers unapproved.** Alpha Generation and JW
   Water / Robson remain blocked until their stated evidence gaps are closed.
6. **Re-attest the complete result.** Run the report against the intended
   non-production lineage, retain the exact run/artifact/template digests, and
   have the Research owner record decisions in the approval schema. Engineering
   must then inspect the dry-run transaction and redirect plan before any
   `--apply`.

## Separate cleanup queue for supported nonmatches

Removing a false duplicate candidate from the mechanical detector does not
complete the underlying editorial cleanup. Track these records outside the
merge approval until all three are closed:

1. **Boldyn:** replace the provisional global/U.S. labels with sourced legal or
   investment-perimeter names and re-review the ownership descriptions.
2. **Puget:** replace the slash-combined parent label with a precise entity
   name while retaining Puget Sound Energy as its own utility record.
3. **Montecito and MedCraft:** remove the cross-contaminated Montecito
   citations through the reviewed editorial workflow, then regenerate the
   primary-citation queue.

A clean duplicate gate is evidence only that the detector no longer proposes
these nonmatches. It is not evidence that the cleanup queue above is complete.

No statement in this document authorizes `--apply`, publication, archival,
source selection, or any other mutation. Until a separate approval passes all
review and hash checks, the correct operational action is **no merge**.
