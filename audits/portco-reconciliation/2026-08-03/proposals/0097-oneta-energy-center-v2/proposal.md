# PortCo proposal — Oneta Energy Center

- Task: 97 (ledger:0097:oneta-energy-center:feec8a7c)
- As of: 2026-08-16
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 386c65cb654569cdf18a325e7e3662b745e16d0a4cfcc078748d0983913383ac
- Production snapshot SHA-256: 37677278faa8ab21c488500f9cc0b530366335ea36e7071c692608cf474422ca
- Current company snapshot SHA-256: d92768c21f60ed4d1a4c496a6d23e2f1785ba24b292eabb5c907c474b7f4b840
- After-image SHA-256: ec2c21d0757e17d19cd63c465b324708a054e842941eaf2a021d9e5bb9c0542d

## Recommendation

Merge the duplicate Oneta Power production identity into the canonical Oneta Energy Center record. Oklahoma DEQ identifies Oneta Power, LLC as the permittee and operator of the Oneta Energy Center facility, so the two records represent one plant and one Argo investment. LS Power announced the sale to an Argo-managed vehicle on August 15, 2019, FERC reports a November 21, 2019 control-transfer date, and EPA's 2023 facility record identifies Argo Infrastructure Partners LP as the 100% parent. The live Oneta site continues to describe the Broken Arrow plant, and no later sale or pending ownership transfer was identified through August 16, 2026. Remove the unsupported Apollo vehicle wording because the announced Apollo-Argo manager transaction was terminated and never created an Oneta ownership change.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Argo Infrastructure Partners | — | — | 100% | 2019 | — | CLOSED_ACTIVE |

## Source holdings

- 015-argo-infrastructure-partners:holding:010:oneta-energy-center

## Retired company records

- cmrxpj7c400knivhe7bfekz6z

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkpkr02t0ivheucx8xptj | cmrxpkjqr02m0ivhe9f36smy0 | Both milestones describe LS Power's August 15, 2019 announcement of the same Oneta and Carville sale to an Argo-managed vehicle. |
| OWNERSHIP_PERIOD | cmrxpjsdy01hlivherxh2r9cp | cmrxpjqyw01faivhe634yyccq | Both ownership periods represent the same Argo-managed acquisition and current ownership of the single Oneta Energy Center asset. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Canonical legal and operating identity](https://applications.deq.ok.gov/permitspublic/storedpermits/8197.pdf) — Oneta Power and Oneta Energy Center are company and facility labels for one operating asset, Oneta Power, LLC is the permittee and operator of the Oneta Energy Center, the facility is located in Broken Arrow, Wagoner County, Oklahoma
- [Apollo-Argo termination and ownership-vehicle correction](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BF082C39B-0000-C423-9296-BE68E22B02CF%7D) — the announced Apollo-Argo manager transaction did not close, the transaction was terminated in January 2026 and creates no Oneta ownership change
- [Direct current-owner evidence and stake](https://ghgdata.epa.gov/ghgp/html/2023.do?et=undefined&id=1007570) — EPA reports Argo's ownership interest as 100%, EPA's 2023 Oneta Energy Center facility record identifies Argo Infrastructure Partners LP as the parent company
- [Acquisition closing date, market and attributed capacity](https://mbrweb.ferc.gov/SearchMBRAssetAppendix/AssetAppendixDetails?AssetAppendixId=7691) — FERC's asset appendix lists November 21, 2019 as the Oneta Energy Center control-transfer date, the asset is in the Southwest Power Pool, the filing attributes 1,086 MW to the entity and affiliates
- [Current operating identity, official location and scale](https://onetapower.com/about/) — Oneta Power's live official site describes one 1,150 MW combined-cycle facility in Broken Arrow, the site publishes the facility address and operating configuration
- [Argo acquisition announcement and infrastructure-investment basis](https://www.lspower.com/news/ls-power-announces-sale-of-carville-and-oneta-projects-to-argo-infrastructure-partners/) — LS Power agreed on August 15, 2019 to sell Oneta and Carville to an investment vehicle managed by Argo Infrastructure Partners, the Oneta asset was described as a 1,127 MW gas-fired combined-cycle facility, the transaction was subject to approvals and expected to close in the fourth quarter of 2019

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
