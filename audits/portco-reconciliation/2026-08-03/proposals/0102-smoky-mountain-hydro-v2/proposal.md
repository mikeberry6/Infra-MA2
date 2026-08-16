# PortCo proposal — Smoky Mountain Hydro

- Task: 102 (ledger:0102:smoky-mountain-hydro:c03f70e0)
- As of: 2026-08-16
- Actions: CORRECT_COMPANY, ADD_OWNER, RETIRE_OWNERSHIP, MERGE_COMPANIES
- Proposal SHA-256: a83b58b0941e3c26156ee71d27906ea6d3a6a88bb2b32dae719ed39bd8000277
- Production snapshot SHA-256: efe30842e56cc3a9b3152957a51e47fd1e61d9e1982d2999810eba96ecbd3b5d
- Current company snapshot SHA-256: bb2e1ee9a5f803c9ccf06a42d0d6bf5914312b2f5638a6bd4377f986b670e274
- After-image SHA-256: f1c281aa34427ebf5d1bedc68662f9a3f6317a9361c2435c7bebaf81ef8904a7

## Recommendation

Consolidate the three published records describing the same four-facility Smoky Mountain hydro platform into the immutable Smoky Mountain Hydro queue target and rename that survivor to the current legal platform identity, Smoky Mountain Holdings LLC. Federal records show Brookfield Smoky Mountain Hydropower acquired the Tapoco portfolio in 2012. FERC approved Argo affiliate AMF Kimble Holdings' acquisition of a 50% interest in February 2023, and contemporaneous reporting dates the acquisition to March 17, 2023; Brookfield retained the remaining 50%. The existing Brookfield period is therefore preserved as a former 2012-2023 period, followed by a new current Brookfield 50% period from 2023. Brookfield Infrastructure Income Fund's latest annual report identifies later fund exposure beginning in March 2023 and does not support treating that fund as the original 2012 acquisition vehicle. Official 2024 and 2025 releases continue to describe an Argo-Brookfield joint venture, a 377 MW four-dam portfolio, a 10-year TVA PPA beginning in 2025 and a $435 million financing. No later sale, signed pending exit or ownership transfer was identified through August 16, 2026. Apollo's proposed manager-level acquisition of Argo was terminated without closing, so Apollo is removed from the asset vehicle label. Alcoa's 2012 sale remains in the milestones and narrative but is not added as an infrastructure-manager ownership period. Task 103 covers the same third production duplicate and will be superseded only after this exact merge is released, applied and production-verified.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Argo Infrastructure Partners | — | AMF Kimble Holdings, LLC | 50% | 2023 | — | CLOSED_ACTIVE |
| Brookfield Asset Management | — | Brookfield Smoky Mountain Hydropower LLC | 100% before the March 2023 sale of 50% to Argo | 2012 | 2023 | REALIZED |
| Brookfield Asset Management | — | Smoky Mountain Holdings II LLC / Brookfield affiliates and institutional partners | 50% | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 015-argo-infrastructure-partners:holding:017:smoky-mountain-hydro

## Retired company records

- cmrxpj7db00kpivhe629ln2fc
- cmrxpjab100pcivhe8qvszy2f

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkpon02t5ivhep7xkt3dc | cmrxpkjyn02mbivhejnzr1ave | Both milestones describe Argo's March 17, 2023 acquisition of a 50% interest from Brookfield; preserve the immutable queue target milestone. |
| MILESTONE | cmrxpkprw02t7ivhek8hd37kg | cmrxpkjzr02mdivhexgk9g9ii | Repurpose the immutable queue target's generic 2025 row as the exact August 2025 financing milestone and map the duplicate financing row into it. |
| OWNERSHIP_PERIOD | cmrxpjset01hnivhe9uk9dhf3 | cmrxpjr0y01feivhej2ytmv7y | Both periods describe Argo Infrastructure Partners' same March 2023 acquisition and current 50% interest in Smoky Mountain Holdings; preserve the immutable queue target period while correcting its unsupported Apollo vehicle label. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Apollo-Argo manager transaction termination and ownership-label correction](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BF082C39B-0000-C423-9296-BE68E22B02CF%7D) — the proposed Apollo acquisition of Argo did not close, the terminated manager transaction created no Smoky Mountain ownership change, the transaction agreement was terminated in January 2026
- [March 2023 acquisition date and 50/50 joint-venture confirmation](https://irei.com/news/argo-infrastructure-partners-acquires-50-of-hydroelectric-company-smoky-mountain-holdings/) — Argo acquired a 50% interest on March 17, 2023, Brookfield retained the remaining 50%, the transaction concerned Smoky Mountain Holdings and its hydroelectric portfolio
- [Exact 2012 close date, Smoky Mountain rename and four-development history](https://lowimpacthydro.org/lihi-certificate-18-smoky-mountain-project-north-carolina/) — Brookfield acquired the Tapoco Project on November 15, 2012, Brookfield renamed the project Smoky Mountain Hydro, the project includes Cheoah, Calderwood, Chilhowee and Santeetlah
- [Current co-ownership, asset boundary, operating scale and contracted offtake](https://www.businesswire.com/news/home/20241119725256/en/TVA-Enters-10-year-Power-Purchase-Agreement-with-Argo-and-Brookfields-Smoky-Mountain-Hydro-Facilities) — Argo and Brookfield jointly owned the facilities in November 2024, TVA signed a 10-year PPA beginning in 2025, the four facilities totaled 377 MW and averaged approximately 1.4 million MWh annually
- [Current canonical identity, joint ownership, platform boundary and financing continuity](https://www.businesswire.com/news/home/20250814980122/en/Smoky-Mountain-Holdings-LLC-Closes-Landmark-%24435-Million-Financing) — Smoky Mountain Holdings LLC remained an Argo-Brookfield joint venture in August 2025, the company closed a $435 million financing, the company comprised the same four hydroelectric facilities
- [Direct regulatory ownership approval, buyer vehicle and retained Brookfield interest](https://www.ferc.gov/sites/default/files/2024-01/E-10-EL23-43-000.pdf) — AMF Kimble Holdings LLC is an Argo affiliate, Brookfield affiliates retained the remaining 50% after consummation, FERC approved its acquisition of a 50% indirect interest in February 2023
- [Original Brookfield acquisition vehicle and four-project transfer boundary](https://www.govinfo.gov/content/pkg/FR-2012-08-09/pdf/2012-19514.pdf) — Brookfield Smoky Mountain Hydropower LLC sought approval to acquire the Tapoco Project, the regulatory notice was published in August 2012, the transfer covered the four hydroelectric developments
- [Latest Brookfield Infrastructure Income Fund exposure and acquisition-month disclosure](https://www.sec.gov/Archives/edgar/data/1955857/000139834426004615/fp0097166-1_ncsrixbrl.htm) — Smoky Mountain Holdings II LLC is the associated issuer, showing later fund exposure rather than a 2012 buyer vehicle, the fund continued to list U.S. Hydro (Smoky Mountain), the fund reports March 2023 as its acquisition month

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
