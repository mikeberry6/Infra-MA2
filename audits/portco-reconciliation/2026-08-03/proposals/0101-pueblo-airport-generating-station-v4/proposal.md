# PortCo proposal — Pueblo Airport Generating Station

- Task: 101 (ledger:0101:pueblo-airport-generating-station:d9b71a68)
- As of: 2026-08-16
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 3926f5044519e1c367dcdbcc2da25a2dd0284fb59de59d2cb17fff2677662588
- Production snapshot SHA-256: 9b6d6aafe84e44046df532a256c1136cb7422a115b9699dd70f0da28c2bba566
- Current company snapshot SHA-256: 5130f17cdac5f9656fa1ba393a47d7b197ff4e2d5088e149331a91859b0392b0
- After-image SHA-256: 787aabe04c313731ad71e65b553615094ad8305dd8e6aec275a1ee8d73d61656

## Recommendation

Consolidate the duplicate Black Hills Colorado IPP row into the immutable Pueblo Airport Generating Station queue target, then rename that surviving record to the manager-level Black Hills Colorado IPP investment. Black Hills filings distinguish the 440 MW Pueblo Airport site from Black Hills Colorado IPP, LLC, which owns the 200 MW combined-cycle IPP facility; the remaining 240 MW is utility-owned and outside Argo's investment boundary. Black Hills signed the sale of a 49.9% IPP member interest to AIA Energy North America LLC on February 12, 2016 and closed it on April 14, 2016. A live FERC asset appendix identifies AIA Colchis LLC as the direct 49.9% holder, and Argo's May 2026 Form ADV identifies AIA Energy North America and AIA Colchis vehicles within Argo's managed fund structure. Black Hills' August 2026 Form 10-Q continues to report distributions to the IPP noncontrolling interest. No later Argo/AIA asset sale, signed pending exit or ownership transfer was identified through August 16, 2026. Apollo's proposed manager-level acquisition of Argo was terminated in January 2026, and Black Hills' pending NorthWestern corporate merger does not transfer Argo's IPP interest. Attempt 4 maps the compatible duplicate ownership, commencement and closing relations, retains the retired February 2016 transaction and 2031 contract-term milestones by their original database IDs, and repurposes the surviving record's unsupported 2015 milestone as the directly sourced August 2026 ownership-continuity check. Attempts 1 through 3 produced no release or database mutation.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Argo Infrastructure Partners | — | AIA Energy North America LLC / AIA Colchis LLC | 49.9% | 2016 | — | CLOSED_ACTIVE |

## Source holdings

- None

## Retired company records

- cmrxpj77i00kfivhe3epcx6ic

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkozu02saivhevppdq9eh | cmrxpkjwe02m8ivhevyt59axo | Both milestones describe the January 2012 commercial operation of the 200 MW Black Hills Colorado IPP facility at the broader Pueblo Airport site; preserve the immutable queue target milestone. |
| MILESTONE | cmrxpkp0z02scivhei25x0k73 | cmrxpkjxj02maivhej4rtll3v | Both milestones describe the April 14, 2016 closing of AIA Energy North America's 49.9% member-interest acquisition; preserve the immutable queue target milestone. |
| OWNERSHIP_PERIOD | cmrxpjs9701hcivhewani56jy | cmrxpjr0f01fdivhew4dvpy28 | Both periods describe Argo's same April 2016 acquisition and continuing 49.9% interest in Black Hills Colorado IPP; preserve the immutable queue target period while correcting its unsupported Apollo vehicle label. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Apollo-Argo manager transaction termination](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BF082C39B-0000-C423-9296-BE68E22B02CF%7D) — the proposed Apollo manager transaction did not close, the terminated manager transaction did not change the IPP ownership period, the transaction agreement was terminated in January 2026
- [Direct legal holder, ownership percentages and asset/site distinction](https://mbrweb.ferc.gov/SearchMBRAssetAppendix/AssetAppendixDetails?AssetAppendixId=10451) — Black Hills Electric Generation LLC holds 50.1% and AIA Colchis LLC holds 49.9% of Black Hills Colorado IPP LLC, the IPP owns specified units within the broader Pueblo Airport Generating Station, the output is sold to Black Hills Colorado Electric under a PPA
- [Argo manager, AIA Energy fund and AIA Colchis vehicle attribution](https://reports.adviserinfo.sec.gov/reports/ADV/171246/PDF/171246.pdf) — AIA Colchis vehicles are disclosed within the AIA Energy managed-fund structure, Argo remains investment manager to AIA Energy North America LLC, the supported vehicle chain does not include Apollo
- [2016 definitive agreement, transaction boundary, buyer vehicle, stake and consideration](https://www.sec.gov/Archives/edgar/data/1130464/000113046416000173/form8-ksgpurchasecompletion.htm) — Black Hills signed the 49.9% member-interest sale on February 12, 2016, the buyer was AIA Energy North America LLC, an Argo-managed infrastructure platform, the target was Black Hills Colorado IPP, LLC rather than the whole Pueblo Airport site
- [Exact legal closing and transaction proceeds](https://www.sec.gov/Archives/edgar/data/1130464/000113046416000209/bkh10qq22016.htm) — Black Hills reported approximately $216 million of closing proceeds, Black Hills retained the controlling 50.1% interest and operator role, the 49.9% sale closed on April 14, 2016
- [Current platform boundary, operating scale, contract term and ownership continuity](https://www.sec.gov/Archives/edgar/data/1130464/000119312526046028/bkh-20251231.htm) — Black Hills retains 50.1% of the IPP and reports the 49.9% noncontrolling interest, the IPP facility commenced service in 2012 and is contracted through December 31, 2031, the full Pueblo Airport site is 440 MW, including a separate 200 MW Black Hills Colorado IPP facility
- [Latest Black Hills filing and current noncontrolling-interest continuity](https://www.sec.gov/Archives/edgar/data/1130464/000119312526337444/bkh-20260630.htm) — Black Hills continued to report distributions to the Black Hills Colorado IPP noncontrolling interest in August 2026, no IPP-level ownership disposal was reported, the separate Black Hills-NorthWestern parent merger remained pending

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
